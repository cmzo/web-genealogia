#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["rich", "questionary"]
# ///
"""
Gestor del árbol genealógico.

  uv run scripts/gestionar_arbol.py            → menú interactivo
  uv run scripts/gestionar_arbol.py list        → comando directo
"""

import os
import re
import sqlite3
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'data', 'arbol.db')
EXPORT_SCRIPT = os.path.join(ROOT, 'scripts', 'export_arbol.py')

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
    from rich import box as rbox
    import questionary
except ImportError:
    print('Faltan dependencias. Ejecutar con:\n  uv run scripts/gestionar_arbol.py')
    sys.exit(1)

console = Console()

STYLE = questionary.Style([
    ('qmark',       'fg:#f5a623 bold'),
    ('question',    'fg:#e8e8e8 bold'),
    ('answer',      'fg:#4ec9b0 bold'),
    ('pointer',     'fg:#4ec9b0 bold'),
    ('highlighted', 'fg:#ffffff bold'),
    ('selected',    'fg:#4ec9b0'),
    ('separator',   'fg:#555555'),
    ('instruction', 'fg:#888888 italic'),
    # autocompletado: fondo oscuro, texto claro
    ('completion-menu',                    'bg:#2a2a2a fg:#dddddd'),
    ('completion-menu.completion',         'bg:#2a2a2a fg:#dddddd'),
    ('completion-menu.completion.current', 'bg:#4ec9b0 fg:#1a1a1a bold'),
])

BACK = '← Volver'
SEP  = questionary.Separator('─' * 30)

# ── db ────────────────────────────────────────────────────────────────────────

def get_con():
    if not os.path.exists(DB_PATH):
        console.print(f'[red]✗[/red] No existe {DB_PATH}')
        sys.exit(1)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def iso_to_display(d):
    if not d:
        return ''
    m = re.match(r'^(\d{4})-(\d{2})-(\d{2})$', d)
    return f'{m.group(3)}/{m.group(2)}/{m.group(1)}' if m else d


def parse_date(raw, current=''):
    raw = raw.strip()
    if not raw:
        return current
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', raw)
    if m:
        return f'{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}'
    if re.match(r'^\d{4}$', raw):
        return f'{raw}-01-01'
    console.print('[yellow]⚠[/yellow]  Formato no reconocido — usar DD/MM/YYYY o solo el año.')
    return current


def get_num(pid):
    m = re.match(r'^[pm](\d+)$', str(pid))
    return int(m.group(1)) if m else 0


def next_id(cur, table, prefix, pattern):
    cur.execute(f'SELECT id FROM {table}')
    nums = [get_num(r['id']) for r in cur.fetchall() if re.match(pattern, r['id'])]
    return f'{prefix}{max(nums) + 1}' if nums else f'{prefix}1'


def warn_ref(cur, field, value):
    if value:
        cur.execute('SELECT id FROM personas WHERE id = ?', (value,))
        if not cur.fetchone():
            console.print(f'  [yellow]⚠[/yellow]  {field} "{value}" no existe en la DB')


def offer_export():
    if questionary.confirm('¿Regenerar arbol.json ahora?', default=False, style=STYLE).ask():
        subprocess.run([sys.executable, EXPORT_SCRIPT], check=True)
        console.print('[green]✓[/green] arbol.json regenerado.')

# ── status ────────────────────────────────────────────────────────────────────

_STATUS_COLOR = {'verificado': 'green', 'incompleto': 'yellow', 'en_proceso': 'cyan', 'sin_datos': 'dim'}
_STATUS_LABEL = {'verificado': 'Verificado', 'incompleto': 'Incompleto', 'en_proceso': 'En proceso', 'sin_datos': 'Sin datos'}

def status_markup(s):
    c = _STATUS_COLOR.get(s or '', 'dim')
    l = _STATUS_LABEL.get(s or '', s or '—')
    return f'[{c}]{l}[/{c}]'

_STATUS_CHOICES = [
    questionary.Choice('✓  Verificado',  'verificado'),
    questionary.Choice('~  Incompleto',  'incompleto'),
    questionary.Choice('↻  En proceso',  'en_proceso'),
    questionary.Choice('○  Sin datos',   'sin_datos'),
]
_GENDER_CHOICES = [
    questionary.Choice('Masculino', 'M'),
    questionary.Choice('Femenino',  'F'),
    questionary.Choice('—',         ''),
]
_VIVO_CHOICES = [
    questionary.Choice('Sí', 'si'),
    questionary.Choice('No', 'no'),
    questionary.Choice('—',  ''),
]

# ── prompt helpers ────────────────────────────────────────────────────────────

def _ask(q):
    return q.unsafe_ask()


def qtext(label, default=''):
    r = _ask(questionary.text(label, default=default or '', style=STYLE))
    return r if r is not None else (default or '')


def qdate(label, current=''):
    display = iso_to_display(current) or ''
    raw = _ask(questionary.text(label, default=display, style=STYLE)) or ''
    return parse_date(raw, current)


def qselect(label, choices, default=None):
    default_choice = next((c for c in choices if isinstance(c, questionary.Choice) and c.value == default), None)
    return _ask(questionary.select(label, choices=choices, default=default_choice or default, style=STYLE))


