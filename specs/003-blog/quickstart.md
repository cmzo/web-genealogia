# Quickstart: Blog

**Feature**: 003 — Blog
**Date**: 2026-04-27

---

## Phase 1 — Post template & CSS

```bash
npm run serve   # or: python3 -m http.server 8000
```

**Create a test post**:
1. Copy `blog/post-template.html` → `blog/posts/test-post.html`.
2. Fill in title, date (`2026-04-27`), and a few paragraphs of body text.
3. Open `http://localhost:8000/blog/posts/test-post.html`.

**Checks (desktop 1280px)**:
- [ ] Title renders in display serif font, large and clear.
- [ ] Body text sits in a ~680px column centred on the page.
- [ ] Line height feels comfortable for long-form reading.
- [ ] `<time>` element shows human-readable date.
- [ ] "← Volver al blog" footer link works.
- [ ] A `<blockquote>` in the body has the left accent border.
- [ ] An `<img loading="lazy">` in the body renders correctly.

**Mobile (375px)**:
- [ ] Reading column fills the screen with comfortable side padding.
- [ ] No horizontal scrolling.

---

## Phase 2 — Listing + blog-index.json

**Create a minimal index**:

```bash
cat > data/blog-index.json << 'EOF'
[
  {
    "slug": "test-post",
    "title": "Artículo de prueba",
    "date": "2026-04-27",
    "excerpt": "Este es un extracto de prueba para verificar el listing del blog."
  },
  {
    "slug": "segundo-post",
    "title": "Segundo artículo",
    "date": "2026-03-15",
    "excerpt": null
  }
]
EOF
```

Open `http://localhost:8000/blog/`:

- [ ] Two post cards rendered in the listing.
- [ ] "Artículo de prueba" appears first (newest).
- [ ] "Segundo artículo" shows no excerpt (null entry).
- [ ] Clicking a card navigates to `/blog/posts/[slug].html`.
- [ ] Dates rendered in Spanish locale (e.g., "27 de abril de 2026").

**Error state**:
- Temporarily rename `data/blog-index.json` → `data/blog-index.json.bak`, reload listing.
- [ ] Friendly error message shown — no JS exception in console.
- Restore the file; reload.
- [ ] Posts reappear.

**Empty state**:
- Replace file content with `[]`, reload listing.
- [ ] "Aún no hay artículos publicados." message shown.

---

## Authoring workflow smoke test

1. Copy template → `blog/posts/nuevo-articulo.html`, fill content.
2. Prepend to `blog-index.json`:
   ```json
   { "slug": "nuevo-articulo", "title": "Nuevo artículo", "date": "2026-04-27", "excerpt": "Extracto." }
   ```
3. Reload listing → new post card appears at the top.
4. Click card → post page renders correctly.

Total steps: 3. No build command required. ✅
