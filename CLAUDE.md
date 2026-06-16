# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de sesión

### «Actualiza todo»
Cuando el usuario diga **«Actualiza todo»**, ejecutar en orden:

1. **TODO.md** (`/Users/matias/genealogia/TODO.md`) — revisar cada tarea abierta y marcar `[x]` las que se resolvieron durante la sesión; moverlas a `## Completadas` con fecha y resultado breve. No inventar resoluciones: solo marcar lo que efectivamente ocurrió.
2. **`content/changelog.md`** — añadir una entrada `####` por cada cambio significativo hecho al sitio durante la sesión (UI, contenido, estructura, correcciones). Insertar bajo el encabezado `### <fecha de hoy>` (crear la sección **solo si no existe**; **no** renombrar la de otra fecha — los cambios viejos conservan su fecha). Marcar el tipo de cambio con una etiqueta al inicio del `####`: nueva funcionalidad → `<span class="changelog-tag">Novedad</span>`; mejora de algo existente → `<span class="changelog-tag changelog-tag--mejora">Mejora</span>`; corrección → `<span class="changelog-tag changelog-tag--fix">Arreglo</span>`. Estilos en `changelog.html`.
3. **`CLAUDE.md`** (este archivo) — revisar si algo documentado aquí quedó desactualizado por los cambios de la sesión (rutas, nombres de archivos, tipografía, comandos, descripción de componentes) y corregirlo.

## Commands

```bash
# Build: compile posts to HTML, regenerate blog-entries.json and arbol.json
npm run build

# Dev server: build then serve at http://localhost:8000
npm run dev

# Add a post (copies .md to content/posts/, runs build)
node scripts/add-post.js <file.md>
node scripts/add-post.js <file.md> --add-frontmatter  # auto-generate front matter if missing

# Manage posts
npm run list-posts
npm run delete-post <slug>   # removes .md, dist/blog/<slug>.html, and JSON entry

# Image optimization for personas (requires sharp)
npm run optimize-personas    # reads assets/images/personas/, outputs WebP

# Árbol genealógico — gestión de personas (requiere uv)
uv run scripts/gestionar_web.py           # menú interactivo (recomendado)

# Comandos directos:
uv run scripts/gestionar_web.py list
uv run scripts/gestionar_web.py show <id>
uv run scripts/gestionar_web.py add
uv run scripts/gestionar_web.py edit <id>
uv run scripts/gestionar_web.py delete <id>

uv run scripts/gestionar_web.py list-marriages
uv run scripts/gestionar_web.py add-marriage
uv run scripts/gestionar_web.py edit-marriage <id>
uv run scripts/gestionar_web.py delete-marriage <id>

uv run scripts/gestionar_web.py list-media [<persona_id>]
uv run scripts/gestionar_web.py add-media <persona_id>
uv run scripts/gestionar_web.py add-media-bulk <persona_id>
uv run scripts/gestionar_web.py delete-media <media_id>

uv run scripts/gestionar_web.py list-unregistered  # fotos en disco sin entrada en DB

uv run scripts/gestionar_web.py create-post        # crear nuevo post interactivo

# Regenerar arbol.json manualmente (sin hacer build completo)
uv run scripts/export_arbol.py

# Deploy to GitHub Pages (build + git add + commit + push)
npm run deploy

# Remove dist/
npm run clean
```

There is no test suite and no linter configured.

## Architecture

This is a **static site** deployed to **Cloudflare Workers Assets** (`web-genealogia.cmzo.workers.dev`). Configuration in `wrangler.toml`. There is no build framework — everything is plain HTML/CSS/JS with a small Node.js build pipeline.

### Blog pipeline

1. Write a post in `content/posts/<slug>.md` with YAML front matter
2. Run `npm run build` → `scripts/build.js` converts each `.md` to `dist/blog/<slug>.html` using the template at `content/templates/post-template.html`
3. The build also regenerates `assets/data/blog-entries.json`, which is the index that `blog.html` reads at runtime via `fetch()`
4. **`dist/` is committed** to the repo — GitHub Pages serves it directly, so always commit `dist/` after a build

