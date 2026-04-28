# Implementation Plan: Individual Profiles

**Branch**: `005-individual-profiles` | **Date**: 2026-04-27
**Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/005-individual-profiles/spec.md`

## Summary

Build the individual profiles system: statically generated HTML pages (one per
person) from `data/individuals.json` + `data/files.json`, a Fuse.js-powered
search index page, a vanilla-JS lightbox for gallery images, and a sitemap
generator. Profile generation runs as an additional step in the Feature 001
GitHub Actions pipeline.

## Technical Context

**Language/Version**: Node.js (LTS) for generation scripts; HTML5 + ES2020 modules for frontend
**Primary Dependencies**: Fuse.js v7 (CDN) for search; no frontend bundler; no template engine
**Storage**: Reads `data/individuals.json` + `data/files.json` (Feature 001) — read-only; writes `profiles/[id].html` + `sitemap.xml`
**Testing**: Manual visual test with fixture data; Lighthouse ≥ 90
**Target Platform**: GitHub Pages (static)
**Performance Goals**: Profile page loads < 1s on broadband; search results appear < 1s after keystroke
**Constraints**: Static-only (no JS required to read a profile); Fuse.js from CDN; no template engine; lazy-load all gallery images; accessibility via alt text + keyboard lightbox
**Scale/Scope**: Hundreds of individuals; hundreds of generated HTML files

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First | ✅ Pass | All profiles generated at build time; no runtime API calls |
| II. Content-First Design | ✅ Pass | Uses CSS custom properties; serif typography for names/dates |
| III. Data Integrity | ✅ Pass | Profile URL = individual `id`; permanent, no name dependency |
| IV. Performance | ✅ Pass | Lazy-load images; Fuse.js CDN; no heavy framework |
| V. Desktop-First | ✅ Pass | Two-column layout on desktop; single-column on mobile |
| VI. Accessibility | ✅ Pass | `alt` from `caption`; `<time>` elements; keyboard lightbox with focus trap |

No violations.

## Project Structure

### Documentation

```text
specs/005-individual-profiles/
├── plan.md
├── research.md
├── data-model.md     ← template context object + entity schemas
└── quickstart.md
```

### Source Code

```text
profiles/
  index.html               ← search + browse page
  profile-template.html    ← HTML template for generation (not served directly)
  [id].html                ← generated pages (do not edit)

scripts/
  generate-profiles.js     ← reads individuals.json + files.json → writes profiles/
  generate-sitemap.js      ← reads profiles/ → writes sitemap.xml

assets/
  css/
    profiles.css
  js/
    profiles-search.js     ← Fuse.js search for index.html
    lightbox.js            ← reusable lightbox for gallery
```

---

## Phase 0 — Template Design (`profiles/profile-template.html`)

**Goal**: Define the HTML structure that `generate-profiles.js` will inject data into.
No JavaScript is needed to view the profile; the lightbox is a progressive enhancement.

### Template placeholders

All placeholders use `{{variable}}` syntax and are replaced by simple
`String.prototype.replaceAll()` in the generator.

```
{{page_title}}          ← "Francisco Clemenzo | Clemenzo de Ardón"
{{meta_description}}    ← birth/death summary sentence
{{og_title}}            ← same as page_title
{{og_description}}      ← same as meta_description
{{og_image_tag}}        ← full <meta property="og:image"> tag, or empty string
{{og_url}}              ← canonical profile URL
{{individual_id}}       ← used in tree link href
{{full_name}}           ← first_name + last_name
{{birth_section}}       ← rendered HTML block (empty string if no birth data)
{{death_section}}       ← rendered HTML block (empty string if no death data)
{{family_section}}      ← rendered HTML block (empty string if no family)
{{notes_section}}       ← rendered HTML block (empty string if no notes)
{{gallery_section}}     ← rendered HTML block (empty string if no files)
```

Sections are pre-rendered by the generator as complete HTML strings. The template
contains one placeholder per section — no conditional logic inside the template.

### Template structure

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{page_title}}</title>
  <meta name="description" content="{{meta_description}}">
  <meta property="og:title" content="{{og_title}}">
  <meta property="og:description" content="{{og_description}}">
  {{og_image_tag}}
  <meta property="og:url" content="{{og_url}}">
  <meta property="og:type" content="profile">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/profiles.css">
</head>
<body>
  <!-- Site nav — Feature 006 placeholder until 006 ships -->
  <header class="site-header">
    <nav class="site-nav">
      <a class="site-nav__brand" href="/">Clemenzo de Ardón</a>
      <a class="site-nav__link" href="/tree/">Árbol</a>
      <a class="site-nav__link" href="/profiles/">Personas</a>
      <a class="site-nav__link" href="/blog/">Blog</a>
    </nav>
  </header>

  <main class="profile">
    <header class="profile__header">
      <h1 class="profile__name">{{full_name}}</h1>
      {{birth_section}}
      {{death_section}}
    </header>

    {{family_section}}
    {{notes_section}}
    {{gallery_section}}

    <p class="profile__tree-link">
      <a href="/tree/?highlight={{individual_id}}">Ver en el árbol genealógico →</a>
    </p>
  </main>

  <script type="module" src="/assets/js/lightbox.js"></script>
</body>
</html>
```

