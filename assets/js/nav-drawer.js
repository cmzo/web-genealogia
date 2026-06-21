(function () {
  const path = window.location.pathname;
  const isNested = path.includes('/dist/');
  const prefix   = isNested ? '../../' : '';
  const current  = path.split('/').pop() || 'index.html';

  const mainLinks = [
    { href: 'index.html',   label: 'Inicio' },
    { href: 'blog.html',    label: 'Blog' },
    { href: 'gen.html',     label: 'Genealogía' },
    { href: 'arbol.html',   label: 'Árbol' },
    { href: 'wiki.html',    label: 'Wiki' },
    { href: 'fuentes.html', label: 'Fuentes' },
  ];

  const secondaryLinks = [
    { href: 'colaborar.html', label: 'Colaborar' },
    { href: 'changelog.html', label: 'Cambios' },
  ];

  function isActive(file) {
    if (file === current) return true;
    if (isNested && file === 'blog.html') return true;
    return false;
  }

  function renderLink(link) {
    const active = isActive(link.href) ? ' is-active' : '';
    const minor  = link.minor ? ' nav-drawer-link--minor' : '';
    return `<a href="${prefix}${link.href}" class="nav-drawer-link${active}${minor}">${link.label}</a>`;
  }

  // ── Overlay ──────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'nav-drawer-overlay';

  // ── Drawer ───────────────────────────────────────────────
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.setAttribute('aria-label', 'Menú de navegación');
  const ghLink = `<a href="https://github.com/cmzo/web-genealogia" target="_blank" rel="noopener noreferrer" class="nav-drawer-link nav-drawer-link--gh"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>GitHub</a>`;

  drawer.innerHTML = `
    <div class="nav-drawer-header">
      <a href="${prefix}index.html" class="nav-drawer-brand"><span class="tilde">~/</span>cmzo</a>
      <button class="nav-drawer-close" aria-label="Cerrar menú">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <nav class="nav-drawer-links">
      ${mainLinks.map(renderLink).join('\n      ')}
      <div class="nav-drawer-divider"></div>
      ${secondaryLinks.map(renderLink).join('\n      ')}
      ${ghLink}
    </nav>`;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  // ── Hamburger button ─────────────────────────────────────
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Abrir menú');
  hamburger.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

  const navActions = document.querySelector('.nav-actions');
  if (navActions) navActions.prepend(hamburger);

  // ── Open / close ─────────────────────────────────────────
  function open() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', open);
  overlay.addEventListener('click', close);
  drawer.querySelector('.nav-drawer-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // ── Iconos Material Symbols en la sidebar de escritorio ──────────────────────
  const SIDEBAR_ICONS = {
    'sobre.html':             'info',
    'arbol.html': 'account_tree',
    'wiki.html':              'hub',
    'blog.html':              'edit_note',
    'fuentes.html':           'description',
    'colaborar.html':         'forum',
    'changelog.html':         'history',
  };

  if (!document.querySelector('link[href*="Material+Symbols"]')) {
    const mlink = document.createElement('link');
    mlink.rel = 'stylesheet';
    mlink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block';
    document.head.appendChild(mlink);
  }

  document.querySelectorAll('.site-sidebar .sidebar-link').forEach(a => {
    const file = (a.getAttribute('href') || '').split('/').pop().split(/[?#]/)[0];
    const icon = SIDEBAR_ICONS[file];
    if (!icon) return;
    const label = a.textContent.trim();
    a.classList.remove('sidebar-link--icon'); // ya no usa el SVG inline
    a.innerHTML =
      `<span class="material-symbols-outlined sidebar-icon" aria-hidden="true">${icon}</span>` +
      `<span class="sidebar-label">${label}</span>`;
  });

  // Revela los iconos cuando la fuente está lista (con fallback por las dudas)
  function revealIcons() { document.documentElement.classList.add('ms-ready'); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(revealIcons);
    setTimeout(revealIcons, 1500);
  } else {
    revealIcons();
  }
})();
