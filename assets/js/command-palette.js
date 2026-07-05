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
    filter:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></svg>',
    arbol:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/></svg>',
    timeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
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
  let _overlay, _input, _results, _actHint;
  let _index = null;       // { personas: [], posts: [] } — cargado on demand
  let _loading = false;
  let _visible = [];       // items planos en orden de render
  let _active = 0;
  let _lastFocus = null;
  let _mode = null;        // null = raíz | 'branch' = filtrar por familia | 'actions' = acciones de una persona
  let _modeItem = null;    // la persona cuyas acciones se listan (modo 'actions')
  let _rootQuery = '';     // query de la raíz, para restaurarlo al volver de un sub-menú

  const PLACEHOLDER = 'Buscar o ejecutar un comando…';
  const PLACEHOLDERS = { branch: 'Tipeá un apellido…', actions: 'Elegir una acción…' };

  function setMode(mode, item) {
    if (mode && !_mode) _rootQuery = _input.value;   // al entrar, recordar lo tipeado
    _mode = mode;
    _modeItem = item || null;
    _input.value = mode ? '' : _rootQuery;           // al salir, restaurarlo
    _input.placeholder = PLACEHOLDERS[mode] || PLACEHOLDER;
    renderResults(_input.value);
    _input.focus();
  }

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

  /** Resalta la primera ocurrencia de cada token del query en el texto. */
  function highlight(text, q) {
    const tokens = (q || '').split(/\s+/).filter(Boolean);
    if (!tokens.length) return esc(text);
    const n = norm(text);
    const ranges = [];
    tokens.forEach(t => { const i = n.indexOf(t); if (i !== -1) ranges.push([i, i + t.length]); });
    if (!ranges.length) return esc(text);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0]];
    ranges.slice(1).forEach(r => {
      const last = merged[merged.length - 1];
      if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push(r);
    });
    let out = '', prev = 0;
    merged.forEach(([a, b]) => { out += esc(text.slice(prev, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>'; prev = b; });
    return out + esc(text.slice(prev));
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

    // Personas con investigación legible en la wiki (para la acción «Leer investigación»)
    const readable = new Set(((wikiRaw && wikiRaw.nodes) || [])
      .filter(n => /^p\d+$/.test(n.id) && n.hasContent).map(n => n.id));

    const personas = (arbol.personas || []).map(p => {
      const b = year(p.birth_date), d = year(p.death_date);
      const years = b || d ? `${b || '?'}–${d || (p.vivo === 'si' ? '' : '?')}`.replace(/–$/, '') : '';
      const branch = p.branch ? cap(p.branch) : '';
      const sub = [years, branch].filter(Boolean).join(' · ');
      return { type: 'persona', id: p.id, title: p.name, sub, read: readable.has(p.id),
               _t: norm(p.name),
               // Lugares y años en el haystack: «riddes» o «1858» encuentran personas
               _h: norm([p.name, branch, p.id, p.birth_place, p.death_place, b, d].filter(Boolean).join(' ')) };
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

  // Filtro por familia de la wiki — solo existe cuando el grafo lo expone (estás en la wiki).
  // En el nivel raíz es UNA entrada («Filtrar por familia…») que abre un sub-menú donde
  // se tipea el apellido; las familias no se listan una por una en la raíz.
  function activeBranch() {
    return typeof window.__wikiActiveBranch === 'function' ? window.__wikiActiveBranch() : null;
  }
  function wikiFilterEntry() {
    const branches = window.__wikiBranches;
    if (!Array.isArray(branches) || !branches.length) return [];
    const active = activeBranch();
    const items = [{ type: 'mode', mode: 'branch', icon: 'filter', title: 'Filtrar por familia…',
      sub: active ? `Filtro activo: ${cap(active)}` : 'Elegir un apellido del grafo',
      _t: norm('filtrar por familia'), _h: norm('filtrar familia rama apellido grafo wiki filtro') }];
    if (active) items.push({ type: 'filter', branch: null, icon: 'filter', title: 'Quitar filtro de familia',
      sub: `Mostrando solo ${cap(active)}`, _t: norm('quitar filtro familia'), _h: norm('quitar filtro todas las ramas familias mostrar') });
    return items;
  }
  // Acciones de una persona (sub-menú «→» sobre su fila): elegir el destino
  // en vez del comportamiento contextual por defecto del Enter.
  function personaActions(p) {
    const items = [
      { type: 'action', act: 'tree', id: p.id, icon: 'arbol', title: 'Ver en el árbol',
        sub: 'Enfocar la tarjeta en el árbol genealógico', _t: norm('ver en el arbol'), _h: norm('arbol genealogico tarjeta ficha') },
      { type: 'action', act: 'graph', id: p.id, icon: 'wiki', title: 'Ver en el grafo de la wiki',
        sub: 'Enfocar el nodo y sus conexiones', _t: norm('ver en el grafo de la wiki'), _h: norm('wiki grafo nodo conexiones') },
    ];
    if (p.read) items.push({ type: 'action', act: 'read', id: p.id, icon: 'post', title: 'Leer investigación',
      sub: 'Abrir su archivo de investigación en la wiki', _t: norm('leer investigacion'), _h: norm('investigacion archivo nota leer wiki') });
    if (TIMELINE_OK()) items.push({ type: 'action', act: 'timeline', id: p.id, icon: 'timeline', title: 'Línea de tiempo',
      sub: 'Su vida contra los hitos de la época', _t: norm('linea de tiempo'), _h: norm('linea tiempo timeline hitos') });
    return items;
  }

  // Ítems del sub-menú (una fila por familia, filtrables al tipear)
  function branchItems() {
    const active = activeBranch();
    return (window.__wikiBranches || []).map(b => {
      const label = cap(b);
      return { type: 'filter', branch: b, icon: 'filter', title: label,
        sub: active === b ? 'Filtro activo' : 'Filtrar el grafo por esta familia',
        _t: norm(label), _h: norm(label) };
    });
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

  /** Puntaje de un ítem contra los tokens del query: TODOS deben matchear (AND).
   *  Por token: título con coincidencia difusa (substring o subsecuencia); el resto
   *  del haystack (descripción, lugares, tags, rama, id) solo substring exacto,
   *  para no traer ruido por subsecuencias dispersas en textos largos. */
  function scoreItem(tokens, it) {
    let total = 0;
    for (const t of tokens) {
      const st = scoreText(t, it._t);
      const hi = it._h.indexOf(t);
      const s = Math.max(st >= 0 ? st + 200 : -1, hi !== -1 ? 620 - hi : -1);
      if (s < 0) return -1;
      total += s;
    }
    return total;
  }

  function rank(items, q, limit) {
    const tokens = q.split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    return items
      .map(it => ({ it, s: scoreItem(tokens, it) }))
      .filter(x => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map(x => x.it);
  }

  function buildGroups(query) {
    const q = norm(query.trim());

    // Sub-menú «Filtrar por familia»: solo las familias, filtrables al tipear
    if (_mode === 'branch') {
      const items = q ? rank(branchItems(), q, 30) : branchItems();
      return items.length ? [{ label: 'Familias', items }] : [];
    }

    // Sub-menú de acciones de una persona (→ sobre su fila)
    if (_mode === 'actions' && _modeItem) {
      const all = personaActions(_modeItem);
      const items = q ? rank(all, q, 10) : all;
      return items.length ? [{ label: _modeItem.title, items }] : [];
    }

    const pages = pagesItems();
    const personas = (_index && _index.personas) || [];
    const posts = (_index && _index.posts) || [];
    const notas = (_index && _index.notas) || [];
    const wikiPages = (_index && _index.wikiPages) || [];

    if (!q) {
      // Estado vacío: sugerencias — filtro de la wiki (si aplica) + comandos + páginas + posts recientes
      const recent = [...posts].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 4);
      return [
        { label: 'Filtrar la wiki', items: wikiFilterEntry() },
        { label: 'Comandos', items: commandItems() },
        { label: 'Páginas', items: pages },
        { label: 'Posts recientes', items: recent },
      ].filter(g => g.items.length);
    }

    return [
      { label: 'Filtrar la wiki', items: rank(wikiFilterEntry(), q, 3) },
      { label: 'Comandos',        items: rank(commandItems(), q, 5) },
      { label: 'Páginas',         items: rank(pages, q, 6) },
      { label: 'Wiki',            items: rank(wikiPages, q, 7) },
      { label: 'Personas',        items: rank(personas, q, 7) },
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
    // Hint contextual: solo cuando el ítem activo es una persona en la raíz
    if (_actHint) _actHint.hidden = !(!_mode && _visible[_active] && _visible[_active].type === 'persona');
  }

  function move(delta) {
    if (!_visible.length) return;
    _active = (_active + delta + _visible.length) % _visible.length;
    paintActive();
  }

  function activate() {
    const it = _visible[_active];
    if (!it) return;
    if (it.type === 'mode') {
      // Entra al sub-menú (p. ej. «Filtrar por familia…»): el palette queda abierto
      setMode(it.mode);
      return;
    }
    if (it.type === 'action') {
      // Acción elegida en el sub-menú de una persona: destino explícito
      if (it.act === 'tree') {
        if (typeof window.__treeFocus === 'function') { window.__treeFocus(it.id); close(); return; }
        window.location.href = ROOT + 'arbol.html?focus=' + encodeURIComponent(it.id);
      } else if (it.act === 'graph') {
        // __personaFocus solo lo expone la wiki (en el árbol el handler es __treeFocus)
        if (typeof window.__wikiRead === 'function' && typeof window.__personaFocus === 'function') { window.__personaFocus(it.id); close(); return; }
        window.location.href = ROOT + 'wiki.html?focus=' + encodeURIComponent(it.id);
      } else if (it.act === 'read') {
        if (typeof window.__wikiRead === 'function') { window.__wikiRead(it.id); close(); return; }
        window.location.href = ROOT + 'wiki.html?read=' + encodeURIComponent(it.id);
      } else if (it.act === 'timeline') {
        if (typeof window.__openTimeline === 'function') { window.__openTimeline(it.id); close(); return; }
        window.location.href = ROOT + 'arbol.html?timeline=' + encodeURIComponent(it.id);
      }
      return;
    }
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
    if (it.type === 'persona') {
      // Enter = acción por defecto (enfocar); los demás destinos —incluida la línea
      // de tiempo— viven en el sub-menú de acciones (→). Si la página define un
      // handler propio (árbol o wiki), enfoca sin salir; si no, navega al árbol.
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
    _mode = null;
    _input.value = '';
    _input.placeholder = PLACEHOLDER;
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
          <span class="cmdk-hint-act" hidden><span class="cmdk-kbd">→</span> acciones</span>
          <span class="cmdk-footer-spacer"></span>
          <span><span class="cmdk-kbd">esc</span> cerrar</span>
        </div>
      </div>`;
    document.body.appendChild(_overlay);

    _input   = _overlay.querySelector('.cmdk-input');
    _results = _overlay.querySelector('.cmdk-results');
    _actHint = _overlay.querySelector('.cmdk-hint-act');

    _input.addEventListener('input', () => renderResults(_input.value));
    _overlay.querySelector('[data-close]').addEventListener('click', close);

    _overlay.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown')      { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter')     { e.preventDefault(); activate(); }
      else if (e.key === 'Escape')    { e.preventDefault(); if (_mode) setMode(null); else close(); }
      else if (e.key === 'Backspace' && _mode && !_input.value) { e.preventDefault(); setMode(null); }
      else if (e.key === 'ArrowRight' && !_mode
               && _visible[_active] && _visible[_active].type === 'persona'
               && _input.selectionStart === _input.value.length) {
        // → sobre una persona (con el cursor al final del texto): abrir sus acciones
        e.preventDefault(); setMode('actions', _visible[_active]);
      }
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
