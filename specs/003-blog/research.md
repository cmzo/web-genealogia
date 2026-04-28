# Research: Blog

**Feature**: 003 — Blog
**Date**: 2026-04-27

All technical decisions were provided by the project author. No open questions remain.

---

## Decision 1 — No runtime Markdown / SSG

**Decision**: Posts are authored directly in HTML using a copy-and-fill template.
No Markdown parser runs in the browser; no static site generator (SSG) is used.

**Rationale**: The author is comfortable with HTML. Avoiding a build tool means
there is no toolchain to maintain, no dependency to update, and no build step to
run before authoring. The template enforces consistent structure. This also aligns
with the constitution's "no heavy framework" principle.

**Alternatives considered**: Marked.js runtime Markdown parsing — violates the
constitution's zero-JS-on-post-pages goal; also means posts are not readable
without JS. Eleventy/Jekyll SSG — adds toolchain complexity the author doesn't want.

---

## Decision 2 — `blog-index.json` maintained manually

**Decision**: The author adds an entry to `data/blog-index.json` by hand each time
a new post is published. No automated generation.

**Rationale**: Manual maintenance is viable for a personal blog with tens of posts
(not thousands). It keeps the pipeline simple and gives the author control over the
excerpt text (which cannot be reliably auto-extracted from arbitrary HTML).

**Future option**: A lightweight Node.js script that scans `blog/posts/*.html`,
extracts `<title>` and `<time datetime>`, and rebuilds `blog-index.json` — if the
author finds manual maintenance burdensome.

---

## Decision 3 — Reading column 680px

**Decision**: `.post` has `max-width: 680px` centred within the 1100px content area.

**Rationale**: ~65–70 characters per line at 1.05rem — the widely accepted optimal
reading width for long-form text. The constitution specifies "approximately 60–75
characters per line".

---

## Decision 4 — Zero JS on post pages

**Decision**: Post HTML files are fully self-contained static HTML. No JS is
required to read a post. `blog.js` is only loaded by `blog/index.html`.

**Rationale**: Progressive enhancement baseline. Post content is accessible to
users with JS disabled, search engine crawlers, and screen readers — all read the
HTML directly.

---

## Decision 5 — Profile cross-links by `id`

**Decision**: Within post bodies, links to individual profiles use the individual's
permanent `id` as the URL: `/profiles/[id].html`.

**Rationale**: Consistent with the constitution's permalink stability principle.
The `id` is permanent; name changes do not break existing post links.

---

## Resolved Unknowns

No NEEDS CLARIFICATION markers. All decisions resolved from author input.
