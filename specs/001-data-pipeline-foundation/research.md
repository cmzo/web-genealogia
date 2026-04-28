# Research: Data Pipeline & Foundation

**Feature**: 001 — Data Pipeline & Foundation
**Date**: 2026-04-27
**Branch**: `001-data-pipeline-foundation`

## Summary

All technical decisions for this feature were provided by the project author.
No open questions remain. This document records the decisions and their rationale.

---

## Decision 1 — Pipeline Trigger

**Decision**: GitHub Actions workflow triggered on every push to `main` AND on a daily
schedule (`cron: '0 3 * * *'` — UTC 03:00).

**Rationale**: The push trigger ensures data is refreshed whenever the author deploys
content changes. The daily schedule ensures data stays current (≤24h stale) even
when no code changes are deployed, covering the case where the author updates only
the Google Sheets.

**Alternatives considered**: Manual trigger only — rejected because it requires author
action and violates SC-005 ("author never needs to manually trigger a data update").

---

## Decision 2 — Google Sheets Authentication

**Decision**: Google Sheets API v4 via Service Account. Credentials stored as GitHub
Secrets (`SHEETS_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`). Never committed to the repo.

**Rationale**: Service Account authentication is the correct choice for server-to-server
(CI/CD) access to Sheets. It does not require browser OAuth flow and is well-supported
by `@googleapis/sheets`. Secrets are scoped to the repository and injected as environment
variables at workflow runtime.

**Alternatives considered**: Published CSV endpoint — simpler but CSV parsing is fragile
(quoting, encoding), and Sheets CSV export is not always up-to-date. API v4 gives
structured JSON directly.

---

## Decision 3 — Data Artefacts

**Decision**: Three files written to `data/`:
- `individuals.json` — full individuals array (Sheet 1 schema)
- `files.json` — full media files array (Sheet 2 schema)
- `search-index.json` — reduced array with `id`, `first_name`, `last_name`,
  `birth_place`, `birth_date` for use by Fuse.js client-side search

**Rationale**: Separating the search index from the full data lets the nav search load
a small file (search-index.json) without downloading the full individuals payload.
The full files are consumed by profile pages.

**Alternatives considered**: Single `data.json` with both datasets — rejected because
it unnecessarily couples unrelated data and forces every page to load data it may not need.

---

## Decision 4 — GEDCOM Generation

**Decision**: Implement GEDCOM 5.5.1 export in `scripts/generate-gedcom.js` as a
hand-written text generator. No external library.

**Rationale**: GEDCOM 5.5.1 is a structured plain-text format with a predictable schema
for the data this project holds (individuals + parent relationships). Writing a minimal
generator from scratch avoids a dependency and is straightforward to maintain. The scope
is limited to `INDI` records and `FAM` records (parent-child relationships). Marriage
records are out of scope for v1.

**Output path**: `public/export/family.ged`

**Alternatives considered**: `gedcomx` npm library — introduces a dependency with
broader scope than needed; the GEDCOM format for this use case is ~100 lines of
template code.

---

## Decision 5 — Service Worker Caching Strategy

**Decision**: `sw.js` at the site root with:
- **Cache-first** for `data/*.json` and all CSS/JS assets
- **Network-first** for HTML pages
- Cache name: `clemenzo-v1`
- Registered from `base.js` with `'serviceWorker' in navigator` feature detection

**Rationale**: JSON data files and assets are stable between deployments and benefit
from cache-first delivery (instant load). HTML is network-first so page structure
updates (new nav items, layout changes) are received immediately on the next visit
while still falling back to cache when offline.

**Cache invalidation**: Because the cache name is `clemenzo-v1`, a future version bump
to `clemenzo-v2` will cause the SW to delete the old cache and re-fetch all resources.

**Alternatives considered**: Stale-while-revalidate for all resources — rejected because
it means visitors may see outdated HTML after a deploy until the next page load.

---

## Decision 6 — Commit Strategy for Generated Artefacts

**Decision**: The workflow commits all generated files with the message
`data: refresh from Google Sheets [skip ci]` and pushes to `main`. GitHub Pages
deploys from `main` automatically.

**Rationale**: `[skip ci]` prevents the commit from triggering another workflow run
(infinite loop prevention). Committing the generated files means GitHub Pages serves
them as static files — no client-side Sheets API calls.

**Alternatives considered**: GitHub Actions artefact upload without commit — rejected
because GitHub Pages can only serve files that are in the repository.

---

## Resolved Unknowns

All technical questions were resolved by the author's input. No NEEDS CLARIFICATION
markers remain.
