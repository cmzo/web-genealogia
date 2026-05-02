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

# Image optimization (requires sharp)
npm run optimize-images      # reads assets/images/original/, outputs WebP

# Archive data
npm run build-archive        # regenerates content/data/archive.json

# Árbol genealógico — gestión de personas
python3 scripts/gestionar_arbol.py list
python3 scripts/gestionar_arbol.py show <id>
python3 scripts/gestionar_arbol.py add
python3 scripts/gestionar_arbol.py edit <id>

# Regenerar arbol.json manualmente (sin hacer build completo)
python3 scripts/export_arbol.py

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
- `arbol-matrimonios.html` — interactive family tree; fetches `assets/data/arbol.json` at runtime; uses ES modules from `assets/js/arbol/`
- `archivo.html` — document/photo archive viewer

### Family tree (`arbol-matrimonios.html`)

The tree is modularized into ES modules under `assets/js/arbol/`:

```
assets/js/arbol/
  ├── config.js      — CONFIG object (SVG dimensions, spacing), cardColors, getBranchColor()
  ├── data.js        — loadData(): fetches assets/data/arbol.json
  ├── structure.js   — buildMarriageStructure(): parses rows into marriage/single units with children
  ├── layout.js      — calculateMarriageLayout(): positions units by generation and order
  └── render.js      — renderTree(), renderPersonCard(), renderParentChildConnections(), zoomIn/Out()
```

Styles are in `assets/css/arbol.css`. The HTML (`arbol-matrimonios.html`) is 81 lines with no inline CSS or JS.

**Data source:** `data/arbol.db` (SQLite) is the source of truth. At build time, `scripts/build.js` calls `scripts/export_arbol.py`, which reads the DB and writes `assets/data/arbol.json`. The tree page only ever reads the static JSON — it never touches the DB or any external service.

**Managing people:**
```bash
python3 scripts/gestionar_arbol.py list          # all people
python3 scripts/gestionar_arbol.py show <id>     # detail
python3 scripts/gestionar_arbol.py add           # interactive add
python3 scripts/gestionar_arbol.py edit <id>     # interactive edit
```

**One-time migration script** (already ran): `scripts/import_arbol.py` — imports from `arbol.json` into the DB. Only needed to bootstrap a fresh DB.

**Data schema** (`arbol.json` rows / DB columns):
```
{ id, name, birth_date, birth_place, death_date, death_place,
  spouseId, childrenIds, fatherId, motherId, branch, generation, order, vivo }
```
Dates are stored as ISO `YYYY-MM-DD` in the DB and exported as `Date(Y,M,D)` (JS 0-indexed month) in the JSON, which is what `render.js` expects. See `data/README.md` for full schema details.

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
