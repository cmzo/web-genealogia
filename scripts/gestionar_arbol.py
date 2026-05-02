#!/usr/bin/env python3
"""
CLI para gestionar personas, matrimonios y media en data/arbol.db.

Uso:
  python3 scripts/gestionar_arbol.py <comando> [args]

Personas:
  list                   Listar todas las personas
  show <id>              Ver detalle de una persona (con matrimonios y media)
  add                    Agregar nueva persona (interactivo)
  edit <id>              Editar persona existente

Matrimonios:
  list-marriages         Listar todos los matrimonios
  add-marriage           Agregar matrimonio entre dos personas
  edit-marriage <id>     Editar datos de un matrimonio (fecha, lugar, etc.)

Media:
  list-media             Listar todos los registros de media
  list-media <id>        Listar archivos de una persona específica
  add-media <id>         Asociar foto o documento a una persona
  delete-media <mid>     Eliminar un registro de media (con opción de borrar el archivo)
"""
import os
import re
import sqlite3
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'data', 'arbol.db')
EXPORT_SCRIPT = os.path.join(ROOT, 'scripts', 'export_arbol.py')


# ── helpers ──────────────────────────────────────────────────────────────────

def get_con():
    if not os.path.exists(DB_PATH):
        sys.exit(f'❌ No existe {DB_PATH}. Corre primero: python3 scripts/import_arbol.py')
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def iso_to_display(date_str):
    if not date_str:
        return ''
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})$', date_str)
    return f'{m.group(3)}/{m.group(2)}/{m.group(1)}' if m else date_str


def parse_date_input(raw, current=''):
    raw = raw.strip()
    if not raw:
        return current
    m_full = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', raw)
    if m_full:
        return f'{m_full.group(3)}-{int(m_full.group(2)):02d}-{int(m_full.group(1)):02d}'
    if re.match(r'^\d{4}$', raw):
        return f'{raw}-01-01'
    print(f'  ⚠️  Formato no reconocido ("{raw}"). Usar DD/MM/YYYY o solo el año.')
    return current


def prompt_date(label, current=''):
    display = iso_to_display(current) or '—'
    raw = input(f'  {label} [{display}]: ')
    return parse_date_input(raw, current)


def prompt_field(label, current=''):
    val = input(f'  {label} [{current or "—"}]: ').strip()
    return val if val else current


def get_num(pid):
    m = re.match(r'^[pm](\d+)$', pid)
    return int(m.group(1)) if m else 0


def next_persona_id(cur):
    cur.execute("SELECT id FROM personas")
    nums = [get_num(r['id']) for r in cur.fetchall() if re.match(r'^p\d+$', r['id'])]
    return f'p{max(nums) + 1}' if nums else 'p1'


def next_marriage_id(cur):
    cur.execute("SELECT id FROM matrimonios")
    nums = [get_num(r['id']) for r in cur.fetchall() if re.match(r'^m\d+$', r['id'])]
    return f'm{max(nums) + 1}' if nums else 'm1'


def next_media_id(cur):
    cur.execute("SELECT id FROM media")
    rows = cur.fetchall()
    nums = []
    for r in rows:
        m = re.match(r'^med(\d+)$', r['id'])
        if m:
            nums.append(int(m.group(1)))
    return f'med{max(nums) + 1}' if nums else 'med1'


def warn_missing_ref(cur, field, value):
    if value:
        cur.execute('SELECT id FROM personas WHERE id = ?', (value,))
        if not cur.fetchone():
            print(f'  ⚠️  {field} "{value}" no existe en la DB')


def offer_export():
    resp = input('\n¿Regenerar arbol.json ahora? [s/N]: ').strip().lower()
    if resp == 's':
        subprocess.run([sys.executable, EXPORT_SCRIPT], check=True)


# ── personas: collect fields ─────────────────────────────────────────────────

