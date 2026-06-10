#!/usr/bin/env python3
"""
Genera assets/data/arbol.json desde data/arbol.db.
Invocado automáticamente por scripts/build.js en cada build.

Estructura del JSON:
  {
    "personas": [ { ...campos, "media": [...] }, ... ],
    "matrimonios": [ { ...campos }, ... ]
  }

Las fechas se exportan en ISO (YYYY-MM-DD). El frontend las parsea directamente.
Los hijos son derivados: el frontend los infiere desde father_id/mother_id.
Los media se embeben en cada persona para evitar joins en el frontend.
"""
import json
import sqlite3
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'data', 'arbol.db')
JSON_PATH = os.path.join(ROOT, 'assets', 'data', 'arbol.json')


def load_media_by_persona(cur):
    cur.execute(
        'SELECT id, persona_id, type, url, caption, date, source_label, group_label, group_order '
        'FROM media ORDER BY group_label, group_order, id'
    )
    by_persona = {}
    for row in cur.fetchall():
        pid = row['persona_id']
        if pid not in by_persona:
            by_persona[pid] = []
        by_persona[pid].append({
            'id':           row['id'],
            'type':         row['type'],
            'url':          row['url'],
            'caption':      row['caption'],
            'date':         row['date'],
            'source_label': row['source_label'],
            'group_label':  row['group_label'] or '',
            'group_order':  row['group_order'] or 0,
        })
    return by_persona


def main():
    if not os.path.exists(DB_PATH):
        print(f'⚠️  No existe {DB_PATH} — saltando actualización de arbol.json')
        return

    try:
        from actualizar_status import actualizar_status
        n = actualizar_status(apply=True, quiet=True)
        if n:
            print(f'🏷️  {n} status actualizado(s) automáticamente')
    except Exception as e:
        print(f'⚠️  actualizar_status falló: {e}')

    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    media_by_persona = load_media_by_persona(cur)

    cur.execute('SELECT * FROM personas ORDER BY generation, sort_order')
    personas = [
        {
            'id':          r['id'],
            'name':        r['name'],
            'gender':      r['gender'],
            'birth_date':  r['birth_date'],
            'birth_place': r['birth_place'],
            'death_date':  r['death_date'],
            'death_place': r['death_place'],
            'father_id':   r['father_id'],
            'mother_id':   r['mother_id'],
            'branch':      r['branch'],
            'generation':  r['generation'],
            'sort_order':  r['sort_order'],
            'vivo':        r['vivo'],
            'photo_url':   r['photo_url'],
            'notes':       r['notes'],
            'sources':     r['sources'],
            'status':      r['status'],
            'media':       media_by_persona.get(r['id'], []),
        }
        for r in cur.fetchall()
    ]

    cur.execute('SELECT * FROM matrimonios ORDER BY id')
    matrimonios = [
        {
            'id':             r['id'],
            'spouse1_id':     r['spouse1_id'],
            'spouse2_id':     r['spouse2_id'],
            'marriage_date':  r['marriage_date'],
            'marriage_place': r['marriage_place'],
            'divorce_date':   r['divorce_date'],
            'notes':          r['notes'],
        }
        for r in cur.fetchall()
    ]

    con.close()

    data = {'personas': personas, 'matrimonios': matrimonios}
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'✅ arbol.json generado: {len(personas)} personas, {len(matrimonios)} matrimonios')


if __name__ == '__main__':
    main()