def qconfirm(label, default=False):
    r = _ask(questionary.confirm(label, default=default, style=STYLE))
    return r if r is not None else False


def pick_persona(cur, prompt='Seleccionar persona'):
    cur.execute('SELECT id, name FROM personas ORDER BY CAST(SUBSTR(id, 2) AS INTEGER)')
    rows = cur.fetchall()
    if not rows:
        console.print('[yellow]No hay personas registradas.[/yellow]')
        return None
    choices = [f'{r["name"]}  ({r["id"]})' for r in rows]
    raw = _ask(questionary.autocomplete(prompt, choices=choices, style=STYLE))
    if not raw:
        return None
    m = re.search(r'\((\w+)\)\s*$', raw)
    return m.group(1) if m else None


def pick_persona_optional(cur, prompt, current_id=None):
    """Como pick_persona pero permite dejar vacío (sin padre/madre)."""
    cur.execute('SELECT id, name FROM personas ORDER BY CAST(SUBSTR(id, 2) AS INTEGER)')
    rows = cur.fetchall()
    none_opt = '— (ninguno)'
    choices = [none_opt] + [f'{r["name"]}  ({r["id"]})' for r in rows]
    default = none_opt
    if current_id:
        for r in rows:
            if r['id'] == current_id:
                default = f'{r["name"]}  ({r["id"]})'
                break
    raw = _ask(questionary.autocomplete(prompt, choices=choices, default=default, style=STYLE))
    if not raw or raw == none_opt:
        return ''
    m = re.search(r'\((\w+)\)\s*$', raw)
    return m.group(1) if m else ''


def _all_places(cur):
    places = set()
    for table, col in [('personas','birth_place'), ('personas','death_place'), ('matrimonios','marriage_place')]:
        try:
            cur.execute(f'SELECT DISTINCT {col} FROM {table} WHERE {col} IS NOT NULL AND {col} != ""')
            places.update(r[0] for r in cur.fetchall())
        except Exception:
            pass
    return sorted(places)


def qplace(label, cur, default=''):
    places = _all_places(cur)
    raw = _ask(questionary.autocomplete(label, choices=places, default=default or '', style=STYLE))
    return raw if raw is not None else (default or '')


def pick_marriage(cur, prompt='Seleccionar matrimonio'):
    cur.execute("""
        SELECT m.id, p1.name n1, p2.name n2 FROM matrimonios m
        JOIN personas p1 ON m.spouse1_id = p1.id
        JOIN personas p2 ON m.spouse2_id = p2.id
        ORDER BY CAST(SUBSTR(m.id, 2) AS INTEGER)
    """)
    rows = cur.fetchall()
    if not rows:
        console.print('[yellow]No hay matrimonios registrados.[/yellow]')
        return None
    choices = [f'{r["n1"]} ↔ {r["n2"]}  ({r["id"]})' for r in rows]
    raw = _ask(questionary.autocomplete(prompt, choices=choices, style=STYLE))
    if not raw:
        return None
    m = re.search(r'\((\w+)\)\s*$', raw)
    return m.group(1) if m else None


# ── display ───────────────────────────────────────────────────────────────────

def show_personas():
    con = get_con()
    cur = con.cursor()
    cur.execute(
        'SELECT id, name, gender, generation, branch, vivo, status FROM personas '
        'ORDER BY CAST(SUBSTR(id, 2) AS INTEGER)'
    )
    rows = cur.fetchall()
    con.close()

    t = Table(box=rbox.SIMPLE_HEAD, header_style='bold', show_edge=False)
    t.add_column('ID',     style='dim', width=6)
    t.add_column('Nombre', min_width=28)
    t.add_column('G',      justify='center', width=3)
    t.add_column('Gen',    justify='right',  width=4)
    t.add_column('Rama',   width=22)
    t.add_column('Estado')
    t.add_column('Vivo',   width=5)
    for r in rows:
        g = '[blue]M[/blue]' if r['gender'] == 'M' else ('[magenta]F[/magenta]' if r['gender'] == 'F' else '')
        t.add_row(r['id'], r['name'], g, str(r['generation'] or ''), r['branch'] or '',
                  status_markup(r['status']), r['vivo'] or '')
    console.print()
    console.print(t)
    console.print(f'[dim]  {len(rows)} personas[/dim]\n')


