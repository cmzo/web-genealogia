/**
 * Capa de datos del árbol genealógico.
 * Carga arbol.json y construye índices en memoria para acceso O(1).
 *
 * Índices disponibles tras loadData():
 *   personaById       Map<id, persona>
 *   matrimonioById    Map<id, matrimonio>
 *   matrimoniosByPersona  Map<personaId, matrimonio[]>
 *   hijosByPersona    Map<personaId, persona[]>   — hijos directos (father_id o mother_id)
 *   hijosByMatrimonio Map<matrimonioId, persona[]> — hijos del par específico
 */

const personaById        = new Map();
const matrimonioById     = new Map();
const matrimoniosByPersona  = new Map();
const hijosByPersona     = new Map();
const hijosByMatrimonio  = new Map();

let _loaded = false;

export async function loadData() {
  if (_loaded) return;

  const url = window.getDataPath?.('arbol.json') ?? './assets/data/arbol.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar arbol.json (${res.status})`);

  const { personas, matrimonios } = await res.json();

  // Índice primario de personas
  personas.forEach(p => personaById.set(p.id, p));

  // Índice primario de matrimonios + índice por persona
  matrimonios.forEach(m => {
    matrimonioById.set(m.id, m);
    for (const pid of [m.spouse1_id, m.spouse2_id]) {
      if (!matrimoniosByPersona.has(pid)) matrimoniosByPersona.set(pid, []);
      matrimoniosByPersona.get(pid).push(m);
    }
    hijosByMatrimonio.set(m.id, []);
  });

  // Índice de hijos por persona y por matrimonio
  personas.forEach(p => {
    for (const parentId of [p.father_id, p.mother_id].filter(Boolean)) {
      if (!hijosByPersona.has(parentId)) hijosByPersona.set(parentId, []);
      hijosByPersona.get(parentId).push(p);
    }

    // Asignar al matrimonio correspondiente si ambos padres son conocidos
    if (p.father_id && p.mother_id) {
      const m = getMatrimonioBetween(p.father_id, p.mother_id);
      if (m) hijosByMatrimonio.get(m.id)?.push(p);
    }
  });

  _loaded = true;
}

// ── accessors ────────────────────────────────────────────────────────────────

export const getPersona           = id  => personaById.get(id) ?? null;
export const getMatrimonio        = id  => matrimonioById.get(id) ?? null;
export const getMatrimoniosByPersona = id => matrimoniosByPersona.get(id) ?? [];
export const getHijosByPersona    = id  => hijosByPersona.get(id) ?? [];
export const getHijosByMatrimonio = id  => hijosByMatrimonio.get(id) ?? [];
export const getAllPersonas        = ()  => personaById;
export const getAllMatrimonios     = ()  => matrimonioById;

/** Devuelve el matrimonio entre dos personas, si existe. */
export function getMatrimonioBetween(id1, id2) {
  for (const m of matrimoniosByPersona.get(id1) ?? []) {
    if (m.spouse1_id === id2 || m.spouse2_id === id2) return m;
  }
  return null;
}

/** Devuelve los hijos de una persona que no están asignados a ningún matrimonio registrado. */
export function getHijosSinMatrimonio(personaId) {
  const todos = hijosByPersona.get(personaId) ?? [];
  const enMatrimonios = new Set(
    (matrimoniosByPersona.get(personaId) ?? []).flatMap(m => hijosByMatrimonio.get(m.id) ?? []).map(h => h.id)
  );
  return todos.filter(h => !enMatrimonios.has(h.id));
}
