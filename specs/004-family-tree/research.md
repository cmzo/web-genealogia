# Research: Interactive Family Tree

**Feature**: 004 — Family Tree
**Date**: 2026-04-27

---

## Decision 1 — D3.js v7 from CDN

**Decision**: Load D3.js v7 as an ES module from `unpkg.com/d3@7`. Vendorise
`assets/js/vendor/d3.min.js` as a fallback loaded via `<script nomodule>` or
inline fallback detection.

**Rationale**: The constitution prohibits npm dependencies in the browser bundle.
D3 is the only external JS dependency for this feature. CDN delivery avoids
bundling; vendor fallback ensures the page works if unpkg is unavailable.

**CDN URL**: `https://unpkg.com/d3@7/dist/d3.min.js`

---

## Decision 2 — D3 stratify + tree (Reingold-Tilford)

**Decision**: Use `d3.stratify()` to convert the flat `Individual[]` array to a
hierarchy, then `d3.tree()` for the Reingold-Tilford layout.

**Key insight**: Genealogical data is a **forest** (multiple disconnected subtrees),
not a single-root tree. `d3.stratify` requires exactly one root. Solution: inject
a synthetic `__root__` node as the parent of all real roots. The synthetic root is
excluded from rendering.

**Primary parent selection**: Each individual can have both `father_id` and
`mother_id`. `d3.stratify` supports only one `parentId` per node. The primary
parent for tree placement is `father_id` (paternal line); `mother_id` is stored as
metadata and rendered as a decorative secondary edge overlay (Phase 2 enhancement,
or deferred to v2).

---

## Decision 3 — Unknown parent nodes

**Decision**: For each `father_id` or `mother_id` that does not resolve to a known
individual, inject a synthetic node `{ id: "unknown-{parent}-{child_id}", first_name: "?",
isSynthetic: true }` so the branch always has a destination.

**Rationale**: Displaying open-ended branches (no node at the end) requires special
SVG handling and is visually ambiguous. A "?" node clearly communicates "this person
existed but is not recorded". Consistent with the spec requirement: "tree should
represent that gracefully rather than breaking or showing an error."

---

## Decision 4 — Viewport virtualisation via visibility toggle

**Decision**: Toggle `visibility: hidden` / `visibility: visible` on node `<g>`
elements for nodes outside the current viewport, throttled with
`requestAnimationFrame`. Threshold: activate above 150 nodes.

**Rationale**: DOM removal/insertion causes reflow and is expensive. `visibility`
toggle retains the element in the layout (no reflow) while stopping the browser
from painting it. This approach also keeps all nodes in the accessibility tree
(screen readers can still traverse them). RAF throttling prevents jank from
triggering virtualisation on every pixel of a drag.

**Alternative rejected**: Canvas — would sacrifice SVG accessibility (keyboard
navigation, aria-label, tab order), which the constitution requires.

---

## Decision 5 — Mobile: separate ancestor-chain module

**Decision**: Mobile breakpoint (`< 768px`) renders a completely different view
from `tree-mobile.js`: a search input → ancestor chain list. The SVG tree is not
rendered at all on mobile.

**Rationale**: The SVG tree at 375px viewport width with 200px-wide nodes would
require zooming in to see even a single node clearly. A dedicated linear ancestor
view is more useful and more usable on a small screen.

**Detection**: `window.matchMedia('(max-width: 767px)')` evaluated before module
import so D3 is not loaded at all on mobile.

---

## Decision 6 — SVG node size: 200 × 120px

**Decision**: Each node rect is `width: 180px, height: 80px` (within a 200×120px
cell including margins).

**Rationale**: Wide enough to show "Francisco Clemenzo" on one line at ~0.85rem.
Tall enough for name + two date lines. Tested against the longest expected names
in the dataset (~25 characters).

---

## Decision 7 — Cycle detection before render

**Decision**: Run a DFS traversal over the stratified hierarchy to detect cycles
(person A is ancestor of person B and B is ancestor of A). On detection: remove
the back-edge and `console.warn` with offending IDs. Do not crash.

**Rationale**: Genealogical data entry errors can produce cycles (e.g., a typo
makes someone their own ancestor). The tree must not hang or crash on bad data.

---

## Phase 0 Validation Plan

Before building the full renderer, validate the graph construction with a
50-person fixture:

1. Create `data/fixtures/individuals-50.json` with a representative 50-person
   dataset including: multiple roots, 3–4 generations, at least 5 unknown parents,
   and one cycle (to test cycle detection).
2. Load in browser console: verify `loadTree()` returns a valid hierarchy.
3. Verify synthetic nodes appear for all unknown parents.
4. Verify the cycle is detected and broken (console.warn visible).
5. Verify `d3.tree()` computes x/y coordinates without NaN.

Only after this validation passes: proceed to Phase 2.

---

## Resolved Unknowns

All technical decisions resolved from author input and D3.js documentation.
No NEEDS CLARIFICATION items remain.