def show_persona(pid):
    con = get_con()
    cur = con.cursor()
    cur.execute('SELECT * FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe "{pid}"')
        con.close()
        return

    parents = {}
    for role, fid in [('Padre', r['father_id']), ('Madre', r['mother_id'])]:
        if fid:
            cur.execute('SELECT name FROM personas WHERE id = ?', (fid,))
            row = cur.fetchone()
            parents[role] = f'{row["name"]} ({fid})' if row else fid

    cur.execute(
        'SELECT id, name FROM personas WHERE father_id = ? OR mother_id = ? ORDER BY sort_order',
        (pid, pid)
    )
    hijos = cur.fetchall()

    cur.execute(
        'SELECT m.*, p.name spouse_name FROM matrimonios m '
        'JOIN personas p ON (CASE WHEN m.spouse1_id=? THEN m.spouse2_id ELSE m.spouse1_id END)=p.id '
        'WHERE m.spouse1_id=? OR m.spouse2_id=?',
        (pid, pid, pid)
    )
    marriages = cur.fetchall()

    cur.execute('SELECT * FROM media WHERE persona_id=? ORDER BY id', (pid,))
    media = cur.fetchall()
    con.close()

    txt = Text()
    def row_t(label, value):
        txt.append(f'  {label:<18}', style='bold')
        txt.append(f'{value}\n')

    row_t('Nombre',        r['name'])
    row_t('Género',        {'M': 'Masculino', 'F': 'Femenino'}.get(r['gender'] or '', '—'))
    nac = iso_to_display(r['birth_date']) or '—'
    if r['birth_place']: nac += f'  ·  {r["birth_place"]}'
    row_t('Nacimiento',    nac)
    fall = iso_to_display(r['death_date']) or '—'
    if r['death_place']:  fall += f'  ·  {r["death_place"]}'
    row_t('Fallecimiento', fall)
    row_t('Padre',         parents.get('Padre', '—'))
    row_t('Madre',         parents.get('Madre', '—'))
    if hijos:
        row_t('Hijos', ', '.join(f'{h["name"]} ({h["id"]})' for h in hijos))
    row_t('Rama',          r['branch'] or '—')
    row_t('Generación',    str(r['generation'] or '—'))
    row_t('Vivo',          r['vivo'] or '—')
    row_t('Estado',        _STATUS_LABEL.get(r['status'] or '', '—'))
    if r['notes']:   row_t('Notas',   r['notes'])
    if r['sources']: row_t('Fuentes', r['sources'])

    console.print()
    console.print(Panel(txt, title=f'[bold]{r["name"]}[/bold]  [dim]({pid})[/dim]', expand=False))

    if marriages:
        t = Table(box=rbox.SIMPLE, title='Matrimonios', header_style='dim', show_edge=False)
        t.add_column('ID', style='dim'); t.add_column('Cónyuge')
        t.add_column('Fecha'); t.add_column('Lugar')
        for m in marriages:
            t.add_row(m['id'], m['spouse_name'],
                      iso_to_display(m['marriage_date']) or '—', m['marriage_place'] or '—')
        console.print(t)

    if media:
        t = Table(box=rbox.SIMPLE, title='Media', header_style='dim', show_edge=False)
        t.add_column('ID', style='dim'); t.add_column('Tipo')
        t.add_column('Archivo'); t.add_column('Descripción')
        for med in media:
            t.add_row(med['id'], med['type'], med['url'], med['caption'] or '')
        console.print(t)

    console.print()


def show_marriages():
    con = get_con()
    cur = con.cursor()
    cur.execute("""
        SELECT m.id, p1.name n1, p2.name n2, m.marriage_date, m.marriage_place
        FROM matrimonios m
        JOIN personas p1 ON m.spouse1_id = p1.id
        JOIN personas p2 ON m.spouse2_id = p2.id
        ORDER BY CAST(SUBSTR(m.id, 2) AS INTEGER)
    """)
    rows = cur.fetchall()
    con.close()

    t = Table(box=rbox.SIMPLE_HEAD, header_style='bold', show_edge=False)
    t.add_column('ID',       style='dim', width=5)
    t.add_column('Cónyuge 1', min_width=24)
    t.add_column('Cónyuge 2', min_width=24)
    t.add_column('Fecha',    width=12)
    t.add_column('Lugar')
    for r in rows:
        t.add_row(r['id'], r['n1'], r['n2'],
                  iso_to_display(r['marriage_date']) or '—', r['marriage_place'] or '—')
    console.print()
    console.print(t)
    console.print(f'[dim]  {len(rows)} matrimonios[/dim]\n')


# ── personas CRUD ─────────────────────────────────────────────────────────────

