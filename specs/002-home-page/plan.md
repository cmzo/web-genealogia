# Implementation Plan: Home Page

**Branch**: `002-home-page` | **Date**: 2026-04-27
**Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-home-page/spec.md`

## Summary

Build `index.html` — the static landing page for *Clemenzo de Ardón*. The page
has a hero section (site name + description + three navigation cards) and an
optional Featured Ancestor section that loads asynchronously from
`data/individuals.json`. No framework; semantic HTML + vanilla JS ES module.
The page renders immediately; the featured section is inserted after the JSON
loads without blocking or visible layout shift.

## Technical Context

**Language/Version**: HTML5, CSS3 (custom properties), ES2020 (modules, optional
chaining, nullish coalescing)
**Primary Dependencies**: None — vanilla JS only
**Storage**: Reads `data/individuals.json` (produced by Feature 001); no writes
**Testing**: Manual visual check on desktop (1280px) and mobile (375px)
**Target Platform**: Static file served by GitHub Pages
**Project Type**: Static web page
**Performance Goals**: Page interactive in <2s on broadband; featured section appears
within 1s of JSON load (typically <500ms from cache after first visit)
**Constraints**: No JS framework; no render-blocking data fetch; `base.css` and
its `:root` variables are owned by Feature 006 — this feature stubs them locally
and defers full integration to Feature 006

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First | ✅ Pass | No runtime API calls; JSON pre-loaded by pipeline |
| II. Content-First Design | ✅ Pass | Hero and editorial highlight, minimal chrome |
| III. Data Integrity | ✅ Pass | Reads individuals.json read-only; uses `id` for profile link |
| IV. Performance | ✅ Pass | Non-blocking fetch; lazy image; font preconnect |
| V. Desktop-First | ✅ Pass | 1100px max-width centred layout, mobile-responsive |
| VI. Accessibility | ✅ Pass | Semantic HTML; nav cards use `<a>`; featured image has alt |

No violations.

## Project Structure

### Documentation

```text
specs/002-home-page/
├── plan.md
├── research.md
├── quickstart.md
└── tasks.md        ← /speckit-tasks
```

### Source Code

```text
index.html                   ← home page (site root)
assets/
  css/
    base.css                 ← (Feature 006) :root vars, reset, typography
    home.css                 ← home-specific styles (imports base.css)
  js/
    home.js                  ← ES module — featured ancestor logic
    base.js                  ← (Feature 006) SW registration, shared utils
data/
  individuals.json           ← (Feature 001) read-only
```

**Structure Decision**: `index.html` at the repository root so GitHub Pages serves
it at `/`. All page-specific assets under `assets/css/` and `assets/js/`
following existing project conventions.

**Dependency note**: `base.css` is owned by Feature 006 (site shell). For this
feature, a minimal stub `base.css` with the required CSS custom properties is
created. It will be replaced by the full version in Feature 006.

---

## Phase 0 — Research

All decisions resolved from the author's input. See [research.md](research.md).

---

## Phase 1 — Static Structure (HTML + CSS)

**Goal**: A pixel-complete, fully functional home page with the hero section and
static navigation cards. The featured section is present in the DOM as an empty
placeholder. No JS required for this phase to be usable.

### 1.1 `index.html` structure

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clemenzo de Ardón — Genealogía familiar</title>
  <meta name="description" content="Investigación genealógica de la familia Clemenzo.
    Árbol familiar interactivo, perfiles de ancestros y artículos de investigación.">

  <!-- Font preconnects (Feature 006 will add the @import; stub here) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/home.css">
</head>
<body>
  <!-- Navigation: stub here; Feature 006 replaces with shared partial -->
  <header class="site-nav" role="banner">
    <nav aria-label="Navegación principal">
      <a class="site-nav__logo" href="/">Clemenzo de Ardón</a>
      <ul class="site-nav__links" role="list">
        <li><a href="/tree/">Árbol</a></li>
        <li><a href="/profiles/">Perfiles</a></li>
        <li><a href="/blog/">Blog</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <!-- Hero -->
    <section class="hero" aria-labelledby="hero-heading">
      <h1 id="hero-heading" class="hero__title">Clemenzo de Ardón</h1>
      <p class="hero__subtitle">
        Investigación genealógica de la familia Clemenzo.
        Árbol familiar, perfiles de ancestros y artículos de investigación.
      </p>
      <nav class="hero__cards" aria-label="Secciones principales">
        <a class="hero-card" href="/tree/">
          <span class="hero-card__label">Árbol familiar</span>
          <span class="hero-card__desc">Explora las relaciones entre generaciones</span>
        </a>
        <a class="hero-card" href="/profiles/">
          <span class="hero-card__label">Perfiles</span>
          <span class="hero-card__desc">Busca y lee sobre cada persona</span>
        </a>
        <a class="hero-card" href="/blog/">
          <span class="hero-card__label">Blog</span>
          <span class="hero-card__desc">Artículos de investigación y hallazgos</span>
        </a>
      </nav>
    </section>

    <!-- Featured ancestor (populated by home.js; hidden until data loads) -->
    <section class="featured" id="featured-section" aria-labelledby="featured-heading"
             hidden>
      <h2 id="featured-heading" class="featured__heading">Ancestro destacado</h2>
      <div class="featured__card" id="featured-card"></div>
    </section>
  </main>

  <footer class="site-footer">
    <!-- Feature 006 replaces with shared partial -->
  </footer>

  <script type="module" src="assets/js/home.js"></script>
</body>
</html>
```

**Notes**:
- `<section hidden>` hides the featured section until JS populates it. If JS
  fails or JSON is unavailable, the section stays hidden — no visible error.
