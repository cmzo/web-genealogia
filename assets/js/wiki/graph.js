// Grafo de conocimiento de la wiki (estilo Obsidian): Cytoscape.js solo como
// renderer (layout "preset") + física propia — repulsión, centrado, resortes y
// borde circular — definida más abajo. Los tags no se dibujan (viven en el panel).
//
// El grafo es el hub: clic en un nodo abre un panel lateral con relaciones/enlaces;
// "Leer" abre un modal con el markdown renderizado, sin salir de la página.

import cytoscape from '../vendor/cytoscape.esm.min.js';
import { getBranchColor } from '../arbol/config.js';

// Colores de tipo: familia apagada/cálida (tierras y verdes del sitio), deliberadamente
// distinta de la paleta viva de las ramas para que las páginas/posts se lean como otra
// clase de nodo (los viejos teal/violeta/cian colisionaban con garrido/lantz/venegas).
const TYPE_COLOR = { lugar: '#4a7c59', fuente: '#854d0e', evento: '#8f4632', tema: '#2d4a3e', post: '#3f5e6b', tag: '#64748b' };
const TYPE_LABEL = { persona: 'Persona', lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema', post: 'Post', tag: 'Etiqueta' };

const nodeColor = n => n.type === 'persona' ? getBranchColor(n.branch) : (TYPE_COLOR[n.type] || TYPE_COLOR.tema);
const isPersona = id => /^p\d+$/.test(id);

const dataPath = f => (window.getDataPath ? window.getDataPath(f) : `./assets/data/${f}`);
const rootBase = () => (window.PATH_CONFIG && window.PATH_CONFIG.base) || './';

async function init() {
  const host = document.getElementById('wikiGraph');
  // Único momento con espera real (fetch); el armado del disco de abajo es ~300
  // pasos síncronos deliberadamente invisibles (ver comentario en reveal()), así
  // que este mensaje solo cubre la carga de datos, no la física.
  const loadingEl = document.getElementById('wikiGraphLoading');
  let data, arbol, documentos;
  try {
    [data, arbol, documentos] = await Promise.all([
      fetch(dataPath('wiki-graph.json')).then(r => r.json()),
      fetch(dataPath('arbol.json')).then(r => r.json()).catch(() => ({ personas: [], matrimonios: [] })),
      fetch(dataPath('documentos.json')).then(r => r.ok ? r.json() : []).catch(() => []),
    ]);
  } catch (e) {
    loadingEl?.remove();
    host.innerHTML = '<p class="wiki-graph-empty">No se pudo cargar el grafo.</p>';
    return;
  }

  const nodes = data.nodes.map(d => ({ ...d }));
  const links = data.edges.map(d => ({ ...d }));
  const nodeById = new Map(nodes.map(n => [n.id, n]));
  if (!nodes.length) { loadingEl?.remove(); host.innerHTML = '<p class="wiki-graph-empty">Todavía no hay páginas en la wiki.</p>'; return; }

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
  const siblingsOf = new Map();
  (arbol.personas || []).forEach(p => {
    if (!p.father_id && !p.mother_id) return;
    const sibs = (arbol.personas || [])
      .filter(q => q.id !== p.id && ((p.father_id && q.father_id === p.father_id) || (p.mother_id && q.mother_id === p.mother_id)))
      .map(q => q.id);
    if (sibs.length) siblingsOf.set(p.id, sibs);
  });
  const docCountByPersona = new Map();
  (documentos || []).forEach(d => (d.personas || []).forEach(p => {
    docCountByPersona.set(p.id, (docCountByPersona.get(p.id) || 0) + 1);
  }));

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
    return Math.max(3, Math.min(13, 3 + Math.sqrt(deg) * 1.6));
  };

  // ── Construcción de elementos Cytoscape ─────────────────────────────────────
  // Los "hubs" (nodos con muchas conexiones) muestran el nombre siempre, como en Obsidian.
  const HUB_DEG = 8;
  const elements = [];
  visNodes.forEach(n => {
    const data = { id: n.id, title: n.title, type: n.type, branch: n.branch || '', color: nodeColor(n), r: nodeRadius(n) };
    if ((degreeMap.get(n.id) || 0) >= HUB_DEG) data.hub = 1;
    if (n.hasContent || n.type === 'post') data.content = 1;   // anillo: hay algo para leer
    elements.push({ data });
  });
  visLinks.forEach((l, i) => elements.push({ data: { id: `e${i}`, source: l.source, target: l.target, rel: l.rel || '' } }));

  // Tokens de color según tema (se releen al alternar día/noche — ver el MutationObserver más abajo)
  const readTokens = () => {
    const css = getComputedStyle(document.documentElement);
    const tok = (name, fb) => (css.getPropertyValue(name).trim() || fb);
    return { text: tok('--text', '#1a1a1a'), surface: tok('--surface', '#ffffff'), border: tok('--border', '#e8e8e6'), accent: tok('--accent', '#2d4a3e'), muted: tok('--muted', '#5a5040') };
  };
  const C = readTokens();

  // Hoja de estilos como función de los tokens, para poder re-aplicarla al cambiar el tema.
  const makeStyle = () => [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)', 'background-blacken': -0.15,
        width: 'data(r)', height: 'data(r)',
        'border-width': 0,
        // Nombres tenues y livianos (no dominan), apagados salvo en hubs / hover / zoom.
        label: 'data(title)', color: C.muted, 'text-opacity': 0,
        'font-family': '"IBM Plex Sans", sans-serif', 'font-size': 11, 'font-weight': 500,
        'text-valign': 'center', 'text-halign': 'right', 'text-margin-x': 4,
        'text-outline-color': C.surface, 'text-outline-width': 1.5,
        'transition-property': 'opacity, text-opacity, border-width', 'transition-duration': '0.15s',
      },
    },
    // Anillo en los nodos con algo para leer (nota, página o post) — invita el clic
    { selector: 'node[?content]', style: { 'border-width': 1.5, 'border-color': C.accent } },
    {
      selector: 'edge',
      style: {
        width: 0.3, 'line-color': C.muted, 'curve-style': 'straight', opacity: 0.4,
        'transition-property': 'opacity', 'transition-duration': '0.15s',
      },
    },
    // El backbone familiar, más tenue: es contexto (ya vive en el árbol);
    // la red de menciones/enlaces es el contenido propio de la wiki.
    { selector: 'edge[rel="familia"]', style: { opacity: 0.18 } },
    // Estados
    { selector: '.dim', style: { opacity: 0.08 } },
    { selector: 'edge.hl', style: { 'line-color': C.accent, opacity: 1, width: 1.8, 'z-index': 20 } },  // líneas del nodo en hover
    { selector: 'node.show', style: { 'text-opacity': 1 } },   // nombre visible (hover / vecinos / selección)
    { selector: 'node.focus', style: { 'border-width': 2.5, 'border-color': C.text, color: C.text, 'font-weight': 700, 'z-index': 30 } },
    // Nombre visible siempre en los hubs, y en todos los nodos al acercar el zoom
    { selector: 'node[?hub], node.zoomed', style: { 'text-opacity': 1 } },
    { selector: '.hidden', style: { display: 'none' } },
  ];

  // Ocultar el lienzo ANTES del primer render, SIN transición (oculto instantáneo). La transición
  // se agrega recién al revelar — si se pusiera acá, el grafo se desvanecería a la vista (visible).
  host.style.opacity = '0';

  const cy = cytoscape({
    container: host,
    elements,
    minZoom: 0.15,
    maxZoom: 4,
    wheelSensitivity: 0.25,
    boxSelectionEnabled: false,
    style: makeStyle(),
    layout: { name: 'preset' },   // las posiciones las pone la física de abajo
  });

  // ── Física tipo Obsidian: repulsión entre todos + centrado + resortes de enlace, CONFINADOS
  //    en un borde circular. El disco redondo emerge de la repulsión empujando hacia afuera contra
  //    el centro; el borde lo cierra el confinamiento. La misma física sirve para el arrastre.
  // El disco vive en coordenadas de MODELO, independientes del viewport: cy.fit()/centerNodes()
  // lo escalan a la pantalla al final. Antes DISC_R = 0.25·min(ancho,alto) del CONTENEDOR, así que
  // en pantallas angostas (móvil en vertical) el disco quedaba chico y los 100+ nodos —de tamaño
  // fijo— se amontonaban → parecía la maraña vieja. Ahora el radio depende de la CANTIDAD de nodos:
  // densidad pareja en cualquier dispositivo, y sin depender de que el contenedor ya tenga su alto.
  const CX = 0, CY = 0;
  const DISC_R = Math.max(170, Math.sqrt(nodes.length) * 15);   // radio del disco — calibrado a ≈ el desktop actual (173 nodos → ~197)

  const K_REPEL  = 13000;   // repulsión entre nodos (más alto = más separados, disco más lleno)
  const K_CENTER = 0.038;   // elástico al centro (ayuda a llenar el interior)
  const K_LINK   = 0.04;    // resortes de enlace (vecinos juntos / se siguen al arrastrar)
  const REST     = 64;      // distancia de reposo de un enlace
  const K_BOUND  = 0.5;     // fuerza del borde circular (más alto = contorno más nítido)
  const DAMP     = 0.4;     // amortiguación

  const vel = new Map();
  let simRunning = false, grabbedId = null, revealed = false;

  // Centra el disco de NODOS en el viewport. cy.fit/center usan el bounding box CON labels,
  // y como los hubs muestran su nombre a la derecha, eso corre el cúmulo hacia la izquierda.
  // Recalculamos el paneo sobre el bbox de los nodos SIN labels para que quede centrado de verdad.
  function centerNodes() {
    const bb = cy.nodes(':visible').boundingBox({ includeLabels: false });
    if (!bb || !isFinite(bb.x1)) return;
    const z = cy.zoom();
    cy.pan({ x: cy.width() / 2 - ((bb.x1 + bb.x2) / 2) * z, y: cy.height() / 2 - ((bb.y1 + bb.y2) / 2) * z });
  }

  function reveal() {
    if (revealed) return; revealed = true;
    cy.fit(undefined, 50);
    centerNodes();
    loadingEl?.remove();
    host.style.transition = 'opacity 0.5s ease';
    host.style.opacity = '1';
  }

  // Un paso de simulación; devuelve la energía cinética total (para saber cuándo frenó).
  function step() {
    const ns = cy.nodes().toArray();
    const force = new Map(), pos = new Map();
    ns.forEach(n => { force.set(n.id(), { x: 0, y: 0 }); pos.set(n.id(), n.position()); });

    // Repulsión entre todos los pares (inverse-square, con distancia mínima para estabilidad)
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = ns[i].id(), b = ns[j].id(), pa = pos.get(a), pb = pos.get(b);
        let dx = pb.x - pa.x, dy = pb.y - pa.y, d2 = dx * dx + dy * dy;
        if (d2 < 36) d2 = 36;
        const d = Math.sqrt(d2), f = K_REPEL / d2, ux = dx / d, uy = dy / d;
        const fa = force.get(a), fb = force.get(b);
        fa.x -= f * ux; fa.y -= f * uy; fb.x += f * ux; fb.y += f * uy;
      }
    }
    // Resortes de enlace
    cy.edges().forEach(e => {
      const a = e.data('source'), b = e.data('target'), pa = pos.get(a), pb = pos.get(b);
      if (!pa || !pb) return;
      const dx = pb.x - pa.x, dy = pb.y - pa.y, d = Math.hypot(dx, dy) || 1;
      const f = K_LINK * (d - REST), ux = dx / d, uy = dy / d;
      if (a !== grabbedId) { const fa = force.get(a); fa.x += f * ux; fa.y += f * uy; }
      if (b !== grabbedId) { const fb = force.get(b); fb.x -= f * ux; fb.y -= f * uy; }
    });
    // Centro + borde circular + integración
    let energy = 0;
    ns.forEach(n => {
      const id = n.id(); if (id === grabbedId) return;
      const p = pos.get(id), f = force.get(id);
      f.x += K_CENTER * (CX - p.x); f.y += K_CENTER * (CY - p.y);
      const ddx = p.x - CX, ddy = p.y - CY, dd = Math.hypot(ddx, ddy);
      if (dd > DISC_R) { const ux = ddx / dd, uy = ddy / dd; f.x -= K_BOUND * (dd - DISC_R) * ux; f.y -= K_BOUND * (dd - DISC_R) * uy; }
      const v = vel.get(id) || { x: 0, y: 0 };
      v.x = (v.x + f.x) * DAMP; v.y = (v.y + f.y) * DAMP;
      vel.set(id, v);
      n.position({ x: p.x + v.x, y: p.y + v.y });
      energy += v.x * v.x + v.y * v.y;
    });
    return energy;
  }

  function rafLoop() { const e = step(); if (grabbedId || e > 0.4) requestAnimationFrame(rafLoop); else simRunning = false; }
  function startPhysics() { if (!simRunning) { simRunning = true; requestAnimationFrame(rafLoop); } }
  cy.on('grab', 'node', e => { grabbedId = e.target.id(); startPhysics(); });
  cy.on('drag', 'node', startPhysics);
  cy.on('free', 'node', () => { grabbedId = null; startPhysics(); });

  // Arranque: posiciones dispersas dentro del disco; pre-asentar en sincrónico (oculto) → disco,
  // y recién entonces revelar. Así no se ve el proceso, solo el círculo ya formado.
  cy.nodes().forEach(n => {
    const a = Math.random() * 2 * Math.PI, r = Math.sqrt(Math.random()) * DISC_R * 0.9;
    n.position({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });
  });
  for (let i = 0; i < 300; i++) step();
  reveal();

  // Tamaño de los nombres FIJO en pantalla (no escala con el zoom). Además, al acercar lo
  // suficiente se muestran TODOS los nombres (no solo los hubs) → invita a explorar.
  const LABEL_PX = 13, ZOOM_LABELS = 1.6;
  let labelsExpanded = false;
  const fixLabelSize = () => {
    cy.nodes().style('font-size', LABEL_PX / cy.zoom());
    const expand = cy.zoom() > ZOOM_LABELS;
    if (expand !== labelsExpanded) { labelsExpanded = expand; cy.nodes().toggleClass('zoomed', expand); }
  };
  cy.on('zoom', fixLabelSize);
  fixLabelSize();

  // El grafo sigue al toggle día/noche en vivo: se releen los tokens y se re-aplica la hoja
  // de estilos (los font-size por elemento de fixLabelSize son bypass y sobreviven).
  new MutationObserver(() => { Object.assign(C, readTokens()); cy.style(makeStyle()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── Interacción del grafo ───────────────────────────────────────────────────
  let selectedId = null;

  // Resalta vía el mapa `neighbors` (datos completos). Funciona también para un tag:
  // aunque el tag no esté dibujado, ilumina a toda la gente etiquetada con él.
  function highlight(id) {
    cy.elements().removeClass('dim focus show hl');
    if (!id) return;
    const keep = neighbors.get(id);
    if (!keep) return;
    cy.nodes().forEach(nd => { const k = keep.has(nd.id()); nd.toggleClass('dim', !k); nd.toggleClass('show', k); });
    cy.edges().forEach(ed => {
      const s = ed.data('source'), t = ed.data('target');
      ed.toggleClass('dim', !(keep.has(s) && keep.has(t)));
      ed.toggleClass('hl', s === id || t === id);   // líneas que tocan el nodo en foco → iluminadas
    });
    const nd = cy.getElementById(id);
    if (nd.nonempty()) nd.addClass('focus');
  }
  // El foco vuelve al lienzo al seleccionar (clic o teclado): así, después de clickear
  // un nodo con el mouse, las flechas ya funcionan sin necesitar un Tab de más.
  function selectNode(id) { selectedId = id; highlight(id); openPanel(nodeById.get(id)); host.focus({ preventScroll: true }); }
  function deselect() { selectedId = null; highlight(null); closePanel(); }

  cy.on('tap', 'node', e => selectNode(e.target.id()));
  cy.on('tap', e => { if (e.target === cy) deselect(); });
  cy.on('mouseover', 'node', e => { if (!selectedId) highlight(e.target.id()); });
  cy.on('mouseout', 'node', () => { if (!selectedId) highlight(null); });

  // ── Navegación por teclado ───────────────────────────────────────────────────
  // El lienzo es un <canvas>: no hay un nodo del DOM por dato que Tab pueda alcanzar.
  // Mismo patrón que assets/js/arbol/keyboard.js (foco en un nodo + flechas para
  // moverse), adaptado a un grafo general en vez de una jerarquía familiar:
  // →/↓ avanza al vecino visible (no-tag) más conectado del nodo en foco;
  // ←/↑ vuelve sobre los pasos (historial de visita, como "atrás" del navegador);
  // Enter/Space abre la lectura si el nodo tiene contenido; Escape suelta el foco.
  const kbHistory = [];
  function visibleNeighborsOf(id) {
    const own = neighbors.get(id);
    if (!own) return [];
    return [...own]
      .filter(nid => nid !== id && nodeById.has(nid) && nodeById.get(nid).type !== 'tag')
      .sort((a, b) => (degreeMap.get(b) || 0) - (degreeMap.get(a) || 0) || nodeById.get(a).title.localeCompare(nodeById.get(b).title));
  }
  function initialKeyboardNode() {
    // Sin selección todavía: arrancar por el hub más conectado del grafo visible.
    let best = null;
    visNodes.forEach(n => { if (!best || (degreeMap.get(n.id) || 0) > (degreeMap.get(best) || 0)) best = n.id; });
    return best;
  }
  function goToByKeyboard(id) { recenterOn(id); selectNode(id); }
  host.addEventListener('keydown', e => {
    if (e.key === 'Escape') { deselect(); kbHistory.length = 0; host.blur(); return; }
    if (!selectedId) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        const id = initialKeyboardNode();
        if (id) goToByKeyboard(id);
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const opts = visibleNeighborsOf(selectedId);
      if (!opts.length) return;
      kbHistory.push(selectedId);
      goToByKeyboard(opts[0]);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = kbHistory.pop();
      if (prev) goToByKeyboard(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const n = nodeById.get(selectedId);
      if (n) { if (n.type === 'post') location.href = `${rootBase()}${n.url}`; else if (n.hasContent) openModal(n); }
    }
  });

  // Popover de ayuda (ⓘ): único aviso visible de que el grafo se navega por teclado.
  const infoBtn = document.getElementById('wikiInfoBtn');
  const infoPop = document.getElementById('wikiInfoPop');
  if (infoBtn && infoPop) {
    const setInfoOpen = open => { infoPop.hidden = !open; infoBtn.setAttribute('aria-expanded', String(open)); };
    infoBtn.addEventListener('click', e => { e.stopPropagation(); setInfoOpen(infoPop.hidden); });
    document.addEventListener('click', e => { if (!infoPop.hidden && !infoPop.contains(e.target) && e.target !== infoBtn) setInfoOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !infoPop.hidden) setInfoOpen(false); });
  }

  function recenterOn(id) {
    const n = cy.getElementById(id);
    if (n.empty()) return;
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

  // Ficha: vitales derivados de arbol.json (nunca escritos a mano). Mismo dato,
  // mismo lugar, en las 133 personas — cuando falta se ve el hueco a propósito.
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function fmtFecha(s) {
    if (!s) return '';
    const parts = String(s).split('-');
    if (parts.length === 3) return `${+parts[2]} de ${MESES[+parts[1] - 1]} de ${parts[0]}`;
    if (parts.length === 2) return `${MESES[+parts[1] - 1]} de ${parts[0]}`;
    return parts[0];
  }
  function fichaRow(label, valueHtml) {
    return `<div class="wiki-ficha-row"><span class="wiki-ficha-label">${label}</span>${valueHtml}</div>`;
  }
  function fichaHtml(p) {
    const NONE = '<p class="wiki-ficha-val wiki-ficha-none">—</p>';
    const nac = fmtFecha(p.birth_date);
    let nacHtml = NONE;
    if (nac || p.birth_place) {
      nacHtml = `<p class="wiki-ficha-val">${nac ? `<b>${escapeHtml(nac)}</b>` : '<span class="wiki-ficha-none">fecha sin documentar</span>'}${p.birth_place ? `<br><span class="wiki-ficha-place">${escapeHtml(p.birth_place)}</span>` : ''}</p>`;
    }
    const def = fmtFecha(p.death_date);
    let edad = '';
    if (p.birth_date && p.death_date) {
      const by = +String(p.birth_date).slice(0, 4), dy = +String(p.death_date).slice(0, 4);
      if (by && dy) edad = String(dy - by);
    }
    let defHtml = NONE;
    if (def || p.death_place) {
      defHtml = `<p class="wiki-ficha-val">${def ? `<b>${escapeHtml(def)}</b>` : '<span class="wiki-ficha-none">fecha sin documentar</span>'}${edad ? ` <span class="wiki-ficha-edad">a los ${edad}</span>` : ''}${p.death_place ? `<br><span class="wiki-ficha-place">${escapeHtml(p.death_place)}</span>` : ''}</p>`;
    } else if (p.vivo === 'si') {
      defHtml = '<p class="wiki-ficha-val wiki-ficha-none">vive</p>';
    }
    return `<div class="wiki-panel-group wiki-ficha-block">${fichaRow('Nacimiento', nacHtml)}${fichaRow('Defunción', defHtml)}</div>`;
  }
  function docsGroup(id) {
    const n = docCountByPersona.get(id) || 0;
    const val = n ? `<button class="wiki-panel-doclink" data-read="${id}">${n} documento${n === 1 ? '' : 's'} →</button>` : '<p class="wiki-ficha-val wiki-ficha-none">—</p>';
    return `<div class="wiki-panel-group"><h3 class="wiki-panel-group-title">Documentos</h3>${val}</div>`;
  }

  function openPanel(n) {
    if (!n) return;
    let html = `<header class="wiki-panel-head">
      <span class="wiki-panel-type wiki-panel-type--${n.type}">${TYPE_LABEL[n.type] || n.type}</span>
      <h2 class="wiki-panel-title">${escapeHtml(n.title)}</h2>
      ${n.type !== 'persona' && n.summary ? `<p class="wiki-panel-summary">${escapeHtml(n.summary)}</p>` : ''}
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
      html += fichaHtml(p);
      html += chipGroup('Padres', parents);
      html += chipGroup('Cónyuge', spousesOf.get(n.id) || []);
      html += chipGroup('Hermanos', siblingsOf.get(n.id) || []);
      html += chipGroup('Hijos', childrenOf.get(n.id) || []);
      html += docsGroup(n.id);
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
    else if (n.hasContent) actions += `<button class="wiki-panel-btn wiki-panel-btn--primary" data-read="${n.id}">${n.type !== 'persona' ? 'Leer página' : n.docsOnly ? 'Ver documentos' : 'Leer investigación'}</button>`;
    if (n.type === 'persona') actions += `<a class="wiki-panel-btn wiki-panel-btn--ghost" href="${rootBase()}arbol.html?focus=${n.id}">Ver en árbol</a>`;
    if (actions) html += `<div class="wiki-panel-actions">${actions}</div>`;

    panelBody.innerHTML = html;
    panel.classList.add('is-open');
  }
  function closePanel() { panel.classList.remove('is-open'); }

  // Delegación: chips re-centran; botón "Leer" abre modal
  panelBody.addEventListener('click', e => {
    const c = e.target.closest('[data-node]');
    if (c) {
      const id = c.dataset.node;
      if (modal.classList.contains('is-open')) closeModal();  // si estabas leyendo, saltá
      if (nodeById.has(id)) { recenterOn(id); selectNode(id); } else { location.href = `${rootBase()}arbol.html?focus=${id}`; }
      return;
    }
    const r = e.target.closest('[data-read]');
    if (r) openModal(nodeById.get(r.dataset.read));
  });

  // ── Modal de lectura ────────────────────────────────────────────────────────
  const modal = document.getElementById('wikiModal');
  const modalBody = document.getElementById('wikiModalBody');
  document.getElementById('wikiModalClose').onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  // Mermaid bajo demanda: solo se carga (vendoreado, build UMD) cuando un artículo trae diagramas.
  let _mermaidP = null;
  function ensureMermaid() {
    if (window.mermaid) return Promise.resolve(window.mermaid);
    if (_mermaidP) return _mermaidP;
    _mermaidP = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${rootBase()}assets/js/vendor/mermaid.min.js`;
      s.onload = () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        window.mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral' });
        resolve(window.mermaid);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return _mermaidP;
  }
  async function runMermaidIn(root) {
    const blocks = root.querySelectorAll('.mermaid');
    if (!blocks.length) return;
    try { (await ensureMermaid()).run({ nodes: blocks }); } catch (_) {}
  }
  // Figuras → lightbox compartido (assets/js/lightbox.js). Arma una galería con todas
  // las imágenes del artículo y abre en la que se clickeó.
  function wireFigures(root) {
    const imgs = [...root.querySelectorAll('.wiki-figure img')];
    if (!imgs.length || !window.openLightboxGallery) return;
    const gallery = imgs.map(im => ({
      src: im.src, alt: im.alt,
      caption: im.closest('figure')?.querySelector('figcaption')?.innerHTML || im.alt || '',
    }));
    imgs.forEach((im, i) => { im.style.cursor = 'zoom-in'; im.addEventListener('click', () => window.openLightboxGallery(gallery, i, { sans: true })); });
  }

  // Vista completa del artículo de un nodo (persona/página/post).
  async function openModal(n) {
    if (!n || !n.hasContent) return;
    modalBody.innerHTML = '<p class="wiki-modal-loading">Cargando…</p>';
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    try {
      const doc = new DOMParser().parseFromString(await (await fetch(rootBase() + n.url)).text(), 'text/html');
      const content = doc.querySelector('.wiki-page-content');
      modalBody.innerHTML =
        `<span class="wiki-type-badge wiki-type-badge--${n.type}">${TYPE_LABEL[n.type] || n.type}</span>
         <h1 class="wiki-modal-title">${escapeHtml(n.title)}</h1>
         ${n.summary ? `<p class="wiki-modal-summary">${escapeHtml(n.summary)}</p>` : ''}
         <div class="wiki-page-content">${content ? content.innerHTML : ''}</div>`;
      modalBody.scrollTop = 0;
      runMermaidIn(modalBody);   // diagramas (carga perezosa)
      wireFigures(modalBody);    // imágenes → lightbox
    } catch (err) {
      modalBody.innerHTML = '<p class="wiki-modal-loading">No se pudo cargar el contenido.</p>';
    }
  }

  // Vista enfocada en UN documento curado (⌘K → «Documentos», o una card dentro
  // de la ficha de una persona): todas sus páginas + transcripción, armada 100%
  // desde documentos.json — no depende de a qué persona esté ligada.
  const docBySlug = new Map((documentos || []).map(d => [d.slug, d]));
  function renderDocModal(d) {
    const personas = (d.personas || []).map(p =>
      `<button type="button" class="wiki-doc-persona-chip" data-doc-persona="${p.id}">${escapeHtml(p.name)}</button>`).join('');
    const gallery = (d.paginas || []).map(url =>
      `<figure class="wiki-figure"><img src="${rootBase()}${url}" alt="${escapeHtml(d.title)}" loading="lazy"></figure>`).join('');
    modalBody.innerHTML =
      `<span class="wiki-type-badge wiki-type-badge--persona">Documento</span>
       <h1 class="wiki-modal-title">${escapeHtml(d.title)}</h1>
       <div class="wiki-doc-personas">${personas}</div>
       <div class="wiki-doc-pages-gallery">${gallery}</div>
       <div class="wiki-page-content">
         ${d.hasBody ? d.bodyHtml : '<p class="wiki-doc-pending">Todavía no tiene transcripción.</p>'}
       </div>`;
    modalBody.scrollTop = 0;
    runMermaidIn(modalBody);
    wireFigures(modalBody);
  }
  function openDocModal(slug) {
    const d = docBySlug.get(slug);
    if (!d) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderDocModal(d);
  }
  function closeModal() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

  // Enlaces internos dentro del modal → llevan a la investigación del destino
  // (no solo lo enfocan en el grafo): una card de documento (data-doc) abre su
  // vista enfocada; un chip de persona (data-doc-persona) o un link en prosa
  // (data-node) abren la ficha completa de ese nodo si tiene contenido.
  modalBody.addEventListener('click', e => {
    const docCard = e.target.closest('[data-doc]');
    if (docCard) { e.preventDefault(); openDocModal(docCard.dataset.doc); return; }
    const personaChip = e.target.closest('[data-doc-persona]');
    if (personaChip) {
      const id = personaChip.dataset.docPersona;
      if (nodeById.has(id)) { recenterOn(id); selectNode(id); openModal(nodeById.get(id)); }
      return;
    }
    const a = e.target.closest('[data-node]');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.node;
    if (nodeById.has(id)) {
      const n = nodeById.get(id);
      // Un post no se lee en el modal (no es contenido de la wiki) — navega directo.
      if (n.type === 'post') { location.href = `${rootBase()}${n.url}`; return; }
      recenterOn(id); selectNode(id);
      if (n.hasContent) openModal(n); else closeModal();
    }
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

  // ── Card de métricas del grafo (derivadas del JSON en runtime; se actualizan
  // solas con cada build — nada hardcodeado) ───────────────────────────────────
  const statsCard = document.getElementById('wikiStats');
  if (statsCard) {
    const nPersonas = nodes.filter(n => n.type === 'persona').length;
    const nInvestigadas = nodes.filter(n => n.type === 'persona' && n.hasContent && !n.docsOnly).length;
    const nPaginas = nodes.filter(n => ['lugar', 'fuente', 'evento', 'tema'].includes(n.type)).length;
    const nPosts = nodes.filter(n => n.type === 'post').length;
    const nTags = nodes.filter(n => n.type === 'tag').length;
    const pct = nPersonas ? Math.round((nInvestigadas / nPersonas) * 100) : 0;
    const row = (label, v) => `<div class="wiki-stats-row">${label}<b>${v}</b></div>`;
    statsCard.innerHTML =
      `<div class="wiki-stats-kicker">// grafo</div>` +
      row('personas', nPersonas) +
      row('investigadas', `${nInvestigadas}/${nPersonas}`) +
      `<div class="wiki-stats-bar" title="${pct}% investigado"><span style="width:${pct}%"></span></div>` +
      row('páginas', nPaginas) +
      row('posts', nPosts) +
      row('nodos', nodes.length) +
      row('relaciones', links.length) +
      row('tags', nTags) +
      (Array.isArray(documentos) && documentos.length ? (() => {
        const nDocs = documentos.length;
        const nTrans = documentos.filter(d => d.hasBody).length;
        const tPct = Math.round((nTrans / nDocs) * 100);
        return row('documentos', nDocs) +
          row('transcriptos', `${nTrans}/${nDocs}`) +
          `<div class="wiki-stats-bar" title="${tPct}% transcripto"><span style="width:${tPct}%"></span></div>`;
      })() : '');
  }

  // El command palette (⌘K) enfoca un nodo sin salir de la página
  window.__personaFocus = id => {
    if (nodeById.has(id)) { recenterOn(id); selectNode(id); }
    else location.href = `${rootBase()}arbol.html?focus=${id}`;
  };
  // …y puede abrir la lectura directo (acción «Leer investigación» del ⌘K)
  window.__wikiRead = id => {
    if (!nodeById.has(id)) return;
    recenterOn(id); selectNode(id); openModal(nodeById.get(id));
  };
  // Abre la vista enfocada de un documento curado por su slug (⌘K → «Documentos»)
  window.__wikiOpenDoc = slug => openDocModal(slug);

  // Foco inicial: ?focus=<id> centra en el grafo; ?read=<id> además abre el modal
  // de lectura; ?doc=<slug> abre directo la vista enfocada de un documento.
  const params = new URLSearchParams(location.search);
  const docSlug = params.get('doc');
  if (docSlug) openDocModal(docSlug);
  const focusId = params.get('focus') || params.get('read');
  if (focusId && nodeById.has(focusId)) cy.ready(() => setTimeout(() => {
    recenterOn(focusId); selectNode(focusId);
    if (params.get('read')) openModal(nodeById.get(focusId));
  }, 300));
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

init();