def collect_persona_fields(cur, defaults=None):
    d = defaults or {}
    print('  (Enter para mantener el valor actual)\n')

    name        = prompt_field('Nombre completo *', d.get('name', ''))
    gender_raw  = prompt_field('Género (M / F / vacío)', d.get('gender', ''))
    birth_date  = prompt_date('Fecha nacimiento  (DD/MM/YYYY o YYYY)', d.get('birth_date', ''))
    birth_place = prompt_field('Lugar nacimiento', d.get('birth_place', ''))
    death_date  = prompt_date('Fecha fallecimiento (DD/MM/YYYY o YYYY)', d.get('death_date', ''))
    death_place = prompt_field('Lugar fallecimiento', d.get('death_place', ''))
    father_id   = prompt_field('ID padre', d.get('father_id', ''))
    mother_id   = prompt_field('ID madre', d.get('mother_id', ''))
    branch      = prompt_field('Rama familiar', d.get('branch', ''))

    gen_raw = prompt_field('Generación (número)', str(d.get('generation', 0)))
    ord_raw = prompt_field('Orden dentro de la generación (número)', str(d.get('sort_order', 0)))
    vivo_raw    = prompt_field('Vivo (si / no / vacío)', d.get('vivo', ''))
    photo_url   = prompt_field('Foto de perfil (ruta relativa o vacío)', d.get('photo_url', ''))
    notes       = prompt_field('Notas', d.get('notes', ''))
    sources     = prompt_field('Fuentes / citas', d.get('sources', ''))

    gender = gender_raw.upper() if gender_raw.upper() in ('M', 'F') else ''
    if gender_raw and gender == '':
        print('  ⚠️  Género solo acepta "M" o "F". Dejando vacío.')

    try:
        generation = int(gen_raw)
    except ValueError:
        print('  ⚠️  Generación debe ser un entero. Usando 0.')
        generation = 0

    try:
        sort_order = int(ord_raw)
    except ValueError:
        print('  ⚠️  Orden debe ser un entero. Usando 0.')
        sort_order = 0

    vivo = vivo_raw.lower() if vivo_raw.lower() in ('si', 'no') else ''
    if vivo_raw and vivo == '':
        print('  ⚠️  "vivo" solo acepta "si" o "no". Dejando vacío.')

    STATUS_OPTIONS = ('verificado', 'incompleto', 'en_proceso', 'sin_datos')
    status_raw = prompt_field(
        f'Estado investigación ({" / ".join(STATUS_OPTIONS)})',
        d.get('status', 'sin_datos'),
    )
    status = status_raw if status_raw in STATUS_OPTIONS else 'sin_datos'
    if status_raw and status == 'sin_datos' and status_raw != 'sin_datos':
        print(f'  ⚠️  Estado no reconocido. Opciones: {", ".join(STATUS_OPTIONS)}. Usando "sin_datos".')

    for field, val in [('father_id', father_id), ('mother_id', mother_id)]:
        warn_missing_ref(cur, field, val)

    return {
        'name': name, 'gender': gender,
        'birth_date': birth_date, 'birth_place': birth_place,
        'death_date': death_date, 'death_place': death_place,
        'father_id': father_id, 'mother_id': mother_id,
        'branch': branch, 'generation': generation, 'sort_order': sort_order,
        'vivo': vivo, 'photo_url': photo_url, 'notes': notes, 'sources': sources,
        'status': status,
    }


# ── personas: comandos ────────────────────────────────────────────────────────

def cmd_list(_args):
    con = get_con()
    cur = con.cursor()
    cur.execute(
        'SELECT id, name, gender, generation, branch, vivo FROM personas ORDER BY CAST(SUBSTR(id, 2) AS INTEGER)'
    )
    rows = cur.fetchall()
    con.close()

    print(f'\n{"ID":<6}  {"Nombre":<40} {"G":>1}  {"Gen":>4}  {"Rama":<20} Vivo')
    print('─' * 82)
    for r in rows:
        g = r['gender'] or ' '
        print(f'{r["id"]:<6}  {r["name"]:<40} {g:>1}  {r["generation"]:>4}  {r["branch"]:<20} {r["vivo"]}')
    print(f'\n{len(rows)} personas en total.')


