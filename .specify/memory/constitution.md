<!--
SYNC IMPACT REPORT
==================
Version change: (blank template) → 1.0.0
Bump rationale: MINOR — Initial ratification; all sections are new additions.

Modified principles: N/A (initial constitution)

Added sections:
  - I. Static-First
  - II. Content-First Design
  - III. Data Integrity & Permalink Stability
  - IV. Performance
  - V. Desktop-First, Mobile-Aware
  - VI. Accessibility
  - Design System & Architecture (Section 2)
  - Development Workflow (Section 3)
  - Governance

Removed sections: N/A

Templates reviewed:
  ✅ .specify/templates/plan-template.md     — Constitution Check section is generic; no changes needed.
  ✅ .specify/templates/spec-template.md     — Structure aligns with project type; no changes needed.
  ✅ .specify/templates/tasks-template.md    — Task phases align with static-site workflow; no changes needed.
  ✅ .specify/templates/checklist-template.md — Generic structure; no changes needed.

Deferred TODOs: none — all placeholders resolved.
-->

# Clemenzo de Ardon — Constitution

## Core Principles

### I. Static-First

The site MUST be hosted on GitHub Pages as a fully static site with no server-side rendering.
All data originating from Google Sheets MUST be pre-fetched at build time (via GitHub Actions)
and committed as static JSON files (`data/individuals.json`, `data/files.json`). The frontend
MUST read these static files at runtime — never call the Sheets API or expose API keys in
client-side code. A scheduled or push-triggered GitHub Action owns the data-refresh cycle.

**Rationale**: GitHub Pages cannot run server-side code. Pre-fetching eliminates runtime API
latency, quota concerns, and credential exposure.

### II. Content-First Design

The visual design MUST recede and let the content — names, dates, photographs, documents —
take centre stage. The aesthetic is archival and editorial, never tech-product.

- Typography MUST use a characterful serif for headings (`Playfair Display`, `Lora`, or
  `EB Garamond`) and a highly legible body face (`Source Serif 4`, `Literata`, or `Spectral`).
  Dates and labels use a monospace face (`IBM Plex Mono` or equivalent).
- The color palette MUST be expressed exclusively via CSS custom properties (see Design System
  section). No color value may be hardcoded outside `:root`.
- Layout MUST use a max content width of `1100px`, centred with generous whitespace. The
  family-tree page MAY use full viewport dimensions.
- Avoid: Inter, Roboto, system-ui as primary display or body fonts.

**Rationale**: The site serves family members and researchers; the documents and genealogical
data are the product, not the interface.

### III. Data Integrity & Permalink Stability

- Every individual MUST have a permanent `id` field (from Sheet 1) that serves as the URL slug
  for their profile page (`/profiles/[id].html`). Names change; IDs MUST NOT.
- All JSON keys MUST use `snake_case` matching the Sheet column names exactly.
- Sheet schemas (Sheet 1: individuals, Sheet 2: files/media) MUST be treated as stable
  contracts. Column renames or removals require a deliberate amendment to this constitution
  and a corresponding migration of all downstream JSON consumers.
- Do not expose Google Sheets API keys in any client-side code. Use published CSV endpoints
  or the pre-fetch GitHub Action approach only.

**Rationale**: Family members share and bookmark profile links. A broken URL is a broken
record. Stable IDs are the genealogical equivalent of a primary key.

### IV. Performance

- Target Lighthouse score: ≥ 90 on desktop before shipping any feature.
- Images in file galleries MUST be lazy-loaded (`loading="lazy"`).
- Family-tree rendering MUST virtualise off-screen nodes for trees of 500+ individuals.
- Fonts MUST use `preconnect` hints and `font-display: swap`.
- No heavy UI framework (React, Vue, Angular) is permitted. Vanilla JS or a lightweight
  bundler (Vite) is the approved stack. Justify any deviation in the Complexity section of
  the relevant plan.
- The data-access path MUST be: build-time JSON fetch → static file → client reads JSON.
  No runtime Sheet API calls.

**Rationale**: The site must load fast on consumer hardware and residential connections for
family members who are not power users.

### V. Desktop-First, Mobile-Aware

- The primary design surface is desktop (≥ 1024px). Full tree view, multi-column layouts,
  and side-by-side profile panels are desktop-native.