- Navigation and footer are stubs; Feature 006 replaces them with shared partials.
- `lang="es"` reflects the primary language of the site's content.

### 1.2 `assets/css/base.css` (stub — Feature 006 owns final version)

Minimal stub containing only the custom properties and resets required by
`home.css`. Feature 006 will replace this with the full site-wide version.

```css
/* base.css — stub for Feature 002; replaced in full by Feature 006 */
:root {
  --color-bg:          #FAF8F5;
  --color-surface:     #F2EFE9;
  --color-border:      #DDD8CE;
  --color-text:        #1C1A17;
  --color-text-muted:  #6B6559;
  --color-accent:      #8B5E3C;
  --color-accent-hover:#6B4629;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Source Serif 4', Georgia, serif;
  --font-mono:    'IBM Plex Mono', 'Courier New', monospace;

  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;

  --max-width: 1100px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.7;
}

a { color: var(--color-accent); }
a:hover { color: var(--color-accent-hover); }
```

### 1.3 `assets/css/home.css`

Key layout rules (author expands with full visual design):

```css
/* home.css */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400&display=swap');

/* ── Layout wrapper ── */
main {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-4);
}

/* ── Hero ── */
.hero {
  padding-block: var(--space-8);
  text-align: center;
}
.hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.15;
  margin-bottom: var(--space-3);
}
.hero__subtitle {
  max-width: 60ch;
  margin-inline: auto;
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

/* ── Navigation cards ── */
.hero__cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  list-style: none;
}
.hero-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  text-decoration: none;
  color: var(--color-text);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.hero-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  color: var(--color-text);
}
.hero-card__label {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--color-accent);
}
.hero-card__desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

/* ── Featured section ── */
.featured {
  border-top: 1px solid var(--color-border);
  padding-block: var(--space-6);
}
.featured__heading {
  font-family: var(--font-display);
  font-size: 1.3rem;
  margin-bottom: var(--space-3);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}
.featured__card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-4);
  align-items: start;
}

/* ── Mobile (< 768px) ── */
@media (max-width: 767px) {
  .hero__cards {
    grid-template-columns: 1fr;
  }
  .featured__card {
    grid-template-columns: 1fr;
  }
}
```

---

## Phase 2 — Dynamic Featured Ancestor

**Goal**: `home.js` loads `data/individuals.json`, selects the featured ancestor,
and inserts a rich card into `#featured-section` without blocking page render.

### 2.1 Selection logic

```
1. Fetch /data/individuals.json (no-store cache for SW bypass not needed — SW
   handles cache-first; home.js just fetches).
2. Find first record where record.featured === true.
   If none, find record with the most recent birth_date (or first record if no dates).
3. If array is empty or fetch fails → do nothing (section stays hidden).
```

### 2.2 `assets/js/home.js`

```js
// home.js — featured ancestor card
const INDIVIDUALS_URL = '/data/individuals.json';

async function loadFeatured() {
  let individuals;
  try {
    const res = await fetch(INDIVIDUALS_URL);
    if (!res.ok) return;
    individuals = await res.json();
  } catch {
    return; // Fail silently — section stays hidden
  }

  if (!Array.isArray(individuals) || individuals.length === 0) return;

  const featured =
    individuals.find(p => p.featured === true) ??
    [...individuals].sort((a, b) => {
      if (!a.birth_date) return 1;
      if (!b.birth_date) return -1;
      return b.birth_date.localeCompare(a.birth_date);
    })[0];

  if (!featured) return;

  const section = document.getElementById('featured-section');
  const card    = document.getElementById('featured-card');

  const dates = [
    featured.birth_date ? `n. ${featured.birth_date.slice(0, 4)}` : null,
    featured.death_date ? `† ${featured.death_date.slice(0, 4)}` : null,
  ].filter(Boolean).join(' · ');

  card.innerHTML = `
    <div class="featured-person">
      <p class="featured-person__name">
        <a href="/profiles/${encodeURIComponent(featured.id)}">
          ${escapeHtml(featured.first_name)} ${escapeHtml(featured.last_name)}
        </a>
      </p>
      ${dates ? `<p class="featured-person__dates">${escapeHtml(dates)}</p>` : ''}
      ${featured.birth_place
        ? `<p class="featured-person__place">${escapeHtml(featured.birth_place)}</p>`
        : ''}
      ${featured.notes
        ? `<p class="featured-person__note">${escapeHtml(featured.notes.slice(0, 200))}${featured.notes.length > 200 ? '…' : ''}</p>`
        : ''}
      <a class="featured-person__link" href="/profiles/${encodeURIComponent(featured.id)}">
        Ver perfil →
      </a>
    </div>
  `;

  section.hidden = false;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadFeatured();
```

**Security note**: `escapeHtml()` sanitises all Sheet-sourced strings before
inserting into the DOM via `innerHTML`. No XSS risk.

**Graceful degradation**:
- Fetch fails → `return` — section stays `hidden`.
- Empty array → `return` — section stays `hidden`.
- `data/individuals.json` not yet generated (Feature 001 not run) → `return`.

---

## Constitution Check (Post-Design)

| Principle | Status |
|-----------|--------|
| I. Static-First | ✅ Pass — reads pre-generated JSON; no Sheets calls |
| II. Content-First Design | ✅ Pass — minimal chrome, editorial featured section |
| IV. Performance | ✅ Pass — non-blocking async fetch; `section hidden` prevents layout shift |
| VI. Accessibility | ✅ Pass — `escapeHtml` prevents injection; semantic landmark roles |

---

## Complexity Tracking

No violations to justify.
