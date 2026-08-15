/**
 * wiki-hover.js — preview al hacer hover sobre un link de la wiki (estilo Gwern).
 *
 * Autocontenido: solo inyecta el popup (el CSS vive en wiki.css, ya cargado en
 * toda página que use esto). Funciona sobre CUALQUIER .wiki-link/.wiki-chip
 * con [data-node] o [data-doc] — links en prosa y chips de «relacionados» por
 * igual — sin importar si están en el modal SPA de wiki.html o en una página
 * directa de dist/wiki/. El popup es clickeable: reenvía el click al elemento
 * original, así reusa la navegación que cada contexto ya sabe hacer (href real
 * en las páginas directas, o el delegate de graph.js dentro del modal).
 */
(function () {
  'use strict';

  const IN_WIKI_PAGE = /\/dist\/wiki\//.test(window.location.pathname);
  const IN_POST = /\/dist\/blog\//.test(window.location.pathname);
  const ROOT = (IN_WIKI_PAGE || IN_POST) ? '../../' : '';

  const TYPE_LABEL = {
    persona: 'Persona', lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema', post: 'Post',
  };

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function vitals(p) {
    if (!p) return '';
    const parts = [];
    if (p.birth_date || p.birth_place) parts.push(`n. ${[p.birth_date, p.birth_place].filter(Boolean).join(', ')}`);
    if (p.death_date || p.death_place) parts.push(`f. ${[p.death_date, p.death_place].filter(Boolean).join(', ')}`);
    return parts.join(' · ');
  }

  let _index = null, _loading = null;
  function loadIndex() {
    if (_index) return Promise.resolve(_index);
    if (_loading) return _loading;
    _loading = Promise.all([
      fetch(ROOT + 'assets/data/wiki-graph.json').then(r => r.ok ? r.json() : { nodes: [] }).catch(() => ({ nodes: [] })),
      fetch(ROOT + 'assets/data/documentos.json').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(ROOT + 'assets/data/arbol.json').then(r => r.ok ? r.json() : { personas: [] }).catch(() => ({ personas: [] })),
    ]).then(([graph, docsRaw, arbol]) => {
      _index = {
        nodeById: new Map((graph.nodes || []).map(n => [n.id, n])),
        docBySlug: new Map((Array.isArray(docsRaw) ? docsRaw : []).map(d => [d.slug, d])),
        personaById: new Map((arbol.personas || []).map(p => [p.id, p])),
      };
      return _index;
    });
    return _loading;
  }

  const popup = document.createElement('div');
  popup.id = 'wikiHoverPopup';
  popup.setAttribute('role', 'tooltip');
  popup.tabIndex = -1;
  document.body.appendChild(popup);
  let hideTimer = null;
  let _currentEl = null;

  function renderNode(n, idx) {
    const badge = TYPE_LABEL[n.type] || n.type;
    const p = n.type === 'persona' ? idx.personaById.get(n.id) : null;
    const meta = [p ? vitals(p) : '', n.branch ? cap(n.branch) : ''].filter(Boolean).join(' · ');
    return `<span class="whv-badge">${escapeHtml(badge)}</span>`
      + `<p class="whv-title">${escapeHtml(n.title)}</p>`
      + (meta ? `<p class="whv-meta">${escapeHtml(meta)}</p>` : '')
      + (n.summary ? `<p class="whv-body">${escapeHtml(n.summary)}</p>` : '')
      + `<span class="whv-cta">${n.type === 'persona' ? 'Clic → abre su ficha' : n.type === 'post' ? 'Clic → abre el post' : 'Clic → abre la página'}</span>`;
  }

  function renderDoc(d) {
    const personas = (d.personas || []).map(p => p.name).join(' · ');
    const pages = d.paginas && d.paginas.length > 1 ? ` — ${d.paginas.length} páginas` : '';
    const hasBody = !!d.hasBody;
    const body = hasBody ? d.snippet : 'Todavía no tiene transcripción.';
    const cover = d.paginas && d.paginas[0];
    const thumb = cover ? `<img class="whv-thumb" src="${ROOT}${cover}" alt="">` : '';
    return `<span class="whv-badge">Documento</span>`
      + thumb
      + `<p class="whv-title">${escapeHtml(d.title)}</p>`
      + (personas ? `<p class="whv-meta">${escapeHtml(personas)}${pages}</p>` : '')
      + `<p class="whv-body${hasBody ? '' : ' whv-pending'}">${escapeHtml(body)}</p>`
      + `<span class="whv-cta">Clic → abre el documento</span>`;
  }

  function place(el) {
    const r = el.getBoundingClientRect();
    const w = popup.offsetWidth || 440;
    let top = r.bottom + 8, left = r.left;
    if (left + w > window.innerWidth - 16) left = window.innerWidth - w - 16;
    popup.style.top = Math.max(8, top) + 'px';
    popup.style.left = Math.max(8, left) + 'px';
    popup.classList.add('is-on');
    const h = popup.offsetHeight || 160;
    if (top + h > window.innerHeight) popup.style.top = Math.max(8, r.top - h - 8) + 'px';
  }

  function show(el) {
    const docSlug = el.dataset.doc;
    const nodeId = el.dataset.node;
    loadIndex().then(idx => {
      let html = '';
      if (docSlug && idx.docBySlug.has(docSlug)) html = renderDoc(idx.docBySlug.get(docSlug));
      else if (nodeId && idx.nodeById.has(nodeId)) html = renderNode(idx.nodeById.get(nodeId), idx);
      else return;
      _currentEl = el;
      popup.innerHTML = html;
      place(el);
    });
  }

  function scheduleHide() {
    hideTimer = setTimeout(() => popup.classList.remove('is-on'), 180);
  }

  // Escopado a .wiki-link/.wiki-chip a propósito: son los links en prosa y los
  // chips de «relacionados» — NO las cards de la galería «Documentos»
  // (.wiki-doc-card), que ya son visuales (miniatura + título) y no ganan
  // nada con una vista previa redundante encima.
  const TRIGGER = '.wiki-link[data-node], .wiki-link[data-doc], .wiki-chip[data-node]';

  document.body.addEventListener('mouseover', e => {
    const el = e.target.closest(TRIGGER);
    if (!el) return;
    clearTimeout(hideTimer);
    show(el);
  });
  document.body.addEventListener('mouseout', e => {
    if (e.target.closest(TRIGGER)) scheduleHide();
  });
  popup.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  popup.addEventListener('mouseleave', scheduleHide);

  // El popup entero es clickeable: reenvía el click al link original, que ya
  // sabe navegar en cualquier contexto (href real, o el delegate del modal).
  popup.addEventListener('click', () => {
    if (_currentEl) _currentEl.click();
    popup.classList.remove('is-on');
  });
})();
