export function buildMarriageStructure(rows) {
  const individuals = {};
  rows.forEach(row => {
    if (!row.id || !row.name) return;
    individuals[row.id] = {
      id: row.id,
      name: row.name,
      birthDate: row.birth_date,
      birthPlace: row.birth_place,
      deathDate: row.death_date,
      deathPlace: row.death_place,
      generation: row.generation,
      order: row.order,
      branch: row.branch,
      vivo: row.vivo,
      spouseId: row.spouseId || null,
      fatherId: row.fatherId || null,
      motherId: row.motherId || null,
      childrenIds: row.childrenIds
        ? row.childrenIds.split(',').map(s => s.trim()).filter(s => s)
        : [],
    };
  });

  const marriages = new Map();
  const singlePeople = new Map();
  const processedPairs = new Set();
  const processedIndividuals = new Set();

  // Crear matrimonios
  Object.values(individuals).forEach(person => {
    if (!person.spouseId || !individuals[person.spouseId]) return;
    const key = [person.id, person.spouseId].sort().join('::');
    if (processedPairs.has(key)) return;
    processedPairs.add(key);
    const spouse = individuals[person.spouseId];
    if (spouse.spouseId !== person.id) return;
    marriages.set(key, {
      id: key,
      spouse1: person,
      spouse2: spouse,
      children: [],
      generation: Math.max(person.generation, spouse.generation),
      order: Math.max(person.order || 0, spouse.order || 0),
      collapsed: false,
      hidden: false,
      x: 0,
      y: 0,
      type: 'marriage',
    });
    processedIndividuals.add(person.id);
    processedIndividuals.add(spouse.id);
  });

  // Crear personas solteras
  Object.values(individuals).forEach(person => {
    if (processedIndividuals.has(person.id)) return;
    singlePeople.set(person.id, {
      id: person.id,
      person,
      children: [],
      generation: person.generation,
      order: person.order || 0,
      collapsed: false,
      hidden: false,
      x: 0,
      y: 0,
      type: 'single',
    });
  });

  // Asignar hijos a sus padres
  Object.values(individuals).forEach(person => {
    if (!person.fatherId && !person.motherId) return;
    if (person.fatherId && person.motherId) {
      const marriageKey = [person.fatherId, person.motherId].sort().join('::');
      const marriage = marriages.get(marriageKey);
      if (marriage) {
        if (marriage.spouse1.id === person.id || marriage.spouse2.id === person.id) return;
        marriage.children.push(person);
        return;
      }
    }
    const parentId = person.fatherId || person.motherId;
    const parentSingle = singlePeople.get(parentId);
    if (parentSingle) parentSingle.children.push(person);
  });

  const allUnits = [];
  marriages.forEach(m => allUnits.push(m));
  singlePeople.forEach(s => allUnits.push(s));
  return allUnits;
}