def _collect_fields(cur, defaults=None):
    d = defaults or {}
    console.print('[dim]  Enter para mantener el valor actual[/dim]\n')

    name        = qtext('Nombre completo', d.get('name', ''))
    gender      = qselect('Género',   _GENDER_CHOICES, default=d.get('gender', ''))
    birth_date  = qdate('Nacimiento  (DD/MM/YYYY o YYYY)', d.get('birth_date', ''))
    birth_place = qplace('Lugar de nacimiento',  cur, d.get('birth_place', '') or '')
    death_date  = qdate('Fallecimiento (DD/MM/YYYY o YYYY)', d.get('death_date', ''))
    death_place = qplace('Lugar de fallecimiento', cur, d.get('death_place', '') or '')
    father_id   = pick_persona_optional(cur, 'Padre', d.get('father_id') or None)
    mother_id   = pick_persona_optional(cur, 'Madre', d.get('mother_id') or None)
    branch      = qtext('Rama familiar', d.get('branch', '') or '')
    gen_raw     = qtext('Generación (número)', str(d.get('generation') or 0))

    # Sugerir orden según hermanos existentes (solo al agregar, no al editar)
    if defaults is None:
        parent_id = father_id or mother_id
        if parent_id:
            cur.execute(
                'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM personas WHERE father_id=? OR mother_id=?',
                (parent_id, parent_id)
            )
            suggested_order = str(cur.fetchone()[0])
        else:
            suggested_order = '0'
    else:
        suggested_order = str(d.get('sort_order') or 0)
    ord_raw     = qtext('Orden en la generación', suggested_order)
    vivo        = qselect('¿Está vivo?', _VIVO_CHOICES, default=d.get('vivo', ''))
    photo_url   = qtext('Foto de perfil (ruta o vacío)', d.get('photo_url', '') or '')
    notes       = qtext('Notas',   d.get('notes',   '') or '')
    sources     = qtext('Fuentes', d.get('sources', '') or '')
    status      = qselect('Estado investigación', _STATUS_CHOICES,
                           default=d.get('status', 'sin_datos'))

    try:    generation = int(gen_raw)
    except: generation = 0
    try:    sort_order = int(ord_raw)
    except: sort_order = 0

    for field, val in [('father_id', father_id), ('mother_id', mother_id)]:
        warn_ref(cur, field, val)

    return {
        'name': name, 'gender': gender or '',
        'birth_date': birth_date, 'birth_place': birth_place or None,
        'death_date': death_date, 'death_place': death_place or None,
        'father_id': father_id or None, 'mother_id': mother_id or None,
        'branch': branch or None, 'generation': generation, 'sort_order': sort_order,
        'vivo': vivo or '', 'photo_url': photo_url or None,
        'notes': notes or None, 'sources': sources or None,
        'status': status or 'sin_datos',
    }


def cmd_list(_args=None):
    show_personas()


def cmd_show(args=None):
    if args:
        pid = args[0]
    else:
        con = get_con(); cur = con.cursor()
        pid = pick_persona(cur); con.close()
        if not pid: return
    show_persona(pid)


def cmd_add(_args=None):
    con = get_con(); cur = con.cursor()
    suggested = next_id(cur, 'personas', 'p', r'^p\d+$')

    console.print('\n[bold]Agregar persona[/bold]\n')
    pid_raw = qtext('ID', suggested)
    pid = pid_raw.strip() or suggested

    if not re.match(r'^p\d+$', pid):
        console.print('[red]✗[/red] El ID debe ser p<número> (ej: p58)'); con.close(); return
    cur.execute('SELECT id FROM personas WHERE id = ?', (pid,))
    if cur.fetchone():
        console.print(f'[red]✗[/red] Ya existe "{pid}"'); con.close(); return

    console.print()
    f = _collect_fields(cur)
    if not f['name']:
        console.print('[red]✗[/red] El nombre es obligatorio.'); con.close(); return

    cur.execute(
        'INSERT INTO personas (id,name,gender,birth_date,birth_place,death_date,death_place,'
        'father_id,mother_id,branch,generation,sort_order,vivo,photo_url,notes,sources,status) '
        'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (pid, f['name'], f['gender'], f['birth_date'], f['birth_place'], f['death_date'],
         f['death_place'], f['father_id'], f['mother_id'], f['branch'], f['generation'],
         f['sort_order'], f['vivo'], f['photo_url'], f['notes'], f['sources'], f['status']),
    )
    con.commit(); con.close()
    console.print(f'\n[green]✓[/green] "{f["name"]}" agregada como [bold]{pid}[/bold]')
    offer_export()