### Front matter fields

```yaml
title: "..."
kicker: "..."          # required — subtitle shown above the title
description: "..."
image: "assets/images/cards/foo.webp"
category: "investigación"
date: "2024-08-17"
tags: "tag1, tag2"
featured: true
slug: "my-slug"        # defaults to filename without .md
aside: |               # optional sidebar content (supports Markdown)
  Some sidebar text
```

### Path handling

`assets/js/path-config.js` runs on every page and exposes `window.PATH_CONFIG` plus helpers (`getAssetPath`, `getImagePath`, `getDataPath`, etc.) that resolve paths correctly for both local dev (`./`) and GitHub Pages (`/web-genealogia/`). Pages that fetch data at runtime (like `index.html` and `blog.html`) use these helpers.

Generated posts in `dist/blog/` use hardcoded relative paths (`../../assets/…`, `../../index.html`) to reach root-level resources — this is handled automatically by `scripts/build.js`.

### Key data flow

- `index.html` — home page with editorial layout; fetches `assets/data/blog-entries.json` at runtime to render the "Última entrada" section dynamically
- `blog.html` — fetches `assets/data/blog-entries.json` and renders cards dynamically; cards are purely typographic (no image); search and filter were intentionally removed
- `arbol.html` — interactive family tree; fetches `assets/data/arbol.json` at runtime; uses D3.js and ES modules from `assets/js/arbol/`
- `archivo.html` — document/photo archive viewer; faceted filters by branch/country (the name search bar was removed in favor of the global ⌘+K palette)

### Global command palette (`assets/js/command-palette.js`)

Self-contained command palette (Spotlight/Raycast style) opened with **⌘/Ctrl + K**. Injects its own CSS + DOM and a "Buscar ⌘ + K" trigger button into `.nav-actions`. Indexes **pages**, **personas** (from `arbol.json`) and **blog posts** (from `blog-entries.json`), fetched lazily and cached. Fuzzy, accent-insensitive search; grouped results; keyboard nav. Selecting a persona focuses it in the tree via `window.__treeFocus` (defined in `arbol.html`) when already on the tree, otherwise navigates to `arbol.html?focus=<id>`. Included on Inicio, Árbol, Archivo, Blog, Cambios and blog posts — **not** on Colaborar, Fuentes, Sobre. Paths are relative; `ROOT` is `../../` inside `dist/blog/` posts, `''` elsewhere.

### Family tree (`arbol.html`)

The tree is modularized into ES modules under `assets/js/arbol/` and uses **D3.js v7** for SVG rendering with zoom/pan:

```
assets/js/arbol/
  ├── config.js    — CARD/MARRIAGE_NODE dimensions, TRANSITION_MS, getBranchColor()
  ├── data.js      — loadData(): fetches assets/data/arbol.json
  ├── store.js     — reactive focus/selection state (setFocus, setSelected)
  ├── structure.js — buildMarriageStructure(): parses personas+matrimonios into nodes
  ├── layout.js    — calculateLayout(): positions nodes by generation/order, exports VGAP
  ├── render.js    — initTree(), render(), recenterOn(), zoomIn/Out() — D3 SVG rendering
  ├── panel.js     — side panel that shows person details and media when a node is selected
  ├── timeline.js  — modal «Línea de tiempo» por persona (se abre desde el botón del hero de panel.js)
  ├── search.js    — name search UI
  └── keyboard.js  — keyboard shortcuts
```

Styles are in `assets/css/arbol.css`. The HTML (`arbol.html`) has no inline CSS or JS.

