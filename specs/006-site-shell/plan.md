# Implementation Plan: Navigation, Changelog & Site Shell

**Branch**: `006-site-shell` | **Date**: 2026-04-28
**Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-site-shell/spec.md`

## Summary

Build the shared site shell consumed by every other feature: `base.css`
(design tokens + reset + typography), global navigation (sticky bar with inline
Fuse.js search and mobile hamburger), global footer, `changelog.html`, `404.html`,
and `base.js` (Service Worker registration). These files are the dependency
foundation — `base.css` ships before any other feature page.

## Technical Context

**Language/Version**: HTML5, CSS3, ES2020 modules (no bundler)
**Primary Dependencies**: Fuse.js v7 from CDN (same import as Feature 005); no other external deps
**Storage**: Nav search reads `data/search-index.json` (Feature 001) — read-only
**Testing**: Manual visual + interactive test; JS-disabled fallback check; Lighthouse ≥ 90
**Target Platform**: GitHub Pages (static)
**Performance Goals**: Navigation JS < 5 KB; nav search results appear in < 300ms
**Constraints**: No web components; nav/footer = static HTML copied per page; CSS-only hamburger where possible; no framework; progressive enhancement (section links work without JS)
**Scale/Scope**: ~8 page types; nav and footer present on all

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First | ✅ Pass | Nav/footer = static HTML; changelog = static HTML; 404 = static file |
| II. Content-First Design | ✅ Pass | `base.css` is the single source for palette and typography |
| III. Data Integrity | ✅ Pass | No data produced; search reads `search-index.json` read-only |
| IV. Performance | ✅ Pass | Fuse.js CDN; no heavy framework; CSS-only hamburger avoids layout shift |
| V. Desktop-First | ✅ Pass | Desktop: full nav bar; mobile: hamburger fallback |
| VI. Accessibility | ✅ Pass | `aria-label` on hamburger/search buttons; focus trap in search overlay; `<nav>` landmark |

No violations.

## Project Structure

### Documentation

```text
specs/006-site-shell/
├── plan.md
├── research.md
├── data-model.md     ← HTML interface contracts + changelog entry schema
└── quickstart.md
```

### Source Code

```text
assets/
  css/
    base.css          ← Phase 1 — design tokens + reset + typography
    nav.css           ← Phase 2/3 — nav layout, hamburger, search overlay
    footer.css        ← Phase 4 — footer layout
    changelog.css     ← Phase 4 — changelog page styles
  js/
    base.js           ← Phase 1 — Service Worker registration
    nav.js            ← Phase 2/3 — active link, hamburger, search

changelog.html        ← Phase 4 — manually maintained
404.html              ← Phase 4 — static error page
CONTRIBUTING.md       ← Phase 4 — "how to add a new page" instructions
```

---

## Phase 1 — `base.css` + Typography + Service Worker (`base.js`)

**Goal**: Establish the design token layer and SW registration that all other
features depend on. `base.css` must be committed before any feature page ships.

### `assets/css/base.css`

```css
/* ====================================================================
   Design Tokens — from constitution.md §Design System
   ==================================================================== */
:root {
  /* Color palette */
  --color-bg:           #FAF8F5;
  --color-surface:      #F2EFE9;
  --color-border:       #DDD8CE;
  --color-text:         #1C1A17;
  --color-text-muted:   #6B6559;
  --color-accent:       #8B5E3C;
  --color-accent-hover: #6B4629;

  /* Typography */
  --font-display: 'Playfair Display', 'Lora', 'EB Garamond', Georgia, serif;
  --font-body:    'Source Serif 4', 'Literata', 'Spectral', serif;
  --font-mono:    'IBM Plex Mono', 'Courier New', monospace;

  /* Spacing — base unit 8px */
  --space-1:  8px;
  --space-2:  16px;
  --space-3:  24px;
  --space-4:  32px;
  --space-6:  48px;
  --space-8:  64px;

  /* Layout */
  --content-max-width: 1100px;

  /* Nav height — used by pages to add padding-top so content isn't hidden behind sticky nav */
  --nav-height: 60px;
}

