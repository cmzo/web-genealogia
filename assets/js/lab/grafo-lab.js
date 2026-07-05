// Laboratorio del grafo — sandbox interactivo del motor de la Wiki.
// Cytoscape.js para el render + una física propia (repulsión entre todos + centrado +
// resortes de enlace, confinados en un borde circular). Los diales editan los parámetros
// en vivo. Pensado como documentación reproducible: la "receta" de abajo se copia a un LLM.

import cytoscape from '../vendor/cytoscape.esm.min.js';

// ── Parámetros (los editan los diales; los defaults son los de la Wiki real) ──────────
const P = {
  N: 130,            // cantidad de nodos
  m: 2,              // densidad: aristas por nodo nuevo (preferential attachment → hubs)
  kRepel: 13000,     // repulsión entre nodos
  kCenter: 0.012,    // centrado (elástico al centro)
  kLink: 0.04,       // resortes de enlace
  rest: 38,          // longitud de reposo del enlace
  kBound: 0.2,       // fuerza del borde circular
  damp: 0.55,        // amortiguación
  discR: 0.46,       // radio del disco (× min(ancho, alto))
  nodeMult: 1.9,     // tamaño de nodo: 3 + √grado × nodeMult
  nodeBright: 0,     // luminosidad de los nodos (>0 aclara, <0 oscurece)
  lineWidth: 0.9,    // grosor de líneas
  lineOpacity: 0.4,  // opacidad de líneas
  hubDeg: 6,         // grado a partir del cual se muestra el nombre
};

const PALETTE = ['#1e40af', '#2d4a3e', '#0d9488', '#b45309', '#9333ea', '#0891b2', '#5fb389', '#c026d3'];
const host = document.getElementById('labGraph');
const tok = (n, fb) => (getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb);

let cy, vel = new Map(), grabbedId = null, running = false;

// ── Generación del grafo (preferential attachment de Barabási–Albert → crea hubs) ─────
function genElements(N, m) {
  const els = [], bag = [];   // bag = lista ponderada por grado para el attachment
  for (let i = 0; i < N; i++) {
    const id = 'n' + i;
    els.push({ data: { id, color: PALETTE[i % PALETTE.length], r: 4, hub: 0 } });
    const mm = Math.min(m, i);
    const chosen = new Set();
    let guard = 0;
    while (chosen.size < mm && guard++ < 60) {
      const t = bag.length ? bag[(Math.random() * bag.length) | 0] : 'n0';
      if (t !== id) chosen.add(t);
    }
    chosen.forEach(t => { els.push({ data: { id: `e${i}_${t}`, source: id, target: t } }); bag.push(t, id); });
    bag.push(id);
  }
  return els;
}

function degrees() {
  const d = new Map();
  cy.nodes().forEach(n => d.set(n.id(), 0));
  cy.edges().forEach(e => { d.set(e.data('source'), (d.get(e.data('source')) || 0) + 1); d.set(e.data('target'), (d.get(e.data('target')) || 0) + 1); });
  return d;
}

// Recalcula tamaño y flag de hub de cada nodo según su grado y los parámetros estéticos
function restyle() {
  const d = degrees();
  cy.batch(() => cy.nodes().forEach(n => {
    const g = d.get(n.id()) || 0;
    n.data('r', Math.max(3, Math.min(18, 3 + Math.sqrt(g) * P.nodeMult)));
    n.data('hub', g >= P.hubDeg ? 1 : 0);
  }));
  // background-blacken: positivo oscurece, negativo aclara → invertimos para que el dial sea "luminosidad"
  cy.nodes().style('background-blacken', -P.nodeBright);
  cy.edges().style({ width: P.lineWidth, opacity: P.lineOpacity });
}

