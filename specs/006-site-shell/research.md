# Research: Navigation, Changelog & Site Shell

**Feature**: 006 — Navigation, Changelog & Site Shell
**Date**: 2026-04-28

---

## Decision 1 — `base.css` as single source of design tokens

**Decision**: All CSS custom properties from the constitution (colors, fonts,
spacing, layout constants) are defined once in `base.css`. All other stylesheets
reference these variables — no hardcoded values outside `:root`.

**Rationale**: Constitution Principle II requires all color values to be expressed
via CSS custom properties and prohibits hardcoding. Centralising the token layer
in a single file means the palette can be updated in one place. `base.css` is the
first `<link>` on every page so the cascade works correctly.

---

## Decision 2 — JS-driven hamburger toggle, not CSS-only

**Decision**: The mobile hamburger is toggled by `nav.js` adding the `.is-open`
class to `<header>`. The toggle button is a semantic `<button>` with
`aria-expanded` and `aria-controls`.

**Rationale**: The classic CSS-only approach uses a hidden `<input type=checkbox>`
+ `<label>` as the toggle mechanism. While technically functional without JS, this
pattern has known accessibility issues: the checkbox is not exposed as a disclosure
widget to screen readers, requiring additional ARIA to work correctly. A `<button>`
with `aria-expanded` is the semantically correct and accessible pattern, and the
JS needed is only 5 lines. Progressive enhancement: without JS, the hamburger
button renders but the menu stays visible as a block list (acceptable fallback).

**Alternative rejected**: `<details>/<summary>` element — a valid pure-HTML
approach, but `.is-open` class-based toggle gives better animation control and
cleaner markup.

---

## Decision 3 — Fuse.js loaded lazily on first search activation

**Decision**: `nav.js` does not import or fetch Fuse.js or `search-index.json`
on page load. Both are loaded the first time the search icon is clicked (via
`loadIndex()` called in `openSearch()`).

**Rationale**: Every page on the site loads `nav.js`. Eagerly loading Fuse.js
(a 25 KB CDN file) and `search-index.json` on every page load penalises users
who never use the global search (the majority of page views). Deferred loading
means zero extra network requests on page load; the only cost is a ~100ms delay
on the very first search open.

---

## Decision 4 — Search activates after 3+ characters

**Decision**: The nav search overlay only runs Fuse.js and renders results when
the query has 3 or more characters. Below 3 characters, results are cleared.

**Rationale**: Queries shorter than 3 characters produce too many matches to be
useful (e.g., "C" would match most of the family). The threshold is consistent
with the spec clarification (Q4: results appear as-you-type) and the search-index
approach in Feature 005. Debounce of 200ms prevents firing on every keystroke.

---

## Decision 5 — Changelog as hand-authored `<dl>` list

**Decision**: `changelog.html` uses a `<dl>` (description list) with
`<div class="changelog__entry">` wrappers containing `<dt>` (date in `<time>`)
and `<dd>` (description). No JavaScript. No Markdown-to-HTML pipeline for this
page.

**Rationale**: The changelog is edited infrequently by a single author who is
comfortable with HTML. A `<dl>` is semantically correct for this term/definition
pattern (date = term, description = definition). No automated processing is needed:
add a new `<div class="changelog__entry">` block at the top.

**Alternative rejected**: Markdown file + build script — over-engineered for a
page with a few dozen entries, and adds a build dependency.

---

## Decision 6 — 404 page has no JavaScript

**Decision**: `404.html` loads only `base.css`, `nav.css`, and `footer.css`.
No `base.js` (no Service Worker registration), no `nav.js`.

**Rationale**: The 404 page should be as simple and fast as possible. Visitors
who land on a 404 are already in an error state — this is not the moment to
spend resources on SW registration or search. The navigation links in the 404
content are sufficient for orientation. The nav and footer HTML snippets are
still copied in, but they work without JS (section links are plain `<a>` tags).

---

## Decision 7 — Static HTML copy for nav/footer (no build-time includes)

**Decision**: The `<header>` and `<footer>` HTML snippets are copy-pasted into
every page. A `CONTRIBUTING.md` documents the process. No server-side includes,
no JS-injected fragments, no build step.

**Rationale**: The site has ~8 static page types. Copy-paste with documentation
is lower friction than adding a new build step or templating system. The pages
are already manually maintained — this is consistent with the constitution's
static-first principle and "no bundler" constraint.

**Trade-off accepted**: If the nav or footer is redesigned, all pages must be
updated. This is acceptable for an ~8-page site; a build-time include system
would be warranted at 20+ pages.

---

## Decision 8 — Search results capped at 8

**Decision**: `fuse.search(q, { limit: 8 })` — the nav search overlay shows a
maximum of 8 results.

**Rationale**: The nav search is a quick-access tool, not a full browse experience.
More than 8 results in a dropdown becomes hard to scan. Visitors who need to see
all matches can navigate to `/profiles/` where there is no result limit. This
also keeps the overlay from growing to an unreadable height on small screens.

---

## Resolved Unknowns

All technical decisions resolved from user input, spec clarifications, and prior
feature plans. No NEEDS CLARIFICATION items remain.