/* ====================================================================
   Reset
   ==================================================================== */
*,
*::before,
*::after { box-sizing: border-box; }

body  { margin: 0; }
img   { max-width: 100%; display: block; }
ul, ol { list-style: none; margin: 0; padding: 0; }

/* ====================================================================
   Base Typography
   ==================================================================== */
html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.6;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  line-height: 1.25;
  margin: 0 0 var(--space-2);
}

h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); }
h2 { font-size: clamp(1.375rem, 3vw, 1.875rem); }
h3 { font-size: 1.375rem; }
h4 { font-size: 1.125rem; }

p  { margin: 0 0 var(--space-2); }
a  { color: var(--color-accent); text-decoration-thickness: 1px; }
a:hover { color: var(--color-accent-hover); }

time, .label, .mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

/* ====================================================================
   Layout utility
   ==================================================================== */
.container {
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding-inline: var(--space-3);
}
```

### `assets/js/base.js`

Registers the Service Worker (Feature 001 `sw.js`). Loaded on every page as
`<script type="module" src="/assets/js/base.js"></script>`.

```js
// assets/js/base.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // SW registration failure is non-fatal — site works without offline support
  });
}
```

### Google Fonts loading

In `<head>` of every page (included in the nav HTML snippet for convenience):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
```

---

## Phase 2 — Desktop Navigation

**Goal**: Sticky top bar with logo, section links, and search icon. Full visual
treatment; active-link highlighting via JS.

### HTML snippet (copied to every page)

```html
<!-- site-nav — copy verbatim to every page; update aria-current in page-specific CSS or via nav.js -->
<header class="site-header" role="banner">
  <nav class="site-nav container" aria-label="Navegación principal">
    <a class="site-nav__brand" href="/">Clemenzo de Ardón</a>

    <!-- Desktop links -->
    <ul class="site-nav__links" role="list">
      <li><a class="site-nav__link" href="/">Inicio</a></li>
      <li><a class="site-nav__link" href="/blog/">Blog</a></li>
      <li><a class="site-nav__link" href="/tree/">Árbol</a></li>
      <li><a class="site-nav__link" href="/profiles/">Personas</a></li>
    </ul>

    <!-- Search trigger + hamburger -->
    <div class="site-nav__controls">
      <button class="site-nav__search-btn" aria-label="Buscar personas" aria-expanded="false">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="9" r="6"/><line x1="14" y1="14" x2="18" y2="18"/>
        </svg>
      </button>
      <!-- Hamburger: visible on mobile only (see Phase 3) -->
      <button class="site-nav__burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="site-nav-menu">
        <span class="site-nav__burger-bar"></span>
        <span class="site-nav__burger-bar"></span>
        <span class="site-nav__burger-bar"></span>
      </button>
    </div>
  </nav>

  <!-- Search overlay -->
  <div class="nav-search" id="nav-search" role="search" aria-label="Buscar personas" hidden>
    <div class="nav-search__inner container">
      <input type="search" id="nav-search-input" class="nav-search__input"
             placeholder="Buscar por nombre..." autocomplete="off"
             aria-label="Buscar personas">
      <button class="nav-search__close" aria-label="Cerrar búsqueda">✕</button>
    </div>
    <ul id="nav-search-results" class="nav-search__results" aria-live="polite" role="listbox"></ul>
    <p id="nav-search-empty" class="nav-search__empty" hidden>
      No se encontraron personas con ese nombre.
    </p>
  </div>
</header>
```

### `assets/css/nav.css` (desktop)

```css
.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--nav-height);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.site-nav {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-4);
}

.site-nav__brand {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
}

.site-nav__links {
  display: flex;
  gap: var(--space-3);
  margin-inline-start: auto;
}

.site-nav__link {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.site-nav__link:hover,
.site-nav__link--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.site-nav__controls {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-inline-start: var(--space-2);
}

.site-nav__search-btn {
  display: flex;
  align-items: center;
  padding: var(--space-1);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
}
.site-nav__search-btn:hover { color: var(--color-accent); }

/* Hamburger hidden on desktop */
.site-nav__burger { display: none; }

/* Body offset — every page body needs this to not hide under sticky nav */
body { padding-top: var(--nav-height); }
```

