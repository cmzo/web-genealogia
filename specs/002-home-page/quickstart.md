# Quickstart: Home Page

**Feature**: 002 — Home Page
**Date**: 2026-04-27

---

## Phase 1 validation — static structure

```bash
# Serve from project root
npm run serve   # or: python3 -m http.server 8000

# Open http://localhost:8000
```

**Desktop (1280px)**:
- [ ] Site name "Clemenzo de Ardón" visible above the fold in display serif font.
- [ ] Three navigation cards (Árbol, Perfiles, Blog) visible in a 3-column grid.
- [ ] Clicking each card navigates to the correct section URL.
- [ ] Featured section is NOT visible (no JSON served yet — `hidden` remains).
- [ ] No console errors.

**Mobile (375px — DevTools responsive mode)**:
- [ ] Three cards stack to single column.
- [ ] No horizontal scrolling.
- [ ] All text is legible without zooming.

---

## Phase 2 validation — featured ancestor

**Prerequisite**: `data/individuals.json` must exist (run Feature 001 pipeline first,
or create a minimal fixture file).

```bash
# Minimal fixture to test without running the full pipeline
mkdir -p data
cat > data/individuals.json << 'EOF'
[
  {
    "id": "fcl-001",
    "first_name": "Francisco",
    "last_name": "Clemenzo",
    "birth_date": "1872-03-15",
    "birth_place": "Ardón, León, España",
    "death_date": "1951-11-02",
    "death_place": "Buenos Aires, Argentina",
    "father_id": null,
    "mother_id": null,
    "notes": "Emigró a Argentina en 1903.",
    "featured": true
  }
]
EOF

npm run serve
```

**Checks**:
- [ ] Featured section becomes visible after a brief moment (JSON load).
- [ ] Shows Francisco Clemenzo's name, birth year, birth place, and note excerpt.
- [ ] "Ver perfil →" link points to `/profiles/fcl-001`.
- [ ] Removing `"featured": true` from the fixture still shows the record (fallback).
- [ ] Replacing the array with `[]` keeps the featured section hidden — no error.
- [ ] Serving with DevTools → Network → Offline still shows the hero and cards
  (featured section hidden because JSON not cached yet on first visit).

---

## Accessibility checks

- [ ] Tab through the page: hero links, nav cards, featured link — all focusable in logical order.
- [ ] Screen reader announces "Secciones principales" nav landmark for the cards.
- [ ] Featured person name link has descriptive text (not just "Ver perfil").

---

## Performance check

- [ ] Open DevTools → Lighthouse → run Desktop audit.
- [ ] Performance score ≥ 90.
- [ ] No render-blocking resources (fonts use `display=swap`; home.js is a module).
