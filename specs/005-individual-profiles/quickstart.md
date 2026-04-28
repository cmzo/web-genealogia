# Quickstart: Individual Profiles

**Feature**: 005 — Individual Profiles
**Date**: 2026-04-27

---

## Phase 0 — Template validation

Create a minimal fixture and confirm the template and generator work end-to-end:

```bash
# Fixture: one individual with all fields populated
node --input-type=module << 'EOF'
import { writeFile } from 'node:fs/promises';
const individuals = [{
  id: 'fcl-001', first_name: 'Francisco', last_name: 'Clemenzo',
  birth_date: '1872-01-01', birth_place: 'Ardón',
  death_date: '1951-05-15', death_place: 'Buenos Aires',
  father_id: null, mother_id: null,
  notes: 'Primer párrafo biográfico.\n\nSegundo párrafo con más detalle.'
}];
await writeFile('data/individuals.json', JSON.stringify(individuals));
await writeFile('data/files.json', JSON.stringify([]));
console.log('Fixture written.');
EOF

node scripts/generate-profiles.js
```

**Expected results**:
- [ ] No uncaught exceptions.
- [ ] `"1 profiles written."` logged.
- [ ] File `profiles/fcl-001.html` created.
- [ ] `<h1>` contains "Francisco Clemenzo".
- [ ] Notes rendered as two `<p>` tags (split on `\n\n`).
- [ ] No empty `<section>` elements in the output.
- [ ] No raw `{{placeholder}}` tokens remain in the output.

---

## Phase 1 — Full profile view (with files)

```bash
# Add image and document to fixture
node --input-type=module << 'EOF'
import { writeFile } from 'node:fs/promises';
const files = [
  { file_id: 'f-001', individual_id: 'fcl-001', file_type: 'image',
    url: 'https://via.placeholder.com/400', caption: 'Foto circa 1920', date: null },
  { file_id: 'f-002', individual_id: 'fcl-001', file_type: 'document',
    url: 'https://example.com/acta.pdf', caption: 'Acta de nacimiento', date: null }
];
await writeFile('data/files.json', JSON.stringify(files));
EOF

node scripts/generate-profiles.js
npm run serve
```

Open `http://localhost:8000/profiles/fcl-001.html`:

- [ ] Name visible in `<h1>`.
- [ ] Birth date and place visible.
- [ ] Death date and place visible.
- [ ] Image thumbnail present with `loading="lazy"` attribute.
- [ ] Document shows as a link (not an image).
- [ ] Gallery section heading "Archivos" visible.
- [ ] Tree link present: `href` contains `/tree/?highlight=fcl-001`.

---

## Phase 1b — Minimal profile (sparse data)

```bash
node --input-type=module << 'EOF'
import { writeFile } from 'node:fs/promises';
await writeFile('data/individuals.json', JSON.stringify([
  { id: 'fcl-999', first_name: 'Desconocido', last_name: 'Clemenzo',
    birth_date: '1900-01-01', birth_place: null,
    death_date: null, death_place: null,
    father_id: null, mother_id: null, notes: null }
]));
await writeFile('data/files.json', JSON.stringify([]));
EOF

node scripts/generate-profiles.js
```

Open `http://localhost:8000/profiles/fcl-999.html`:

- [ ] Only name and birth date visible.
- [ ] No death section.
- [ ] No family section.
- [ ] No notes section.
- [ ] No gallery section.
- [ ] Page looks polished — no empty boxes or "Unknown" placeholders.

---

## Phase 2 — Profiles index and search

```bash
npm run serve
```

Open `http://localhost:8000/profiles/`:

- [ ] Search input visible and focusable.
- [ ] On load: last 20 added individuals shown (no search term needed).
- [ ] Typing "Clemenz" (partial) shows Francisco Clemenzo.
- [ ] Typing "Klemenso" (misspelled) shows relevant results.
- [ ] Typing a birth place returns individuals born there.
- [ ] Typing a query with no matches shows: "No se encontraron personas con ese nombre."
- [ ] Clicking a result card navigates to the correct `[id].html`.
- [ ] Results update as-you-type (debounced ~200ms).

---

## Phase 3 — Lightbox

Open `http://localhost:8000/profiles/fcl-001.html` (profile with image):

- [ ] Clicking the image thumbnail opens the lightbox.
- [ ] Full-size image visible; caption shown below.
- [ ] With multiple images: ← → arrow buttons visible and functional.
- [ ] With single image: prev/next buttons hidden.
- [ ] Left/right keyboard arrow keys navigate images.
- [ ] Esc key closes the lightbox.
- [ ] Clicking the overlay background (outside image) closes the lightbox.
- [ ] After closing: focus returns to the thumbnail that was clicked.
- [ ] Tab key stays within the lightbox while it is open (focus trap).
- [ ] Document file shows as a link — clicking does NOT open lightbox.

---

## Phase 4 — Sitemap + Open Graph tags

```bash
node scripts/generate-sitemap.js
```

- [ ] `sitemap.xml` created at repo root.
- [ ] Contains `<loc>` entry for `…/profiles/fcl-001.html`.
- [ ] Contains entries for `/`, `/blog/`, `/tree/`, `/profiles/`.
- [ ] No duplicate entries.

Open profile in browser, inspect `<head>`:

- [ ] `<title>` = "Francisco Clemenzo | Clemenzo de Ardón".
- [ ] `<meta name="description">` populated.
- [ ] `<meta property="og:title">` present.
- [ ] `<meta property="og:url">` matches canonical profile URL.
- [ ] `<meta property="og:image">` present when profile has images.
- [ ] `<meta property="og:image">` ABSENT when profile has no images.

---

## Edge Cases

- [ ] `father_id` pointing to non-existent ID: father link silently omitted, no error.
- [ ] `mother_id` pointing to non-existent ID: mother link silently omitted, no error.
- [ ] Very long unbroken string in notes: renders safely without breaking layout (CSS word-break).
- [ ] Notes with HTML special characters (`<`, `>`, `&`): escaped correctly in output.
- [ ] Individual with image but empty `caption`: `alt=""` and `aria-label=""` are acceptable (image is decorative).
- [ ] `profiles/nonexistent.html`: GitHub Pages returns its 404 page (graceful; no profile-specific handling needed).

---

## Lighthouse

```bash
# Run on deployed GitHub Pages (Service Worker must be active)
npx lighthouse https://cmzo.github.io/genealogia/profiles/fcl-001.html \
  --only-categories=performance,accessibility
```

- [ ] Performance ≥ 90 (desktop preset).
- [ ] Accessibility ≥ 90.