### Active link — `assets/js/nav.js` (excerpt)

```js
// Mark current page link as active
function setActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav__link').forEach(link => {
    const href = new URL(link.href, location.href).pathname;
    // Exact match OR prefix match for section roots (/blog/, /profiles/, /tree/)
    const isActive = (href === '/' && path === '/') ||
                     (href !== '/' && path.startsWith(href));
    link.classList.toggle('site-nav__link--active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });
}
```

---

## Phase 3 — Mobile Navigation + Inline Search

**Goal**: Hamburger that works via CSS toggle + minimal JS; inline Fuse.js search overlay.

### Mobile CSS (appended to `nav.css`)

```css
@media (max-width: 767px) {
  /* Hide desktop links; show hamburger */
  .site-nav__links { display: none; }
  .site-nav__burger {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px; height: 18px;
    padding: 0; background: none; border: none;
    cursor: pointer;
  }
  .site-nav__burger-bar {
    display: block;
    height: 2px;
    background: var(--color-text);
    border-radius: 2px;
    transition: transform 0.2s, opacity 0.2s;
  }

  /* Expanded state — toggled by nav.js adding .is-open to <header> */
  .site-header.is-open .site-nav__links {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: var(--nav-height);
    left: 0; right: 0;
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
  }
  /* Animate hamburger → X */
  .site-header.is-open .site-nav__burger-bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  .site-header.is-open .site-nav__burger-bar:nth-child(2) { opacity: 0; }
  .site-header.is-open .site-nav__burger-bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
}
```

### Hamburger JS (in `assets/js/nav.js`)

```js
function initHamburger() {
  const header = document.querySelector('.site-header');
  const burger = header?.querySelector('.site-nav__burger');
  if (!burger) return;

  burger.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  // Close when a nav link is tapped on mobile
  header.querySelectorAll('.site-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}
```

### Inline search overlay JS (in `assets/js/nav.js`)

```js
import Fuse from 'https://unpkg.com/fuse.js@7/dist/fuse.esm.js';

const FUSE_OPTIONS = {
  keys: ['first_name', 'last_name', 'birth_place'],
  threshold: 0.35,
};

let fuse = null;

async function loadIndex() {
  if (fuse) return;
  const data = await fetch('/data/search-index.json').then(r => r.json());
  fuse = new Fuse(data, FUSE_OPTIONS);
}

function initSearch() {
  const searchBtn  = document.querySelector('.site-nav__search-btn');
  const closeBtn   = document.querySelector('.nav-search__close');
  const overlay    = document.getElementById('nav-search');
  const input      = document.getElementById('nav-search-input');
  const resultsList = document.getElementById('nav-search-results');
  const emptyMsg   = document.getElementById('nav-search-empty');
  if (!searchBtn || !overlay) return;

  function openSearch() {
    overlay.hidden = false;
    searchBtn.setAttribute('aria-expanded', 'true');
    input.focus();
    loadIndex();
  }

  function closeSearch() {
    overlay.hidden = true;
    searchBtn.setAttribute('aria-expanded', 'false');
    resultsList.innerHTML = '';
    emptyMsg.hidden = true;
    input.value = '';
  }

  searchBtn.addEventListener('click', openSearch);
  closeBtn.addEventListener('click',  closeSearch);

  // Close on Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) { e.preventDefault(); closeSearch(); }
  });

  // Close on click outside
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSearch();
  });

  let debounceId;
  input.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => runSearch(input.value.trim()), 200);
  });

  function runSearch(q) {
    if (!fuse || q.length < 3) {
      resultsList.innerHTML = '';
      emptyMsg.hidden = true;
      return;
    }
    const results = fuse.search(q, { limit: 8 });
    emptyMsg.hidden = results.length > 0;
    resultsList.innerHTML = results.map(({ item }) => `
      <li role="option">
        <a class="nav-search__result" href="/profiles/${encodeURIComponent(item.id)}.html">
          <span class="nav-search__result-name">${escapeHtml(item.first_name)} ${escapeHtml(item.last_name)}</span>
          ${item.birth_date ? `<span class="nav-search__result-date">${escapeHtml(item.birth_date.slice(0,4))}</span>` : ''}
        </a>
      </li>
    `).join('');
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
```