---

## Phase 1 — Generation Script (`scripts/generate-profiles.js`)

**Goal**: Read source data, render all sections, and write one HTML file per individual.

### Algorithm

```
Input:  data/individuals.json, data/files.json, profiles/profile-template.html
Output: profiles/[id].html for each individual

1. Load template file (read once, store as string).
2. Load individuals.json → Individual[]
3. Load files.json → File[]
4. Build filesMap: Map<individual_id, File[]>  (O(1) file lookup per individual)
5. Build individualsMap: Map<id, Individual>    (O(1) name/link resolution)
6. Build childrenMap: Map<id, Individual[]>     (inverted parent→children index)

7. For each individual:
   a. Build context object (see data-model.md).
   b. Render each section to an HTML string:
      - birth_section:  if birth_date or birth_place exist
      - death_section:  if death_date or death_place exist
      - family_section: if father_id, mother_id, or any children are non-empty
      - notes_section:  if notes exists and is non-empty
      - gallery_section:if filesMap has entries for this id
   c. Replace all {{placeholders}} in template with rendered strings.
   d. Write to profiles/[id].html.

8. console.log summary: "N profiles written."
```

### Section rendering functions

```js
function renderBirthSection(individual) {
  const parts = [];
  if (individual.birth_date)
    parts.push(`n. <time datetime="${individual.birth_date}">${individual.birth_date}</time>`);
  if (individual.birth_place)
    parts.push(`<span class="profile__place">${escapeHtml(individual.birth_place)}</span>`);
  return parts.length
    ? `<p class="profile__dates">${parts.join(' · ')}</p>`
    : '';
}

function renderDeathSection(individual) {
  const parts = [];
  if (individual.death_date)
    parts.push(`† <time datetime="${individual.death_date}">${individual.death_date}</time>`);
  if (individual.death_place)
    parts.push(`<span class="profile__place">${escapeHtml(individual.death_place)}</span>`);
  return parts.length
    ? `<p class="profile__dates profile__dates--death">${parts.join(' · ')}</p>`
    : '';
}

function renderFamilySection(individual, individualsMap, childrenMap) {
  const links = [];
  if (individual.father_id && individualsMap.has(individual.father_id)) {
    const f = individualsMap.get(individual.father_id);
    links.push(`<li class="family__item family__item--parent">
      Padre: <a href="/profiles/${encodeURIComponent(f.id)}.html">${escapeHtml(f.first_name)} ${escapeHtml(f.last_name)}</a>
    </li>`);
  }
  if (individual.mother_id && individualsMap.has(individual.mother_id)) {
    const m = individualsMap.get(individual.mother_id);
    links.push(`<li class="family__item family__item--parent">
      Madre: <a href="/profiles/${encodeURIComponent(m.id)}.html">${escapeHtml(m.first_name)} ${escapeHtml(m.last_name)}</a>
    </li>`);
  }
  const children = childrenMap.get(individual.id) ?? [];
  for (const child of children) {
    links.push(`<li class="family__item family__item--child">
      <a href="/profiles/${encodeURIComponent(child.id)}.html">${escapeHtml(child.first_name)} ${escapeHtml(child.last_name)}</a>
    </li>`);
  }
  if (!links.length) return '';
  return `<section class="profile__family">
    <h2 class="profile__section-title">Familia</h2>
    <ul class="family">${links.join('\n')}</ul>
  </section>`;
}

function renderNotesSection(individual) {
  if (!individual.notes?.trim()) return '';
  const paragraphs = individual.notes
    .split(/\n\n+/)
    .map(p => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<section class="profile__notes">
    <h2 class="profile__section-title">Notas biográficas</h2>
    ${paragraphs}
  </section>`;
}

