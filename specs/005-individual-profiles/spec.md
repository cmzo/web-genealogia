# Feature Specification: Individual Profiles

**Feature Branch**: `005-individual-profiles`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description — Feature 005

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Find a Person by Name (Priority: P1)

A visitor arrives at the profiles index page and searches for a family member
by name. Even with a partial or slightly misspelled name, they see matching
results and can click through to the person's profile.

**Why this priority**: Search is the primary entry point for visitors who know
who they are looking for. Without it, the profiles section has no front door.

**Independent Test**: Search for "Clemenz" (partial name) and for "Klemenso"
(misspelled name); both searches return relevant results within 1 second.

**Acceptance Scenarios**:

1. **Given** a visitor types a partial name into the search field, **When**
   results appear, **Then** all individuals whose name contains that substring
   are included in the results.
2. **Given** a visitor types a slightly misspelled name, **When** results
   appear, **Then** closely matching individuals are returned (fuzzy match).
3. **Given** a visitor types a place name, **When** results appear, **Then**
   individuals born or who died in that place are included.
4. **Given** a visitor clicks a search result, **When** the navigation
   completes, **Then** they land on that individual's profile page.

---

### User Story 2 — View a Complete Individual Profile (Priority: P1)

A visitor opens a profile page for a specific person. They see all recorded
information about that person: name, dates, places, biographical notes, family
members, media files, and a link to their position in the tree.

**Why this priority**: The profile page is the core unit of value for this
feature. Every other story depends on it existing.

**Independent Test**: Open a profile for an individual with all fields
populated; verify all data from `data/individuals.json` and `data/files.json`
appears correctly on the page.

**Acceptance Scenarios**:

1. **Given** a visitor opens a profile, **When** the page renders, **Then**
   the individual's full name, birth date, birth place, death date (if any),
   and death place (if any) are displayed prominently.
2. **Given** an individual has biographical notes, **When** the visitor reads
   the profile, **Then** the notes appear as formatted text (paragraphs,
   emphasis) — not as raw markup.
3. **Given** an individual has recorded parents and/or children, **When** the
   visitor views the profile, **Then** each parent and child is listed by name
   and links to their own profile page.
4. **Given** an individual has associated media files, **When** the visitor
   views the profile, **Then** thumbnails or previews of all files are
   displayed in a gallery section.
5. **Given** a visitor is on a profile page, **When** they click the "View in
   family tree" link, **Then** they are taken to the family tree page with
   that individual's position highlighted or centred.

---

### User Story 3 — View an Image at Full Size (Priority: P2)

A visitor is browsing a profile's media gallery and clicks on a photograph.
A lightbox opens showing the full image. They can dismiss it or navigate to
the next and previous images in the gallery without leaving the profile page.

**Why this priority**: The gallery often contains historical photographs and
scanned documents that require full-size viewing to be useful. Opening a new
page for each image would be a significant friction point.

**Independent Test**: Click the first image in a gallery with 3+ images;
navigate forward and backward through all images; dismiss; confirm you are
still on the same profile page.

**Acceptance Scenarios**:

1. **Given** a visitor clicks a gallery image, **When** the click registers,
   **Then** a lightbox opens displaying the full-size image and its caption.
2. **Given** the lightbox is open, **When** the visitor clicks a "next" or
   "previous" control, **Then** the lightbox displays the adjacent image in
   the gallery.
3. **Given** the lightbox is open, **When** the visitor presses Escape or
   clicks outside the image, **Then** the lightbox closes and the visitor
   remains on the profile page.
4. **Given** a gallery has only one image, **When** the lightbox opens,
   **Then** the next/previous controls are absent or disabled.

---

### User Story 4 — View a Profile with Minimal Data (Priority: P2)

A visitor opens a profile for an individual with very little recorded
information — perhaps only a name and one date. The page looks intentional
and complete, not like a half-empty form with broken sections.

**Why this priority**: Many genealogical records are sparse. A broken or
obviously incomplete-looking profile undermines trust in the data and the site.

**Independent Test**: Open a profile where only `first_name`, `last_name`,
and `birth_date` are populated; the page looks polished with no empty boxes,
"Unknown" placeholders, or missing-section errors.

**Acceptance Scenarios**:

1. **Given** an individual has no recorded death date, **When** their profile
   renders, **Then** no death date field or "Unknown" placeholder is shown.
2. **Given** an individual has no biographical notes, **When** their profile
   renders, **Then** no empty "Biography" section is shown.
3. **Given** an individual has no associated media files, **When** their
   profile renders, **Then** no empty gallery section is shown.
4. **Given** an individual has no recorded parents or children, **When** their
   profile renders, **Then** no empty "Family" section is shown.

---

### User Story 5 — Search Engine Visitor Arrives on a Profile (Priority: P3)

A genealogy researcher finds a profile page via a search engine. The page
makes sense without prior context: the site name is visible, the page explains
what kind of site this is, and navigation to other sections is accessible.

**Why this priority**: Profiles have individual URLs and will be indexed. A
page that looks orphaned or confusing to an outside visitor is a missed
opportunity.

**Independent Test**: Open a profile page with no prior context (e.g., in an
incognito window); a stranger can identify the site name, understand it is a
genealogy site, and find navigation to the tree, blog, and profiles index.

**Acceptance Scenarios**:

