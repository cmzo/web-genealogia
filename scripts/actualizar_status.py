#!/usr/bin/env python3
"""
Deriva el campo `status` de personas a partir de señales objetivas en la base
y el repositorio, para que el badge del panel no quede desactualizado a mano.

Señales y escalera (de menor a mayor):
  sin_datos   — solo nombre y relaciones
  incompleto  — tiene alguna fecha o lugar cargado
  en_proceso  — tiene documentos adjuntos (media), ficha de investigación
                (content/personas/p{id}.md) o fuentes citadas (sources)
  verificado  — NUNCA se asigna ni se quita automáticamente: lo pone el
                investigador cuando hay acta o ≥2 fuentes primarias coherentes

El script solo sube estados, nunca baja uno puesto a mano.
Lo invoca export_arbol.py en cada export; también se puede correr solo:

  python3 scripts/actualizar_status.py            # dry-run: muestra qué cambiaría
  python3 scripts/actualizar_status.py --apply    # aplica los cambios
"""
import os
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'data', 'arbol.db')
FICHAS_DIR = os.path.join(ROOT, 'content', 'personas')

LADDER = ['sin_datos', 'incompleto', 'en_proceso', 'verificado']


def _derivar(row, media_count, tiene_ficha):
    nivel = 0
    if any((row['birth_date'], row['death_date'], row['birth_place'], row['death_place'])):
        nivel = 1
    if media_count > 0 or tiene_ficha or (row['sources'] or '').strip():
        nivel = 2
    return nivel


def actualizar_status(apply=False, quiet=False):
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute('SELECT persona_id, COUNT(*) c FROM media GROUP BY persona_id')
    media = {r['persona_id']: r['c'] for r in cur.fetchall()}

    cur.execute('SELECT * FROM personas')
    cambios = []
    for r in cur.fetchall():
        actual = r['status'] if r['status'] in LADDER else 'sin_datos'
        if actual == 'verificado':
            continue
        ficha = os.path.exists(os.path.join(FICHAS_DIR, f"{r['id']}.md"))
        derivado = _derivar(r, media.get(r['id'], 0), ficha)
        if derivado > LADDER.index(actual):
            cambios.append((r['id'], r['name'], actual, LADDER[derivado]))

    if apply:
        for pid, _, _, nuevo in cambios:
            cur.execute('UPDATE personas SET status=? WHERE id=?', (nuevo, pid))
        con.commit()
    con.close()

    if not quiet:
        for pid, name, antes, despues in cambios:
            print(f'  {pid:5} {name[:35]:35} {antes} → {despues}')
        accion = 'aplicados' if apply else 'pendientes (usar --apply)'
        print(f'🏷️  {len(cambios)} cambio(s) de status {accion}')
    return len(cambios)


if __name__ == '__main__':
    actualizar_status(apply='--apply' in sys.argv)
