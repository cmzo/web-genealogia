# Quickstart: Interactive Family Tree

**Feature**: 004 — Family Tree
**Date**: 2026-04-27

---

## Phase 0 — Fixture validation

Create the 50-person fixture and validate graph construction before writing any
renderer code:

```bash
# Create fixture directory
mkdir -p data/fixtures

# Run the loader in isolation (Node.js, no browser needed)
node --input-type=module << 'EOF'
import { loadTree } from './assets/js/tree-loader.js';
// Temporarily point at fixture:
const { root, individualsMap } = await loadTree('/data/fixtures/individuals-50.json');
console.log('Total nodes (incl. synthetic):', root.descendants().length);
console.log('Max depth:', root.height);
console.log('Unknown nodes:', root.descendants().filter(d => d.data.isUnknown).length);
EOF
```

**Expected results**:
- [ ] No uncaught exceptions.
- [ ] Total nodes ≥ 50 (synthetic "?" nodes are added on top).
- [ ] `console.warn` emitted for the cycle in the fixture.
- [ ] Every leaf node with an unknown parent has a synthetic "?" child.

---

## Phase 2 — Desktop tree renders

```bash
npm run serve   # serve from project root
```

Open `http://localhost:8000/tree/`:

- [ ] SVG tree renders with all 50 fixture nodes visible on first load.
- [ ] Unknown parent nodes show "?" label in a visually distinct style.
- [ ] Edges between parent and child nodes are visible (Bézier curves).
- [ ] Ancestros at the top (depth 0); descendants flow downward.
- [ ] No NaN positions; no overlapping nodes for a clean dataset.

---

## Phase 3 — Interactivity

- [ ] Click + drag pans the tree smoothly.
- [ ] Scroll wheel zooms in and out.
- [ ] Zoom is clamped: cannot zoom out past seeing the whole tree; cannot zoom in
  past individual node filling the screen.
- [ ] "Centrar árbol" button resets zoom/pan to initial view.
- [ ] Hovering a node shows tooltip with name, dates, and birth place.
- [ ] Tooltip hides when mouse leaves the node.
- [ ] Clicking a non-synthetic node navigates to `/profiles/[id].html`.
- [ ] Clicking the "?" node does nothing.

**Keyboard**:
- [ ] Tab key moves focus through visible nodes.
- [ ] Enter on a focused node navigates to its profile.
- [ ] Aria-label announced by screen reader: "Francisco Clemenzo, nacido 1872".

---

## Phase 4 — Virtualisation (use large fixture)

```bash
# Generate a 500-node fixture for performance testing
node scripts/generate-fixture.js --count 500 > data/fixtures/individuals-500.json
```

Open tree page with the large fixture:

- [ ] Initial render completes in < 3s.
- [ ] Pan/zoom at 500 nodes feels smooth (no noticeable frame drops).
- [ ] DevTools Performance panel shows RAF calls are <16ms.
- [ ] Nodes outside the viewport have `visibility: hidden` in the DOM.
- [ ] Nodes scroll into view as you pan.

---

## Phase 5 — Mobile view

Open DevTools → responsive mode → 375px width, reload:

- [ ] SVG tree is NOT rendered (D3 is not loaded; check Network tab).
- [ ] Search input is visible.
- [ ] Typing "Francisco" shows matching results.
- [ ] Selecting a result renders an ancestor chain of ≤ 6 items.
- [ ] Each chain item links to `/profiles/[id].html`.
- [ ] Chain items are readable and tappable.

---

## GEDCOM download

- [ ] "Descargar árbol genealógico (.ged)" link is visible on the tree page on
  desktop without scrolling.
- [ ] Clicking the link downloads `family.ged`.
- [ ] The downloaded file opens in Gramps without parse errors.

---

## Lighthouse

```bash
# Run on deployed GitHub Pages (not localhost — SW must be active)
npx lighthouse https://cmzo.github.io/genealogia/tree/ --only-categories=performance,accessibility
```

- [ ] Performance ≥ 90 (desktop preset).
- [ ] Accessibility ≥ 90.
