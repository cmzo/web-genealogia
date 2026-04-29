import { CONFIG } from './config.js';

export function calculateMarriageLayout(marriageArray) {
  const { width, cardWidth, spouseGap, marriageSpacing, generationSpacing } = CONFIG;
  const unitsByGeneration = new Map();

  marriageArray.forEach(unit => {
    let generation, order;
    if (unit.type === 'marriage') {
      generation = Math.max(unit.spouse1.generation, unit.spouse2.generation);
      order = Math.max(unit.spouse1.order || 0, unit.spouse2.order || 0);
    } else {
      generation = unit.person.generation;
      order = unit.person.order || 0;
    }
    if (!unitsByGeneration.has(generation)) unitsByGeneration.set(generation, []);
    unitsByGeneration.get(generation).push({ unit, order });
  });

  const sortedGenerations = Array.from(unitsByGeneration.keys()).sort((a, b) => b - a);
  const positionedUnits = new Set();

  sortedGenerations.forEach((generation, genIndex) => {
    const generationUnits = unitsByGeneration.get(generation);
    const y = 100 + genIndex * generationSpacing;
    generationUnits.sort((a, b) => a.order - b.order);

    const totalWidth = generationUnits.length * marriageSpacing;
    const startX = (width - totalWidth) / 2;

    generationUnits.forEach(({ unit }, index) => {
      if (positionedUnits.has(unit.id)) return;
      unit.x = startX + index * marriageSpacing + marriageSpacing / 2;
      unit.y = y;
      if (unit.type === 'marriage') {
        unit.spouse1.x = unit.x - cardWidth / 2 - spouseGap / 2;
        unit.spouse1.y = unit.y;
        unit.spouse2.x = unit.x + cardWidth / 2 + spouseGap / 2;
        unit.spouse2.y = unit.y;
      } else {
        unit.person.x = unit.x;
        unit.person.y = unit.y;
      }
      positionedUnits.add(unit.id);
    });
  });

  return marriageArray;
}
