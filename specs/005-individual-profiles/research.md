# Research: Individual Profiles

**Feature**: 005 — Individual Profiles
**Date**: 2026-04-27

---

## Decision 1 — Static generation with simple string replacement

**Decision**: Use `String.prototype.replaceAll()` on a single HTML template file.
No external template engine (Handlebars, EJS, Nunjucks, etc.).

**Rationale**: The constitution prohibits npm dependencies in the frontend bundle,
and adding a Node.js template engine just for build-time generation adds a
dependency that buys little over simple string replacement. Pre-rendering every
HTML section to a string in JS, then doing one `replaceAll` per placeholder,
keeps the generator dependency-free and the template readable as plain HTML.

**Alternative rejected**: EJS / Handlebars — would require an npm dep in
`scripts/package.json` and conditional logic inside the template file. Benefit
doesn't outweigh cost for a flat static site template.

---

## Decision 2 — Sections pre-rendered as HTML strings

**Decision**: Each conditional section (birth, death, family, notes, gallery) is
rendered entirely in JavaScript to an HTML string, then injected via a single
`{{placeholder}}` in the template. Empty sections produce an empty string.

**Rationale**: Eliminates conditional logic inside the template file. The template
stays readable HTML; all logic lives in the generator script. An empty section
placeholder produces an empty string, so no `<section>` element appears in the
output — satisfying FR-012 (no empty sections displayed).

---

## Decision 3 — Children map via parent reference inversion

**Decision**: Build `childrenMap: Map<parent_id, Individual[]>` in O(n) by
iterating all individuals once, recording who references each `id` as
`father_id` or `mother_id`. Build this map before the per-individual generation
loop.

**Rationale**: `individuals.json` stores `father_id` / `mother_id` on each
individual (child → parent direction). Profile pages also need the inverse
(parent → children). Building the inverse map once in O(n) avoids scanning
all individuals for each profile in O(n²). With hundreds of individuals, O(n²)
would make the build measurably slower.

---

## Decision 4 — Fuse.js v7 from CDN

**Decision**: Load Fuse.js v7 as an ES module import from
`https://unpkg.com/fuse.js@7/dist/fuse.esm.js`.

**Rationale**: The constitution prohibits npm bundling for the frontend. Fuse.js
is the only external JS dependency for profile search. CDN delivery is consistent
with the D3.js approach in Feature 004. Threshold `0.35` balances recall
(catching misspellings) against precision (not flooding results with unrelated
names).

**Alternative rejected**: Vendoring the file locally — possible, but CDN delivery
is the established pattern for this project (Feature 004 Decision 1).

---

## Decision 5 — Lightbox as progressive enhancement

**Decision**: Lightbox is a vanilla JS module loaded via `<script type="module">`
in the profile template. Gallery images are present in the DOM as `<img>` elements
inside `<button class="gallery__trigger">` even without JS. Without JS, buttons
do nothing; with JS, they open the lightbox.

**Rationale**: The profile page must be readable without JavaScript (constitution:
static-first). Using `<button>` elements (not `<a href="">`) for gallery triggers
means: without JS, images are still visible and downloadable via right-click;
with JS, the lightbox intercepts clicks. Focus management and focus trap satisfy
constitution Principle VI (Accessibility).

---

## Decision 6 — `og:image` omitted when no image exists

**Decision**: If an individual has no associated image files, the generator emits
`{{og_image_tag}}` as an empty string — no `<meta property="og:image">` is written.

**Rationale**: Social media crawlers handle missing OG image gracefully (show a
generic card). An invalid or empty `content` attribute on `og:image` causes
crawlers to log errors and may surface a broken image placeholder in shares.

---

## Decision 7 — Document files open in new tab, not lightbox

**Decision**: Gallery items with `file_type: 'document'` render as
`<a href="..." target="_blank" rel="noopener">` links, not lightbox triggers.

**Rationale**: PDFs and other document formats cannot be displayed inside an
`<img>` element. Opening in a new tab is the universally understood pattern
for file downloads. The spec assumption confirms: "clicking opens the file URL
in a new tab rather than a lightbox."

---

## Decision 8 — Sitemap reads the generated files directory

**Decision**: `generate-sitemap.js` reads the `profiles/` directory to discover
profile IDs, not `individuals.json`.

**Rationale**: The source of truth for what is actually deployed is the set of
generated files. Reading the directory guarantees the sitemap only lists pages
that exist on disk. If generation failed for some individuals (e.g., bad data),
those IDs are correctly absent from the sitemap.

---

## Resolved Unknowns

All technical decisions resolved from user input and prior feature plans.
No NEEDS CLARIFICATION items remain.
