# Research: Home Page

**Feature**: 002 — Home Page
**Date**: 2026-04-27

All technical decisions were provided by the project author. No open questions remain.

---

## Decision 1 — File location

**Decision**: `index.html` at the repository root.

**Rationale**: GitHub Pages serves `index.html` at the site root (`/`) automatically.
Placing it anywhere else would require explicit redirect rules.

---

## Decision 2 — CSS architecture

**Decision**: `assets/css/base.css` (shared variables + reset, owned by Feature 006)
imported by `assets/css/home.css` (home-specific styles). A minimal stub `base.css`
is created for this feature; Feature 006 replaces it with the full site version.

**Rationale**: Avoids duplicating the CSS custom properties palette defined in the
constitution across multiple files. The stub approach unblocks Feature 002 without
waiting for Feature 006.

---

## Decision 3 — Featured ancestor selection

**Decision**: `home.js` fetches `data/individuals.json` and picks the record with
`featured: true`; falls back to the record with the most recent `birth_date`; falls
back further to the first record in the array.

**Rationale**: Gives the author explicit control via a `featured` flag, with a
sensible automatic fallback for when the flag is not set. The selection is fully
deterministic.

**Alternatives considered**: A separate `featured.json` file — unnecessary overhead;
the flag approach requires no extra pipeline step.

---

## Decision 4 — Non-blocking render

**Decision**: `home.js` is a `type="module"` script at the bottom of `<body>`.
The featured section uses the `hidden` attribute; it becomes visible only after
JS populates it. No `async`/`defer` needed for module scripts (they are deferred
by default).

**Rationale**: The hero and navigation cards are visible immediately on parse.
The featured section appears as a progressive enhancement. If `individuals.json`
is unavailable (e.g., first deploy before pipeline runs), the page still works
perfectly — users see the hero and nav cards.

---

## Decision 5 — XSS safety

**Decision**: All Sheet-sourced strings inserted via `innerHTML` are sanitised
with a local `escapeHtml()` function before insertion.

**Rationale**: `individuals.json` is generated from user-controlled Sheets data.
Even though this is a personal site, escaping all interpolated values is the correct
default and costs nothing.

---

## Resolved Unknowns

No NEEDS CLARIFICATION markers. All decisions resolved from author input.