function renderGallerySection(files) {
  if (!files?.length) return '';
  const items = files.map(f => {
    if (f.file_type === 'image') {
      return `<li class="gallery__item">
        <button class="gallery__trigger"
                data-src="${escapeAttr(f.url)}"
                data-caption="${escapeAttr(f.caption ?? '')}"
                aria-label="Ver imagen: ${escapeAttr(f.caption ?? '')}">
          <img src="${escapeAttr(f.url)}"
               alt="${escapeAttr(f.caption ?? '')}"
               loading="lazy"
               class="gallery__thumb">
        </button>
      </li>`;
    }
    return `<li class="gallery__item gallery__item--document">
      <a href="${escapeAttr(f.url)}" target="_blank" rel="noopener" class="gallery__doc-link">
        <span class="gallery__doc-icon" aria-hidden="true">📄</span>
        <span>${escapeHtml(f.caption ?? f.url)}</span>
      </a>
    </li>`;
  }).join('\n');
  return `<section class="profile__gallery">
    <h2 class="profile__section-title">Archivos</h2>
    <ul class="gallery">${items}</ul>
  </section>`;
}
```

### Children map construction

`individuals.json` stores `father_id`/`mother_id` on each child (child → parent
direction). Profile pages need the inverse direction (parent → children list).
Build this once before the per-individual loop — O(n) instead of O(n²):

```js
function buildChildrenMap(individuals) {
  const map = new Map(); // parent_id → Individual[]
  for (const ind of individuals) {
    for (const parentId of [ind.father_id, ind.mother_id]) {
      if (!parentId) continue;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId).push(ind);
    }
  }
  return map;
}
```

### Security: HTML escaping

All user-supplied data is escaped before HTML injection — never use raw strings
from JSON inside innerHTML:

```js
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
const escapeAttr = escapeHtml;
```

### Workflow integration

Added as new steps in `.github/workflows/refresh-data.yml` (after the existing
data-fetch steps):

```yaml
- name: Generate profile pages
  run: node scripts/generate-profiles.js

- name: Generate sitemap
  run: node scripts/generate-sitemap.js
```

---

## Phase 2 — Profiles Index (`profiles/index.html` + `assets/js/profiles-search.js`)

**Goal**: Search and browse page; primary entry point for visitors.

### `profiles/index.html` structure

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Personas | Clemenzo de Ardón</title>
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/profiles.css">
</head>
<body>
  <!-- Site nav placeholder (Feature 006) -->
  <header class="site-header">
    <nav class="site-nav">
      <a class="site-nav__brand" href="/">Clemenzo de Ardón</a>
      <a class="site-nav__link" href="/tree/">Árbol</a>
      <a class="site-nav__link site-nav__link--active" href="/profiles/">Personas</a>
      <a class="site-nav__link" href="/blog/">Blog</a>
    </nav>
  </header>

  <main class="profiles-index">
    <h1 class="profiles-index__title">Personas</h1>
    <div class="search">
      <input type="search" id="search-input" class="search__input"
             placeholder="Buscar por nombre o lugar..." autocomplete="off"
             aria-label="Buscar personas">
    </div>
    <p id="search-empty" class="search__empty" hidden>
      No se encontraron personas con ese nombre.
    </p>
    <ul id="results-list" class="profile-cards" aria-live="polite"></ul>
  </main>

  <script type="module" src="/assets/js/profiles-search.js"></script>
</body>
</html>
```