**Panel inspector (`panel.js` + `.tree-panel`):** lenguaje editorial coherente con el blog — hero sobre superficie clara (nombre en Source Serif 4, años en serif cursiva), badge de estado tipo chip, secciones en cards blancas. En desktop el panel flota como tarjeta con **gaps de 5mm tipo i3** (el fondo de puntos vive en `.tree-wrapper` y se ve en los gaps). El botón "Ampliar panel" del footer alterna el estado `.is-expanded`, que hace que el panel ocupe todo el área dejando solo el gap de 5mm (toggle a "Volver al árbol"). **Esta expansión y los gaps son solo desktop** (`@media max-width: 960px` los desactiva: el panel vuelve a ser un drawer overlay a pantalla completa y el footer se oculta).

**Modal «Línea de tiempo» (`timeline.js`):** abre desde el botón del hero del panel y ubica a la persona —con su ascendencia y descendencia— en una columna central (eje temporal vertical) contra hitos históricos a la izquierda. A la derecha, un **panel de detalle fijo** (master-detail) que sigue al hover/scroll. Los hitos viven en el array `WORLD_EVENTS` (cada uno con `wiki` = título de artículo) y traen imagen + resumen en vivo vía `fetchWiki()` (REST de es.wikipedia, con caché en `sessionStorage`). La franja superior («slot-machine») muestra banderas de dónde nació/creció/vivió/murió cada persona; el país sale de `getCountry()` por regex sobre los lugares, con un mapa `HARDCODED_GEO` (por id) para personas sin datos de residencia (hoy p1/p3/p4 → España). Regla vivo/muerto: `DEAD_CUTOFF = 1941` (sin defunción y nacido antes → fallecido).

**Data source:** `data/arbol.db` (SQLite) is the source of truth. At build time, `scripts/build.js` calls `scripts/export_arbol.py`, which reads the DB and writes `assets/data/arbol.json`. The tree page only ever reads the static JSON — it never touches the DB directly.

**Data schema** — `assets/data/arbol.json` root structure:
```json
{
  "personas":    [ <Persona>, ... ],
  "matrimonios": [ <Matrimonio>, ... ]
}
```

Key `Persona` fields: `id` (format `p<n>`), `name`, `gender` (`"M"`/`"F"`/`""`), `birth_date`, `birth_place`, `death_date`, `death_place`, `father_id`, `mother_id`, `branch` (determines card color), `generation`, `sort_order`, `vivo`, `photo_url`, `notes`, `sources`, `status`, `media: []`.

Key `Matrimonio` fields: `id` (format `m<n>`), `spouse1_id`, `spouse2_id`, `marriage_date`, `marriage_place`, `divorce_date`, `notes`.

Each `Persona` embeds its `media` array (type `"photo"` or `"document"`) with fields: `id` (format `med<n>`), `url`, `type`, `caption`, `date`, `source_label`, `group_label`, `group_order`.

All dates are stored as ISO partial strings (`"YYYY"`, `"YYYY-MM"`, or `"YYYY-MM-DD"`) in both the DB and the exported JSON. Children are derived at runtime from `father_id`/`mother_id` — they are not stored as a list.

See `data/README.md` for the full schema reference and DB table definitions.

**Media files:**
- Fotos: `assets/images/personas/` — WebP, naming: `p26-descripcion.webp`
- Documentos: `assets/docs/personas/` — naming: `p26-acta-nacimiento.pdf`

Run `npm run optimize-personas` to convert images to WebP before committing.

### Deploy script

`scripts/update-and-deploy.js` runs `build()` then stages and pushes:
```
git add dist/ assets/data/ assets/css/ assets/js/ assets/images/ assets/fonts/ *.html docs/ content/
```
Raw image files (`.jpg`, `.png` originals) are **not** staged by the deploy script — optimize them to WebP first.

### Images

- **Originals**: `assets/images/original/` (gitignored) — also any loose `.jpg`/`.png` in `assets/images/` are not committed by the deploy script
- **Cards** (280×380 approx WebP): `assets/images/cards/` — used in `blog-entries.json` and home cards
- **Post images**: `assets/images/posts/` — referenced in Markdown post bodies
- **Personas**: `assets/images/personas/` — person photos for the family tree panel
- **Avatars**: `assets/images/avatars/`