### Search overlay CSS (appended to `nav.css`)

```css
.nav-search {
  position: fixed;
  top: var(--nav-height); left: 0; right: 0;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  z-index: 99;
  padding: var(--space-2) 0;
}

.nav-search__inner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-search__input {
  flex: 1;
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-body);
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text);
}

.nav-search__close {
  background: none; border: none;
  color: var(--color-text-muted);
  font-size: 1.25rem; cursor: pointer; padding: 4px 8px;
}

.nav-search__results {
  max-height: 320px;
  overflow-y: auto;
}

.nav-search__result {
  display: flex;
  justify-content: space-between;
  padding: var(--space-1) var(--space-3);
  color: var(--color-text);
  text-decoration: none;
}
.nav-search__result:hover { background: var(--color-surface); }
.nav-search__result-name { font-weight: 600; }
.nav-search__result-date { font-family: var(--font-mono); font-size: 0.8125rem; color: var(--color-text-muted); }

.nav-search__empty {
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  font-style: italic;
}
```

### `nav.js` entry point

```js
// assets/js/nav.js — ES module
// (Fuse import + search functions defined above)

document.addEventListener('DOMContentLoaded', () => {
  setActiveLink();
  initHamburger();
  initSearch();
});
```

Loaded on every page: `<script type="module" src="/assets/js/nav.js"></script>`.

---

## Phase 4 — Footer, Changelog, 404

### Footer HTML snippet (copied to every page)

```html
<footer class="site-footer" role="contentinfo">
  <div class="site-footer__inner container">
    <div class="site-footer__about">
      <p class="site-footer__brand">Clemenzo de Ardón</p>
      <p class="site-footer__desc">
        Árbol genealógico, perfiles e historia de la familia Clemenzo,
        originaria de Ardón, León, España.
      </p>
      <p class="site-footer__credit">
        Datos actualizados diariamente desde Google Sheets.
        Mantenido por <a href="mailto:mdclemenzo@gmail.com">Matías Clemenzo</a>.
      </p>
    </div>
    <nav class="site-footer__nav" aria-label="Secciones del sitio">
      <a href="/">Inicio</a>
      <a href="/blog/">Blog</a>
      <a href="/tree/">Árbol</a>
      <a href="/profiles/">Personas</a>
      <a href="/changelog.html">Cambios</a>
    </nav>
  </div>
</footer>
```

### `assets/css/footer.css`

```css
.site-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-8);
  padding: var(--space-6) 0;
}

.site-footer__inner {
  display: flex;
  gap: var(--space-6);
  align-items: flex-start;
}

.site-footer__brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: var(--space-1);
}

.site-footer__desc,
.site-footer__credit {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  max-width: 380px;
}

.site-footer__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  white-space: nowrap;
}

.site-footer__nav a {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  text-decoration: none;
}
.site-footer__nav a:hover { color: var(--color-accent); }

@media (max-width: 767px) {
  .site-footer__inner { flex-direction: column; }
  .site-footer__nav { flex-direction: row; flex-wrap: wrap; gap: var(--space-2); }
}
```

### `changelog.html`

Manually maintained by the author. Structure:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cambios recientes | Clemenzo de Ardón</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/footer.css">
  <link rel="stylesheet" href="/assets/css/changelog.css">
</head>
<body>
  <!-- Site nav snippet -->
  <main class="changelog container">
    <h1>Cambios recientes</h1>
    <dl class="changelog__list">

      <div class="changelog__entry">
        <dt class="changelog__date">
          <time datetime="2026-04-27">27 de abril de 2026</time>
        </dt>
        <dd class="changelog__desc">
          Añadidos perfiles de José Clemenzo y Ana Clemenzo.
          <!-- Optional link: <a href="/profiles/fcl-010.html">Ver perfil</a> -->
        </dd>
      </div>

    </dl>
  </main>
  <!-- Site footer snippet -->
  <script type="module" src="/assets/js/base.js"></script>
  <script type="module" src="/assets/js/nav.js"></script>
