# Quickstart: Navigation, Changelog & Site Shell

**Feature**: 006 — Navigation, Changelog & Site Shell
**Date**: 2026-04-28

---

## Phase 1 — `base.css` + Service Worker registration

```bash
npm run serve
```

Create a minimal test page (`test.html` at repo root):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/assets/css/base.css">
</head>
<body>
  <div class="container">
    <h1>Test heading</h1>
    <h2>Subheading</h2>
    <p>Body text. <a href="#">A link</a>.</p>
    <time>1872-01-01</time>
  </div>
</body>
</html>
```

Open `http://localhost:8000/test.html`:

- [ ] Background is `#FAF8F5` (warm off-white), not browser white.
- [ ] `<h1>` renders in a serif display font (Playfair Display or fallback).
- [ ] `<p>` renders in a body serif (Source Serif 4 or fallback).
- [ ] `<time>` renders in monospace and muted color.
- [ ] `<a>` renders in `#8B5E3C` accent color.
- [ ] No horizontal overflow on the page.
- [ ] `box-sizing: border-box` applied (verify via DevTools > Computed).

Open DevTools > Application > Service Workers — add `<script type="module" src="/assets/js/base.js"></script>` to test page:
- [ ] Service Worker registered (`sw.js` in scope `/`).

---

## Phase 2 — Desktop navigation

Add nav snippet to test page. Open `http://localhost:8000/test.html`:

- [ ] Sticky header visible at top, does not scroll away.
- [ ] Brand name "Clemenzo de Ardón" on the left.
- [ ] Section links (Inicio · Blog · Árbol · Personas) on the right.
- [ ] Search icon visible to the right of the links.
- [ ] No horizontal overflow at 1280px wide.
- [ ] Content body not hidden behind nav (`padding-top: var(--nav-height)` applied).

Active link highlighting (`nav.js` loaded):
- [ ] Visiting `/blog/index.html`: Blog link visually distinct (accent color + underline).
- [ ] Visiting `/profiles/index.html`: Personas link visually distinct.
- [ ] Visiting `/tree/index.html`: Árbol link visually distinct.
- [ ] No more than one link active at a time.

---

## Phase 3 — Mobile navigation + inline search

Open DevTools → responsive mode → 375px width:

- [ ] Desktop section links hidden.
- [ ] Hamburger button (3 bars) visible on the right.
- [ ] Search icon still visible alongside hamburger.
- [ ] Tapping hamburger: menu opens full-width with all 4 section links.
- [ ] Hamburger animates to X while menu is open.
- [ ] Tapping a section link: navigates correctly and menu closes.
- [ ] Tapping hamburger again: menu closes, animation reverses.
- [ ] `aria-expanded` on hamburger toggles between `"true"` and `"false"`.

**Search overlay (both desktop and mobile)**:
- [ ] Click search icon → search overlay appears below nav bar.
- [ ] Overlay input receives focus automatically.
- [ ] Typing fewer than 3 characters: no results shown.
- [ ] Typing "Clemenz" (3+ chars): results appear within 300ms (debounced 200ms).
- [ ] Results show name and birth year.
- [ ] Clicking a result navigates to `/profiles/[id].html`.
- [ ] Typing a query with no matches: "No se encontraron personas con ese nombre." shown.
- [ ] Press Esc: overlay closes, focus returns to search icon.
- [ ] Click outside overlay: overlay closes.
- [ ] Results capped at 8 items even for broad queries.

**Without JavaScript** (disable JS in DevTools):
- [ ] Section links in `<ul>` still visible and functional.
- [ ] Search icon button renders but does nothing (acceptable degradation).
- [ ] Hamburger button renders; mobile users can see section links as vertical list (acceptable fallback if CSS falls back gracefully).

---

## Phase 4 — Footer, Changelog, 404

**Footer** (add footer snippet to test page):
- [ ] Footer visible at bottom of page.
- [ ] "Clemenzo de Ardón" brand name present.
- [ ] Site description and Google Sheets credit visible.
- [ ] Links to Inicio, Blog, Árbol, Personas, Cambios all present.
- [ ] Footer links navigate correctly.
- [ ] On 375px: footer wraps to single column.

**Changelog** — open `http://localhost:8000/changelog.html`:
- [ ] Renders correctly without JavaScript.
- [ ] Entries shown newest-first (most recent `<dt>` date at top).
- [ ] Each entry shows date and description.
- [ ] Entries with optional links: links navigate correctly.
- [ ] Page includes nav and footer.

**Add a new changelog entry** (manual test for author workflow):
- [ ] Open `changelog.html`, prepend a new `<div class="changelog__entry">` block.
- [ ] Reload: new entry appears at top of list.

**404 page** — open `http://localhost:8000/404.html`:
- [ ] Page renders correctly.
- [ ] Site name "Clemenzo de Ardón" visible.
- [ ] Explanation text present.
- [ ] Link to home (`/`) present and functional.
- [ ] Link to profiles (`/profiles/`) present and functional.
- [ ] Nav and footer present (HTML static, no JS required).
- [ ] No JavaScript loaded on this page.

**GitHub Pages 404 test** (requires deployment):
- [ ] Navigate to `https://cmzo.github.io/genealogia/nonexistent-url` → custom `404.html` served (not GitHub's default 404).

---

## Lighthouse

```bash
# Run on deployed GitHub Pages
npx lighthouse https://cmzo.github.io/genealogia/ --only-categories=performance,accessibility
```

- [ ] Performance ≥ 90 (desktop preset).
- [ ] Accessibility ≥ 90.
- [ ] No "Missing alt text" or "Low contrast" failures.
- [ ] `<nav>` landmark detected.
- [ ] `<header>` and `<footer>` landmarks detected.