// ── Física (idéntica a la de la Wiki, parametrizada por P) ────────────────────────────
function step() {
  const W = host.clientWidth || 800, H = host.clientHeight || 600;
  const CX = W / 2, CY = H / 2, R = Math.min(W, H) * P.discR;
  const ns = cy.nodes().toArray();
  const force = new Map(), pos = new Map();
  ns.forEach(n => { force.set(n.id(), { x: 0, y: 0 }); pos.set(n.id(), n.position()); });

  for (let i = 0; i < ns.length; i++) {
    for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i].id(), b = ns[j].id(), pa = pos.get(a), pb = pos.get(b);
      let dx = pb.x - pa.x, dy = pb.y - pa.y, d2 = dx * dx + dy * dy;
      if (d2 < 36) d2 = 36;
      const d = Math.sqrt(d2), f = P.kRepel / d2, ux = dx / d, uy = dy / d;
      const fa = force.get(a), fb = force.get(b);
      fa.x -= f * ux; fa.y -= f * uy; fb.x += f * ux; fb.y += f * uy;
    }
  }
  cy.edges().forEach(e => {
    const a = e.data('source'), b = e.data('target'), pa = pos.get(a), pb = pos.get(b);
    if (!pa || !pb) return;
    const dx = pb.x - pa.x, dy = pb.y - pa.y, d = Math.hypot(dx, dy) || 1;
    const f = P.kLink * (d - P.rest), ux = dx / d, uy = dy / d;
    if (a !== grabbedId) { const fa = force.get(a); fa.x += f * ux; fa.y += f * uy; }
    if (b !== grabbedId) { const fb = force.get(b); fb.x -= f * ux; fb.y -= f * uy; }
  });
  let energy = 0;
  ns.forEach(n => {
    const id = n.id(); if (id === grabbedId) return;
    const p = pos.get(id), f = force.get(id);
    f.x += P.kCenter * (CX - p.x); f.y += P.kCenter * (CY - p.y);
    const ddx = p.x - CX, ddy = p.y - CY, dd = Math.hypot(ddx, ddy);
    if (dd > R) { const ux = ddx / dd, uy = ddy / dd; f.x -= P.kBound * (dd - R) * ux; f.y -= P.kBound * (dd - R) * uy; }
    const v = vel.get(id) || { x: 0, y: 0 };
    v.x = (v.x + f.x) * P.damp; v.y = (v.y + f.y) * P.damp;
    vel.set(id, v);
    n.position({ x: p.x + v.x, y: p.y + v.y });
    energy += v.x * v.x + v.y * v.y;
  });
  return energy;
}

function loop() { const e = step(); if (grabbedId || e > 0.4) requestAnimationFrame(loop); else running = false; }
function reheat() { vel.clear(); if (!running) { running = true; requestAnimationFrame(loop); } }

// ── Construir / reconstruir el grafo ──────────────────────────────────────────────────
function build() {
  if (cy) cy.destroy();
  const W = host.clientWidth || 800, H = host.clientHeight || 600;
  cy = cytoscape({
    container: host,
    elements: genElements(P.N, P.m),
    minZoom: 0.2, maxZoom: 4, wheelSensitivity: 0.25, boxSelectionEnabled: false,
    style: [
      { selector: 'node', style: {
        'background-color': 'data(color)', width: 'data(r)', height: 'data(r)', 'border-width': 0,
        label: 'data(id)', color: tok('--muted', '#888'), 'text-opacity': 0,
        'font-family': 'Inter, sans-serif', 'font-size': 11, 'font-weight': 500,
        'text-valign': 'center', 'text-halign': 'right', 'text-margin-x': 4,
        'text-outline-color': tok('--surface', '#fff'), 'text-outline-width': 1.5,
      } },
      { selector: 'edge', style: { width: P.lineWidth, 'line-color': tok('--muted', '#888'), 'curve-style': 'straight', opacity: P.lineOpacity } },
      { selector: 'node[?hub]', style: { 'text-opacity': 1 } },
      { selector: '.dim', style: { opacity: 0.08 } },
      { selector: 'node.focus', style: { 'text-opacity': 1, color: tok('--text', '#000'), 'font-weight': 700 } },
    ],
    layout: { name: 'preset' },
  });
  // posiciones iniciales en el disco
  const CX = W / 2, CY = H / 2, R = Math.min(W, H) * P.discR;
  cy.nodes().forEach(n => { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R * 0.9; n.position({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }); });
  restyle();
  for (let i = 0; i < 280; i++) step();
  cy.fit(undefined, 40);
  centerNodes();

  cy.on('grab', 'node', e => { grabbedId = e.target.id(); reheat(); });
  cy.on('drag', 'node', reheat);
  cy.on('free', 'node', () => { grabbedId = null; reheat(); });
  cy.on('mouseover', 'node', e => { const nb = e.target.closedNeighborhood(); cy.elements().difference(nb).addClass('dim'); e.target.addClass('focus'); });
  cy.on('mouseout', 'node', () => cy.elements().removeClass('dim focus'));
}

// ── Diales ────────────────────────────────────────────────────────────────────────────
const CONTROLS = [
  { key: 'N', label: 'Nodos', min: 10, max: 400, step: 5, group: 'estructura' },
  { key: 'm', label: 'Densidad (aristas/nodo)', min: 1, max: 5, step: 1, group: 'estructura' },
  { key: 'kRepel', label: 'Repulsión', min: 2000, max: 30000, step: 500, group: 'física' },
  { key: 'kCenter', label: 'Centrado', min: 0, max: 0.05, step: 0.002, group: 'física' },
  { key: 'kLink', label: 'Resortes de enlace', min: 0, max: 0.1, step: 0.005, group: 'física' },
  { key: 'rest', label: 'Reposo del enlace', min: 10, max: 100, step: 2, group: 'física' },
  { key: 'kBound', label: 'Borde circular', min: 0, max: 0.5, step: 0.01, group: 'física' },
  { key: 'damp', label: 'Amortiguación', min: 0.3, max: 0.95, step: 0.01, group: 'física' },
  { key: 'discR', label: 'Radio del disco', min: 0.25, max: 0.5, step: 0.01, group: 'física' },
  { key: 'nodeMult', label: 'Tamaño de nodos', min: 0.5, max: 4, step: 0.1, group: 'estética' },
  { key: 'nodeBright', label: 'Luminosidad de nodos', min: -0.6, max: 0.6, step: 0.05, group: 'estética' },
  { key: 'lineWidth', label: 'Grosor de líneas', min: 0.2, max: 3, step: 0.1, group: 'estética' },
  { key: 'lineOpacity', label: 'Opacidad de líneas', min: 0.05, max: 1, step: 0.05, group: 'estética' },
  { key: 'hubDeg', label: 'Umbral de nombre (hub)', min: 1, max: 20, step: 1, group: 'estética' },
];

