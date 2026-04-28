# Implementation Plan: Blog

**Branch**: `003-blog` | **Date**: 2026-04-27
**Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-blog/spec.md`

## Summary

Build a two-page blog section: a listing page (`blog/index.html`) that reads
`data/blog-index.json` and renders post cards dynamically, and a post template
(`blog/post-template.html`) that authors copy and fill for each new article.
Individual posts are fully static HTML — no JS required to read them. The listing
is the only dynamic surface, progressively enhanced with `blog.js`. Post bodies
support inline links to individual profile pages.

## Technical Context

**Language/Version**: HTML5, CSS3, ES2020 (modules) — listing only; post HTML is static
**Primary Dependencies**: None — vanilla JS
**Storage**: `data/blog-index.json` (manually maintained index); post HTML files at
`blog/posts/[slug].html`
**Testing**: Manual visual check on desktop (1280px) and mobile (375px)
**Target Platform**: GitHub Pages (static)
**Project Type**: Static blog — template-based authoring, no CMS, no Markdown runtime
**Performance Goals**: Listing renders in <1s; individual posts load with zero JS
**Constraints**: No runtime Markdown parser; no SSG; posts are hand-authored HTML
using the template; `blog-index.json` is maintained manually by the author

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Static-First | ✅ Pass | Posts are pure static HTML; listing reads pre-built JSON |
| II. Content-First Design | ✅ Pass | 680px reading column; generous whitespace |
| III. Data Integrity | ✅ Pass | `slug` is the permanent URL identifier; `id`-based profile links |
| IV. Performance | ✅ Pass | Zero JS on post pages; listing fetch is non-blocking |
| V. Desktop-First | ✅ Pass | 680px column, mobile responsive |
| VI. Accessibility | ✅ Pass | `<article>`, `<time datetime>`, semantic structure |

No violations.

## Project Structure

### Documentation

```text
specs/003-blog/
├── plan.md
├── research.md
├── data-model.md     ← blog-index.json schema
├── quickstart.md
└── tasks.md          ← /speckit-tasks
```

### Source Code

```text
blog/
  index.html              ← listing page
  post-template.html      ← template for new posts (copy + rename + fill)
  posts/
    [slug].html           ← individual post files (one per article)

data/
  blog-index.json         ← manually maintained post index

assets/
  css/
    blog.css              ← listing + post styles
  js/
    blog.js               ← fetches blog-index.json, renders cards in listing
```

**Structure Decision**: Posts live under `blog/posts/` so their URL is
`/blog/posts/[slug].html`. The listing is at `/blog/` (served from
`blog/index.html`). Relative asset paths from post files: `../../assets/...`.

---

## Phase 0 — Research

All decisions resolved from author input. See [research.md](research.md).

---

## Phase 1 — Post Template & CSS

**Goal**: A complete, usable post template and the full CSS for both listing and
post pages. A new post can be authored by copying the template and filling in the
content — no listing integration yet.

### 1.1 `blog/post-template.html`

The canonical template that the author copies and renames to `blog/posts/[slug].html`.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- POST TITLE --> — Clemenzo de Ardón</title>
  <meta name="description" content="<!-- POST EXCERPT -->">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link rel="stylesheet" href="../../assets/css/base.css">
  <link rel="stylesheet" href="../../assets/css/blog.css">
</head>
<body>
  <!-- Navigation: Feature 006 shared partial (stub for now) -->
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

  <main class="post-layout">
    <article class="post" aria-labelledby="post-title">
      <header class="post__header">
        <p class="post__kicker"><!-- OPTIONAL KICKER / CATEGORY --></p>
        <h1 id="post-title" class="post__title"><!-- POST TITLE --></h1>
        <time class="post__date" datetime="<!-- YYYY-MM-DD -->">
          <!-- Human-readable date, e.g.: 15 de marzo de 2024 -->
        </time>
      </header>

      <section class="post__body">
        <!--
          POST CONTENT GOES HERE.
          Use standard HTML: <p>, <h2>, <h3>, <img>, <blockquote>, <ul>, <ol>.
          To link an individual: <a href="/profiles/[id].html">Nombre</a>
          Images: <img src="../../assets/images/posts/filename.webp"
                       alt="Descriptive caption" loading="lazy">
        -->
      </section>

      <footer class="post__footer">
        <a href="/blog/" class="post__back">← Volver al blog</a>
      </footer>
    </article>
  </main>

  <footer class="site-footer">
    <!-- Feature 006 shared partial stub -->
  </footer>
</body>
</html>
```

**Authoring notes embedded as HTML comments** so the author has guidance without
needing to consult external docs.

### 1.2 `assets/css/blog.css`