1. **Given** a visitor arrives on a profile page from an external link, **When**
   the page loads, **Then** the site name, a site navigation bar, and a brief
   contextual description of the site are visible.
2. **Given** a visitor on a profile page wants to explore further, **When** they
   look for navigation, **Then** links to the tree, the profiles index, and the
   blog are accessible from the profile page.

---

### Edge Cases

- What if an individual's `father_id` or `mother_id` references an ID that
  does not exist? The profile MUST still render; the missing parent MUST be
  omitted from the family section rather than showing an error or broken link.
- What if a media file URL in `data/files.json` is no longer accessible? The
  gallery MUST not error; a broken image placeholder is acceptable.
- What if a profile is requested for an ID that does not exist? The page MUST
  display a graceful "person not found" message with navigation back to the
  profiles index.
- What if biographical notes contain characters that could break layout (very
  long unbroken strings, special characters)? The notes section MUST wrap and
  display safely.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profiles index page MUST provide a search field that accepts
  name or place queries and returns matching individuals from
  `data/individuals.json`.
- **FR-002**: Search MUST return results for partial name matches (substring
  search).
- **FR-003**: Search MUST return results for approximate name matches
  (fuzzy/tolerant search for misspellings).
- **FR-004**: Search results MUST each link directly to the corresponding
  individual profile page.
- **FR-005**: Each individual profile page MUST display: full name, birth date,
  birth place, death date, death place (omitting each field entirely if not
  recorded).
- **FR-006**: Each profile MUST display biographical notes as formatted text
  where notes exist; the section MUST be absent when no notes are recorded.
- **FR-007**: Each profile MUST list direct family members (parents, children)
  by name, each linking to their own profile page.
- **FR-008**: Missing family member references (broken `father_id`/`mother_id`
  pointers) MUST be silently omitted — no error shown to the visitor.
- **FR-009**: Each profile MUST display a gallery of all associated media files
  from `data/files.json`; the gallery section MUST be absent when no files
  are associated.
- **FR-010**: Clicking a gallery image MUST open a lightbox showing the
  full-size image and its caption, with next/previous navigation and a
  close action, all without a page reload.
- **FR-011**: Each profile MUST include a link to the family tree page that
  leads to or highlights that individual's position in the tree.
- **FR-012**: Profile pages with minimal data MUST omit empty sections rather
  than displaying them blank or with placeholder text.
- **FR-013**: Profile pages MUST include the site name and navigation to the
  tree, profiles index, and blog (for visitors arriving from search engines).
- **FR-014**: Each profile page URL MUST use the individual's permanent `id`
  as the identifier (e.g., `/profiles/[id]`).
- **FR-015**: If a requested profile ID does not exist, the page MUST display
  a graceful "not found" state with navigation back to the profiles index.

### Key Entities

- **Individual**: The subject of a profile page. Key attributes displayed:
  `id` (URL identifier), `first_name`, `last_name`, `birth_date`,
  `birth_place`, `death_date`, `father_id`, `mother_id`, `notes`.
  Sourced from `data/individuals.json`.
- **Media file**: A photograph or scanned document associated with one
  individual. Key attributes displayed: `url`, `caption`, `file_type`, `date`.
  Sourced from `data/files.json`.
- **Family link**: A navigable reference from one individual's profile to a
  parent's or child's profile, resolved by matching `id` values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can find any individual by full name from the profiles
  index page within 10 seconds of arriving at the page.
- **SC-002**: A visitor can find a person using a partial name (3+ characters)
  with results appearing in under 1 second.
- **SC-003**: A visitor can find a person using a name with a single-character
  transposition error (fuzzy search).
- **SC-004**: Every data field recorded for an individual in `data/individuals.json`
  is visible on their profile page (zero fields silently dropped or hidden).
- **SC-005**: A gallery image opens at full size in a lightbox within 1 second
  of being clicked, without a page navigation.
- **SC-006**: A visitor can traverse from one profile to a family member's
  profile and back in two clicks.
- **SC-007**: A profile page for an individual with only name and one date looks
  polished with no empty sections or placeholder text.
- **SC-008**: A visitor arriving from a search engine can identify the site
  name and navigate to the tree, blog, or profiles index within 5 seconds.

## Assumptions

- `data/individuals.json` and `data/files.json` are produced and kept current
  by Feature 001; this feature consumes them as read-only.
- The search index is built client-side from `data/individuals.json`; all
  search happens in the browser with no server calls.
- "Fuzzy" search is defined as tolerating at least one character insertion,
  deletion, or substitution (edit distance of 1).
- Individual profile pages are statically generated at build time (one HTML
  file per individual), not rendered dynamically from the JSON at runtime.
  This is consistent with the static-first architecture in the constitution.
- Documents in the media gallery (non-image files) are represented with a
  document icon thumbnail rather than a file preview, and clicking opens the
  file URL in a new tab rather than a lightbox.
- The "link to tree position" navigates to `/tree/` with the individual's `id`
  as a URL parameter; the tree page (Feature 004) is responsible for handling
  that parameter and centering the view.
- Mobile support for the gallery lightbox is included (swipe to navigate images).
- There is no pagination on search results; all matches are shown in a single
  scrollable list (reasonable given the expected dataset size of hundreds,
  not thousands, of individuals).
