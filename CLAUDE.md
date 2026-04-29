# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build: compile all Markdown posts to HTML and regenerate blog-entries.json
npm run build

# Dev server: build then serve at http://localhost:8000
npm run dev

# Manage posts
npm run list-posts
npm run delete-post <slug>   # removes .md, dist/blog/<slug>.html, and JSON entry

# Image optimization (requires sharp)
npm run optimize-images      # reads img/original/, outputs to img/ as WebP

# Deploy to GitHub Pages
npm run deploy               # or: ./deploy.sh
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

- `index.html` — home; renders a hardcoded set of cards via inline JS (does not use `blog-entries.json` for display, only loads it to trigger the `getDataPath` call)
- `blog.html` — blog listing; fetches `assets/data/blog-entries.json` and renders cards dynamically
- `arbol-matrimonios.html` — interactive family tree (self-contained, no external data)
- `archivo.html` — document/photo archive viewer

### Images

- **Originals**: `assets/images/original/` (gitignored)
- **Cards** (280×380 approx): `assets/images/cards/` — used in `blog-entries.json` and home cards
- **Post images**: `assets/images/posts/` — referenced in Markdown post bodies
- **Avatars**: `assets/images/avatars/`

In Markdown posts, Obsidian-style `![[filename.jpg]]` syntax is supported and auto-converted to standard Markdown pointing to `../../assets/images/posts/filename.jpg` during build.

## Frontend Design

When building or significantly changing UI, use the skill defined in `frontend-design/SKILL.md`. Key rules:

- Pick one visual direction and commit to it — do not mix aesthetics
- Define type hierarchy, color variables, spacing rhythm, and layout logic before coding
- Flat empty backgrounds, generic card grids, and interchangeable SaaS patterns are anti-patterns here
- Motion should be meaningful: one well-directed sequence beats scattered micro-interactions
- Preserve the existing design system when working inside an existing page