```css
/* blog.css — listing + post styles */

/* ── Shared layout ── */
.post-layout,
.blog-layout {
  max-width: var(--max-width);
  margin-inline: auto;
  padding-inline: var(--space-4);
  padding-block: var(--space-6);
}

/* ── POST PAGE ── */
.post {
  max-width: 680px;    /* reading column */
  margin-inline: auto;
}

.post__header {
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-4);
}

.post__kicker {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}

.post__title {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  line-height: 1.2;
  margin-bottom: var(--space-2);
}

.post__date {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

/* Post body typography */
.post__body {
  font-size: 1.05rem;
  line-height: 1.8;
}
.post__body p  { margin-bottom: var(--space-3); }
.post__body h2 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}
.post__body h3 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}
.post__body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin-block: var(--space-4);
  border: 1px solid var(--color-border);
}
.post__body blockquote {
  border-left: 3px solid var(--color-accent);
  padding-left: var(--space-3);
  color: var(--color-text-muted);
  font-style: italic;
  margin-block: var(--space-3);
}
.post__body a { text-decoration: underline; }

.post__footer {
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
.post__back {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-decoration: none;
  color: var(--color-text-muted);
}
.post__back:hover { color: var(--color-accent); }

/* ── LISTING PAGE ── */
.blog-listing__heading {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2rem);
  margin-bottom: var(--space-6);
}

.blog-listing__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.post-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-1);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: var(--color-text);
}
.post-card:last-child { border-bottom: none; }

.post-card__date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.post-card__title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--color-accent);
}
.post-card:hover .post-card__title { color: var(--color-accent-hover); }

.post-card__excerpt {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Error state */
.blog-listing__error {
  color: var(--color-text-muted);
  font-style: italic;
  padding: var(--space-4) 0;
}

/* ── Mobile ── */
@media (max-width: 767px) {
  .post {
    max-width: 100%;
  }
}
```

---

## Phase 2 — Listing + `blog-index.json`

**Goal**: The listing page fetches `data/blog-index.json` and renders post cards.
The `blog-index.json` schema is documented; authoring a new post also means adding
an entry to this JSON.

### 2.1 `blog/index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Clemenzo de Ardón</title>
  <meta name="description" content="Artículos de investigación genealógica de la familia Clemenzo.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="../assets/css/base.css">
  <link rel="stylesheet" href="../assets/css/blog.css">
</head>
<body>
  <header class="site-nav" role="banner">
    <nav aria-label="Navegación principal">
      <a class="site-nav__logo" href="/">Clemenzo de Ardón</a>
      <ul class="site-nav__links" role="list">
        <li><a href="/tree/">Árbol</a></li>
        <li><a href="/profiles/" aria-current="page">Perfiles</a></li>
        <li><a href="/blog/" aria-current="page">Blog</a></li>
      </ul>
    </nav>
  </header>

  <main class="blog-layout" aria-labelledby="blog-heading">
    <h1 id="blog-heading" class="blog-listing__heading">Blog</h1>
    <div id="blog-list" class="blog-listing__list" aria-live="polite">
      <!-- Populated by blog.js -->
    </div>
  </main>

  <footer class="site-footer"><!-- Feature 006 --></footer>

  <script type="module" src="../assets/js/blog.js"></script>
</body>
</html>
```

### 2.2 `assets/js/blog.js`

```js
// blog.js — renders the post listing from data/blog-index.json
const INDEX_URL = '/data/blog-index.json';

function formatDate(isoDate) {
  try {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderListing() {
  const container = document.getElementById('blog-list');
  if (!container) return;

  let posts;
  try {
    const res = await fetch(INDEX_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    posts = await res.json();
  } catch (err) {
    container.innerHTML =
      `<p class="blog-listing__error">No se pudieron cargar los artículos. Intenta recargar la página.</p>`;
    return;
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    container.innerHTML =
      `<p class="blog-listing__error">Aún no hay artículos publicados.</p>`;
    return;
  }

  // blog-index.json is already sorted newest-first by the author
  container.innerHTML = posts.map(post => `
    <a class="post-card" href="/blog/posts/${encodeURIComponent(post.slug)}.html">
      <time class="post-card__date" datetime="${escapeHtml(post.date)}">
        ${escapeHtml(formatDate(post.date))}
      </time>
      <span class="post-card__title">${escapeHtml(post.title)}</span>
      ${post.excerpt
        ? `<span class="post-card__excerpt">${escapeHtml(post.excerpt)}</span>`
        : ''}
    </a>
  `).join('');
}

renderListing();
```

### 2.3 `data/blog-index.json` (initial empty state)

See [data-model.md](data-model.md) for the schema. The author creates this file
manually. The initial committed version:

```json
[]
```

When `blog.js` receives an empty array, it renders "Aún no hay artículos publicados."
— no broken state.

### 2.4 Authoring workflow (new post)

1. Copy `blog/post-template.html` → `blog/posts/[slug].html`.
2. Fill in: `<title>`, `<meta name="description">`, kicker, `<h1>`, `<time datetime>`,
   body content.
3. Add an entry at the **top** of `data/blog-index.json`:
   ```json
   {
     "slug": "mi-nuevo-post",
     "title": "Título del artículo",
     "date": "2026-04-27",
     "excerpt": "Breve descripción de dos frases."
   }
   ```
4. Run `npm run deploy` (or just push to `main`).

No build step, no Markdown compilation, no config file changes.

---

## Constitution Check (Post-Design)

| Principle | Status |
|-----------|--------|
| I. Static-First | ✅ Pass — posts are static HTML; listing reads committed JSON |
| II. Content-First | ✅ Pass — 680px reading column, generous line-height, serif body |
| IV. Performance | ✅ Pass — zero JS on post pages; listing JS non-blocking |
| VI. Accessibility | ✅ Pass — `<article>`, `<time datetime>`, `aria-live` on listing |

---

## Complexity Tracking

No violations to justify.