const STRUCTURE = new Set(['N', 'm']);
const ESTHETIC = new Set(['nodeMult', 'nodeBright', 'lineWidth', 'lineOpacity', 'hubDeg']);

function buildControls() {
  const groups = { estructura: 'Estructura', física: 'Física', estética: 'Estética' };
  const wrap = document.getElementById('labControls');
  Object.entries(groups).forEach(([g, title]) => {
    const sec = document.createElement('div'); sec.className = 'lab-group';
    sec.innerHTML = `<h3 class="lab-group-title">${title}</h3>`;
    CONTROLS.filter(c => c.group === g).forEach(c => {
      const row = document.createElement('label'); row.className = 'lab-control';
      row.innerHTML = `<span class="lab-control-head"><span>${c.label}</span><output id="out_${c.key}">${P[c.key]}</output></span>
        <input type="range" id="ctl_${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${P[c.key]}">`;
      sec.appendChild(row);
    });
    wrap.appendChild(sec);
  });

  CONTROLS.forEach(c => {
    const input = document.getElementById('ctl_' + c.key), out = document.getElementById('out_' + c.key);
    input.addEventListener('input', () => {
      P[c.key] = parseFloat(input.value);
      out.textContent = input.value;
      updateRecipe();
      if (STRUCTURE.has(c.key)) build();
      else if (ESTHETIC.has(c.key)) restyle();
      else reheat();
    });
  });

  document.getElementById('labRegen').addEventListener('click', build);
  document.getElementById('labCopy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.getElementById('labRecipe').textContent);
    const b = document.getElementById('labCopy'); const t = b.textContent; b.textContent = '¡Copiado!'; setTimeout(() => b.textContent = t, 1400);
  });
}

// ── Receta copiable ───────────────────────────────────────────────────────────────────
function updateRecipe() {
  document.getElementById('labRecipe').textContent =
`Grafo de conocimiento interactivo — receta de reproducción

Render: Cytoscape.js (canvas) + una física propia en requestAnimationFrame.
Por cada nodo, en cada paso, se suman:
  • Repulsión entre TODOS los pares (inverse-square) — separa y llena el espacio.
  • Centrado — resorte suave hacia el centro del lienzo.
  • Resortes de enlace — acercan a los nodos conectados (longitud de reposo fija).
  • Borde circular — confina los nodos dentro de un disco de radio R; esto cierra el contorno en un círculo.
La misma simulación maneja el arrastre (al soltar, todo vuelve al disco). El armado son ~280 pasos
calculados con el lienzo oculto, y luego se revela.
Estructura: N nodos con preferential attachment (Barabási–Albert), m aristas por nodo nuevo → emergen hubs.

Parámetros:
  Nodos (N): ${P.N}
  Densidad (m, aristas/nodo nuevo): ${P.m}
  Repulsión (K_REPEL): ${P.kRepel}
  Centrado (K_CENTER): ${P.kCenter}
  Resortes de enlace (K_LINK): ${P.kLink}
  Reposo del enlace (REST): ${P.rest}
  Borde circular (K_BOUND): ${P.kBound}
  Amortiguación (DAMP): ${P.damp}
  Radio del disco (× min(ancho,alto)): ${P.discR}
  Tamaño de nodo: 3 + √grado × ${P.nodeMult} (máx 18)
  Luminosidad de nodos (Cytoscape: 'background-blacken'): ${(-P.nodeBright).toFixed(2)}
  Líneas: ancho ${P.lineWidth}, opacidad ${P.lineOpacity}
  Mostrar nombre si grado ≥ ${P.hubDeg}`;
}

// Centra el disco de nodos ignorando los labels (que sobresalen a la derecha y descentran el cúmulo).
function centerNodes() {
  if (!cy) return;
  const bb = cy.nodes(':visible').boundingBox({ includeLabels: false });
  if (!bb || !isFinite(bb.x1)) return;
  const z = cy.zoom();
  cy.pan({ x: cy.width() / 2 - ((bb.x1 + bb.x2) / 2) * z, y: cy.height() / 2 - ((bb.y1 + bb.y2) / 2) * z });
}

// ── Init ──────────────────────────────────────────────────────────────────────────────
buildControls();
updateRecipe();
build();
window.addEventListener('resize', () => { if (cy) { cy.fit(undefined, 40); centerNodes(); } });
