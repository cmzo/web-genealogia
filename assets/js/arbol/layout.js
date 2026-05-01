/**
 * layout.js — posicionamiento del árbol genealógico.
 *
 * Estrategia:
 *   1. Para los ancestros: construye un árbol de personas (sin nodos de matrimonio)
 *      y usa d3.tree().nodeSize() para obtener posiciones X. Invierte el eje Y para
 *      que los ancestros queden arriba.
 *   2. Para los descendientes: idem, eje Y positivo hacia abajo.
 *   3. Agrega nodos "marriage" entre generaciones (a la mitad del espacio vertical)
 *      y calcula su X como la media de los dos cónyuges.
 *
 * Devuelve { nodes: Map<id, {nodeId, x, y, type, data}>, edges: Array, focusId }.
 */

import {
  getPersona,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
  getMatrimonioBetween,
} from './data.js';
import { CARD } from './config.js';

// Espacio vertical entre centros de dos generaciones consecutivas
export const VGAP = CARD.height * 2;  // 160 px

export function computeLayout(focusId, ancestorDepth = 3, descendantDepth = 1) {
  const nodes = new Map();
  const edges = [];

  const focus = getPersona(focusId);
  if (!focus) return null;

  // ── árbol ancestral ──────────────────────────────────────────────────────

  const aPersonaTree = _buildPersonaTree(focus, 0, ancestorDepth);
  const aRoot = d3.hierarchy(aPersonaTree, n => n._ch.length ? n._ch : null);
  d3.tree().nodeSize([CARD.width + CARD.gap, VGAP])(aRoot);

  // Colocar personas: Y invertido → ancestros arriba (valores negativos)
  aRoot.each(n => {
    nodes.set(n.data.id, {
      nodeId: n.data.id,
      x:     n.x,
      y:    -n.y,
      type:  'persona',
      data:  n.data.persona,
    });
  });

  // Círculos de matrimonio para cada persona que tenga padres conocidos
  aRoot.each(n => {
    _addParentMarriage(n.data.persona, nodes, edges);
  });

  // ── árbol descendente ─────────────────────────────────────────────────────

  const allChildren = _collectChildren(focusId);

  if (allChildren.length > 0) {
    // Árbol ficticio con el foco como raíz y los hijos directos como hojas
    const dTree = {
      id:  '__desc__',
      _ch: allChildren.map(c => ({ id: c.id, persona: c, _ch: [] })),
    };
    const dRoot = d3.hierarchy(dTree, n => n._ch.length ? n._ch : null);
    d3.tree().nodeSize([CARD.width + CARD.gap, VGAP])(dRoot);

    // El nodo raíz ficticio queda en x=0, y=0. Los hijos quedan en y=VGAP.
    dRoot.each(n => {
      if (n.data.id === '__desc__') return;
      nodes.set(n.data.id, {
        nodeId: n.data.id,
        x:     n.x,
        y:     n.y,   // positivo: hacia abajo
        type:  'persona',
        data:  n.data.persona,
      });
    });

    // Círculos de matrimonio para cada unión del foco con hijos
    getMatrimoniosByPersona(focusId).forEach(m => {
      const children = getHijosByMatrimonio(m.id).filter(c => nodes.has(c.id));
      if (children.length === 0) return;

      const mx = children.reduce((s, c) => s + nodes.get(c.id).x, 0) / children.length;
      const my = VGAP / 2;   // punto medio entre foco (y=0) e hijos (y=VGAP)

      nodes.set(m.id, {
        nodeId: m.id,
        x:     mx,
        y:     my,
        type:  'marriage',
        data:  m,
      });

      edges.push({ source: focusId, target: m.id, kind: 'focus-marriage' });
      children.forEach(c => {
        edges.push({ source: m.id, target: c.id, kind: 'marriage-child' });
      });
    });

    // Hijos sin matrimonio registrado → conector directo
    getHijosSinMatrimonio(focusId)
      .filter(c => nodes.has(c.id))
      .forEach(c => {
        edges.push({ source: focusId, target: c.id, kind: 'direct' });
      });
  }

  return { nodes, edges, focusId };
}

// ── helpers ──────────────────────────────────────────────────────────────────

function _buildPersonaTree(persona, depth, maxDepth) {
  const children = [];
  if (depth < maxDepth) {
    const father = persona.father_id ? getPersona(persona.father_id) : null;
    const mother = persona.mother_id ? getPersona(persona.mother_id) : null;
    if (father) children.push(_buildPersonaTree(father, depth + 1, maxDepth));
    if (mother) children.push(_buildPersonaTree(mother, depth + 1, maxDepth));
  }
  return { id: persona.id, persona, _ch: children };
}

function _addParentMarriage(persona, nodes, edges) {
  const { id, father_id, mother_id } = persona;
  if (!father_id && !mother_id) return;

  const fatherNode = father_id ? nodes.get(father_id) : null;
  const motherNode = mother_id ? nodes.get(mother_id) : null;
  if (!fatherNode && !motherNode) return;

  const parentNode = fatherNode ?? motherNode;
  const mx = (fatherNode && motherNode)
    ? (fatherNode.x + motherNode.x) / 2
    : parentNode.x;
  // Mitad del espacio entre la generación del padre y la del hijo
  const my = parentNode.y + VGAP / 2;

  const matrimonio = (father_id && mother_id)
    ? getMatrimonioBetween(father_id, mother_id)
    : null;
  const mId = matrimonio
    ? matrimonio.id
    : `virtual-${father_id ?? 'x'}-${mother_id ?? 'x'}`;

  if (!nodes.has(mId)) {
    nodes.set(mId, {
      nodeId: mId,
      x:     mx,
      y:     my,
      type:  'marriage',
      data:  matrimonio ?? { id: null, spouse1_id: father_id, spouse2_id: mother_id },
    });
  }

  // Aristas: persona → círculo de matrimonio (para dibujar la unión)
  edges.push({ source: mId, target: id, kind: 'marriage-child' });
  if (fatherNode) edges.push({ source: father_id, target: mId, kind: 'spouse' });
  if (motherNode) edges.push({ source: mother_id, target: mId, kind: 'spouse' });
}

function _collectChildren(personaId) {
  const children = [];
  const seen = new Set();
  getMatrimoniosByPersona(personaId).forEach(m => {
    getHijosByMatrimonio(m.id).forEach(c => {
      if (!seen.has(c.id)) { seen.add(c.id); children.push(c); }
    });
  });
  getHijosSinMatrimonio(personaId).forEach(c => {
    if (!seen.has(c.id)) { seen.add(c.id); children.push(c); }
  });
  return children;
}