In Markdown posts, Obsidian-style `![[filename.jpg]]` syntax is auto-converted to `../../assets/images/posts/filename.jpg` during build.

## Frontend Design

When building or significantly changing UI, use the skill defined in `frontend-design/SKILL.md`. Key rules:

- Pick one visual direction and commit to it — do not mix aesthetics
- Define type hierarchy, color variables, spacing rhythm, and layout logic before coding
- Flat empty backgrounds, generic card grids, and interchangeable SaaS patterns are anti-patterns here
- Motion should be meaningful: one well-directed sequence beats scattered micro-interactions
- Preserve the existing design system when working inside an existing page

**Visual consistency is mandatory.** Every page must use the same fonts, color tokens, spacing values, and component patterns documented in `design-system.html`. When a visual change deviates from what's documented (new color, new font size, new spacing, new component variant), **update `design-system.html` immediately** — it is the single source of truth for the site's visual language. Never introduce ad-hoc styles that aren't reflected there.

## Site design system

All pages share a two-column layout: persistent sidebar (Sobre el proyecto / Árbol / Archivo / Blog / Fuentes / Colaborar, plus Cambios at the bottom) + scrollable main area. CSS variables are defined in `assets/css/styles.css`. Key layout classes: `.site-nav`, `.site-body`, `.site-sidebar`, `.site-main`, `.site-footer`. The sidebar uses the `is-active` class for the current page, rendered as a filled green (`--accent`) pill. Each `.sidebar-link` shows a **Material Symbols Outlined** icon with an uppercase label; the icons + the icon font `<link>` are injected by `assets/js/nav-drawer.js` (mapping href → icon name), so the sidebar markup in each HTML page stays plain text — no per-page edits needed to change icons.

**Color palette (light mode):**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f6f6f4` | General background |
| `--surface` | `#ffffff` | Content surface (site-main) |
| `--border` | `#e8e8e6` | Borders and dividers |
| `--text` | `#1a1a1a` | Body text |
| `--muted` | `#5a5040` | Secondary text, metadata (warm brown-gray) |
| `--accent` | `#2d4a3e` | Emphasis, hover, links (verde botella) |
| `--on-accent` | `#cad7d0` | Text on accent-colored backgrounds |

**Dark mode** (`[data-theme="dark"]`) overrides all tokens: `--bg: #16181a`, `--surface: #1f2225`, `--border: #33373b`, `--text: #e8eaec`, `--muted: #9aa3a8`, `--accent: #5fb389`, `--on-accent: #0f1f17`. Applied via:
- Anti-flash init script inline in `<head>` of every page (reads `localStorage["theme"]`, falls back to `prefers-color-scheme`)
- `assets/js/theme.js` — injects the sun/moon toggle button into `.nav-actions`; persists choice to `localStorage`; listens to `matchMedia` change events for system-preference tracking

**Typography:**

All fonts are **self-hosted** in `assets/fonts/*.woff2` (latin + latin-ext subsets). Loaded via `assets/css/fonts.css`, imported at the top of `styles.css` — no Google Fonts dependency.

| Font | Weights | Use |
|---|---|---|
| Hanken Grotesk | 500, 600, 700, 800 | Titles (h1, h2, h3), nav brand, UI headings |
| Source Serif 4 | 400, 400i, 600, 700 | Body text in blog posts, subtitles, blog card descriptions |
| Inter | 400, 500, 600, 700 | UI, navigation, metadata, table content |
| JetBrains Mono | 400, 500 | Code blocks |

**Layout constants:** nav `height: 52px` sticky; sidebar `width: 160px` sticky; grid `160px 1fr`. Mobile (≤960px): sidebar hidden, footer hidden, hamburger button opens a slide-in drawer with all nav links. Article grid switches to two columns when `aside` content is present.
