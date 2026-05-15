/**
 * layout.js — posicionamiento dinámico centrado en el foco.
 *
 * El árbol muestra siempre tres filas:
 *   y = -VGAP  → padre y madre del foco (con su nodo de matrimonio)
 *   y =  0     → foco + todos sus hermanos, cada uno con su cónyuge adyacente
 *   y = +VGAP  → hijos del foco (de todos sus matrimonios)
 *
 * El foco siempre queda en x=0. Todos los demás nodos se posicionan
 * relativamente a él. Al cambiar el foco se recalcula todo.
 */

import {
  getPersona,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
  getHijosByPersona,
  getMatrimonioBetween,
} from './data.js';
import { CARD } from './config.js';

export const VGAP = CARD.height * 2;        // 160 px entre filas
const HGAP        = CARD.width + CARD.gap;  // 184 px por slot horizontal

export function computeLayout(focusId) {
  const nodes = new Map();
  const edges = [];

  const focus = getPersona(focusId);
  if (!focus) return null;

  // ── Fila del foco (y = 0): hermanos + sus cónyuges ───────────────────────

  const sibs = _getSiblings(focusId);  // incluye al foco, ordenado por sort_order

  // Construir la fila: cada hermano seguido de su cónyuge (si tiene)
  const row = [];
  const inRow = new Set();
  for (const sib of sibs) {
    if (inRow.has(sib.id)) continue;
    row.push(sib);
    inRow.add(sib.id);
    const spouse = _getFirstSpouse(sib.id);
    if (spouse && !inRow.has(spouse.id)) {
      row.push(spouse);
      inRow.add(spouse.id);
    }
  }

  // Foco siempre en x = 0; los demás relativos a su posición en la fila
  const focusIdx = row.findIndex(p => p.id === focusId);
  row.forEach((p, i) => {
    nodes.set(p.id, {
      nodeId: p.id,
      x:      (i - focusIdx) * HGAP,
      y:      0,
      type:   'persona',
      data:   p,
    });
  });

  // ── Matrimonios de la fila y hijos del foco ───────────────────────────────

  const doneMarriages = new Set();

  sibs.forEach(sib => {
    getMatrimoniosByPersona(sib.id).forEach(m => {
      if (doneMarriages.has(m.id)) return;
      const n1 = nodes.get(m.spouse1_id);
      const n2 = nodes.get(m.spouse2_id);
      if (!n1 && !n2) return;
      doneMarriages.add(m.id);

      const anchor = n1 ?? n2;
      const mx = n1 && n2 ? (n1.x + n2.x) / 2 : anchor.x;

      nodes.set(m.id, { nodeId: m.id, x: mx, y: CARD.height / 2, type: 'marriage', data: m });
      if (n1) edges.push({ source: m.spouse1_id, target: m.id, kind: 'spouse' });
      if (n2) edges.push({ source: m.spouse2_id, target: m.id, kind: 'spouse' });

      // Hijos solo si el foco pertenece a este matrimonio
      if (m.spouse1_id === focusId || m.spouse2_id === focusId) {
        const children = getHijosByMatrimonio(m.id);
        children.forEach((child, ci, arr) => {
          const childX = mx + (ci - (arr.length - 1) / 2) * HGAP;
          nodes.set(child.id, {
            nodeId: child.id,
            x:      childX,
            y:      VGAP,
            type:   'persona',
            data:   child,
          });
          edges.push({ source: m.id, target: child.id, kind: 'marriage-child' });
        });
      }
    });
  });

  // Hijos del foco sin matrimonio registrado
  getHijosSinMatrimonio(focusId).forEach((child, ci, arr) => {
    if (nodes.has(child.id)) return;
    nodes.set(child.id, {
      nodeId: child.id,
      x:      (ci - (arr.length - 1) / 2) * HGAP,
      y:      VGAP,
      type:   'persona',
      data:   child,
    });
    edges.push({ source: focusId, target: child.id, kind: 'direct' });
  });

  // ── Padres del foco (y = -VGAP) ──────────────────────────────────────────

  const father = focus.father_id ? getPersona(focus.father_id) : null;
  const mother = focus.mother_id ? getPersona(focus.mother_id) : null;

  if (father || mother) {
    // Centrar los padres sobre el grupo de hermanos nativos
    const nativeCenterX = sibs.reduce((s, p) => s + (nodes.get(p.id)?.x ?? 0), 0) / sibs.length;
    const COUPLE_HALF   = (CARD.width + CARD.marriageGap) / 2;  // 96 px

    if (father) {
      nodes.set(father.id, {
        nodeId: father.id,
        x:      mother ? nativeCenterX - COUPLE_HALF : nativeCenterX,
        y:      -VGAP,
        type:   'persona',
        data:   father,
      });
    }
    if (mother) {
      nodes.set(mother.id, {
        nodeId: mother.id,
        x:      father ? nativeCenterX + COUPLE_HALF : nativeCenterX,
        y:      -VGAP,
        type:   'persona',
        data:   mother,
      });
    }

    if (father && mother) {
      const matrimonio = getMatrimonioBetween(father.id, mother.id);
      const pmId       = matrimonio ? matrimonio.id : `virtual-${father.id}-${mother.id}`;
      nodes.set(pmId, {
        nodeId: pmId,
        x:      nativeCenterX,
        y:      -VGAP + CARD.height / 2,
        type:   'marriage',
        data:   matrimonio ?? { id: null, spouse1_id: father.id, spouse2_id: mother.id },
      });
      edges.push({ source: father.id, target: pmId, kind: 'spouse' });
      edges.push({ source: mother.id, target: pmId, kind: 'spouse' });
      sibs.forEach(s => edges.push({ source: pmId, target: s.id, kind: 'marriage-child' }));
    } else {
      // Padre o madre solo: aristas directas a cada hermano
      const parentId = (father ?? mother).id;
      sibs.forEach(s => edges.push({ source: parentId, target: s.id, kind: 'direct' }));
    }
  }

  return { nodes, edges, focusId };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve el foco + todos sus hermanos (hijos de los mismos padres), ordenados por sort_order. */
function _getSiblings(focusId) {
  const focus = getPersona(focusId);
  if (!focus) return [];

  const sibs = new Map([[focusId, focus]]);
  for (const parentId of [focus.father_id, focus.mother_id].filter(Boolean)) {
    getHijosByPersona(parentId).forEach(s => sibs.set(s.id, s));
  }

  return [...sibs.values()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

/** Devuelve el primer cónyuge de una persona (si existe). */
function _getFirstSpouse(personId) {
  const marriages = getMatrimoniosByPersona(personId);
  if (!marriages.length) return null;
  const m        = marriages[0];
  const spouseId = m.spouse1_id === personId ? m.spouse2_id : m.spouse1_id;
  return getPersona(spouseId);
}
