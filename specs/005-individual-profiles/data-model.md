# Data Model: Individual Profiles

**Feature**: 005 — Individual Profiles
**Date**: 2026-04-27

---

## Input: `data/individuals.json`

Consumed read-only. Full schema in `specs/001-data-pipeline-foundation/data-model.md`.
Fields used by `generate-profiles.js`:

| Field | Used for |
|-------|---------|
| `id` | Filename (`[id].html`); URL slug; family link construction |
| `first_name`, `last_name` | Page title; `<h1>`; family link labels |
| `birth_date`, `birth_place` | Birth section |
| `death_date`, `death_place` | Death section |
| `father_id`, `mother_id` | Family section links |
| `notes` | Notes section (split on `\n\n` → `<p>` tags) |

---

## Input: `data/files.json`

Consumed read-only. Full schema in `specs/001-data-pipeline-foundation/data-model.md`.
Fields used by `generate-profiles.js`:

| Field | Used for |
|-------|---------|
| `individual_id` | Key for filesMap lookup; associates file with a profile |
| `file_type` | `"image"` → gallery thumb + lightbox; `"document"` → download link |
| `url` | `src` attribute (image) or `href` (document link) |
| `caption` | `alt` attribute on `<img>`; `data-caption` for lightbox; link text for documents |
| `date` | Optional display alongside caption in gallery item |

---

## Internal: Template Context Object

The object built by `generate-profiles.js` for each individual, before HTML sections
are rendered and placeholders are replaced.

```js
{
  // Identity
  id:               string,        // individual id — used as URL slug and tree link param

  // Head / meta
  page_title:       string,        // `${full_name} | Clemenzo de Ardón`
  meta_description: string,        // e.g. "Nacido en 1872 en Ardón. Fallecido en 1951."
  og_title:         string,        // same as page_title
  og_description:   string,        // same as meta_description
  og_image_tag:     string,        // `<meta property="og:image" content="...">` or ''
  og_url:           string,        // `https://cmzo.github.io/genealogia/profiles/${id}.html`

  // Body placeholders — each is a complete HTML string (empty string = section omitted)
  full_name:        string,        // `${first_name} ${last_name}` (HTML-escaped)
  individual_id:    string,        // same as id — for `/tree/?highlight={{individual_id}}`
  birth_section:    string,        // <p class="profile__dates">n. <time>…</p>  or  ''
  death_section:    string,        // <p class="profile__dates--death">† <time>…</p>  or  ''
  family_section:   string,        // <section class="profile__family">…</section>  or  ''
  notes_section:    string,        // <section class="profile__notes">…</section>  or  ''
  gallery_section:  string,        // <section class="profile__gallery">…</section>  or  ''
}
```

---

## Internal: Search Index Entry

Produced by Feature 001's `generate-search-index.js`. Consumed read-only by
`profiles-search.js`. Schema defined in `specs/001-data-pipeline-foundation/data-model.md`.

```js
{
  id:          string,
  first_name:  string,
  last_name:   string,
  birth_place: string | null,
  birth_date:  string | null,   // YYYY-MM-DD
  death_date:  string | null,   // YYYY-MM-DD
}
```

Fuse.js searches over `first_name`, `last_name`, and `birth_place` with `threshold: 0.35`.

---

## Internal: Children Map

Built in-memory during generation. Maps each individual `id` to the array of
individuals that reference it as `father_id` or `mother_id`.

```js
// Type: Map<string, Individual[]>
// Example:
childrenMap.get('fcl-001')
// → [{ id: 'fcl-010', first_name: 'José', last_name: 'Clemenzo', ... },
//    { id: 'fcl-011', first_name: 'Ana',  last_name: 'Clemenzo', ... }]
```

Not serialised. Built once per generation run, discarded after all profiles are written.

---

## Internal: Files Map

Built in-memory during generation. Maps each `individual_id` to the ordered array
of their associated files.

```js
// Type: Map<string, File[]>
// Example:
filesMap.get('fcl-001')
// → [{ file_id: 'f-001', file_type: 'image', url: 'https://…', caption: 'Foto 1920' },
//    { file_id: 'f-002', file_type: 'document', url: 'https://…', caption: 'Acta de nacimiento' }]
```

Not serialised. Built once per generation run from `files.json`.

---

## Output: `profiles/[id].html`

A complete static HTML file per individual. The filename is `[id].html` where
`[id]` is the individual's permanent `id` field from `individuals.json`.

Files in this directory that are NOT profiles:
- `index.html` — the search/browse page (hand-authored)
- `profile-template.html` — the generation template (not served as a profile)

---

## Output: `sitemap.xml`

Produced by `scripts/generate-sitemap.js`. Written to repo root.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://cmzo.github.io/genealogia/</loc></url>
  <url><loc>https://cmzo.github.io/genealogia/blog/</loc></url>
  <url><loc>https://cmzo.github.io/genealogia/tree/</loc></url>
  <url><loc>https://cmzo.github.io/genealogia/profiles/</loc></url>
  <url><loc>https://cmzo.github.io/genealogia/profiles/fcl-001.html</loc></url>
  <!-- one <url> entry per generated profile -->
</urlset>
```
