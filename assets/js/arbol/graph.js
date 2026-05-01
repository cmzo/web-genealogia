/**
 * Construcción de árboles navegables para el pedigree y la vista completa.
 *
 * Los nodos producidos son compatibles con d3.hierarchy():
 *   { nodeId, type, data, children }
 *
 * Tipos de nodo:
 *   'persona'   → data = persona
 *   'marriage'  → data = matrimonio (o matrimonio virtual si no hay registro)
 *
 * En el árbol ancestral el foco es la raíz y los padres son sus "hijos"
 * en la jerarquía D3. layout.js invierte el eje Y para que fluya hacia arriba.
 *
 * En el árbol descendente el foco es la raíz y los matrimonios/hijos cuelgan hacia abajo.
 */

import {
  getPersona,
  getMatrimonioBetween,
  getMatrimoniosByPersona,
  getHijosByMatrimonio,
  getHijosSinMatrimonio,
  getAllPersonas,
  getAllMatrimonios,
} from './data.js';

// ── árbol ancestral ───────────────────────────────────────────────────────────

/**
 * Devuelve un árbol de nodos con el foco como raíz y los ancestros como hijos,
 * hasta maxDepth generaciones hacia arriba.
 *
 * Estructura por nivel:
 *   persona → [marriageNode] → [padre, madre] → [sus parents...] → ...
 */
export function getAncestorTree(focusId, maxDepth = 3) {
  const persona = getPersona(focusId);
  if (!persona) return null;
  return _buildAncestorNode(persona, 0, maxDepth);
}

function _buildAncestorNode(persona, depth, maxDepth) {
  const node = {
    nodeId:    persona.id,
    type:      'persona',
    data:      persona,
    children:  [],
  };

  if (depth >= maxDepth) return node;

  const { father_id, mother_id } = persona;
  if (!father_id && !mother_id) return node;

  const father = father_id ? getPersona(father_id) : null;
  const mother = mother_id ? getPersona(mother_id) : null;
  const matrimonio = (father_id && mother_id)
    ? getMatrimonioBetween(father_id, mother_id)
    : null;

  const marriageNode = {
    nodeId:    matrimonio ? matrimonio.id : `virtual-${father_id ?? 'x'}-${mother_id ?? 'x'}`,
    type:      'marriage',
    data:      matrimonio ?? { id: null, spouse1_id: father_id, spouse2_id: mother_id,
                               marriage_date: '', marriage_place: '', notes: '' },
    children:  [],
  };

  if (father) marriageNode.children.push(_buildAncestorNode(father, depth + 1, maxDepth));
  if (mother) marriageNode.children.push(_buildAncestorNode(mother, depth + 1, maxDepth));

  node.children.push(marriageNode);
  return node;
}

// ── árbol descendente ─────────────────────────────────────────────────────────

/**
 * Devuelve un árbol de nodos con el foco como raíz y sus descendientes hacia abajo,
 * hasta maxDepth generaciones.
 *
 * Estructura:
 *   persona → [marriageNode, ...] → [hijo, ...] → [sus matrimonios...] → ...
 */
export function getDescendantTree(focusId, maxDepth = 2) {
  const persona = getPersona(focusId);
  if (!persona) return null;
  return _buildDescendantNode(persona, 0, maxDepth);
}

function _buildDescendantNode(persona, depth, maxDepth) {
  const node = {
    nodeId:   persona.id,
    type:     'persona',
    data:     persona,
    children: [],
  };

  if (depth >= maxDepth) return node;

  const matrimonios = getMatrimoniosByPersona(persona.id);

  matrimonios.forEach(m => {
    const hijos = getHijosByMatrimonio(m.id);
    const marriageNode = {
      nodeId:   m.id,
      type:     'marriage',
      data:     m,
      children: hijos.map(h => _buildDescendantNode(h, depth + 1, maxDepth)),
    };
    node.children.push(marriageNode);
  });

  // Hijos sin matrimonio registrado
  const huerfanos = getHijosSinMatrimonio(persona.id);
  huerfanos.forEach(h => node.children.push(_buildDescendantNode(h, depth + 1, maxDepth)));

  return node;
}

// ── datos completos para la vista full ───────────────────────────────────────

/**
 * Devuelve un árbol completo con una raíz virtual que agrupa a todas las personas
 * sin padres conocidos. Para uso con la vista de árbol completo.
 */
export function getFullTree() {
  const allPersonas   = getAllPersonas();
  const allMatrimonios = getAllMatrimonios();

  // Raíces: personas sin padres conocidos
  const roots = [];
  allPersonas.forEach(p => {
    if (!p.father_id && !p.mother_id) roots.push(p);
  });

  // Construimos con maxDepth alto para incluir todo
  const rootChildren = roots.map(p => _buildDescendantNode(p, 0, 99));

  return {
    nodeId:   '__root__',
    type:     'virtual-root',
    data:     null,
    children: rootChildren,
  };
}

// ── helpers de consulta ───────────────────────────────────────────────────────

/** Todas las personas que coinciden con un texto de búsqueda (nombre). */
export function searchPersonas(query) {
  if (!query?.trim()) return [];
  const q = query.toLowerCase().trim();
  const results = [];
  getAllPersonas().forEach(p => {
    if (p.name.toLowerCase().includes(q)) results.push(p);
  });
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/** Matrimonios de una persona con datos del cónyuge resueltos. */
export function getMatrimoniosConConyuge(personaId) {
  return getMatrimoniosByPersona(personaId).map(m => {
    const conyugeId = m.spouse1_id === personaId ? m.spouse2_id : m.spouse1_id;
    return {
      matrimonio: m,
      conyuge:    getPersona(conyugeId),
      hijos:      getHijosByMatrimonio(m.id),
    };
  });
}
