/**
 * command-palette.js — buscador global estilo Spotlight/Raycast (cmd/ctrl + K).
 *
 * Autocontenido: inyecta su propio CSS y DOM, así basta incluir este único
 * <script defer> en cualquier página. Indexa páginas del sitio, personas del
 * árbol (arbol.json) y posts del blog (blog-entries.json).
 *
 * Rutas: todas relativas. ROOT se calcula según si la página está en la raíz
 * o es un post generado en dist/blog/ (prefijo ../../). Funciona igual en
 * local y en GitHub Pages sin depender del hostname.
 */
(function () {
  'use strict';

  // ── ROOT relativo ───────────────────────────────────────────────────────────
  const IN_POST = /\/dist\/blog\//.test(window.location.pathname);
  const ROOT = IN_POST ? '../../' : '';

  // ── Etiqueta del atajo según plataforma ──────────────────────────────────────
  const IS_MAC = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
  const KEY_LABEL = IS_MAC ? '⌘ + K' : 'Ctrl + K';

  // ── Páginas del sitio (índice estático) ─────────────────────────────────────
  const PAGES = [
    { title: 'Inicio',            url: 'index.html',            desc: 'Portada del proyecto' },
    { title: 'Árbol genealógico', url: 'arbol.html', desc: 'Explorar el árbol y los matrimonios' },
    { title: 'Wiki',              url: 'wiki.html',             desc: 'Grafo de personas, lugares y fuentes' },
    { title: 'Blog',              url: 'blog.html',             desc: 'Entradas de investigación' },
    { title: 'Fuentes',           url: 'fuentes.html',          desc: 'Archivos y repositorios consultados' },
    { title: 'Sobre el proyecto', url: 'sobre.html',            desc: 'Qué es y cómo se construyó' },
    { title: 'Colaborar',         url: 'colaborar.html',        desc: 'Dejar un comentario o aportar datos' },
    { title: 'Cambios',           url: 'changelog.html',        desc: 'Historial del sitio' },
  ];

  // ── Iconos (inline SVG) ─────────────────────────────────────────────────────
  const ICONS = {
    page:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    persona: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/></svg>',
    post:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    search:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    timeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    filter:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>',
    command: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 3 3-3 3M13 15h5"/></svg>',
    theme:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></svg>',
    nota:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    wiki:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7.2 16 8.4M7.4 8 8.6 16M10.6 16.6 16 11"/></svg>',
  };

  // La línea de tiempo (master-detail) no entra en pantallas chicas
  const TIMELINE_OK = () => window.innerWidth > 960;

  // ── Estilos (inyectados) ────────────────────────────────────────────────────
  const CSS = `
  .cmdk-overlay { position: fixed; inset: 0; z-index: 1000; display: flex;
    align-items: flex-start; justify-content: center; padding: 12vh 16px 16px; }
  .cmdk-overlay[hidden] { display: none; }
  .cmdk-backdrop { position: absolute; inset: 0; background: rgba(20,20,18,0.42);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
  .cmdk-modal { position: relative; width: min(640px, 92vw); max-height: 78vh;
    display: flex; flex-direction: column; background: var(--surface, #fff);
    border: 1px solid var(--border, #e8e8e6); border-radius: 12px; overflow: hidden;
    box-shadow: 0 24px 64px rgba(20,20,18,0.28), 0 4px 12px rgba(20,20,18,0.12);
    animation: cmdk-in 160ms cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes cmdk-in { from { opacity: 0; transform: translateY(-10px) scale(0.985); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .cmdk-modal { animation: none; } }

  .cmdk-input-row { display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border-bottom: 1px solid var(--border, #e8e8e6); flex-shrink: 0; }
  .cmdk-input-row > svg { width: 18px; height: 18px; color: var(--muted, #8a8a88); flex-shrink: 0; }
  .cmdk-input { flex: 1; border: none; outline: none; background: none;
    font-family: 'Inter', sans-serif; font-size: 16px; color: var(--text, #1a1a1a); padding: 2px 0; }
  .cmdk-input::placeholder { color: var(--muted, #8a8a88); }

  .cmdk-results { overflow-y: auto; padding: 8px; flex: 1;
    scrollbar-width: thin; scrollbar-color: var(--border, #e8e8e6) transparent; }
  .cmdk-results::-webkit-scrollbar { width: 6px; }
  .cmdk-results::-webkit-scrollbar-thumb { background: var(--border, #e8e8e6); border-radius: 3px; }

  .cmdk-group-label { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted, #8a8a88);
    padding: 12px 12px 6px; }
  .cmdk-group:first-child .cmdk-group-label { padding-top: 4px; }

  .cmdk-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px;
    border-radius: 8px; cursor: pointer; }
  .cmdk-item-icon { flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg, #f6f6f4); border: 1px solid var(--border, #e8e8e6); color: var(--muted, #8a8a88); }
  .cmdk-item-icon svg { width: 17px; height: 17px; }
  .cmdk-item-text { min-width: 0; flex: 1; }
  .cmdk-item-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    color: var(--text, #1a1a1a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cmdk-item-sub { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--muted, #8a8a88);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
  .cmdk-item-enter { flex-shrink: 0; font-size: 11px; color: var(--accent, #2d4a3e); opacity: 0; }
  .cmdk-item mark { background: rgba(45,74,62,0.16); color: inherit; border-radius: 2px; padding: 0 1px; }

  .cmdk-item.is-active { background: rgba(45,74,62,0.08); }
  .cmdk-item.is-active .cmdk-item-icon { border-color: var(--accent, #2d4a3e); color: var(--accent, #2d4a3e); }
  .cmdk-item.is-active .cmdk-item-title { color: var(--accent, #2d4a3e); }
  .cmdk-item.is-active .cmdk-item-enter { opacity: 1; }

  .cmdk-empty { padding: 32px 16px; text-align: center; font-family: 'Inter', sans-serif;
    font-size: 13px; color: var(--muted, #8a8a88); font-style: italic; }

  .cmdk-footer { display: flex; align-items: center; gap: 16px; flex-shrink: 0;
    padding: 9px 16px; border-top: 1px solid var(--border, #e8e8e6); background: var(--bg, #f6f6f4); }
  .cmdk-footer span { display: inline-flex; align-items: center; gap: 5px;
    font-family: 'Inter', sans-serif; font-size: 11px; color: var(--muted, #8a8a88); }
  .cmdk-kbd { font-family: 'JetBrains Mono', monospace; font-size: 10px; line-height: 1;
    color: var(--text, #1a1a1a); background: var(--surface, #fff);
    border: 1px solid var(--border, #e8e8e6); border-bottom-width: 2px; border-radius: 4px;
    padding: 3px 5px; min-width: 18px; text-align: center; }
  .cmdk-footer-spacer { flex: 1; }

  .cmdk-trigger { display: inline-flex; align-items: center; gap: 8px; padding: 5px 9px;
    background: var(--bg, #f6f6f4); border: 1px solid var(--border, #e8e8e6); border-radius: 7px;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; color: var(--muted, #8a8a88);
    cursor: pointer; transition: border-color 0.15s, color 0.15s; line-height: 1; }
  .cmdk-trigger:hover { border-color: var(--accent, #2d4a3e); color: var(--text, #1a1a1a); }
  .cmdk-trigger > svg { width: 15px; height: 15px; flex-shrink: 0; }
  .cmdk-trigger .cmdk-kbd { font-size: 10px; }
  @media (max-width: 600px) {
    .cmdk-trigger-label, .cmdk-trigger .cmdk-kbd { display: none; }
    .cmdk-trigger { padding: 6px; }
  }
  `;

  // ── Estado ──────────────────────────────────────────────────────────────────
  let _built = false;
  let _overlay, _input, _results;
  let _index = null;       // { personas: [], posts: [] } — cargado on demand
  let _loading = false;
  let _visible = [];       // items planos en orden de render
  let _active = 0;
  let _lastFocus = null;

  // ── Utilidades de texto ───────────────────────────────────────────────────────
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc  = s => (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const year = d => { const r = String(d || '').match(/^(\d{4})\/(\d{4})$/); if (r) return `${r[1]}/${r[2].slice(2)}`; const m = String(d || '').match(/^(\d{4})/); return m ? m[1] : ''; };
  const cap  = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  /** Puntaje de coincidencia: substring fuerte, luego subsecuencia. -1 si no hay. */
  function scoreText(q, t) {
    if (!q) return 0;
    const i = t.indexOf(q);
    if (i !== -1) return 1000 - i + (i === 0 ? 400 : 0);
    let qi = 0, ti = 0, last = -1, gaps = 0;
    while (qi < q.length && ti < t.length) {
      if (q[qi] === t[ti]) { if (last !== -1) gaps += ti - last - 1; last = ti; qi++; }
      ti++;
    }
    return qi === q.length ? 240 - gaps : -1;
  }

  /** Resalta la primera ocurrencia (substring) del query en el texto. */
  function highlight(text, q) {
    if (!q) return esc(text);
    const i = norm(text).indexOf(q);
    if (i === -1) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  // ── Carga de datos (perezosa, cacheada) ───────────────────────────────────────
  async function loadIndex() {
    if (_index || _loading) return;
    _loading = true;
    const [arbol, posts, notasRaw, wikiRaw] = await Promise.all([
      fetch(ROOT + 'assets/data/arbol.json').then(r => r.ok ? r.json() : { personas: [] }).catch(() => ({ personas: [] })),
      fetch(ROOT + 'assets/data/blog-entries.json').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(ROOT + 'assets/data/notas.json').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(ROOT + 'assets/data/wiki-graph.json').then(r => r.ok ? r.json() : { nodes: [] }).catch(() => ({ nodes: [] })),
    ]);

    const personas = (arbol.personas || []).map(p => {
      const b = year(p.birth_date), d = year(p.death_date);
      const years = b || d ? `${b || '?'}–${d || (p.vivo === 'si' ? '' : '?')}`.replace(/–$/, '') : '';
      const branch = p.branch ? cap(p.branch) : '';
      const sub = [years, branch].filter(Boolean).join(' · ');
      return { type: 'persona', id: p.id, title: p.name, sub,
               _t: norm(p.name), _h: norm([p.name, branch, p.id].join(' ')) };
    });

    const list = (Array.isArray(posts) ? posts : []).map(e => {
      const sub = [cap(e.category || ''), year(e.date)].filter(Boolean).join(' · ');
      return { type: 'post', url: e.url, title: e.title, sub, date: e.date || '',
               _t: norm(e.title), _h: norm([e.title, e.category, (e.tags || []).join(' '), e.description].join(' ')) };
    });

    const notas = (Array.isArray(notasRaw) ? notasRaw : []).map(n => {
      const t = (n.text || '').trim();
      const title = t.length > 90 ? t.slice(0, 90) + '…' : (t || '(nota sin texto)');
      return { type: 'nota', id: n.id, title,
               sub: [cap(n.type || 'nota'), n.date].filter(Boolean).join(' · '),
               _t: norm(title), _h: norm(t) };
    });

    // Páginas de la wiki (lugares/fuentes/eventos/temas). Las personas ya están
    // indexadas arriba y los posts en el blog, así que se excluyen para no duplicar.
    const WIKI_TYPE_ES = { lugar: 'Lugar', fuente: 'Fuente', evento: 'Evento', tema: 'Tema' };
    const wikiPages = ((wikiRaw && wikiRaw.nodes) || [])
      .filter(n => !/^p\d+$/.test(n.id) && n.type !== 'tag' && n.type !== 'post' && n.hasContent)
      .map(n => ({ type: 'wiki', id: n.id, title: n.title,
                   sub: ['Wiki', WIKI_TYPE_ES[n.type] || ''].filter(Boolean).join(' · '),
                   _t: norm(n.title), _h: norm([n.title, n.summary || '', n.type || ''].join(' ')) }));

    _index = { personas, posts: list, notas, wikiPages };
    _loading = false;
  }

  // ── Construcción de resultados ────────────────────────────────────────────────
  function pagesItems() {
    return PAGES.map(p => ({ type: 'page', url: p.url, title: p.title, sub: p.desc,
      _t: norm(p.title), _h: norm(p.title + ' ' + p.desc) }));
  }

  // Filtros por rama de la wiki — solo existen cuando el grafo los expone (estás en la wiki)
  function wikiFilterItems() {
    const branches = window.__wikiBranches;
    if (!Array.isArray(branches) || !branches.length) return [];
    const active = typeof window.__wikiActiveBranch === 'function' ? window.__wikiActiveBranch() : null;
    const items = [];
    if (active) items.push({ type: 'filter', branch: null, title: 'Quitar filtro de rama',
      sub: 'Mostrar todas las ramas', _t: norm('quitar filtro ramas'), _h: norm('quitar filtro todas las ramas mostrar') });
    branches.forEach(b => {
      const label = cap(b);
      items.push({ type: 'filter', branch: b, title: `Rama: ${label}`,
        sub: active === b ? 'Filtro activo' : 'Filtrar el grafo por esta rama',
        _t: norm(label), _h: norm('rama ' + label + ' filtro') });
    });
    return items;
  }

  // ── Comandos (acciones ejecutables, no navegación) ────────────────────────────
  // Cada comando: { type:'command', icon, title, sub, run }. `run()` ejecuta la acción
  // y, si devuelve truthy, el palette queda ABIERTO y se re-renderiza (útil para toggles).
  // Para sumar comandos nuevos, agregá un objeto en commandItems().
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function toggleTheme() {
    // Reusar el botón de tema (theme.js) mantiene en sync su ícono y el localStorage;
    // si no está (alguna página sin theme.js), alternar a mano.
    const btn = document.querySelector('.theme-toggle');
    if (btn) { btn.click(); return true; }
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch (e) {}
    document.documentElement.setAttribute('data-theme', next);
    return true;   // mantener abierto y re-render → la etiqueta del comando se actualiza
  }

  function commandItems() {
    const dark = currentTheme() === 'dark';
    return [
      { type: 'command', icon: 'theme', run: toggleTheme,
        title: dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro', sub: 'Tema del sitio',
        _t: norm('tema modo dia noche claro oscuro'),
        _h: norm('tema theme modo dia noche claro oscuro light dark apariencia cambiar') },
    ];
  }

  function rank(items, q, limit) {
    return items
      .map(it => {
        // Título: permite coincidencia difusa (substring o subsecuencia).
        // Resto del haystack (descripción, tags, rama, id): solo substring exacto,
        // para no traer ruido por subsecuencias dispersas en textos largos.
        const st = scoreText(q, it._t);
        const hi = it._h.indexOf(q);
        const s = Math.max(st >= 0 ? st + 200 : -1, hi !== -1 ? 620 - hi : -1);
        return { it, s };
      })
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map(x => x.it);
  }

  function buildGroups(query) {
    const q = norm(query.trim());
    const pages = pagesItems();
    const personas = (_index && _index.personas) || [];
    const posts = (_index && _index.posts) || [];
    const notas = (_index && _index.notas) || [];
    const wikiPages = (_index && _index.wikiPages) || [];

    if (!q) {
      // Estado vacío: sugerencias — filtros de la wiki (si aplica) + comandos + páginas + posts recientes
      const recent = [...posts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 4);
      return [
        { label: 'Filtrar la wiki', items: wikiFilterItems() },
        { label: 'Comandos', items: commandItems() },
        { label: 'Páginas', items: pages },
        { label: 'Posts recientes', items: recent },
      ].filter(g => g.items.length);
    }

    const tl = TIMELINE_OK()
      ? rank(personas, q, 4).map(p => ({ ...p, type: 'timeline', tl: true,
          sub: 'Ver línea de tiempo' }))
      : [];

    return [
      { label: 'Filtrar la wiki', items: rank(wikiFilterItems(), q, 5) },
      { label: 'Comandos',        items: rank(commandItems(), q, 5) },
      { label: 'Páginas',         items: rank(pages, q, 6) },
      { label: 'Wiki',            items: rank(wikiPages, q, 7) },
      { label: 'Personas',        items: rank(personas, q, 7) },
      { label: 'Línea de tiempo', items: tl },
      { label: 'Posts',           items: rank(posts, q, 6) },
      { label: 'Notas',           items: rank(notas, q, 6) },
    ].filter(g => g.items.length);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function renderResults(query) {
    const q = norm(query.trim());
    const groups = buildGroups(query);
    _visible = [];

    if (!groups.length) {
      _results.innerHTML = `<div class="cmdk-empty">Sin resultados para “${esc(query.trim())}”</div>`;
      return;
    }

    let html = '';
    groups.forEach(g => {
      html += `<div class="cmdk-group"><div class="cmdk-group-label">${esc(g.label)}</div>`;
      g.items.forEach(it => {
        const i = _visible.length;
        _visible.push(it);
        html += `
          <div class="cmdk-item" role="option" data-i="${i}">
            <div class="cmdk-item-icon">${ICONS[it.icon] || ICONS[it.type] || ICONS.page}</div>
            <div class="cmdk-item-text">
              <div class="cmdk-item-title">${highlight(it.title, q)}</div>
              ${it.sub ? `<div class="cmdk-item-sub">${esc(it.sub)}</div>` : ''}
            </div>
            <span class="cmdk-item-enter">↵</span>
          </div>`;
      });
      html += `</div>`;
    });
    _results.innerHTML = html;

    _active = 0;
    paintActive();

    _results.querySelectorAll('.cmdk-item').forEach(el => {
      const i = +el.dataset.i;
      el.addEventListener('mousemove', () => { if (_active !== i) { _active = i; paintActive(false); } });
      el.addEventListener('click', () => { _active = i; activate(); });
    });
  }

  function paintActive(scroll = true) {
    const els = _results.querySelectorAll('.cmdk-item');
    els.forEach((el, i) => el.classList.toggle('is-active', i === _active));
    if (scroll && els[_active]) els[_active].scrollIntoView({ block: 'nearest' });
  }

  function move(delta) {
    if (!_visible.length) return;
    _active = (_active + delta + _visible.length) % _visible.length;
    paintActive();
  }

  function activate() {
    const it = _visible[_active];
    if (!it) return;
    if (it.type === 'command') {
      // Ejecuta la acción. Si run() devuelve truthy, el palette sigue abierto y se
      // re-renderiza (p. ej. el toggle de tema actualiza su etiqueta in situ).
      const keepOpen = typeof it.run === 'function' ? it.run() : false;
      if (keepOpen) renderResults(_input.value); else close();
      return;
    }
    if (it.type === 'filter') {
      // Filtra el grafo de la wiki sin salir de la página
      if (typeof window.__wikiFilterBranch === 'function') window.__wikiFilterBranch(it.branch);
      close();
      return;
    }
    if (it.tl) {
      // Abrir la línea de tiempo: directo si estamos en el árbol, si no navegar con ?timeline=
      if (typeof window.__openTimeline === 'function') { window.__openTimeline(it.id); close(); return; }
      window.location.href = ROOT + 'arbol.html?timeline=' + encodeURIComponent(it.id);
      return;
    }
    if (it.type === 'persona') {
      // Si la página define un handler propio (árbol o wiki), enfocar sin salir;
      // si no, navegar al árbol con ?focus=
      const focusFn = window.__personaFocus || window.__treeFocus;
      if (typeof focusFn === 'function') { focusFn(it.id); close(); return; }
      window.location.href = ROOT + 'arbol.html?focus=' + encodeURIComponent(it.id);
      return;
    }
    if (it.type === 'wiki') {
      // Enfocar el nodo en el grafo si ya estamos en la wiki; si no, navegar con ?focus=
      if (typeof window.__personaFocus === 'function') { window.__personaFocus(it.id); close(); return; }
      window.location.href = ROOT + 'wiki.html?focus=' + encodeURIComponent(it.id);
      return;
    }
    if (it.type === 'nota') {
      // Las notas no tienen página: abren el modal en la home. Si estamos ahí, directo;
      // si no, navegar a la home con ?nota= para que lo abra al cargar.
      if (typeof window.__openNota === 'function') { window.__openNota(it.id); close(); return; }
      window.location.href = ROOT + 'index.html?nota=' + encodeURIComponent(it.id);
      return;
    }
    window.location.href = ROOT + it.url;
  }

  // ── Abrir / cerrar ────────────────────────────────────────────────────────────
  function open() {
    build();
    if (!_overlay.hidden) return;
    _lastFocus = document.activeElement;
    _overlay.hidden = false;
    _input.value = '';
    // Re-render con el valor actual cuando lleguen los datos (no pisar lo tipeado)
    loadIndex().then(() => { if (!_overlay.hidden) renderResults(_input.value); });
    renderResults('');
    requestAnimationFrame(() => _input.focus());
  }

  function close() {
    if (!_overlay || _overlay.hidden) return;
    _overlay.hidden = true;
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
  }

  let _styled = false;
  function ensureStyles() {
    if (_styled) return;
    _styled = true;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function build() {
    if (_built) return;
    _built = true;
    ensureStyles();

    _overlay = document.createElement('div');
    _overlay.className = 'cmdk-overlay';
    _overlay.hidden = true;
    _overlay.innerHTML = `
      <div class="cmdk-backdrop" data-close></div>
      <div class="cmdk-modal" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
        <div class="cmdk-input-row">
          ${ICONS.command}
          <input class="cmdk-input" type="text" placeholder="Buscar o ejecutar un comando…"
                 autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Buscar o ejecutar un comando">
          <span class="cmdk-kbd">esc</span>
        </div>
        <div class="cmdk-results" role="listbox"></div>
        <div class="cmdk-footer">
          <span><span class="cmdk-kbd">↑</span><span class="cmdk-kbd">↓</span> navegar</span>
          <span><span class="cmdk-kbd">↵</span> abrir / ejecutar</span>
          <span class="cmdk-footer-spacer"></span>
          <span><span class="cmdk-kbd">esc</span> cerrar</span>
        </div>
      </div>`;
    document.body.appendChild(_overlay);

    _input   = _overlay.querySelector('.cmdk-input');
    _results = _overlay.querySelector('.cmdk-results');

    _input.addEventListener('input', () => renderResults(_input.value));
    _overlay.querySelector('[data-close]').addEventListener('click', close);

    _overlay.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown')      { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter')     { e.preventDefault(); activate(); }
      else if (e.key === 'Escape')    { e.preventDefault(); close(); }
      else if (e.key === 'Tab')       { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
    });
  }

  // ── Trigger visible en el nav (indica el atajo y abre al click) ───────────────
  function injectTrigger() {
    const nav = document.querySelector('.nav-actions') || document.querySelector('.site-nav');
    if (!nav || nav.querySelector('.cmdk-trigger')) return;
    ensureStyles();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cmdk-trigger';
    btn.setAttribute('aria-label', 'Buscar (' + KEY_LABEL + ')');
    btn.title = 'Buscar (' + KEY_LABEL + ')';
    btn.innerHTML = `${ICONS.search}<span class="cmdk-trigger-label">Buscar</span><span class="cmdk-kbd">${KEY_LABEL}</span>`;
    btn.addEventListener('click', open);
    nav.insertBefore(btn, nav.firstChild);
  }

  // ── Atajo global ──────────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (_overlay && !_overlay.hidden) close(); else open();
    }
  });

  // Permite abrir el palette desde otros componentes si hiciera falta.
  window.openCommandPalette = open;

  // Rellena cualquier pista del atajo en la página (p. ej. la del árbol)
  function fillKeyHints() {
    document.querySelectorAll('[data-cmdk-key]').forEach(el => { el.textContent = KEY_LABEL; });
  }

  function onReady() { injectTrigger(); fillKeyHints(); }

  // El script es defer, pero por las dudas esperamos al DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
