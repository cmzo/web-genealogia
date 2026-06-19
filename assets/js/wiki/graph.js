// Grafo de conocimiento de la wiki (estilo Obsidian) con D3 force layout.
// El grafo es el hub: clic en un nodo abre un panel lateral con relaciones/enlaces;
// "Leer" abre un modal con el markdown renderizado, sin salir de la página.

import { getBranchColor } from '../arbol/config.js';

const TYPE_COLOR = { lugar: '#0d9488', fuente: '#b45309', evento: '#9333ea', tema: '#2d4a3e' };
const TYPE_LABEL = { persona: 'Persona', lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema' };

const nodeColor = n => n.type === 'persona' ? getBranchColor(n.branch) : (TYPE_COLOR[n.type] || TYPE_COLOR.tema);
const nodeRadius = n => n.type === 'persona' ? 7 : 11;
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

  // ── Relaciones familiares desde arbol.json ──────────────────────────────────
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

  // Adyacencia dirigida (para "enlaza con" / "mencionada en")
  const outOf = new Map(), inOf = new Map(), neighbors = new Map(nodes.map(n => [n.id, new Set([n.id])]));
  links.forEach(l => {
    const s = l.source, t = l.target;
    (outOf.get(s) || outOf.set(s, new Set()).get(s)).add(t);
    (inOf.get(t) || inOf.set(t, new Set()).get(t)).add(s);
    neighbors.get(s)?.add(t); neighbors.get(t)?.add(s);
  });

  // ── SVG / fuerzas ───────────────────────────────────────────────────────────
  const width = host.clientWidth || 800, height = host.clientHeight || 600;
  const svg = d3.select(host).append('svg').attr('class', 'wiki-graph-svg')
    .attr('width', '100%').attr('height', '100%').attr('viewBox', [0, 0, width, height]);
  const rootG = svg.append('g');
  const zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => rootG.attr('transform', e.transform));
  svg.call(zoom);

  const link = rootG.append('g').selectAll('line').data(links).join('line').attr('class', 'wiki-graph-link');
  const node = rootG.append('g').selectAll('g').data(nodes).join('g').attr('class', 'wiki-graph-node').call(drag());
  node.append('circle').attr('r', nodeRadius).attr('fill', nodeColor)
    .attr('class', d => 'wiki-graph-dot' + (d.type === 'persona' ? ' wiki-graph-dot--persona' : ''));
  node.append('text').attr('class', 'wiki-graph-label').attr('x', d => nodeRadius(d) + 4).attr('y', 4).text(d => d.title);

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(95).strength(0.35))
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => nodeRadius(d) + 16))
    .on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  // ── Interacción del grafo ───────────────────────────────────────────────────
  let selectedId = null;
  node.on('mouseenter', (e, d) => { if (!selectedId) highlight(d.id); })
      .on('mouseleave', () => { if (!selectedId) highlight(null); })
      .on('click', (e, d) => { e.stopPropagation(); selectNode(d.id); });
  svg.on('click', e => { if (e.target.tagName === 'svg') deselect(); });

  function highlight(id) {
    const set = id ? neighbors.get(id) : null;
    node.classed('is-dim', d => set ? !set.has(d.id) : false).classed('is-focus', d => id ? d.id === id : false);
    link.classed('is-dim', d => set ? !(set.has(d.source.id) && set.has(d.target.id)) : false);
  }

  function selectNode(id) {
    selectedId = id;
    highlight(id);
    openPanel(nodeById.get(id));
  }
  function deselect() { selectedId = null; highlight(null); closePanel(); }

  function recenterOn(id) {
    const n = nodeById.get(id);
    if (!n || n.x == null) return;
    const k = 1.2;
    svg.transition().duration(550).call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(k).translate(-n.x, -n.y)
    );
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

    if (n.type === 'persona') {
      const p = personaById.get(n.id) || {};
      const parents = [p.father_id, p.mother_id].filter(Boolean);
      const pageNeighbors = [...(neighbors.get(n.id) || [])].filter(id => id !== n.id && nodeById.get(id) && !isPersona(id));
      html += chipGroup('Padres', parents);
      html += chipGroup('Cónyuge', spousesOf.get(n.id) || []);
      html += chipGroup('Hijos', childrenOf.get(n.id) || []);
      html += chipGroup('Aparece en', pageNeighbors);
    } else {
      html += chipGroup('Enlaza con', [...(outOf.get(n.id) || [])]);
      html += chipGroup('Mencionada en', [...(inOf.get(n.id) || [])]);
    }

    html += `<div class="wiki-panel-actions">`;
    if (n.hasContent) html += `<button class="wiki-panel-btn wiki-panel-btn--primary" data-read="${n.id}">${n.type === 'persona' ? 'Leer investigación' : 'Leer página'}</button>`;
    if (n.type === 'persona') html += `<a class="wiki-panel-btn wiki-panel-btn--ghost" href="${rootBase()}arbol.html?focus=${n.id}">Ver en árbol</a>`;
    html += `</div>`;

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

  // ── Filtro por rama ─────────────────────────────────────────────────────────
  const branches = [...new Set(nodes.filter(n => n.type === 'persona' && n.branch).map(n => n.branch))].sort();
  const pillBox = document.getElementById('wikiBranchPills');
  let activeBranch = null;
  const mkPill = (label, value) => {
    const b = document.createElement('button');
    b.className = 'wiki-filter-pill' + (value === activeBranch ? ' is-active' : '');
    b.textContent = label;
    b.onclick = () => {
      activeBranch = value;
      [...pillBox.children].forEach(c => c.classList.remove('is-active'));
      b.classList.add('is-active');
      node.classed('is-filtered-out', d => activeBranch && d.type === 'persona' && d.branch !== activeBranch);
    };
    return b;
  };
  if (branches.length) {
    pillBox.appendChild(mkPill('Todas', null));
    branches.forEach(br => pillBox.appendChild(mkPill(br.charAt(0).toUpperCase() + br.slice(1), br)));
  }

  // ── Leyenda + zoom ──────────────────────────────────────────────────────────
  const legend = document.getElementById('wikiLegend');
  ['persona', 'lugar', 'fuente', 'evento'].forEach(t => {
    const color = t === 'persona' ? getBranchColor('clemenzo') : TYPE_COLOR[t];
    const s = document.createElement('span');
    s.className = 'wiki-legend-item';
    s.innerHTML = `<span class="wiki-legend-dot" style="background:${color}"></span>${TYPE_LABEL[t]}`;
    legend.appendChild(s);
  });
  document.getElementById('wikiZoomIn').onclick = () => svg.transition().call(zoom.scaleBy, 1.3);
  document.getElementById('wikiZoomOut').onclick = () => svg.transition().call(zoom.scaleBy, 1 / 1.3);

  // El command palette (⌘K) enfoca un nodo sin salir de la página
  window.__personaFocus = id => {
    if (nodeById.has(id)) { recenterOn(id); selectNode(id); }
    else location.href = `${rootBase()}arbol.html?focus=${id}`;
  };

  // Foco inicial si viene ?focus=<id>
  const focusId = new URLSearchParams(location.search).get('focus');
  if (focusId && nodeById.has(focusId)) sim.on('end', () => { recenterOn(focusId); selectNode(focusId); });

  function drag() {
    return d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

init();
