# Data Model: Navigation, Changelog & Site Shell

**Feature**: 006 — Navigation, Changelog & Site Shell
**Date**: 2026-04-28

---

## Input: `data/search-index.json`

Consumed read-only by `nav.js`. Produced by Feature 001.
Full schema in `specs/001-data-pipeline-foundation/data-model.md`.

Fields used by nav search:

| Field | Used for |
|-------|---------|
| `id` | Profile link `href` construction |
| `first_name`, `last_name` | Display name in result list; Fuse.js search keys |
| `birth_place` | Fuse.js search key (place-name queries) |
| `birth_date` | Year shown alongside name in result |

Fuse.js config: `{ keys: ['first_name', 'last_name', 'birth_place'], threshold: 0.35 }`.
Search activates at ≥ 3 characters; results capped at 8.

---

## HTML Interface: Site Nav Snippet

The canonical HTML block copied verbatim to every page. Pages MUST NOT modify
this block except to remove the `<script>` tags on pages that don't need JS
(e.g., `404.html`).

```html
<!-- Paste between <body> and <main> on every page -->
<header class="site-header" role="banner">
  <nav class="site-nav container" aria-label="Navegación principal">
    <a class="site-nav__brand" href="/">Clemenzo de Ardón</a>
    <ul class="site-nav__links" role="list">
      <li><a class="site-nav__link" href="/">Inicio</a></li>
      <li><a class="site-nav__link" href="/blog/">Blog</a></li>
      <li><a class="site-nav__link" href="/tree/">Árbol</a></li>
      <li><a class="site-nav__link" href="/profiles/">Personas</a></li>
    </ul>
    <div class="site-nav__controls">
      <button class="site-nav__search-btn" aria-label="Buscar personas" aria-expanded="false">
        <!-- search SVG icon -->
      </button>
      <button class="site-nav__burger" aria-label="Abrir menú" aria-expanded="false" aria-controls="site-nav-menu">
        <span class="site-nav__burger-bar"></span>
        <span class="site-nav__burger-bar"></span>
        <span class="site-nav__burger-bar"></span>
      </button>
    </div>
  </nav>
  <div class="nav-search" id="nav-search" role="search" hidden>
    <div class="nav-search__inner container">
      <input type="search" id="nav-search-input" class="nav-search__input"
             placeholder="Buscar por nombre..." autocomplete="off">
      <button class="nav-search__close" aria-label="Cerrar búsqueda">✕</button>
    </div>
    <ul id="nav-search-results" class="nav-search__results" aria-live="polite" role="listbox"></ul>
    <p id="nav-search-empty" class="nav-search__empty" hidden>
      No se encontraron personas con ese nombre.
    </p>
  </div>
</header>
```

---

## HTML Interface: Site Footer Snippet

The canonical HTML block copied verbatim to every page.

```html
<!-- Paste before </body> on every page -->
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

---

## Changelog Entry Schema

Authored manually. No serialised format — entries are `<div>` blocks in
`changelog.html`. Schema is structural:

```html
<div class="changelog__entry">
  <dt class="changelog__date">
    <time datetime="YYYY-MM-DD">DD de MMMM de YYYY</time>
  </dt>
  <dd class="changelog__desc">
    Description of the change.
    <!-- Optional: <a href="/profiles/[id].html">Nombre</a> -->
  </dd>
</div>
```

| Field | Required | Notes |
|-------|----------|-------|
| `datetime` attribute | Yes | ISO 8601 date (`YYYY-MM-DD`) |
| Display date | Yes | Human-readable Spanish format |
| Description | Yes | One sentence; max ~120 chars recommended |
| Link | No | Points to profile (`/profiles/[id].html`) or blog post |

Entries appear newest-first. New entries are prepended (inserted before the
first existing `<div class="changelog__entry">`).

---

## CSS Custom Properties (from `base.css`)

These are the design tokens available to all page-specific CSS files.

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg` | `#FAF8F5` | Page background |
| `--color-surface` | `#F2EFE9` | Card/section backgrounds |
| `--color-border` | `#DDD8CE` | Dividers, input borders |
| `--color-text` | `#1C1A17` | Body text |
| `--color-text-muted` | `#6B6559` | Secondary text, labels |
| `--color-accent` | `#8B5E3C` | Links, active states |
| `--color-accent-hover` | `#6B4629` | Link hover |
| `--font-display` | Playfair Display, Lora, … | Headings (h1–h4) |
| `--font-body` | Source Serif 4, Literata, … | Body text |
| `--font-mono` | IBM Plex Mono, … | Dates, labels, code |
| `--space-1`…`--space-8` | 8px…64px | Spacing scale |
| `--content-max-width` | `1100px` | `.container` width |
| `--nav-height` | `60px` | Sticky nav height; used as `body { padding-top }` |

---

## Page `<head>` Template

Canonical `<head>` block to copy into every new page (order matters):

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[Page Title] | Clemenzo de Ardón</title>
  <meta name="description" content="[Page description]">
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
  <!-- Styles — base.css always first -->
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/nav.css">
  <!-- Page-specific CSS here -->
  <link rel="stylesheet" href="/assets/css/footer.css">
</head>
```

Scripts before `</body>`:
```html
<script type="module" src="/assets/js/base.js"></script>
<script type="module" src="/assets/js/nav.js"></script>
<!-- Page-specific JS here -->
```
