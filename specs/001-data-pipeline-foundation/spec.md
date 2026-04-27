# Feature Specification: Data Pipeline & Foundation

**Feature Branch**: `001-data-pipeline-foundation`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description — Feature 001

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Instant Data Access for Any Page (Priority: P1)

Any page on the site that needs individual or media data can load and display
that data without making a network call at runtime. The data is already present
as static files delivered with the site.

**Why this priority**: Every other feature — the family tree, profile pages,
blog post cross-links — depends on data being available instantly. Nothing else
can be built without this foundation.

**Independent Test**: Open the site with network throttled to offline after one
visit; all data-driven pages still render correctly.

**Acceptance Scenarios**:

1. **Given** a visitor loads a page that displays individual data, **When** the
   page loads, **Then** the data appears immediately with no visible loading delay.
2. **Given** network access is unavailable after a first visit, **When** a
   visitor loads any data-driven page, **Then** the page renders fully using
   cached data.

---

### User Story 2 — Automatic Daily Data Refresh (Priority: P2)

The site author updates data in either Google Sheet. Within 24 hours, and
without any manual action, the site reflects those changes.

**Why this priority**: Without automatic refresh, the author must manually
trigger updates — defeating the purpose of the sheet-based workflow.

**Independent Test**: Edit a record in Sheet 1; confirm the site reflects the
change within 24 hours without any manual deploy.

**Acceptance Scenarios**:

1. **Given** the author edits an individual's record in Google Sheets, **When**
   24 hours have passed, **Then** the site displays the updated data.
2. **Given** the refresh job runs, **When** it completes, **Then** the static
   JSON files are updated and committed to the repository.

---

### User Story 3 — Standard Genealogy Export (Priority: P3)

A family member wants to import the family tree into a tool like Ancestry or
FamilySearch. They download the GEDCOM file from the site and import it.

**Why this priority**: GEDCOM export is a one-time or infrequent action; it
does not block any other feature, but it is explicitly required.

**Independent Test**: Download the GEDCOM file; verify it imports without errors
into a standard genealogy tool (e.g., Gramps, Ancestry).

**Acceptance Scenarios**:

1. **Given** a visitor accesses the GEDCOM download link, **When** they download
   the file, **Then** they receive a valid `.ged` file containing all individuals
   and their relationships.
2. **Given** Sheet 1 data is updated, **When** the next data refresh runs, **Then**
   the GEDCOM file is regenerated to reflect the current data.

---

### Edge Cases

- What happens when a Sheet is temporarily unavailable during the refresh job?
  The job MUST fail gracefully without overwriting the existing JSON files with
  empty or partial data.
- What if an individual record has no birth or death date? The export and JSON
  MUST still include the record with those fields absent rather than erroring.
- What if `father_id` or `mother_id` references an `id` that does not exist in
  Sheet 1? The pipeline MUST include the individual and leave the parent
  reference unresolved (not fail the whole job).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST pre-fetch all data from both Google Sheets on an
  automated schedule (at minimum once per 24 hours) without manual intervention.
- **FR-002**: The system MUST produce `data/individuals.json` and `data/files.json`
  as static files accessible to all site pages.
- **FR-003**: The refresh job MUST NOT overwrite existing static files if the
  fetch fails or returns empty data.
- **FR-004**: The site MUST work fully offline after one successful visit,
  serving all data-driven content from the browser cache.
- **FR-005**: The system MUST generate a valid GEDCOM (`.ged`) export file from
  Sheet 1 data, refreshed each time new data is fetched.
- **FR-006**: No Google Sheets API credentials or keys may appear in any
  client-facing code or publicly readable file.
- **FR-007**: The refresh MUST also trigger on every push to the main branch,
  in addition to the scheduled run.

### Key Entities

- **Individual**: Represents one person. Key attributes: `id` (permanent),
  `first_name`, `last_name`, `birth_date`, `birth_place`, `death_date`,
  `father_id`, `mother_id`, `notes`. Sourced from Sheet 1.
- **File / Media record**: Represents a photo or document. Key attributes:
  `file_id`, `individual_id` (foreign key), `file_type`, `url`, `caption`,
  `date`. Sourced from Sheet 2.
- **GEDCOM export**: A standard genealogy file derived from all Individual
  records and their parent relationships.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any page that reads individual or media data displays that data
  with no perceptible delay (content visible within 1 second on a standard
  broadband connection).
- **SC-002**: The data reflected on the site is never more than 24 hours older
  than the current state of the Google Sheets.
- **SC-003**: The site renders fully for a returning visitor with no network
  connection (offline mode).
- **SC-004**: The GEDCOM file is always available for download and imports
  without validation errors into at least one standard genealogy tool.
- **SC-005**: The author never needs to manually trigger a data update; the
  process runs entirely on its own schedule.

## Assumptions

- The author has a Google account and owns both Sheets; API access can be
  configured.
- Both Sheets are structured according to the schemas defined in the
  constitution (Sheet 1: individuals, Sheet 2: files/media).
- The repository is hosted on GitHub; GitHub Actions is available for the
  automated pipeline.
- "No perceptible delay" is interpreted as data appearing within 1 second on
  a standard home broadband connection.
- The GEDCOM export covers all individuals and parent-child relationships;
  marriage/union records are out of scope for v1.
- Offline support covers the data and pages; it does not require caching
  binary media files (images, documents).
