# Quickstart: Data Pipeline & Foundation

**Feature**: 001 — Data Pipeline & Foundation
**Date**: 2026-04-27

Use this checklist to validate that the feature is working end-to-end after
implementation.

---

## Prerequisites

- [ ] Google Service Account created; Sheets API v4 enabled.
- [ ] Service Account has "Viewer" access to both Google Sheets.
- [ ] GitHub Secrets configured:
  - `SHEETS_API_KEY` — API key (if used alongside SA JSON)
  - `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON key file content
  - `SHEET1_ID` — Google Sheet 1 spreadsheet ID
  - `SHEET2_ID` — Google Sheet 2 spreadsheet ID

---

## Local validation (before CI)

```bash
# Install pipeline dependencies (Node.js ≥ 18)
cd scripts && npm install

# Set env vars locally (never commit these)
export GOOGLE_SERVICE_ACCOUNT_JSON='{ ...json content... }'
export SHEET1_ID='your-sheet-1-id'
export SHEET2_ID='your-sheet-2-id'

# Run the fetch script
node scripts/fetch-sheets.js

# Verify output
ls -la data/
# Expected: individuals.json  files.json  search-index.json

# Validate individuals schema
node -e "
const d = require('./data/individuals.json');
console.assert(Array.isArray(d), 'must be array');
console.assert(d.every(r => r.id && r.first_name && r.last_name), 'required fields');
console.log('individuals.json OK —', d.length, 'records');
"

# Validate search index matches
node -e "
const ind = require('./data/individuals.json');
const idx = require('./data/search-index.json');
console.assert(ind.length === idx.length, 'lengths must match');
console.log('search-index.json OK —', idx.length, 'records');
"

# Generate and validate GEDCOM
node scripts/generate-gedcom.js
ls -la public/export/family.ged
# Open in Gramps or https://chronoplexsoftware.com/myfamilytree/ to validate
```

---

## CI validation

1. Push any commit to `main`.
2. Open **Actions** → `refresh-data` workflow.
3. Verify the workflow:
   - [ ] Completes without error.
   - [ ] A new commit appears: `data: refresh from Google Sheets [skip ci]`.
   - [ ] `data/individuals.json`, `data/files.json`, `data/search-index.json` updated.
   - [ ] `public/export/family.ged` updated.

---

## Offline / Service Worker validation

1. Open the site in Chrome DevTools → Application → Service Workers.
   - [ ] `sw.js` is registered and activated.
2. Open Network tab → set throttling to "Offline".
3. Reload any page.
   - [ ] Page renders from cache (HTML fallback).
   - [ ] `data/*.json` served from cache (no network requests).
4. Re-enable network; reload.
   - [ ] HTML served fresh from network.
   - [ ] Cached JSON still served cache-first (no unnecessary re-fetch).

---

## Smoke test: GEDCOM import

1. Download `public/export/family.ged` from the deployed site.
2. Import into Gramps (free, cross-platform) or Family Tree Maker.
   - [ ] Import completes without parse errors.
   - [ ] Individual count matches `individuals.json` record count.
   - [ ] At least one parent-child relationship is visible in the imported tree.
