# Data Model: Blog

**Feature**: 003 — Blog
**Date**: 2026-04-27

---

## `data/blog-index.json`

A manually maintained JSON array of post metadata. The listing page (`blog/index.html`)
reads this file at runtime via `blog.js` to render the post cards.

```json
[
  {
    "slug":    "string — permanent URL identifier; matches the filename blog/posts/[slug].html",
    "title":   "string — post title, shown in the listing card and used as <title>",
    "date":    "string (YYYY-MM-DD) — publication date",
    "excerpt": "string | null — 1–2 sentence summary shown in the listing card"
  }
]
```

**Constraints**:
- The array MUST be sorted newest-first (most recent `date` at index 0). The listing
  page does not re-sort; it renders entries in the order they appear in this file.
- `slug` MUST be a valid URL path segment: lowercase, hyphens only, no spaces or
  special characters. It MUST match the filename `blog/posts/[slug].html` exactly.
- `slug` MUST be permanent — once a post is published, its slug MUST NOT change
  (to avoid breaking links shared by family members).
- `date` MUST conform to `YYYY-MM-DD`.
- `excerpt` is optional (`null` is valid); if present, it SHOULD be ≤300 characters.
  The listing card omits the excerpt block when `null`.
- The file is maintained manually by the site author. There is no automated generation.

**Example**:

```json
[
  {
    "slug":    "linea-de-tiempo-francisco",
    "title":   "Línea de tiempo de Francisco Clemenzo",
    "date":    "2026-04-15",
    "excerpt": "Un recorrido por los momentos clave en la vida de Francisco, desde Ardón hasta Buenos Aires."
  },
  {
    "slug":    "origenes-familia-clemenzo",
    "title":   "Los orígenes de la familia Clemenzo en León",
    "date":    "2025-11-03",
    "excerpt": "Investigación sobre los registros parroquiales del municipio de Ardón a finales del siglo XIX."
  }
]
```

---

## Post HTML file

Individual post files are not data in the JSON sense — they are hand-authored HTML.
The schema that each post file MUST follow is enforced by the template
(`blog/post-template.html`) rather than by a parser.

**Required elements in each post file**:

| Element | Requirement |
|---------|-------------|
| `<title>` | `{Post Title} — Clemenzo de Ardón` |
| `<meta name="description">` | Matches `excerpt` in `blog-index.json` |
| `<h1 id="post-title">` | Matches `title` in `blog-index.json` |
| `<time datetime="YYYY-MM-DD">` | Matches `date` in `blog-index.json` |
| `<article>` wrapping | Mandatory semantic wrapper |
| `<section class="post__body">` | Contains all body content |

**Profile cross-links** within post bodies use the individual's permanent `id`:
```html
<a href="/profiles/fcl-001.html">Francisco Clemenzo</a>
```

The `id` here is the same `id` field from `data/individuals.json` (Feature 001).