def cmd_edit(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        pid = args[0]
    else:
        pid = pick_persona(cur, 'Persona a editar')
        if not pid: con.close(); return

    cur.execute('SELECT * FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe "{pid}"'); con.close(); return

    console.print(f'\n[bold]Editar:[/bold] {r["name"]} [dim]({pid})[/dim]\n')
    f = _collect_fields(cur, dict(r))

    cur.execute(
        'UPDATE personas SET name=?,gender=?,birth_date=?,birth_place=?,death_date=?,death_place=?,'
        'father_id=?,mother_id=?,branch=?,generation=?,sort_order=?,vivo=?,photo_url=?,notes=?,sources=?,status=? '
        'WHERE id=?',
        (f['name'], f['gender'], f['birth_date'], f['birth_place'], f['death_date'], f['death_place'],
         f['father_id'], f['mother_id'], f['branch'], f['generation'], f['sort_order'], f['vivo'],
         f['photo_url'], f['notes'], f['sources'], f['status'], pid),
    )
    con.commit(); con.close()
    console.print(f'\n[green]✓[/green] [bold]{pid}[/bold] actualizado.')
    offer_export()


def cmd_delete(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        pid = args[0]
    else:
        pid = pick_persona(cur, 'Persona a eliminar')
        if not pid: con.close(); return

    cur.execute('SELECT * FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe "{pid}"'); con.close(); return

    cur.execute('SELECT COUNT(*) FROM personas WHERE father_id=? OR mother_id=?', (pid, pid))
    n_hijos = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM matrimonios WHERE spouse1_id=? OR spouse2_id=?', (pid, pid))
    n_mat = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM media WHERE persona_id=?', (pid,))
    n_med = cur.fetchone()[0]

    console.print(f'\n  [bold]{r["name"]}[/bold]  [dim]({pid})[/dim]')
    if n_hijos: console.print(f'  [yellow]⚠[/yellow]  Es padre/madre de {n_hijos} persona(s)')
    if n_mat:   console.print(f'  [yellow]⚠[/yellow]  Tiene {n_mat} matrimonio(s)')
    if n_med:   console.print(f'  [yellow]⚠[/yellow]  Tiene {n_med} archivo(s) de media')

    if not qconfirm(f'¿Eliminar "{r["name"]}"? Esta acción no se puede deshacer.', default=False):
        console.print('Cancelado.'); con.close(); return

    cur.execute('DELETE FROM personas WHERE id = ?', (pid,))
    con.commit(); con.close()
    console.print(f'[green]✓[/green] "{r["name"]}" eliminada.')
    offer_export()


# ── matrimonios CRUD ──────────────────────────────────────────────────────────

def cmd_list_marriages(_args=None):
    show_marriages()


def cmd_add_marriage(_args=None):
    con = get_con(); cur = con.cursor()
    console.print('\n[bold]Agregar matrimonio[/bold]\n')

    s1_raw = pick_persona(cur, 'Cónyuge 1')
    if not s1_raw: con.close(); return
    s2_raw = pick_persona(cur, 'Cónyuge 2')
    if not s2_raw: con.close(); return

    s1, s2 = sorted([s1_raw, s2_raw], key=get_num)
    for pid in [s1, s2]:
        cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
        row = cur.fetchone()
        if not row:
            console.print(f'[red]✗[/red] No existe "{pid}"'); con.close(); return
        console.print(f'  [dim]→[/dim] {row["name"]}')

    cur.execute('SELECT id FROM matrimonios WHERE spouse1_id=? AND spouse2_id=?', (s1, s2))
    if cur.fetchone():
        console.print(f'[red]✗[/red] Ya existe matrimonio entre {s1} y {s2}'); con.close(); return

    mid = next_id(cur, 'matrimonios', 'm', r'^m\d+$')
    console.print()
    marriage_date  = qdate('Fecha de matrimonio (DD/MM/YYYY o YYYY)')
    marriage_place = qplace('Lugar de matrimonio', cur)
    divorce_date   = qdate('Fecha de divorcio (vacío si no aplica)')
    notes          = qtext('Notas')

    cur.execute(
        'INSERT INTO matrimonios (id,spouse1_id,spouse2_id,marriage_date,marriage_place,divorce_date,notes) '
        'VALUES (?,?,?,?,?,?,?)',
        (mid, s1, s2, marriage_date or None, marriage_place or None, divorce_date or None, notes or None),
    )
    con.commit(); con.close()
    console.print(f'\n[green]✓[/green] Matrimonio [bold]{mid}[/bold] registrado ({s1} ↔ {s2})')
    offer_export()


def cmd_edit_marriage(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        mid = args[0]
    else:
        mid = pick_marriage(cur, 'Matrimonio a editar')
        if not mid: con.close(); return

    cur.execute('SELECT * FROM matrimonios WHERE id = ?', (mid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe matrimonio "{mid}"'); con.close(); return

    cur.execute('SELECT name FROM personas WHERE id = ?', (r['spouse1_id'],))
    n1 = cur.fetchone()['name']
    cur.execute('SELECT name FROM personas WHERE id = ?', (r['spouse2_id'],))
    n2 = cur.fetchone()['name']

    d = dict(r)
    console.print(f'\n[bold]Editar matrimonio {mid}:[/bold] {n1} ↔ {n2}\n')
    marriage_date  = qdate('Fecha de matrimonio (DD/MM/YYYY o YYYY)', d.get('marriage_date', ''))
    marriage_place = qplace('Lugar de matrimonio', cur, d.get('marriage_place', '') or '')
    divorce_date   = qdate('Fecha de divorcio (vacío si no aplica)', d.get('divorce_date', ''))
    notes          = qtext('Notas', d.get('notes', '') or '')

    cur.execute(
        'UPDATE matrimonios SET marriage_date=?,marriage_place=?,divorce_date=?,notes=? WHERE id=?',
        (marriage_date or None, marriage_place or None, divorce_date or None, notes or None, mid),
    )
    con.commit(); con.close()
    console.print(f'\n[green]✓[/green] Matrimonio [bold]{mid}[/bold] actualizado.')
    offer_export()


def cmd_delete_marriage(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        mid = args[0]
    else:
        mid = pick_marriage(cur, 'Matrimonio a eliminar')
        if not mid: con.close(); return

    cur.execute("""
        SELECT m.*, p1.name n1, p2.name n2 FROM matrimonios m
        JOIN personas p1 ON m.spouse1_id = p1.id
        JOIN personas p2 ON m.spouse2_id = p2.id
        WHERE m.id = ?
    """, (mid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe matrimonio "{mid}"'); con.close(); return

    console.print(f'\n  {r["n1"]} ↔ {r["n2"]}  [dim]({mid})[/dim]')
    if not qconfirm('¿Eliminar este matrimonio?', default=False):
        console.print('Cancelado.'); con.close(); return

    cur.execute('DELETE FROM matrimonios WHERE id = ?', (mid,))
    con.commit(); con.close()
    console.print(f'[green]✓[/green] Matrimonio {mid} eliminado.')
    offer_export()


# ── media CRUD ────────────────────────────────────────────────────────────────

def _media_dirs(media_type):
    if media_type == 'photo':
        return os.path.join(ROOT, 'assets', 'images', 'personas'), 'assets/images/personas/'
    return os.path.join(ROOT, 'assets', 'docs', 'personas'), 'assets/docs/personas/'


def qfile(label, cur, media_type='photo', default=''):
    """Autocomplete de archivos en la carpeta correspondiente."""
    abs_dir, prefix = _media_dirs(media_type)
    files = []
    if os.path.exists(abs_dir):
        # Archivos sin registrar primero, luego los ya registrados
        cur.execute('SELECT DISTINCT url FROM media')
        registered = {r[0] for r in cur.fetchall()}
        all_files = sorted(f for f in os.listdir(abs_dir)
                           if not f.startswith('.') and os.path.isfile(os.path.join(abs_dir, f)))
        pending = [f for f in all_files if prefix + f not in registered]
        done    = [f'[✓] {f}' for f in all_files if prefix + f in registered]
        files   = pending + done
    if not files:
        return qtext(label, default)
    default_choice = os.path.basename(default) if default else ''
    raw = _ask(questionary.autocomplete(label, choices=files, default=default_choice, style=STYLE))
    if not raw:
        return default or ''
    clean = raw.lstrip('[✓] ').strip()
    return clean if '/' in clean else prefix + clean


def cmd_list_unregistered(_args=None):
    """Muestra archivos en assets/.../personas/ que no están en la tabla media."""
    con = get_con(); cur = con.cursor()
    cur.execute('SELECT DISTINCT url FROM media')
    registered = {r[0] for r in cur.fetchall()}
    con.close()

    any_found = False
    for rel_dir in ['assets/images/personas', 'assets/docs/personas']:
        abs_dir = os.path.join(ROOT, rel_dir)
        if not os.path.exists(abs_dir):
            continue
        files = sorted(f for f in os.listdir(abs_dir)
                       if not f.startswith('.') and os.path.isfile(os.path.join(abs_dir, f)))
        if not files:
            continue
        pending = [f for f in files if f'{rel_dir}/{f}' not in registered]
        done    = [f for f in files if f'{rel_dir}/{f}' in registered]
        t = Table(box=rbox.SIMPLE_HEAD, title=f'[dim]{rel_dir}[/dim]',
                  header_style='bold', show_edge=False)
        t.add_column('Archivo')
        t.add_column('Estado', width=14)
        for f in pending: t.add_row(f, '[yellow]sin registrar[/yellow]')
        for f in done:    t.add_row(f, '[green]✓ en DB[/green]')
        console.print()
        console.print(t)
        any_found = True
    if not any_found:
        console.print('\n[dim](carpetas vacías o inexistentes)[/dim]')
    console.print()

def cmd_list_media(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        pid = args[0]
        cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
        r = cur.fetchone()
        if not r:
            console.print(f'[red]✗[/red] No existe "{pid}"'); con.close(); return
        cur.execute(
            'SELECT m.*, p.name pn FROM media m JOIN personas p ON m.persona_id=p.id '
            'WHERE m.persona_id=? ORDER BY m.id', (pid,)
        )
        title = f'Media de {r["name"]} ({pid})'
    else:
        cur.execute(
            'SELECT m.*, p.name pn FROM media m JOIN personas p ON m.persona_id=p.id '
            'ORDER BY m.persona_id, m.id'
        )
        title = 'Archivos de media'

    rows = cur.fetchall(); con.close()
    if not rows:
        console.print('[dim](sin archivos)[/dim]\n'); return

    t = Table(box=rbox.SIMPLE_HEAD, title=title, header_style='bold', show_edge=False)
    t.add_column('ID', style='dim', width=7)
    t.add_column('Persona', min_width=20)
    t.add_column('Tipo', width=10)
    t.add_column('Archivo')
    t.add_column('Descripción')
    for m in rows:
        t.add_row(m['id'], m['pn'], m['type'], m['url'], m['caption'] or '')
    console.print()
    console.print(t)
    console.print()


def cmd_add_media(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        pid = args[0]
    else:
        pid = pick_persona(cur, 'Persona a la que asociar el archivo')
        if not pid: con.close(); return

    cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
    r = cur.fetchone()
    if not r:
        console.print(f'[red]✗[/red] No existe "{pid}"'); con.close(); return

    console.print(f'\n[bold]Agregar media a {r["name"]}[/bold] [dim]({pid})[/dim]\n')
    mid = next_id(cur, 'media', 'med', r'^med\d+$')

    media_type = qselect('Tipo', [
        questionary.Choice('Foto',      'photo'),
        questionary.Choice('Documento', 'document'),
    ])
    url = qfile('Archivo', cur, media_type)
    if not url:
        console.print('[red]✗[/red] El archivo no puede estar vacío'); con.close(); return

    caption      = qtext('Descripción (caption)')
    date         = qdate('Fecha del archivo (DD/MM/YYYY o YAML, o vacío)')
    source_label = qtext('Fuente / archivo de origen')
    group_label  = qtext('Nombre del grupo (vacío = sin grupo)')
    group_order  = 0
    if group_label:
        cur.execute('SELECT COALESCE(MAX(group_order),0)+1 FROM media WHERE group_label=?', (group_label,))
        suggested = cur.fetchone()[0]
        raw_ord = qtext('Posición en el grupo', str(suggested))
        group_order = int(raw_ord) if raw_ord.isdigit() else suggested

    cur.execute(
        'INSERT INTO media (id,persona_id,type,url,caption,date,source_label,group_label,group_order) '
        'VALUES (?,?,?,?,?,?,?,?,?)',
        (mid, pid, media_type, url, caption or None, date or None,
         source_label or None, group_label or None, group_order),
    )
    con.commit(); con.close()
    console.print(f'\n[green]✓[/green] Media [bold]{mid}[/bold] asociada a {pid}')
    offer_export()


def cmd_delete_media(args=None):
    con = get_con(); cur = con.cursor()
    if args:
        mid = args[0]
    else:
        cur.execute(
            'SELECT m.id, p.name pn, m.type, m.url FROM media m '
            'JOIN personas p ON m.persona_id=p.id ORDER BY m.persona_id, m.id'
        )
        rows = cur.fetchall()
        if not rows:
            console.print('[dim]No hay archivos de media.[/dim]'); con.close(); return
        choices = [f'{r["pn"]}  [{r["type"]}]  {r["url"]}  ({r["id"]})' for r in rows]
        raw = _ask(questionary.autocomplete('Archivo a eliminar', choices=choices, style=STYLE))
        if not raw: con.close(); return
        m = re.search(r'\((\w+)\)\s*$', raw)
        mid = m.group(1) if m else None
        if not mid: con.close(); return

    cur.execute(
        'SELECT m.*, p.name pn FROM media m JOIN personas p ON m.persona_id=p.id WHERE m.id=?', (mid,)
    )
    row = cur.fetchone()
    if not row:
        console.print(f'[red]✗[/red] No existe "{mid}"'); con.close(); return

    console.print(f'\n  {row["id"]}  [{row["type"]}]  —  {row["pn"]}')
    console.print(f'  URL:  {row["url"]}')
    if row['caption']: console.print(f'  Texto:  {row["caption"]}')

    if not qconfirm('¿Eliminar este registro?', default=False):
        console.print('Cancelado.'); con.close(); return

    cur.execute('DELETE FROM media WHERE id = ?', (mid,))
    con.commit()
    console.print(f'[green]✓[/green] Registro {mid} eliminado.')

    file_path = os.path.join(ROOT, row['url'])
    if os.path.exists(file_path):
        if qconfirm(f'¿Eliminar también el archivo del disco? ({row["url"]})', default=False):
            os.remove(file_path)
            console.print(f'[green]✓[/green] Archivo eliminado del disco.')

    con.close()
    offer_export()


# ── menús interactivos ────────────────────────────────────────────────────────

def _submenu_personas():
    while True:
        choice = _ask(questionary.select('Personas', style=STYLE, choices=[
            questionary.Choice('Listar todas',  'list'),
            questionary.Choice('Ver detalle',   'show'),
            questionary.Choice('Agregar nueva', 'add'),
            questionary.Choice('Editar',        'edit'),
            questionary.Choice('Eliminar',      'delete'),
            SEP,
            questionary.Choice(BACK, 'back'),
        ]))
        if not choice or choice == 'back': return
        {'list': cmd_list, 'show': cmd_show, 'add': cmd_add,
         'edit': cmd_edit, 'delete': cmd_delete}[choice]()


def _submenu_matrimonios():
    while True:
        choice = _ask(questionary.select('Matrimonios', style=STYLE, choices=[
            questionary.Choice('Listar todos',  'list'),
            questionary.Choice('Agregar nuevo', 'add'),
            questionary.Choice('Editar',        'edit'),
            questionary.Choice('Eliminar',      'delete'),
            SEP,
            questionary.Choice(BACK, 'back'),
        ]))
        if not choice or choice == 'back': return
        {'list': cmd_list_marriages, 'add': cmd_add_marriage,
         'edit': cmd_edit_marriage, 'delete': cmd_delete_marriage}[choice]()


def cmd_add_media_bulk(_args=None):
    con = get_con(); cur = con.cursor()
    console.print('\n[bold]Asociar archivo a varias personas[/bold]\n')

    media_type = qselect('Tipo', [
        questionary.Choice('Foto',      'photo'),
        questionary.Choice('Documento', 'document'),
    ])
    url = qfile('Archivo', cur, media_type)
    if not url:
        console.print('[red]✗[/red] El archivo no puede estar vacío'); con.close(); return

    caption      = qtext('Descripción (caption)')
    date         = qdate('Fecha del archivo (DD/MM/YYYY o YYYY, o vacío)')
    source_label = qtext('Fuente / archivo de origen')
    group_label  = qtext('Nombre del grupo (recomendado)')

    console.print('\n[dim]Seleccioná las personas una por una. Enter vacío para terminar.[/dim]\n')

    added = []
    while True:
        pid = pick_persona(cur, f'Persona {len(added) + 1}  (Enter para terminar)')
        if not pid:
            break
        mid = next_id(cur, 'media', 'med', r'^med\d+$')
        cur.execute(
            'INSERT INTO media (id,persona_id,type,url,caption,date,source_label,group_label,group_order) '
            'VALUES (?,?,?,?,?,?,?,?,?)',
            (mid, pid, media_type, url, caption or None, date or None,
             source_label or None, group_label or None, len(added)),
        )
        con.commit()
        cur.execute('SELECT name FROM personas WHERE id = ?', (pid,))
        name = cur.fetchone()['name']
        console.print(f'  [green]✓[/green] {name} [dim]({pid}) → {mid}[/dim]')
        added.append(pid)

    con.close()
    if added:
        console.print(f'\n[green]✓[/green] Archivo asociado a [bold]{len(added)}[/bold] persona(s).')
        offer_export()
    else:
        console.print('[dim]Sin cambios.[/dim]')


def _submenu_media():
    while True:
        choice = _ask(questionary.select('Media', style=STYLE, choices=[
            questionary.Choice('Listar todos',          'list'),
            questionary.Choice('Ver sin registrar',     'pending'),
            questionary.Choice('Agregar a una persona', 'add'),
            questionary.Choice('Agregar a varias',      'bulk'),
            questionary.Choice('Eliminar',              'delete'),
            SEP,
            questionary.Choice(BACK, 'back'),
        ]))
        if not choice or choice == 'back': return
        {'list': cmd_list_media, 'pending': cmd_list_unregistered,
         'add': cmd_add_media, 'bulk': cmd_add_media_bulk,
         'delete': cmd_delete_media}[choice]()


OPTIMIZE_SCRIPT = os.path.join(ROOT, 'scripts', 'optimize-personas.js')


def cmd_optimize(_args=None):
    img_dir = os.path.join(ROOT, 'assets', 'images', 'personas')
    if not os.path.exists(img_dir):
        console.print('[yellow]⚠[/yellow]  No existe assets/images/personas/')
        return
    pending = [f for f in os.listdir(img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    if not pending:
        console.print('[dim]No hay JPG/PNG para optimizar en assets/images/personas/[/dim]')
        return
    console.print(f'\n  {len(pending)} archivo(s) sin optimizar: ' + ', '.join(pending[:5]) +
                  ('...' if len(pending) > 5 else ''))
    if not qconfirm('¿Convertir a WebP ahora?', default=True):
        console.print('Cancelado.')
        return
    result = subprocess.run(['node', OPTIMIZE_SCRIPT], capture_output=False)
    if result.returncode != 0:
        console.print('[red]✗[/red] El optimizador terminó con error.')
    console.print()


def cmd_deploy(_args=None):
    console.print()
    subprocess.run(['npm', 'run', 'deploy'], cwd=ROOT)
    console.print()


def interactive():
    console.print(Panel(
        '[bold]Árbol Genealógico[/bold]\n[dim]Gestor de personas, matrimonios y media[/dim]',
        expand=False, border_style='dim',
    ))
    console.print()
    while True:
        choice = _ask(questionary.select('¿Qué querés gestionar?', style=STYLE, choices=[
            questionary.Choice('Personas',             'personas'),
            questionary.Choice('Matrimonios',          'matrimonios'),
            questionary.Choice('Media',                'media'),
            questionary.Choice('Optimizar imágenes',   'optimize'),
            questionary.Choice('Deploy',               'deploy'),
            SEP,
            questionary.Choice('Salir',                'salir'),
        ]))
        if not choice or choice == 'salir': break
        {'personas': _submenu_personas, 'matrimonios': _submenu_matrimonios,
         'media': _submenu_media, 'optimize': cmd_optimize,
         'deploy': cmd_deploy}[choice]()


# ── main ──────────────────────────────────────────────────────────────────────

COMMANDS = {
    'list':             cmd_list,
    'show':             cmd_show,
    'add':              cmd_add,
    'edit':             cmd_edit,
    'delete':           cmd_delete,
    'list-marriages':   cmd_list_marriages,
    'add-marriage':     cmd_add_marriage,
    'edit-marriage':    cmd_edit_marriage,
    'delete-marriage':  cmd_delete_marriage,
    'list-media':       cmd_list_media,
    'add-media':        cmd_add_media,
    'delete-media':     cmd_delete_media,
    'add-media-bulk':   cmd_add_media_bulk,
    'list-unregistered': cmd_list_unregistered,
    'optimize':         cmd_optimize,
}


def main():
    args = sys.argv[1:]
    if not args:
        interactive()
        return
    cmd = args[0]
    if cmd not in COMMANDS:
        console.print(f'[red]Comando desconocido:[/red] {cmd}')
        console.print('Disponibles: ' + ', '.join(COMMANDS))
        sys.exit(1)
    COMMANDS[cmd](args[1:])


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        console.print('\n[dim]Saliendo...[/dim]')
        sys.exit(0)