### `profiles-search.js`

```js
import Fuse from 'https://unpkg.com/fuse.js@7/dist/fuse.esm.js';

const INITIAL_COUNT = 20;
const FUSE_OPTIONS = {
  keys: ['first_name', 'last_name', 'birth_place'],
  threshold: 0.35,
  includeScore: false,
};

async function init() {
  const res = await fetch('/data/search-index.json');
  const individuals = await res.json();
  const fuse = new Fuse(individuals, FUSE_OPTIONS);

  const input = document.getElementById('search-input');
  const list  = document.getElementById('results-list');
  const empty = document.getElementById('search-empty');

  // Initial display: last 20 added (reverse of JSON order)
  renderCards(individuals.slice(-INITIAL_COUNT).reverse(), list, empty);

  let debounceId;
  input.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      const q = input.value.trim();
      const results = q
        ? fuse.search(q).map(r => r.item)
        : individuals.slice(-INITIAL_COUNT).reverse();
      renderCards(results, list, empty);
    }, 200);
  });
}

function renderCards(individuals, list, empty) {
  empty.hidden = individuals.length > 0;
  list.innerHTML = individuals.map(ind => {
    const dates = [ind.birth_date, ind.death_date].filter(Boolean).join(' – ');
    return `<li class="profile-card">
      <a class="profile-card__link" href="/profiles/${encodeURIComponent(ind.id)}.html">
        <span class="profile-card__name">${escapeHtml(ind.first_name)} ${escapeHtml(ind.last_name)}</span>
        ${dates ? `<span class="profile-card__dates">${escapeHtml(dates)}</span>` : ''}
        ${ind.birth_place ? `<span class="profile-card__place">${escapeHtml(ind.birth_place)}</span>` : ''}
      </a>
    </li>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

init();
```

---

## Phase 3 — Lightbox (`assets/js/lightbox.js`)

**Goal**: Progressive-enhancement lightbox for profile gallery images.
Activated by click on `.gallery__trigger[data-src]` buttons within `.profile__gallery`.

```js
// assets/js/lightbox.js — ES module, no dependencies

function buildLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Imagen ampliada');
  overlay.setAttribute('tabindex', '-1');
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Cerrar">✕</button>
    <button class="lightbox__prev" aria-label="Imagen anterior">‹</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" src="" alt="">
      <figcaption class="lightbox__caption"></figcaption>
    </figure>
    <button class="lightbox__next" aria-label="Imagen siguiente">›</button>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function initLightbox() {
  const gallery = document.querySelector('.profile__gallery');
  if (!gallery) return;

  const triggers = Array.from(gallery.querySelectorAll('.gallery__trigger[data-src]'));
  if (!triggers.length) return;

  const overlay  = buildLightbox();
  const img      = overlay.querySelector('.lightbox__img');
  const caption  = overlay.querySelector('.lightbox__caption');
  const btnPrev  = overlay.querySelector('.lightbox__prev');
  const btnNext  = overlay.querySelector('.lightbox__next');
  const btnClose = overlay.querySelector('.lightbox__close');

  const images = triggers.map(t => ({ src: t.dataset.src, caption: t.dataset.caption ?? '', trigger: t }));
  let currentIndex = 0;
  let lastFocused = null;

  function showImage(index) {
    const { src, caption: cap } = images[index];
    img.src = src;
    img.alt = cap;
    caption.textContent = cap;
    currentIndex = index;
  }

  function open(index) {
    lastFocused = document.activeElement;
    showImage(index);
    btnPrev.hidden = images.length <= 1;
    btnNext.hidden = images.length <= 1;
    overlay.hidden = false;
    overlay.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function close() {
    overlay.hidden = true;
    document.removeEventListener('keydown', onKeyDown);
    lastFocused?.focus();
  }

  function prev() {
    showImage((currentIndex - 1 + images.length) % images.length);
  }

  function next() {
    showImage((currentIndex + 1) % images.length);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape')     { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev();  return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); next();  return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(overlay.querySelectorAll('button:not([hidden])'));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  prev);
  btnNext.addEventListener('click',  next);

  triggers.forEach((trigger, i) => {
    trigger.addEventListener('click', () => open(i));
  });
}

document.addEventListener('DOMContentLoaded', initLightbox);
```

### Lightbox CSS (in `assets/css/profiles.css`)

```css
.lightbox {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.lightbox__img    { max-width: 90vw; max-height: 90vh; object-fit: contain; }
.lightbox__figure { display: flex; flex-direction: column; align-items: center; }
.lightbox__caption { color: #fff; font-size: 0.875rem; margin-top: 8px; text-align: center; }
.lightbox__close,
.lightbox__prev,
.lightbox__next {
  position: absolute;
  background: transparent; border: none;
  color: #fff; font-size: 2rem;
  cursor: pointer; padding: 16px; line-height: 1;
}
.lightbox__close { top: 16px;  right: 16px; }
.lightbox__prev  { left: 16px; top: 50%; transform: translateY(-50%); }
.lightbox__next  { right: 16px; top: 50%; transform: translateY(-50%); }
```

---

## Phase 4 — Sitemap Generator (`scripts/generate-sitemap.js`)

**Goal**: Produce `sitemap.xml` listing all deployed profile pages + static pages.

```js
// scripts/generate-sitemap.js
import { readdir, writeFile } from 'node:fs/promises';

const BASE_URL = 'https://cmzo.github.io/genealogia';
const STATIC_PAGES = ['/', '/blog/', '/tree/', '/profiles/'];

async function generateSitemap() {
  const files = await readdir('profiles');
  const profileIds = files
    .filter(f => f.endsWith('.html') && f !== 'index.html' && !f.includes('template'))
    .map(f => f.replace(/\.html$/, ''));

  const staticUrls  = STATIC_PAGES.map(p => `  <url><loc>${BASE_URL}${p}</loc></url>`);
  const profileUrls = profileIds.map(id =>
    `  <url><loc>${BASE_URL}/profiles/${encodeURIComponent(id)}.html</loc></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...profileUrls].join('\n')}
</urlset>`;

  await writeFile('sitemap.xml', xml, 'utf8');
  console.log(`Sitemap written: ${staticUrls.length + profileUrls.length} URLs`);
}

generateSitemap();
```

Reads the `profiles/` directory (not `individuals.json`) so the sitemap only lists
pages that were actually generated and exist on disk.

---

## Constitution Check (Post-Design)

| Principle | Status |
|-----------|--------|
| I. Static-First | ✅ Pass — profiles generated at build time; index uses client-side JSON only |
| II. Content-First | ✅ Pass — `--font-display` for names; CSS custom properties; no framework chrome |
| III. Data Integrity | ✅ Pass — URL slug = permanent `id`; broken parent refs silently omitted |
| IV. Performance | ✅ Pass — lazy-load images; Fuse.js CDN; no heavy framework |
| V. Desktop-First | ✅ Pass — two-column profile layout on desktop; single-column on mobile |
| VI. Accessibility | ✅ Pass — `alt` from `caption`; `<time datetime>`; focus trap in lightbox; keyboard nav |

---

## Complexity Tracking

| Item | Why Needed | Simpler Alternative Rejected Because |
|------|------------|--------------------------------------|
| Static profile generation | GitHub Pages cannot render dynamic pages | Client-side rendering from JSON would make profile pages invisible to search engines and require JS to see any content |
| Children map inversion | `individuals.json` encodes parent refs on child records; profiles need parent → children list | Scanning all individuals per profile would be O(n²) at generation time |
| Focus trap in lightbox | WCAG 2.1 criterion 2.1.2 — keyboard must not escape to invisible background | Without it, Tab exits the overlay; screen reader users lose context |
| `og:image` tag omitted when no image | An invalid OG image URL causes crawler errors and a broken card in social sharing | Missing tag is handled gracefully by all crawlers; broken URL is not |