def cmd_show(args):
    if not args:
        print('Uso: show <id>')
        return
    pid = args[0]
    con = get_con()
    cur = con.cursor()

    cur.execute('SELECT * FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        print(f'❌ No existe "{pid}"')
        con.close()
        return

    # Padres
    parents = {}
    for role, fid in [('Padre', r['father_id']), ('Madre', r['mother_id'])]:
        if fid:
            cur.execute('SELECT name FROM personas WHERE id = ?', (fid,))
            row = cur.fetchone()
            parents[role] = f'{row["name"]} ({fid})' if row else fid

    # Hijos
    cur.execute(
        'SELECT id, name FROM personas WHERE father_id = ? OR mother_id = ? ORDER BY sort_order',
        (pid, pid)
    )
    hijos = [f'{h["name"]} ({h["id"]})' for h in cur.fetchall()]

    # Matrimonios
    cur.execute(
        'SELECT m.*, p.name as spouse_name FROM matrimonios m '
        'JOIN personas p ON (CASE WHEN m.spouse1_id = ? THEN m.spouse2_id ELSE m.spouse1_id END) = p.id '
        'WHERE m.spouse1_id = ? OR m.spouse2_id = ?',
        (pid, pid, pid)
    )
    matrimonios = cur.fetchall()

    # Media
    cur.execute('SELECT * FROM media WHERE persona_id = ? ORDER BY id', (pid,))
    media = cur.fetchall()

    con.close()

    labels = {
        'id': 'ID', 'name': 'Nombre', 'gender': 'Género',
        'birth_date': 'Nacimiento', 'birth_place': 'Lugar nac.',
        'death_date': 'Fallecimiento', 'death_place': 'Lugar fall.',
        'father_id': 'Padre', 'mother_id': 'Madre',
        'branch': 'Rama', 'generation': 'Generación', 'sort_order': 'Orden',
        'vivo': 'Vivo', 'photo_url': 'Foto perfil',
        'notes': 'Notas', 'sources': 'Fuentes',
        'status': 'Estado invest.',
    }

    print(f'\n{"─" * 52}')
    for key in r.keys():
        val = r[key]
        if key in ('birth_date', 'death_date'):
            val = iso_to_display(val) or '—'
        elif key == 'father_id' and r['father_id']:
            val = parents.get('Padre', val)
        elif key == 'mother_id' and r['mother_id']:
            val = parents.get('Madre', val)
        label = labels.get(key, key)
        print(f'  {label:<16} {val if val != "" else "—"}')

    if hijos:
        print(f'  {"Hijos":<16} {", ".join(hijos)}')

    if matrimonios:
        print(f'\n  Matrimonios:')
        for m in matrimonios:
            fecha = iso_to_display(m['marriage_date']) or 'sin fecha'
            lugar = m['marriage_place'] or 'sin lugar'
            print(f'    {m["id"]}  {m["spouse_name"]}  ·  {fecha}  ·  {lugar}')

    if media:
        print(f'\n  Media ({len(media)}):')
        for med in media:
            print(f'    {med["id"]}  [{med["type"]}]  {med["url"]}')
            if med['caption']:
                print(f'               {med["caption"]}')

    print(f'{"─" * 52}')


def cmd_add(_args):
    con = get_con()
    cur = con.cursor()
    suggested = next_persona_id(cur)

    print(f'\nAgregar nueva persona')
    pid_raw = input(f'  ID [{suggested}]: ').strip()
    pid = pid_raw or suggested

    if not re.match(r'^p\d+$', pid):
        print(f'❌ El ID debe tener formato p<número> (ej: p57)')
        con.close()
        return

    cur.execute('SELECT id FROM personas WHERE id = ?', (pid,))
    if cur.fetchone():
        print(f'❌ Ya existe una persona con ID "{pid}"')
        con.close()
        return

    print()
    fields = collect_persona_fields(cur)

    cur.execute(
        """INSERT INTO personas
           (id, name, gender, birth_date, birth_place, death_date, death_place,
            father_id, mother_id, branch, generation, sort_order, vivo,
            photo_url, notes, sources, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (pid, fields['name'], fields['gender'], fields['birth_date'], fields['birth_place'],
         fields['death_date'], fields['death_place'], fields['father_id'], fields['mother_id'],
         fields['branch'], fields['generation'], fields['sort_order'], fields['vivo'],
         fields['photo_url'], fields['notes'], fields['sources'], fields['status']),
    )
    con.commit()
    con.close()

    print(f'\n✅ "{fields["name"]}" agregada con ID {pid}')
    offer_export()


def cmd_edit(args):
    if not args:
        print('Uso: edit <id>')
        return
    pid = args[0]
    con = get_con()
    cur = con.cursor()
    cur.execute('SELECT * FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        print(f'❌ No existe "{pid}"')
        con.close()
        return

    print(f'\nEditar: {r["name"]} ({pid})')
    fields = collect_persona_fields(cur, dict(r))

    cur.execute(
        """UPDATE personas SET
           name=?, gender=?, birth_date=?, birth_place=?, death_date=?, death_place=?,
           father_id=?, mother_id=?, branch=?, generation=?, sort_order=?, vivo=?,
           photo_url=?, notes=?, sources=?, status=?
           WHERE id=?""",
        (fields['name'], fields['gender'], fields['birth_date'], fields['birth_place'],
         fields['death_date'], fields['death_place'], fields['father_id'], fields['mother_id'],
         fields['branch'], fields['generation'], fields['sort_order'], fields['vivo'],
         fields['photo_url'], fields['notes'], fields['sources'], fields['status'], pid),
    )
    con.commit()
    con.close()

    print(f'\n✅ {pid} actualizado.')
    offer_export()


# ── matrimonios ───────────────────────────────────────────────────────────────

def cmd_list_marriages(_args):
    con = get_con()
    cur = con.cursor()
    cur.execute("""
        SELECT m.id, p1.name as n1, p2.name as n2,
               m.marriage_date, m.marriage_place
        FROM matrimonios m
        JOIN personas p1 ON m.spouse1_id = p1.id
        JOIN personas p2 ON m.spouse2_id = p2.id
        ORDER BY m.id
    """)
    rows = cur.fetchall()
    con.close()

    print(f'\n{"ID":<5}  {"Cónyuge 1":<30}  {"Cónyuge 2":<30}  {"Fecha":<12}  Lugar')
    print('─' * 96)
    for r in rows:
        fecha = iso_to_display(r['marriage_date']) or '—'
        lugar = r['marriage_place'] or '—'
        print(f'{r["id"]:<5}  {r["n1"]:<30}  {r["n2"]:<30}  {fecha:<12}  {lugar}')
    print(f'\n{len(rows)} matrimonios en total.')


def cmd_add_marriage(_args):
    con = get_con()
    cur = con.cursor()

    print('\nAgregar matrimonio\n')
    spouse1_id = input('  ID cónyuge 1: ').strip()
    spouse2_id = input('  ID cónyuge 2: ').strip()

    for pid in [spouse1_id, spouse2_id]:
        cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
        r = cur.fetchone()
        if not r:
            print(f'❌ No existe "{pid}"')
            con.close()
            return
        print(f'  → {r["name"]}')

    # Verificar si ya existe este matrimonio
    s1, s2 = sorted([spouse1_id, spouse2_id], key=get_num)
    cur.execute(
        'SELECT id FROM matrimonios WHERE spouse1_id = ? AND spouse2_id = ?', (s1, s2)
    )
    if cur.fetchone():
        print(f'❌ Ya existe un matrimonio entre {s1} y {s2}')
        con.close()
        return

    mid = next_marriage_id(cur)
    print()
    marriage_date  = prompt_date('Fecha de matrimonio (DD/MM/YYYY o YYYY)')
    marriage_place = prompt_field('Lugar de matrimonio', '')
    divorce_date   = prompt_date('Fecha de divorcio (DD/MM/YYYY o YYYY, o vacío)')
    notes          = prompt_field('Notas', '')

    cur.execute(
        """INSERT INTO matrimonios
           (id, spouse1_id, spouse2_id, marriage_date, marriage_place, divorce_date, notes)
           VALUES (?,?,?,?,?,?,?)""",
        (mid, s1, s2, marriage_date, marriage_place, divorce_date, notes),
    )
    con.commit()
    con.close()

    print(f'\n✅ Matrimonio {mid} registrado ({s1} ↔ {s2})')
    offer_export()


def cmd_edit_marriage(args):
    if not args:
        print('Uso: edit-marriage <id>')
        return
    mid = args[0]
    con = get_con()
    cur = con.cursor()
    cur.execute('SELECT * FROM matrimonios WHERE id = ?', (mid,))
    r = cur.fetchone()
    if not r:
        print(f'❌ No existe matrimonio "{mid}"')
        con.close()
        return

    cur.execute('SELECT name FROM personas WHERE id = ?', (r['spouse1_id'],))
    n1 = cur.fetchone()['name']
    cur.execute('SELECT name FROM personas WHERE id = ?', (r['spouse2_id'],))
    n2 = cur.fetchone()['name']

    print(f'\nEditar matrimonio {mid}: {n1} ↔ {n2}\n')
    d = dict(r)
    marriage_date  = prompt_date('Fecha de matrimonio (DD/MM/YYYY o YYYY)', d.get('marriage_date', ''))
    marriage_place = prompt_field('Lugar de matrimonio', d.get('marriage_place', ''))
    divorce_date   = prompt_date('Fecha de divorcio (vacío si no aplica)', d.get('divorce_date', ''))
    notes          = prompt_field('Notas', d.get('notes', ''))

    cur.execute(
        """UPDATE matrimonios SET
           marriage_date=?, marriage_place=?, divorce_date=?, notes=?
           WHERE id=?""",
        (marriage_date, marriage_place, divorce_date, notes, mid),
    )
    con.commit()
    con.close()

    print(f'\n✅ Matrimonio {mid} actualizado.')
    offer_export()


# ── media ─────────────────────────────────────────────────────────────────────

def cmd_list_media(args):
    con = get_con()
    cur = con.cursor()

    if args:
        # Filtrar por persona
        pid = args[0]
        cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
        r = cur.fetchone()
        if not r:
            print(f'❌ No existe "{pid}"')
            con.close()
            return
        cur.execute(
            'SELECT m.*, p.name as persona_name FROM media m '
            'JOIN personas p ON m.persona_id = p.id '
            'WHERE m.persona_id = ? ORDER BY m.id',
            (pid,)
        )
        print(f'\nMedia de {r["name"]} ({pid}):')
    else:
        # Todos los registros
        cur.execute(
            'SELECT m.*, p.name as persona_name FROM media m '
            'JOIN personas p ON m.persona_id = p.id '
            'ORDER BY m.persona_id, m.id'
        )
        print('\nTodos los registros de media:')

    rows = cur.fetchall()
    con.close()

    if not rows:
        print('  (sin archivos)')
        return

    current_persona = None
    for m in rows:
        if m['persona_name'] != current_persona:
            current_persona = m['persona_name']
            print(f'\n── {current_persona} ({m["persona_id"]}) ──')
        print(f'  {m["id"]}  [{m["type"]}]  {m["url"]}')
        if m['caption']:     print(f'         {m["caption"]}')
        if m['group_label']: print(f'         Grupo: {m["group_label"]} ({m["group_order"]})')


def cmd_add_media(args):
    if not args:
        print('Uso: add-media <id>')
        return
    pid = args[0]
    con = get_con()
    cur = con.cursor()
    cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        print(f'❌ No existe "{pid}"')
        con.close()
        return

    print(f'\nAgregar media a {r["name"]} ({pid})\n')

    mid = next_media_id(cur)
    type_raw = input('  Tipo [photo/document] [photo]: ').strip().lower()
    media_type = type_raw if type_raw in ('photo', 'document') else 'photo'

    if media_type == 'photo':
        default_dir = 'assets/images/personas/'
    else:
        default_dir = 'assets/docs/personas/'

    print(f'  Nombre del archivo (se guarda en {default_dir})')
    print(f'  Podés escribir solo el nombre o la ruta completa')
    raw_url = input('  Archivo: ').strip()
    if not raw_url:
        print('❌ El archivo no puede estar vacío')
        con.close()
        return
    # Si no incluye una barra, asumir que es solo el nombre
    url = raw_url if '/' in raw_url else default_dir + raw_url

    caption      = input('  Descripción (caption): ').strip()
    date         = prompt_date('  Fecha del archivo (DD/MM/YYYY o YYYY, o vacío)')
    source_label = input('  Fuente / archivo de origen: ').strip()

    print('  — Grupo (opcional, para agrupar páginas de un mismo documento) —')
    print('  Ejemplo: "Carta de Conthey, 1905"  (vacío = sin grupo)')
    group_label = input('  Nombre del grupo: ').strip()
    group_order = 0
    if group_label:
        # Sugerir el siguiente orden dentro del grupo
        cur.execute(
            'SELECT COALESCE(MAX(group_order), 0) + 1 FROM media WHERE group_label = ?',
            (group_label,)
        )
        suggested = cur.fetchone()[0]
        raw_order = input(f'  Posición en el grupo [{suggested}]: ').strip()
        group_order = int(raw_order) if raw_order.isdigit() else suggested

    cur.execute(
        """INSERT INTO media
           (id, persona_id, type, url, caption, date, source_label, group_label, group_order)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (mid, pid, media_type, url, caption, date, source_label, group_label, group_order),
    )
    con.commit()
    con.close()

    print(f'\n✅ Media {mid} asociada a {pid}')
    offer_export()


def cmd_delete_media(args):
    if not args:
        print('Uso: delete-media <media_id>')
        return
    mid = args[0]
    con = get_con()
    cur = con.cursor()
    cur.execute(
        'SELECT m.*, p.name as persona_name FROM media m '
        'JOIN personas p ON m.persona_id = p.id WHERE m.id = ?',
        (mid,)
    )
    m = cur.fetchone()
    if not m:
        print(f'❌ No existe el registro "{mid}"')
        con.close()
        return

    print(f'\n  {m["id"]}  [{m["type"]}]  —  {m["persona_name"]}')
    print(f'  URL:    {m["url"]}')
    if m['caption']:     print(f'  Texto:  {m["caption"]}')
    if m['group_label']: print(f'  Grupo:  {m["group_label"]} (orden {m["group_order"]})')

    confirm = input('\n¿Eliminar este registro? [s/N]: ').strip().lower()
    if confirm != 's':
        print('Cancelado.')
        con.close()
        return

    cur.execute('DELETE FROM media WHERE id = ?', (mid,))
    con.commit()
    print(f'✅ Registro {mid} eliminado de la base de datos.')

    # Ofrecer borrar el archivo del disco
    file_path = os.path.join(ROOT, m['url'])
    if os.path.exists(file_path):
        del_file = input(f'¿Eliminar también el archivo del disco? ({m["url"]}) [s/N]: ').strip().lower()
        if del_file == 's':
            os.remove(file_path)
            print(f'✅ Archivo eliminado: {m["url"]}')

    con.close()
    offer_export()


# ── main ──────────────────────────────────────────────────────────────────────

COMMANDS = {
    'list':           (cmd_list,           'Listar todas las personas'),
    'show':           (cmd_show,           'Ver detalle completo: show <id>'),
    'add':            (cmd_add,            'Agregar nueva persona (interactivo)'),
    'edit':           (cmd_edit,           'Editar persona: edit <id>'),
    'list-marriages': (cmd_list_marriages, 'Listar todos los matrimonios'),
    'add-marriage':   (cmd_add_marriage,   'Agregar matrimonio entre dos personas'),
    'edit-marriage':  (cmd_edit_marriage,  'Editar matrimonio: edit-marriage <id>'),
    'list-media':     (cmd_list_media,     'Listar media de una persona: list-media <id>'),
    'add-media':      (cmd_add_media,      'Asociar foto o documento: add-media <id>'),
    'delete-media':   (cmd_delete_media,   'Eliminar registro de media: delete-media <media_id>'),
}


def main():
    args = sys.argv[1:]
    if not args or args[0] not in COMMANDS:
        print('\nUso: python3 scripts/gestionar_arbol.py <comando>\n')
        print('Personas:')
        for name in ('list', 'show', 'add', 'edit'):
            print(f'  {name:<18}  {COMMANDS[name][1]}')
        print('\nMatrimonios:')
        for name in ('list-marriages', 'add-marriage', 'edit-marriage'):
            print(f'  {name:<18}  {COMMANDS[name][1]}')
        print('\nMedia:')
        for name in ('list-media', 'add-media'):
            print(f'  {name:<18}  {COMMANDS[name][1]}')
        print()
        return
    COMMANDS[args[0]][0](args[1:])


if __name__ == '__main__':
    main()
