// nav.js — Top-nav dinámica de CMZO (estilo "directorios").
// Lee del <body>:  data-section="home|blog|gen"  ·  data-page="arbol|wiki|fuentes|colaborar" (opcional, dentro de gen)
//                  data-nav-prefix=""            ·  data-page-label="…" (opcional, override del último segmento)
// Arma: el breadcrumb navegable (cmzo /gen /arbol) + los links a las OTRAS secciones top-level.
// Rellena el <header class="cmzo-top"> que cada página deja vacío. Debe correr ANTES de
// theme.js / command-palette.js / i18n.js (que se enganchan a .nav-actions y .lang-opt).
(function () {
  const SECTIONS = [
    { id: 'home', label: 'home', href: 'index.html' },
    { id: 'blog', label: 'blog', href: 'blog.html' },
    { id: 'gen',  label: 'gen',  href: 'gen.html' },
  ];
  const GEN_LABELS = { arbol: 'arbol', wiki: 'wiki', fuentes: 'fuentes', colaborar: 'colaborar', lab: 'lab' };

  const body = document.body;
  const section = body.dataset.section || 'home';
  const page = body.dataset.page || '';
  const prefix = body.dataset.navPrefix || '';
  const sec = SECTIONS.find(s => s.id === section);   // undefined => página "suelta" (ej. cambios)

  const seg = (label, href, current) => current
    ? `<span class="cmzo-seg is-current">${label}</span>`
    : `<a class="cmzo-seg" href="${prefix}${href}">${label}</a>`;
  const sep = `<span class="cmzo-sep">/</span>`;

  // ── Breadcrumb: ~/cmzo / <sección> [/ <página>] ─────────────────────────────
  // El wordmark «~/cmzo» (prompt de directorio home) es siempre link a la portada.
  const parts = [`<a class="cmzo-seg cmzo-wordmark" href="${prefix}index.html"><span class="cmzo-tilde">~/</span>cmzo</a>`];
  if (section === 'home') {
    parts.push(seg('home', '', true));
  } else if (sec && page && GEN_LABELS[page]) {
    parts.push(seg(sec.label, sec.href, false));            // /gen (clickeable → dashboard)
    parts.push(seg(body.dataset.pageLabel || GEN_LABELS[page], '', true)); // /arbol (actual)
  } else if (sec) {
    parts.push(seg(sec.label, '', true));                   // /gen o /blog (actual)
  } else {
    parts.push(seg(body.dataset.sectionLabel || section, '', true));   // /cambios (página suelta)
  }
  const crumb = parts.join(sep);

  // ── Links a las otras secciones top-level (todas si la página es "suelta") ──
  const links = SECTIONS.filter(s => !sec || s.id !== section)
    .map(s => `<a href="${prefix}${s.href}">${s.label}</a>`).join('');

  const gh = `<a href="https://github.com/cmzo/web-genealogia" target="_blank" rel="noopener noreferrer" class="nav-link" aria-label="Repositorio en GitHub"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg></a>`;

  // El selector de idioma sólo se muestra donde el cambio hace algo (body[data-lang-switch]).
  // Las páginas sólo-ES (arbol, wiki, fuentes, blog, cambios) no lo llevan; colaborar tiene el suyo propio.
  const lang = ('langSwitch' in body.dataset)
    ? `<span class="cmzo-lang" role="group" aria-label="Idioma / Langue / Language">
          <button type="button" class="lang-opt" data-lang="es">ES</button>
          <button type="button" class="lang-opt" data-lang="fr">FR</button>
          <button type="button" class="lang-opt" data-lang="en">EN</button>
        </span>`
    : '';

  const header = document.querySelector('.cmzo-top');
  if (!header) return;
  // Layout "Variante A": marca + secciones ancladas a la izquierda (línea vertical entre ellas),
  // spacer elástico, y a la derecha la búsqueda (la inyecta command-palette como primer hijo de
  // .nav-actions, antes de la línea vertical) separada por una línea de la caja de herramientas
  // (idioma · tema · github). El tema lo inserta theme.js antes del github, dentro de .cmzo-tools.
  header.innerHTML = `
    <div class="cmzo-top-inner">
      <span class="cmzo-brand">${crumb}</span>
      <span class="cmzo-vr"></span>
      <nav class="cmzo-mainnav">${links}</nav>
      <span class="cmzo-spacer"></span>
      <div class="nav-actions">
        <span class="cmzo-vr"></span>
        <div class="cmzo-tools">
          ${lang}${lang ? '<span class="cmzo-tsep"></span>' : ''}${gh}
        </div>
      </div>
    </div>`;
})();