- Tablet (768px – 1023px): reduced padding; tree may require horizontal scroll.
- Mobile (< 768px): single-column layout; navigation collapses to a hamburger menu; the
  family tree MUST switch to a simplified ancestor-list or horizontal-scroll view.
- Mobile support MUST NOT compromise desktop usability. Desktop is the authoritative
  design reference.

**Rationale**: The target audience primarily accesses family research sites on desktop; the
interactive tree is inherently a space-hungry visualisation that degrades gracefully rather
than being redesigned from mobile-up.

### VI. Accessibility

- All images MUST have meaningful `alt` text, sourced from the `caption` field in Sheet 2.
- Family-tree nodes MUST be keyboard-navigable (focus management, Enter/Space to activate).
- Color contrast MUST meet WCAG AA minimum (4.5:1 for body text, 3:1 for large text).
- Dates and places MUST use `<time>` elements with `datetime` attributes where appropriate.
- No information may be conveyed by color alone.

**Rationale**: Accessibility is non-negotiable even for a family-only site; some family
members may use assistive technology, and accessibility practices also improve SEO.

## Design System & Architecture

### Color Palette (CSS custom properties — do not hardcode)

```css
:root {
  --color-bg:          #FAF8F5;
  --color-surface:     #F2EFE9;
  --color-border:      #DDD8CE;
  --color-text:        #1C1A17;
  --color-text-muted:  #6B6559;
  --color-accent:      #8B5E3C;
  --color-accent-hover:#6B4629;
}
```

### Spacing

Base unit: `8px`. All spacing, padding, and margin values MUST be multiples of this unit.

### Naming Conventions

```
HTML files:   kebab-case.html
CSS:          BEM (.profile-card, .profile-card__name, .profile-card--featured)
JavaScript:   camelCase variables/functions | PascalCase classes | SCREAMING_SNAKE_CASE constants
JSON keys:    snake_case (matching Sheet column names)
```

### Directory Structure

```
/
├── index.html
├── blog/
│   ├── index.html
│   └── [slug].html
├── tree/
│   └── index.html
├── profiles/
│   ├── index.html
│   └── [id].html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── data/
│   ├── individuals.json   # pre-fetched from Sheet 1
│   └── files.json         # pre-fetched from Sheet 2
└── .specify/
```

### Sheet Data Schemas

**Sheet 1 — Individuals**:
`id`, `first_name`, `last_name`, `birth_date` (YYYY-MM-DD), `birth_place`, `death_date`,
`father_id`, `mother_id`, `notes`

**Sheet 2 — Files & Media**:
`file_id`, `individual_id`, `file_type` (enum: image|document), `url`, `caption`, `date`

## Development Workflow

1. **Local dev**: Static file server (`npx serve`, VS Code Live Server, or `vite`).
2. **Branching**: `main` is production. Feature work on `feature/[name]` branches.
3. **Deployment**: Push to `main` triggers GitHub Pages deploy (automatic or via GitHub Actions).
4. **Data refresh**: A GitHub Action fetches Sheet data and commits updated JSON on a schedule
   (daily recommended) or on manual trigger. The Action MUST NOT expose API credentials in
   logs or committed files.
5. **Build gate**: Run `npm run build` (or equivalent) and verify Lighthouse ≥ 90 on desktop
   before merging any feature branch.

## Governance

This constitution supersedes all other practices, conventions, and ad-hoc decisions made during
feature development. When a plan or implementation conflicts with a principle here, the
constitution governs — amend it if the conflict reveals a genuine gap rather than silently
ignoring it.

**Amendment procedure**:
1. Identify the principle or section to change and document the reason.
2. Update this file, increment the version per semver rules (MAJOR: removals/redefinitions;
   MINOR: additions/expansions; PATCH: clarifications/wording).
3. Run the consistency propagation checklist against all templates.
4. Record the change in a `SYNC IMPACT REPORT` comment at the top of this file.
5. Commit with message: `docs: amend constitution to vX.Y.Z (<summary>)`.

**Compliance**: All feature plans MUST include a "Constitution Check" section that explicitly
validates each applicable principle before Phase 0 research begins and again after Phase 1 design.

---

**Version**: 1.0.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-27
