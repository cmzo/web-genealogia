# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
uv run scripts/gestionar_arbol.py           # menú interactivo (recomendado)

# Comandos directos:
uv run scripts/gestionar_arbol.py list
uv run scripts/gestionar_arbol.py show <id>
uv run scripts/gestionar_arbol.py add
uv run scripts/gestionar_arbol.py edit <id>
uv run scripts/gestionar_arbol.py delete <id>

uv run scripts/gestionar_arbol.py list-marriages
uv run scripts/gestionar_arbol.py add-marriage
uv run scripts/gestionar_arbol.py edit-marriage <id>
uv run scripts/gestionar_arbol.py delete-marriage <id>

uv run scripts/gestionar_arbol.py list-media [<persona_id>]
uv run scripts/gestionar_arbol.py add-media <persona_id>
uv run scripts/gestionar_arbol.py add-media-bulk <persona_id>
uv run scripts/gestionar_arbol.py delete-media <media_id>

uv run scripts/gestionar_arbol.py list-unregistered  # fotos en disco sin entrada en DB

# Regenerar arbol.json manualmente (sin hacer build completo)
uv run scripts/export_arbol.py

# Deploy to GitHub Pages (build + git add + commit + push)
npm run deploy

# Remove dist/
npm run clean
```

There is no test suite and no linter configured.

## Architecture

This is a **static site** deployed to GitHub Pages (`cmzo.github.io/web-genealogia`). There is no build framework — everything is plain HTML/CSS/JS with a small Node.js build pipeline.

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
- `arbol-matrimonios.html` — interactive family tree; fetches `assets/data/arbol.json` at runtime; uses D3.js and ES modules from `assets/js/arbol/`
- `archivo.html` — document/photo archive viewer

### Family tree (`arbol-matrimonios.html`)

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
  ├── search.js    — name search UI
  └── keyboard.js  — keyboard shortcuts
```

Styles are in `assets/css/arbol.css`. The HTML (`arbol-matrimonios.html`) has no inline CSS or JS.

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
git add dist/ assets/data/ assets/css/ assets/js/ assets/images/ *.html docs/ content/
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

## Site design system

All pages share a two-column layout: persistent sidebar (Inicio / Árbol / Archivo / Blog) + scrollable main area. CSS variables are defined in `assets/css/styles.css`. Key layout classes: `.site-nav`, `.site-body`, `.site-sidebar`, `.site-main`, `.site-footer`. The sidebar uses `is-active` class for current page indicator.

**Color palette:**

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f5f2ec` | General background |
| `--surface` | `#fdfcf9` | Content surface (site-main) |
| `--border` | `#e2dbd0` | Borders and dividers |
| `--text` | `#1c1814` | Body text |
| `--muted` | `#7a7060` | Secondary text, metadata |
| `--accent` | `#5c4a2a` | Emphasis, hover, details |

**Typography:**

| Font | Weights | Use |
|---|---|---|
| Source Serif 4 | 400, 600, 700 | Nav brand, article titles, editorial body |
| Inter | 400, 500, 600, 700 | UI, navigation, metadata, changelog |
| JetBrains Mono | 400, 500 | Code blocks |

**Layout constants:** nav `height: 52px` sticky; sidebar `width: 160px` sticky; grid `160px 1fr`. Mobile (≤960px): sidebar hidden, nav links shown inline. Article grid switches to two columns when `aside` content is present.