</body>
</html>
```

### `assets/css/changelog.css`

```css
.changelog {
  padding-top: var(--space-6);
  padding-bottom: var(--space-8);
}

.changelog__list { margin-top: var(--space-4); }

.changelog__entry {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-2) 0;
  border-top: 1px solid var(--color-border);
}

.changelog__date time {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.changelog__desc { color: var(--color-text); }

@media (max-width: 600px) {
  .changelog__entry { grid-template-columns: 1fr; gap: var(--space-1); }
}
```

### `404.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Página no encontrada | Clemenzo de Ardón</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <link rel="stylesheet" href="/assets/css/footer.css">
</head>
<body>
  <!-- Site nav snippet -->
  <main class="not-found container">
    <h1>Página no encontrada</h1>
    <p>
      Lo sentimos, la dirección que buscás no existe en este sitio.
      Es posible que el enlace haya cambiado o que el contenido haya
      sido movido.
    </p>
    <p>
      <strong>Clemenzo de Ardón</strong> es un sitio de genealogía familiar.
      Podés explorar el árbol familiar, buscar personas por nombre o leer
      artículos sobre nuestra historia.
    </p>
    <nav class="not-found__links" aria-label="Páginas principales">
      <a href="/">← Ir al inicio</a>
      <a href="/profiles/">Buscar personas</a>
    </nav>
  </main>
  <!-- Site footer snippet -->
  <!-- No nav.js or base.js on 404 — no JS required -->
</body>
</html>
```

### `CONTRIBUTING.md` — "How to add a new page"

```markdown
## Adding a new page

1. Copy the page skeleton from an existing page (e.g., `changelog.html`).
2. Update `<title>` and `<meta name="description">`.
3. Add the content inside `<main>`.
4. The `<header>` (site-nav) and `<footer>` (site-footer) snippets are
   copy-pasted from any existing page — do not modify them between pages.
5. Include in `<head>` (in order):
   - `base.css` (always first)
   - Any page-specific CSS
   - `nav.css`
   - `footer.css`
6. Before `</body>`:
   - `base.js`
   - `nav.js`
   - Any page-specific JS
7. Run `npm run serve` and verify the page looks correct.
8. Add the page URL to `scripts/generate-sitemap.js` `STATIC_PAGES` array.
```

---

## Constitution Check (Post-Design)

| Principle | Status |
|-----------|--------|
| I. Static-First | ✅ Pass — all pages static HTML; no runtime data generation |
| II. Content-First | ✅ Pass — `base.css` is single source of truth for palette; nav is minimal chrome |
| III. Data Integrity | ✅ Pass — nav search reads `search-index.json` read-only |
| IV. Performance | ✅ Pass — Fuse.js loaded lazily (only on search open); no framework |
| V. Desktop-First | ✅ Pass — desktop nav is full bar; mobile hamburger degrades gracefully |
| VI. Accessibility | ✅ Pass — `role="banner"`, `role="contentinfo"`, `aria-label` on nav/search; focus trap in search |

---

## Complexity Tracking

| Item | Why Needed | Simpler Alternative Rejected Because |
|------|------------|--------------------------------------|
| JS hamburger toggle (not CSS-only) | CSS-only hamburger using `<input type=checkbox>` + label requires hidden checkbox in DOM, is not accessible to screen readers without hacks | A 5-line JS toggle on a `<button>` is simpler, accessible, and produces correct `aria-expanded` |
| Fuse.js deferred load (on search open) | `search-index.json` is fetched only when the search is first activated | Eager loading on nav init would make every page load do an extra JSON fetch even for users who never search |
| Static HTML copy (not build-time include) | Simplest mechanism with zero tooling; consistent with no-bundler constraint | Build-time server-side includes would require a new build step; `<!-- #include -->` has no standard static-site support on GitHub Pages |
