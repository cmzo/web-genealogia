(function () {
  const path = window.location.pathname;
  const isNested = path.includes('/dist/');
  const prefix   = isNested ? '../../' : '';
  const current  = path.split('/').pop() || 'index.html';

  const mainLinks = [
    { href: 'arbol-matrimonios.html', label: 'Árbol' },
    { href: 'archivo.html',           label: 'Archivo' },
    { href: 'blog.html',              label: 'Blog' },
    { href: 'guia.html',              label: 'Guía' },
    { href: 'fuentes.html',           label: 'Fuentes' },
  ];

  const secondaryLinks = [
    { href: 'contacto.html',  label: 'Contacto' },
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
  drawer.innerHTML = `
    <div class="nav-drawer-header">
      <a href="${prefix}index.html" class="nav-drawer-brand">Clemenzo</a>
      <button class="nav-drawer-close" aria-label="Cerrar menú">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <nav class="nav-drawer-links">
      ${mainLinks.map(renderLink).join('\n      ')}
      <div class="nav-drawer-divider"></div>
      ${secondaryLinks.map(renderLink).join('\n      ')}
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
})();
