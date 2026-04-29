import { CONFIG, cardColors, getBranchColor } from './config.js';

let svg = null;
let currentZoom = null;

export function renderTree(marriageArray) {
  const { width, height } = CONFIG;
  d3.select('#tree-container').selectAll('svg').remove();

  svg = d3.select('#tree-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  currentZoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .filter(event => event.type !== 'wheel' || event.ctrlKey)
    .on('zoom', event => g.attr('transform', event.transform));

  svg.call(currentZoom);

  marriageArray.forEach(unit => {
    if (unit.type === 'marriage') renderMarriage(g, unit);
    else if (unit.type === 'single') renderSinglePerson(g, unit);
  });

  renderParentChildConnections(g, marriageArray);
}

export function zoomIn() {
  if (!svg || !currentZoom) return;
  const t = d3.zoomTransform(svg.node());
  const newScale = Math.min(t.k * 1.2, 3);
  svg.transition().duration(200).call(
    currentZoom.transform,
    d3.zoomIdentity.translate(t.x, t.y).scale(newScale)
  );
}

export function zoomOut() {
  if (!svg || !currentZoom) return;
  const t = d3.zoomTransform(svg.node());
  const newScale = Math.max(t.k / 1.2, 0.3);
  svg.transition().duration(200).call(
    currentZoom.transform,
    d3.zoomIdentity.translate(t.x, t.y).scale(newScale)
  );
}

export function resetZoom() {
  if (!svg) return;
  svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
}

function renderMarriage(container, marriage) {
  const { cardWidth } = CONFIG;
  const g = container.append('g')
    .attr('class', 'marriage-unit')
    .attr('transform', `translate(${marriage.x}, ${marriage.y})`);

  g.append('line')
    .attr('class', 'marriage-link')
    .attr('x1', -cardWidth / 2 - 10).attr('y1', 0)
    .attr('x2',  cardWidth / 2 + 10).attr('y2', 0)
    .style('stroke', '#8b5cf6')
    .style('stroke-width', '4')
    .style('stroke-linecap', 'round')
    .style('opacity', '0.9');

  [marriage.spouse1, marriage.spouse2].forEach(spouse =>
    renderPersonCard(g, spouse, marriage.x, marriage.y)
  );
}

function renderSinglePerson(container, singleUnit) {
  const g = container.append('g')
    .attr('class', 'single-unit')
    .attr('transform', `translate(${singleUnit.x}, ${singleUnit.y})`);
  renderPersonCard(g, singleUnit.person, singleUnit.x, singleUnit.y);
}

function renderPersonCard(container, person, baseX, baseY) {
  const { cardWidth, cardHeight } = CONFIG;
  const g = container.append('g')
    .attr('data-person-id', person.id)
    .attr('transform', `translate(${person.x - baseX}, ${person.y - baseY})`);

  // Tarjeta de fondo
  g.append('rect')
    .attr('class', 'person-card')
    .attr('x', -cardWidth / 2).attr('y', -cardHeight / 2)
    .attr('width', cardWidth).attr('height', cardHeight)
    .attr('rx', 20)
    .style('fill', cardColors.background)
    .style('stroke', cardColors.border)
    .style('stroke-width', '2');

  // Avatar placeholder
  g.append('circle')
    .attr('cx', 0).attr('cy', -cardHeight / 2 + 35).attr('r', 25)
    .style('fill', '#f3e8ff').style('opacity', '0.8')
    .style('stroke', cardColors.border).style('stroke-width', '1');

  // Layout del nombre con ajuste de tamaño de fuente
  const { nameLines, fontSize } = fitName(g, person.name, cardWidth);
  const lineHeight = fontSize * 1.2;
  nameLines.forEach((line, i) => {
    g.append('text')
      .attr('class', 'person-text name')
      .attr('y', -cardHeight / 2 + 75 + i * lineHeight)
      .style('font-size', fontSize + 'px').style('font-weight', '600')
      .style('fill', cardColors.text).style('text-anchor', 'middle')
      .text(line);
  });

  const nameBottomY = -cardHeight / 2 + 75 + nameLines.length * lineHeight;
  const locationY = nameBottomY + 12;

  // Lugar de nacimiento
  if (person.birthPlace) {
    const placeText = person.birthPlace.length > 18
      ? person.birthPlace.substring(0, 16) + '...'
      : person.birthPlace;
    g.append('text')
      .attr('x', -cardWidth / 2 + 15).attr('y', locationY + 2)
      .style('font-size', '10px').style('fill', cardColors.text)
      .style('text-anchor', 'start').text('📍');
    g.append('text')
      .attr('class', 'person-text location')
      .attr('x', -cardWidth / 2 + 25).attr('y', locationY + 2)
      .style('font-size', '9px').style('fill', cardColors.text)
      .style('text-anchor', 'start').text(placeText.toUpperCase());
  }

  // Fechas
  const datesY = locationY + 18;
  g.append('text')
    .attr('class', 'person-text birth-date')
    .attr('x', -cardWidth / 2 + 15).attr('y', datesY)
    .style('font-size', '9px').style('fill', cardColors.secondary)
    .style('text-anchor', 'start').text(`Nac: ${formatDate(person.birthDate)}`);
  g.append('text')
    .attr('class', 'person-text death-date')
    .attr('x', -cardWidth / 2 + 15).attr('y', datesY + 14)
    .style('font-size', '9px').style('fill', cardColors.secondary)
    .style('text-anchor', 'start').text(`Def: ${formatDate(person.deathDate)}`);

  if (person.deathPlace && person.deathPlace !== person.birthPlace) {
    const text = person.deathPlace.length > 18
      ? person.deathPlace.substring(0, 16) + '...'
      : person.deathPlace;
    g.append('text')
      .attr('class', 'person-text death-place')
      .attr('x', -cardWidth / 2 + 15).attr('y', datesY + 30)
      .style('font-size', '8px').style('fill', cardColors.secondary)
      .style('text-anchor', 'start').text(text);
  }

  // Indicador vivo/fallecido
  g.append('circle')
    .attr('cx', -cardWidth / 2 + 12).attr('cy', -cardHeight / 2 + 12).attr('r', 4)
    .style('fill', person.vivo === 'si' ? '#10b981' : '#ef4444');
}

function fitName(container, name, cardWidth) {
  const maxWidth = cardWidth - 30;
  const maxLines = 3;
  const measure = (text, size) => {
    const t = container.append('text')
      .style('font-size', size + 'px').style('font-weight', '600').text(text);
    const w = t.node().getBBox().width;
    t.remove();
    return w;
  };
  let fontSize = 14;
  let nameLines = [];
  for (let size = 14; size >= 8; size--) {
    const words = name.split(' ');
    nameLines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (measure(test, size) <= maxWidth) {
        current = test;
      } else {
        if (current) { nameLines.push(current); current = word; }
        else { nameLines.push(word.substring(0, Math.floor(maxWidth / (size * 0.6)))); current = ''; }
      }
    }
    if (current) nameLines.push(current);
    if (nameLines.length <= maxLines) { fontSize = size; break; }
  }
  return { nameLines, fontSize };
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NaN') return null;
  try {
    if (dateStr.includes('Date(')) {
      const m = dateStr.match(/Date\((\d+),(\d+),(\d+)/);
      if (!m) return null;
      const d = new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function formatDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '?';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderParentChildConnections(container, allUnits) {
  const { cardHeight } = CONFIG;

  allUnits.forEach(unit => {
    if (unit.collapsed || !unit.children || unit.children.length === 0) return;

    const childPositions = unit.children.map(child => {
      if (unit.type === 'marriage') {
        if (unit.spouse1.id === child.id || unit.spouse2.id === child.id) return null;
      }
      const childUnit = allUnits.find(u =>
        u.type === 'marriage'
          ? u.spouse1.id === child.id || u.spouse2.id === child.id
          : u.type === 'single' && u.person.id === child.id
      );
      if (!childUnit) return null;
      if (childUnit.type === 'marriage') {
        const s = childUnit.spouse1.id === child.id ? childUnit.spouse1 : childUnit.spouse2;
        return { x: s.x, y: s.y, name: child.name, branch: s.branch };
      }
      return { x: childUnit.person.x, y: childUnit.person.y, name: child.name, branch: childUnit.person.branch };
    }).filter(Boolean);

    let validChildren = childPositions.filter(c => c.y > unit.y);
    if (unit.type === 'marriage') {
      validChildren = validChildren.filter(
        c => c.name !== unit.spouse1.name && c.name !== unit.spouse2.name
      );
    }
    if (validChildren.length === 0) return;

    const collapseCircleY = unit.y + 70;
    const branchPointY = collapseCircleY + 30;

    validChildren.forEach(child => {
      const color = getBranchColor(child.branch);
      const childTopY = child.y - cardHeight / 2 - 60;

      container.append('line')
        .attr('class', 'parent-child-link')
        .attr('x1', unit.x).attr('y1', collapseCircleY)
        .attr('x2', unit.x).attr('y2', branchPointY)
        .style('stroke', color).style('stroke-width', '2.5').style('stroke-linecap', 'round');

      container.append('line')
        .attr('class', 'parent-child-link')
        .attr('x1', unit.x).attr('y1', branchPointY)
        .attr('x2', child.x).attr('y2', childTopY)
        .style('stroke', color).style('stroke-width', '2.5').style('stroke-linecap', 'round');

      container.append('line')
        .attr('class', 'parent-child-link')
        .attr('x1', child.x).attr('y1', childTopY)
        .attr('x2', child.x).attr('y2', child.y - cardHeight / 2)
        .style('stroke', color).style('stroke-width', '2.5').style('stroke-linecap', 'round');
    });
  });
}
