/**
 * keyboard.js — navegación por el árbol con teclado.
 *
 * ↑            sube al padre
 * ↓            baja al primer hijo
 * ←            cicla entre hermanos (cíclico, envuelve al llegar al extremo)
 * →            va al cónyuge de la persona actual
 * Enter/Space  abre el panel de la persona en foco
 * Escape       cierra el panel
 *
 * Flujo típico para acceder a la línea materna:
 *   [hijo] ↑ [padre] → [madre] ↑ [abuelo materno]
 */

import {
  getPersona,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
  getHijosByPersona,
} from './data.js';
import { getFocusPersonId, setFocus, setSelected } from './store.js';

export function initKeyboard() {
  document.addEventListener('keydown', _onKey);
}

function _onKey(e) {
  if (e.target.closest('input, textarea, [contenteditable]')) return;

  const currentId = getFocusPersonId();

  if (e.key === 'Escape') {
    setSelected(null);
    return;
  }

  if (!currentId) return;

  let targetId = null;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      targetId = _goUp(currentId);
      break;
    case 'ArrowDown':
      e.preventDefault();
      targetId = _goDown(currentId);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      targetId = _cycleSiblings(currentId);
      break;
    case 'ArrowRight':
      e.preventDefault();
      targetId = _goSpouse(currentId);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      setSelected(currentId);
      return;
  }

  if (targetId) {
    setFocus(targetId);
    setSelected(targetId);
  }
}

function _goUp(id) {
  const p = getPersona(id);
  if (!p) return null;
  return p.father_id || p.mother_id || null;
}

function _goDown(id) {
  for (const m of getMatrimoniosByPersona(id)) {
    const children = getHijosByMatrimonio(m.id);
    if (children.length > 0) return children[0].id;
  }
  const orphans = getHijosSinMatrimonio(id);
  return orphans.length > 0 ? orphans[0].id : null;
}

/** ← : cicla entre hermanos (comparten padre/madre), envuelve al llegar al extremo. */
function _cycleSiblings(id) {
  const p = getPersona(id);
  if (!p) return null;

  const parentId = p.father_id || p.mother_id;
  if (!parentId) return null;

  const siblings = [...getHijosByPersona(parentId)]
    .sort((a, b) => a.sort_order - b.sort_order);

  if (siblings.length <= 1) return null;

  const idx = siblings.findIndex(s => s.id === id);
  if (idx === -1) return null;

  // Ciclo: al llegar al primero, envuelve al último
  return siblings[(idx - 1 + siblings.length) % siblings.length].id;
}

/** → : va al primer cónyuge de la persona actual. */
function _goSpouse(id) {
  const marriages = getMatrimoniosByPersona(id);
  if (!marriages.length) return null;
  const m = marriages[0];
  const spouseId = m.spouse1_id === id ? m.spouse2_id : m.spouse1_id;
  return getPersona(spouseId) ? spouseId : null;
}
