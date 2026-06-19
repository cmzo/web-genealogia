// Grafo de conocimiento de la wiki (estilo Obsidian) con Cytoscape.js + fcose.
// fcose es un layout force-directed con soporte de "nodos compuestos": cada familia
// se agrupa en un contenedor y el algoritmo separa los clusters entre sí. Eso ordena
// el grafo (clusters prolijos) sin sacar los tags, que quedan como nodos transversales.
//
// El grafo es el hub: clic en un nodo abre un panel lateral con relaciones/enlaces;
// "Leer" abre un modal con el markdown renderizado, sin salir de la página.

import cytoscape from 'https://cdn.jsdelivr.net/npm/cytoscape@3.30.2/+esm';
import fcose from 'https://cdn.jsdelivr.net/npm/cytoscape-fcose@2.2.0/+esm';
import { getBranchColor } from '../arbol/config.js';

cytoscape.use(fcose);

const TYPE_COLOR = { lugar: '#0d9488', fuente: '#b45309', evento: '#9333ea', tema: '#2d4a3e', post: '#0891b2', tag: '#64748b' };
const TYPE_LABEL = { persona: 'Persona', lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema', post: 'Post', tag: 'Etiqueta' };

const nodeColor = n => n.type === 'persona' ? getBranchColor(n.branch) : (TYPE_COLOR[n.type] || TYPE_COLOR.tema);
const isPersona = id => /^p\d+$/.test(id);

const dataPath = f => (window.getDataPath ? window.getDataPath(f) : `./assets/data/${f}`);
const rootBase = () => (window.PATH_CONFIG && window.PATH_CONFIG.base) || './';

async function init() {
  const host = document.getElementById('wikiGraph');
  let data, arbol;
  try {
    [data, arbol] = await Promise.all([
      fetch(dataPath('wiki-graph.json')).then(r => r.json()),
      fetch(dataPath('arbol.json')).then(r => r.json()).catch(() => ({ personas: [], matrimonios: [] })),
    ]);
  } catch (e) {
    host.innerHTML = '<p class="wiki-graph-empty">No se pudo cargar el grafo.</p>';
    return;
  }

  const nodes = data.nodes.map(d => ({ ...d }));
  const links = data.edges.map(d => ({ ...d }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  if (!nodes.length) { host.innerHTML = '<p class="wiki-graph-empty">Todavía no hay páginas en la wiki.</p>'; return; }

  // ── Relaciones familiares desde arbol.json (alimentan el panel lateral) ──────
  const personaById = new Map((arbol.personas || []).map(p => [p.id, p]));
  const childrenOf = new Map();
  (arbol.personas || []).forEach(p => {
    [p.father_id, p.mother_id].forEach(par => {
      if (!par) return;
      if (!childrenOf.has(par)) childrenOf.set(par, []);
      childrenOf.get(par).push(p.id);
    });
  });
  const spousesOf = new Map();
  (arbol.matrimonios || []).forEach(m => {
    if (!m.spouse1_id || !m.spouse2_id) return;
    (spousesOf.get(m.spouse1_id) || spousesOf.set(m.spouse1_id, []).get(m.spouse1_id)).push(m.spouse2_id);
    (spousesOf.get(m.spouse2_id) || spousesOf.set(m.spouse2_id, []).get(m.spouse2_id)).push(m.spouse1_id);
  });

  // Adyacencia COMPLETA (incluye tags) — alimenta el panel, el filtro y el resaltado
  // temático, aunque los tags no se dibujen como nodos en el lienzo.
  const outOf = new Map(), inOf = new Map(), neighbors = new Map(nodes.map(n => [n.id, new Set([n.id])]));
  links.forEach(l => {
    const s = l.source, t = l.target;
    (outOf.get(s) || outOf.set(s, new Set()).get(s)).add(t);
    (inOf.get(t) || inOf.set(t, new Set()).get(t)).add(s);
    neighbors.get(s)?.add(t); neighbors.get(t)?.add(s);
  });

  // ── Grafo VISUAL: los tags quedan FUERA del lienzo ──────────────────────────
  // El lienzo solo dibuja personas + páginas + posts con aristas de familia y enlaces.
  // Eso lo vuelve disperso (≈ árbol genealógico) → fcose lo ordena en un disco limpio,
  // estilo Obsidian. Las relaciones de tags siguen vivas arriba (neighbors/outOf/inOf).
  const visNodes = nodes.filter(n => n.type !== 'tag');
  const visLinks = links.filter(l => l.rel !== 'tag');

  // Grado DENTRO del grafo visual (define el tamaño del nodo)
  const degreeMap = new Map(visNodes.map(n => [n.id, 0]));
  visLinks.forEach(l => { degreeMap.set(l.source, (degreeMap.get(l.source) || 0) + 1); degreeMap.set(l.target, (degreeMap.get(l.target) || 0) + 1); });

  // Radio por grado (√): nodos chicos, los más conectados apenas más grandes (estilo Obsidian)
  const nodeRadius = n => {
    const deg = degreeMap.get(n.id) || 0;
    return Math.max(3, Math.min(13, 3 + Math.sqrt(deg) * 1.9));
  };

  // ── Elección de layout ──────────────────────────────────────────────────────
  // 'fcose'      → force-directed orgánico (disco tipo Obsidian) — agrupa por densidad real
  // 'mandala'    → árbol radial por generación (determinista)
  // 'concentric' → anillos por grado (determinista)
  // 'clustered'  → radial agrupado por familia / sunburst (determinista)
  const LAYOUT = 'fcose';
  const USE_COMPOUNDS = false;

  // ── Construcción de elementos Cytoscape ─────────────────────────────────────
  // Con fcose, cada familia con ≥3 miembros se vuelve un contenedor (compound node)
  // para que se disponga como un cluster propio. Concentric no usa compuestos.
  const branchSize = new Map();
  nodes.forEach(n => { if (n.type === 'persona' && n.branch) branchSize.set(n.branch, (branchSize.get(n.branch) || 0) + 1); });
  const bigBranches = new Set([...branchSize.entries()].filter(([, c]) => c >= 3).map(([b]) => b));

  const elements = [];
  if (USE_COMPOUNDS) bigBranches.forEach(b => elements.push({ data: { id: 'branch:' + b, isParent: 1, color: getBranchColor(b) } }));
  visNodes.forEach(n => {
    elements.push({
      data: {
        id: n.id, title: n.title, type: n.type, branch: n.branch || '',
        color: nodeColor(n), r: nodeRadius(n), deg: degreeMap.get(n.id) || 0,
        parent: (USE_COMPOUNDS && n.type === 'persona' && bigBranches.has(n.branch)) ? 'branch:' + n.branch : undefined,
      },
    });
  });
  visLinks.forEach((l, i) => elements.push({ data: { id: `e${i}`, source: l.source, target: l.target, rel: l.rel || '' } }));

  // ── Layout radial agrupado por familia (sunburst determinista) ──────────────
  // Cada grupo (familia grande / satélites / temas / fuentes) ocupa una cuña angular
  // proporcional a su tamaño; dentro de la cuña, los nodos se reparten en anillos por
  // grado (hubs cerca del centro, hojas al borde).
  function clusteredPositions() {
    const groupKey = n => {
      if (n.type === 'persona') return bigBranches.has(n.branch) ? n.branch : '·otras';
      if (n.type === 'tag') return '·temas';
      return '·fuentes'; // post, lugar, fuente, evento
    };
    const groups = new Map();
    visNodes.forEach(n => { const g = groupKey(n); (groups.get(g) || groups.set(g, []).get(g)).push(n); });
    // Orden alrededor del círculo: familias grandes (por tamaño), luego satélites, temas, fuentes
    const tail = ['·otras', '·temas', '·fuentes'];
    const fams = [...groups.keys()].filter(g => !tail.includes(g)).sort((a, b) => groups.get(b).length - groups.get(a).length);
    const order = [...fams, ...tail.filter(g => groups.has(g))];

    const cx = (host.clientWidth || 1000) / 2, cy0 = (host.clientHeight || 800) / 2;
    const total = visNodes.length, ngroups = order.length;
    const gapAngle = 2 * Math.PI * 0.02;                  // separación entre cuñas
    const usable = 2 * Math.PI - gapAngle * ngroups;
    const Rinner = 140, Rstep = 78, spacing = 72;         // más radio y separación → más aire
    const pos = {};
    let a = -Math.PI / 2;
    order.forEach(g => {
      const members = groups.get(g).slice().sort((x, y) => (degreeMap.get(y.id) || 0) - (degreeMap.get(x.id) || 0));
      const a0 = a, a1 = a + usable * (members.length / total);
      let idx = 0, ring = 0;
      while (idx < members.length) {
        const r = Rinner + ring * Rstep;
        const cap = Math.min(Math.max(1, Math.floor(((a1 - a0) * r) / spacing)), members.length - idx);
        for (let j = 0; j < cap; j++) {
          const ang = a0 + (j + 0.5) / cap * (a1 - a0);
          pos[members[idx++].id] = { x: cx + r * Math.cos(ang), y: cy0 + r * Math.sin(ang) };
        }
        ring++;
      }
      a = a1 + gapAngle;
    });
    return pos;
  }

  // ── Mandala genealógico: anillos = generaciones, sectores = familias ─────────
  // Ancestros (generación alta) al centro; cada generación más reciente, un anillo más afuera.
  // Cada familia ocupa un sector angular; dentro del sector, las personas de cada generación
  // se reparten en su anillo. Páginas/posts/fuentes quedan en un aro exterior.
  function mandalaPositions() {
    const cx = (host.clientWidth || 1000) / 2, cy0 = (host.clientHeight || 800) / 2;
    const persons = visNodes.filter(n => n.type === 'persona');
    const others = visNodes.filter(n => n.type !== 'persona');
    const genOf = id => { const p = personaById.get(id); return p && p.generation != null ? p.generation : null; };
    const sortOf = id => { const p = personaById.get(id); return p ? (p.sort_order ?? 0) : 0; };
    let maxGen = 0;
    persons.forEach(n => { const g = genOf(n.id); if (g != null && g > maxGen) maxGen = g; });
    const levelOf = n => { const g = genOf(n.id); return g == null ? (maxGen + 1) : (maxGen - g); }; // 0 = ancestro (centro)

    const byBranch = new Map();
    persons.forEach(n => { const b = n.branch || '·otras'; (byBranch.get(b) || byBranch.set(b, []).get(b)).push(n); });
    const branches = [...byBranch.keys()].sort((a, b) => byBranch.get(b).length - byBranch.get(a).length);

    const Rin = 95, Rstep = 105, totalP = persons.length || 1;
    const gap = 2 * Math.PI * 0.015;
    const usable = 2 * Math.PI - gap * branches.length;
    const pos = {};
    let a = -Math.PI / 2;
    branches.forEach(b => {
      const members = byBranch.get(b);
      const a0 = a, a1 = a + usable * (members.length / totalP);
      const byLevel = new Map();
      members.forEach(n => { const lv = levelOf(n); (byLevel.get(lv) || byLevel.set(lv, []).get(lv)).push(n); });
      byLevel.forEach((arr, lv) => {
        arr.sort((x, y) => sortOf(x.id) - sortOf(y.id));
        const r = Rin + lv * Rstep;
        arr.forEach((n, k) => {
          const ang = a0 + (k + 0.5) / arr.length * (a1 - a0);
          pos[n.id] = { x: cx + r * Math.cos(ang), y: cy0 + r * Math.sin(ang) };
        });
      });
      a = a1 + gap;
    });

    // Páginas, posts y fuentes → aro exterior repartido uniformemente
    const Rout = Rin + (maxGen + 1.6) * Rstep;
    others.forEach((n, k) => {
      const ang = (k + 0.5) / (others.length || 1) * 2 * Math.PI;
      pos[n.id] = { x: cx + Rout * Math.cos(ang), y: cy0 + Rout * Math.sin(ang) };
    });
    return pos;
  }

  const presetPositions = LAYOUT === 'clustered' ? clusteredPositions()
    : LAYOUT === 'mandala' ? mandalaPositions() : null;

  // Tokens de color según tema (se leen una vez al iniciar)
  const css = getComputedStyle(document.documentElement);
  const tok = (name, fb) => (css.getPropertyValue(name).trim() || fb);
  const C = { text: tok('--text', '#1a1a1a'), surface: tok('--surface', '#ffffff'), border: tok('--border', '#e8e8e6') };

  const cy = cytoscape({
    container: host,
    elements,
    minZoom: 0.15,
    maxZoom: 4,
    wheelSensitivity: 0.25,
    boxSelectionEnabled: false,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          width: 'data(r)', height: 'data(r)',
          'border-width': 0,
          // Nombres APAGADOS en la vista general (como Obsidian); aparecen solo al pasar el mouse.
          label: 'data(title)', color: C.text, 'text-opacity': 0,
          'font-family': 'Inter, sans-serif', 'font-size': 11, 'font-weight': 600,
          'text-valign': 'center', 'text-halign': 'right', 'text-margin-x': 4,
          'text-outline-color': C.surface, 'text-outline-width': 3,
          'transition-property': 'opacity, text-opacity, border-width', 'transition-duration': '0.15s',
        },
      },
      // Contenedores de familia: invisibles, solo agrupan en el layout (sin cajas que distraigan)
      {
        selector: 'node[?isParent]',
        style: { 'background-opacity': 0, 'border-width': 0, padding: 6, label: '', events: 'no' },
      },
      {
        selector: 'edge',
        style: {
          width: 0.6, 'line-color': C.border, 'curve-style': 'straight', opacity: 0.5,
          'transition-property': 'opacity', 'transition-duration': '0.15s',
        },
      },
      // Estados
      { selector: '.dim', style: { opacity: 0.08 } },
      { selector: 'node.show', style: { 'text-opacity': 1 } },   // nombre visible (hover / vecinos / selección)
      { selector: 'node.focus', style: { 'border-width': 2.5, 'border-color': C.text, 'font-weight': 700, 'z-index': 30 } },
      { selector: '.hidden', style: { display: 'none' } },
    ],
    layout: { name: 'preset' },   // el layout real se corre abajo (fcose + envoltorio circular)
  });

  // Posición de reposo ("home") de cada nodo en el disco — la usa la física al soltar un arrastre.
  const home = new Map();

  // Envuelve el resultado de fcose en un disco: conserva el ÁNGULO de cada nodo (los clusters
  // quedan como sectores) y normaliza el RADIO mezclando el original con uno uniforme → círculo
  // redondo pero con el centro más denso que el borde (orgánico, no un anillo perfecto).
  function wrapToCircle() {
    const nodes = cy.nodes().toArray().filter(n => !n.data('isParent'));
    if (!nodes.length) return;
    let cx = 0, cyy = 0;
    for (const n of nodes) { const p = n.position(); cx += p.x; cyy += p.y; }
    cx /= nodes.length; cyy /= nodes.length;
    const N = nodes.length;
    const R = Math.min(cy.width() || 800, cy.height() || 600) * 0.46;

    // Datos por nodo: ángulo y radio que dio fcose
    const arr = nodes.map(n => { const p = n.position(); return { n, ang: Math.atan2(p.y - cyy, p.x - cx), r: Math.hypot(p.x - cx, p.y - cyy) }; });

    // Rank por radio original → conserva "quién estaba más al centro" (densidad)
    const rankR = new Map();
    [...arr].sort((a, b) => a.r - b.r).forEach((o, i) => rankR.set(o.n.id(), i));

    // Ordenar por ángulo y REASIGNAR ángulos equiespaciados → cubre los 360° sin huecos,
    // y como respeta el orden angular, los clusters siguen contiguos (sectores del disco).
    arr.sort((a, b) => a.ang - b.ang);
    arr.forEach((o, i) => {
      const theta = (i / N) * 2 * Math.PI;
      // exponente < 0.5 empuja más nodos hacia el borde → contorno lleno y definido
      const rNew = R * Math.pow((rankR.get(o.n.id()) + 0.5) / N, 0.38);
      o.n.position({ x: cx + rNew * Math.cos(theta), y: cyy + rNew * Math.sin(theta) });
    });
    // Guardar la posición de reposo de cada nodo (la física los devuelve acá al soltar)
    home.clear();
    nodes.forEach(n => home.set(n.id(), { x: n.position('x'), y: n.position('y') }));
    cy.fit(undefined, 40);
  }
  window.__wrap = wrapToCircle;   // diagnóstico: ejecutable a mano desde la consola

  const layoutOpts = (LAYOUT === 'clustered' || LAYOUT === 'mandala') ? {
    name: 'preset', positions: presetPositions, fit: true, padding: 60,
  } : LAYOUT === 'concentric' ? {
    name: 'concentric', fit: true, padding: 60,
    concentric: n => n.data('deg'), levelWidth: () => 4,
    minNodeSpacing: 18, spacingFactor: 1.0, avoidOverlap: true,
  } : {
    name: 'fcose', quality: 'proof', randomize: true, animate: false, fit: false,
    packComponents: true, nodeSeparation: 50, nodeRepulsion: () => 7000,
    idealEdgeLength: e => e.data('rel') === 'familia' ? 36 : 56,
    edgeElasticity: e => e.data('rel') === 'familia' ? 0.45 : 0.25,
    gravity: 0.35, gravityRange: 3.8, numIter: 4500, tile: true,
  };

  cy.layout(layoutOpts).run();
  if (LAYOUT === 'fcose') {
    // fcose (animate:false) ya dejó las posiciones; lo envolvemos en círculo tras un breve respaldo.
    const doWrap = () => { try { wrapToCircle(); } catch (e) { console.error('wrapToCircle:', e); } };
    setTimeout(doWrap, 600);
    setTimeout(doWrap, 1500);   // segunda pasada por si fcose tardó (idempotente)
  }

  // Tamaño de los nombres FIJO en pantalla: el font está en coords del modelo (escala con el
  // zoom), así que lo recalculamos inverso al zoom para que se vea siempre igual de grande.
  const LABEL_PX = 14;
  const fixLabelSize = () => cy.nodes().style('font-size', LABEL_PX / cy.zoom());
  cy.on('zoom', fixLabelSize);
  fixLabelSize();

  // ── Física ligera con "memoria" del círculo (estilo Obsidian) ───────────────
  // Cada nodo tiene resortes hacia sus vecinos (al arrastrar uno, los conectados lo siguen) y
  // un resorte suave hacia su posición de reposo en el disco. Al soltar, el de reposo gana y
  // todo vuelve lento al círculo. La simulación solo corre durante/tras la interacción.
  const K_HOME = 0.006;   // fuerza de regreso al disco (más bajo = vuelve más lento)
  const K_SPRING = 0.014; // fuerza entre vecinos (más alto = los vecinos siguen más al arrastrado)
  const DAMP = 0.46;      // amortiguación (más alto = más "elástico"/lento)
  const vel = new Map();
  let simRunning = false, grabbedId = null;

  function physicsTick() {
    const force = new Map();
    cy.nodes().forEach(n => force.set(n.id(), { x: 0, y: 0 }));
    // Resorte hacia el home (disco)
    cy.nodes().forEach(n => {
      const id = n.id(); if (id === grabbedId) return;
      const h = home.get(id); if (!h) return;
      const p = n.position(), f = force.get(id);
      f.x += K_HOME * (h.x - p.x); f.y += K_HOME * (h.y - p.y);
    });
    // Resorte entre vecinos (longitud de reposo = distancia entre sus homes)
    cy.edges().forEach(e => {
      const s = e.source(), t = e.target(), sp = s.position(), tp = t.position();
      const dx = tp.x - sp.x, dy = tp.y - sp.y, dist = Math.hypot(dx, dy) || 1;
      const hS = home.get(s.id()), hT = home.get(t.id());
      const rest = (hS && hT) ? Math.hypot(hT.x - hS.x, hT.y - hS.y) : dist;
      const mag = K_SPRING * (dist - rest), ux = dx / dist, uy = dy / dist;
      if (s.id() !== grabbedId) { const f = force.get(s.id()); f.x += mag * ux; f.y += mag * uy; }
      if (t.id() !== grabbedId) { const f = force.get(t.id()); f.x -= mag * ux; f.y -= mag * uy; }
    });
    // Integrar y medir energía para saber cuándo frenar
    let energy = 0;
    cy.nodes().forEach(n => {
      const id = n.id(); if (id === grabbedId) return;
      const v = vel.get(id) || { x: 0, y: 0 }, f = force.get(id);
      v.x = (v.x + f.x) * DAMP; v.y = (v.y + f.y) * DAMP;
      vel.set(id, v);
      const p = n.position();
      n.position({ x: p.x + v.x, y: p.y + v.y });
      energy += v.x * v.x + v.y * v.y;
    });
    if (grabbedId || energy > 0.05) requestAnimationFrame(physicsTick);
    else simRunning = false;
  }
  function startPhysics() { if (!simRunning) { simRunning = true; requestAnimationFrame(physicsTick); } }
  cy.on('grab', 'node', e => { grabbedId = e.target.id(); startPhysics(); });
  cy.on('drag', 'node', startPhysics);
  cy.on('free', 'node', () => { grabbedId = null; startPhysics(); });

  // ── Interacción del grafo ───────────────────────────────────────────────────
  let selectedId = null;

  // Resalta vía el mapa `neighbors` (datos completos). Funciona también para un tag:
  // aunque el tag no esté dibujado, ilumina a toda la gente etiquetada con él.
  function highlight(id) {
    cy.elements().removeClass('dim focus show');
    if (!id) return;
    const keep = neighbors.get(id);
    if (!keep) return;
    cy.nodes().forEach(nd => { const k = keep.has(nd.id()); nd.toggleClass('dim', !k); nd.toggleClass('show', k); });
    cy.edges().forEach(ed => ed.toggleClass('dim', !(keep.has(ed.data('source')) && keep.has(ed.data('target')))));
    const nd = cy.getElementById(id);
    if (nd.nonempty()) nd.addClass('focus');
  }
  function selectNode(id) { selectedId = id; highlight(id); openPanel(nodeById.get(id)); }
  function deselect() { selectedId = null; highlight(null); closePanel(); }

  cy.on('tap', 'node', e => {
    const n = e.target;
    if (n.data('isParent')) return;
    selectNode(n.id());
  });
  cy.on('tap', e => { if (e.target === cy) deselect(); });
  cy.on('mouseover', 'node', e => { if (!selectedId && !e.target.data('isParent')) highlight(e.target.id()); });
  cy.on('mouseout', 'node', () => { if (!selectedId) highlight(null); });

  function recenterOn(id) {
    const n = cy.getElementById(id);
    if (n.empty() || n.data('isParent')) return;
    cy.animate({ center: { eles: n }, zoom: Math.max(cy.zoom(), 1.2) }, { duration: 450 });
  }

  // ── Panel lateral ───────────────────────────────────────────────────────────
  const panel = document.getElementById('wikiPanel');
  const panelBody = document.getElementById('wikiPanelBody');
  document.getElementById('wikiPanelClose').onclick = deselect;

  function chip(id) {
    const n = nodeById.get(id);
    const label = n ? n.title : (personaById.get(id)?.name || id);
    const cls = 'wiki-chip' + (isPersona(id) ? ' wiki-chip--persona' : '') + (n ? '' : ' wiki-chip--out');
    return `<button class="${cls}" data-node="${id}">${escapeHtml(label)}</button>`;
  }
  function chipGroup(title, ids) {
    const valid = [...new Set(ids)].filter(Boolean);
    if (!valid.length) return '';
    return `<div class="wiki-panel-group"><h3 class="wiki-panel-group-title">${title}</h3><div class="wiki-chips">${valid.map(chip).join('')}</div></div>`;
  }

  function openPanel(n) {
    if (!n) return;
    let html = `<header class="wiki-panel-head">
      <span class="wiki-panel-type wiki-panel-type--${n.type}">${TYPE_LABEL[n.type] || n.type}</span>
      <h2 class="wiki-panel-title">${escapeHtml(n.title)}</h2>
      ${n.summary ? `<p class="wiki-panel-summary">${escapeHtml(n.summary)}</p>` : ''}
    </header>`;

    const typeOf = id => nodeById.get(id)?.type;
    const tagNbrs = [...(neighbors.get(n.id) || [])].filter(id => typeOf(id) === 'tag');
    const notTag = ids => [...ids].filter(id => typeOf(id) !== 'tag');

    if (n.type === 'persona') {
      const p = personaById.get(n.id) || {};
      const parents = [p.father_id, p.mother_id].filter(Boolean);
      const pageNeighbors = [...(neighbors.get(n.id) || [])].filter(id => {
        const t = typeOf(id); return id !== n.id && t && t !== 'persona' && t !== 'tag';
      });
      html += chipGroup('Padres', parents);
      html += chipGroup('Cónyuge', spousesOf.get(n.id) || []);
      html += chipGroup('Hijos', childrenOf.get(n.id) || []);
      html += chipGroup('Aparece en', pageNeighbors);
      html += chipGroup('Etiquetas', tagNbrs);
    } else if (n.type === 'tag') {
      html += chipGroup('Etiquetado en', [...(neighbors.get(n.id) || [])].filter(id => id !== n.id));
    } else { // página o post
      html += chipGroup('Enlaza con', notTag(outOf.get(n.id) || []));
      html += chipGroup('Mencionada en', notTag(inOf.get(n.id) || []));
      html += chipGroup('Etiquetas', tagNbrs);
    }

    let actions = '';
    if (n.type === 'post') actions += `<a class="wiki-panel-btn wiki-panel-btn--primary" href="${rootBase()}${n.url}">Leer post →</a>`;
    else if (n.hasContent) actions += `<button class="wiki-panel-btn wiki-panel-btn--primary" data-read="${n.id}">${n.type === 'persona' ? 'Leer investigación' : 'Leer página'}</button>`;
    if (n.type === 'persona') actions += `<a class="wiki-panel-btn wiki-panel-btn--ghost" href="${rootBase()}arbol.html?focus=${n.id}">Ver en árbol</a>`;
    if (actions) html += `<div class="wiki-panel-actions">${actions}</div>`;

    panelBody.innerHTML = html;
    panel.classList.add('is-open');
  }
  function closePanel() { panel.classList.remove('is-open'); }

  // Delegación: chips re-centran; botón "Leer" abre modal
  panelBody.addEventListener('click', e => {
    const c = e.target.closest('[data-node]');
    if (c) { const id = c.dataset.node; if (nodeById.has(id)) { recenterOn(id); selectNode(id); } else { location.href = `${rootBase()}arbol.html?focus=${id}`; } return; }
    const r = e.target.closest('[data-read]');
    if (r) openModal(nodeById.get(r.dataset.read));
  });

  // ── Modal de lectura ────────────────────────────────────────────────────────
  const modal = document.getElementById('wikiModal');
  const modalBody = document.getElementById('wikiModalBody');
  document.getElementById('wikiModalClose').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  async function openModal(n) {
    if (!n || !n.hasContent) return;
    modalBody.innerHTML = '<p class="wiki-modal-loading">Cargando…</p>';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    try {
      const doc = new DOMParser().parseFromString(await (await fetch(rootBase() + n.url)).text(), 'text/html');
      const content = doc.querySelector('.wiki-page-content');
      const related = doc.querySelector('.wiki-related');
      modalBody.innerHTML =
        `<span class="wiki-type-badge wiki-type-badge--${n.type}">${TYPE_LABEL[n.type] || n.type}</span>
         <h1 class="wiki-modal-title">${escapeHtml(n.title)}</h1>
         ${n.summary ? `<p class="wiki-modal-summary">${escapeHtml(n.summary)}</p>` : ''}
         <div class="wiki-page-content">${content ? content.innerHTML : ''}</div>
         ${related ? `<div class="wiki-related">${related.innerHTML}</div>` : ''}`;
      modalBody.scrollTop = 0;
    } catch (err) {
      modalBody.innerHTML = '<p class="wiki-modal-loading">No se pudo cargar el contenido.</p>';
    }
  }
  function closeModal() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

  // Enlaces internos dentro del modal → navegan el grafo
  modalBody.addEventListener('click', e => {
    const a = e.target.closest('[data-node]');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.node;
    if (nodeById.has(id)) { closeModal(); recenterOn(id); selectNode(id); }
    else location.href = `${rootBase()}arbol.html?focus=${id}`;
  });

  // ── Filtro por rama (expuesto al command palette ⌘K) ────────────────────────
  let activeBranch = null;
  window.__wikiBranches = [...new Set(nodes.filter(n => n.type === 'persona' && n.branch).map(n => n.branch))].sort();
  window.__wikiActiveBranch = () => activeBranch;
  window.__wikiFilterBranch = (branch) => {
    activeBranch = branch || null;
    cy.batch(() => {
      cy.nodes('[type="persona"]').forEach(n => n.toggleClass('hidden', !!activeBranch && n.data('branch') !== activeBranch));
      cy.edges().forEach(e => {
        const s = nodeById.get(e.data('source')), t = nodeById.get(e.data('target'));
        const out = activeBranch && ((s?.type === 'persona' && s.branch !== activeBranch) || (t?.type === 'persona' && t.branch !== activeBranch));
        e.toggleClass('hidden', !!out);
      });
    });
  };

  // ── Leyenda + zoom ──────────────────────────────────────────────────────────
  const legend = document.getElementById('wikiLegend');
  ['persona', 'lugar', 'fuente', 'evento', 'post'].forEach(t => {
    const color = t === 'persona' ? getBranchColor('clemenzo') : TYPE_COLOR[t];
    const s = document.createElement('span');
    s.className = 'wiki-legend-item';
    s.innerHTML = `<span class="wiki-legend-dot" style="background:${color}"></span>${TYPE_LABEL[t]}`;
    legend.appendChild(s);
  });
  const zoomBy = factor => cy.zoom({ level: cy.zoom() * factor, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  document.getElementById('wikiZoomIn').onclick = () => zoomBy(1.3);
  document.getElementById('wikiZoomOut').onclick = () => zoomBy(1 / 1.3);

  // El command palette (⌘K) enfoca un nodo sin salir de la página
  window.__personaFocus = id => {
    if (nodeById.has(id)) { recenterOn(id); selectNode(id); }
    else location.href = `${rootBase()}arbol.html?focus=${id}`;
  };

  // Foco inicial si viene ?focus=<id>
  const focusId = new URLSearchParams(location.search).get('focus');
  if (focusId && nodeById.has(focusId)) cy.ready(() => setTimeout(() => { recenterOn(focusId); selectNode(focusId); }, 300));
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

init();
