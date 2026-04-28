# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build: converts Markdown posts → HTML and regenerates blog-entries.json
npm run build

# Dev server: build + Python HTTP server on port 8000
npm run dev

# Static server (no build)
npm run serve

# List blog posts
npm run list-posts

# Delete a post (removes .md, generated HTML, and JSON entry)
npm run delete-post <slug>

# Optimize images (reads assets/images/original/, outputs cards/posts/avatars/)
npm run optimize-images

# Deploy: git commit + push (triggers GitHub Pages)
npm run deploy
```

## Architecture

This is a static site with a lightweight Node.js build pipeline. There is **no framework** — all pages are hand-written HTML files with inline CSS and JavaScript.

### Build pipeline

`scripts/build.js` is the core build tool:
1. Reads `.md` files from `content/posts/`
2. Parses YAML front matter (custom parser — not a standard library)
3. Converts Markdown to HTML via `marked`, with post-processing for: Obsidian `![[image]]` syntax, image lightboxes, auto-galleries (2+ consecutive images), blockquote styling, and iframe path correction
4. Injects into `content/templates/post-template.html` using `{{variable}}` placeholders
5. Writes HTML to `dist/blog/<slug>.html`
6. Writes metadata index to `assets/data/blog-entries.json`

The JSON at `assets/data/blog-entries.json` is what `blog.html` reads at runtime to populate the blog listing. If you add or remove a post, always re-run `npm run build` to keep it in sync.

### Routing / path resolution

`assets/js/path-config.js` sets `window.PATH_CONFIG` at runtime, switching between `./` (local dev) and `/<repoName>/` (GitHub Pages at `cmzo.github.io`). Pages use helper functions like `getDataPath()`, `getImagePath()` instead of hardcoded paths.

Generated blog posts live two levels deep (`dist/blog/`), so their relative paths back to assets use `../../assets/...`. The build script patches these automatically.

### Page inventory

| File | Purpose |
|------|---------|
| `index.html` | Home — loads static card config + blog entries JSON |
| `blog.html` | Blog listing — reads `blog-entries.json` at runtime |
| `arbol-matrimonios.html` | Interactive family tree (D3.js), family data embedded inline |
| `francisco.html` | Dedicated page for Francisco Clemenzo |
| `archivo.html` | Document/photo archive |
| `mapa-ruta-francisco.html` / `mapa-clemenzos.html` | Leaflet.js maps |
| `admin.html` | Local-only admin panel for post management |
| `dist/blog/*.html` | Generated blog posts (committed, served via GitHub Pages) |

### Content authoring

Blog posts are Markdown files in `content/posts/` with front matter:

```markdown
---
title: "Post title"
kicker: "Short subtitle shown under title"
description: "Card description"
image: "assets/images/cards/image.webp"
category: "categoria"
date: "2024-01-15"
tags: "tag1, tag2"
featured: true
slug: "url-slug"
aside: |
  Markdown content for the sidebar
---

Post body in Markdown...
```

`title` and `kicker` are required. Obsidian `![[filename.jpg]]` image syntax is automatically rewritten to `../../assets/images/posts/filename.jpg`.

### Deployment

The site is hosted on GitHub Pages. `dist/` is **not** gitignored — generated HTML is committed and served directly. After any content change, run `npm run build` before committing.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/006-site-shell/plan.md`.
<!-- SPECKIT END -->
