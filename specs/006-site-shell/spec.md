# Feature Specification: Navigation, Changelog & Site Shell

**Feature Branch**: `006-site-shell`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description — Feature 006

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navigate to Any Section from Any Page (Priority: P1)

A visitor is reading a blog post and wants to switch to the family tree. They
find the navigation immediately — no back-tracking, no hunting — and reach
the tree in one click.

**Why this priority**: Global navigation is structural infrastructure. If it
does not exist or does not work, every other feature loses discoverability.

**Independent Test**: From each of the five main page types (home, blog post,
tree, profile, profiles index), verify that every main-section link is visible
and functional within one click.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page of the site, **When** they look at the
   top of the page, **Then** navigation links to Home, Blog, Tree, and Profiles
   are visible without scrolling.
2. **Given** a visitor clicks any main navigation link, **When** the navigation
   completes, **Then** they arrive at the target section's landing page.
3. **Given** a visitor is on the currently active section, **When** they view
   the navigation, **Then** the active section is visually distinguished from
   the others.

---

### User Story 2 — Search for an Individual from Any Page (Priority: P1)

A visitor is on the family tree page and recalls someone they want to look up
by name. Without navigating away, they access the individual search directly
from the navigation bar, type a name, and go to the matching profile.

**Why this priority**: Requiring a full navigation to the profiles index just
to search is a friction point. Search from any page is explicitly required.

**Independent Test**: From the blog listing page, use the navigation search
to find an individual by partial name; the result links correctly to the
profile page.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they activate the search in
   the navigation, **Then** an input field appears without a full page reload.
2. **Given** the search input is active and the visitor types a partial name,
   **When** results are returned, **Then** matching individuals appear as a
   list of links pointing to their profile pages.
3. **Given** the visitor clicks a search result, **When** the navigation
   completes, **Then** they land on that individual's profile page.
4. **Given** the visitor activates search and then decides not to use it,
   **When** they dismiss it (press Escape or click outside), **Then** the
   search overlay closes and the current page is unchanged.

---

### User Story 3 — Read the Site Footer (Priority: P2)

A visitor scrolls to the bottom of any page and finds contextual information
about the site: what it is, who maintains it, where the data comes from, and
links to the main sections.

**Why this priority**: The footer reinforces credibility and provides a
secondary navigation safety net, especially for visitors who scroll past the
header.

**Independent Test**: Scroll to the footer on five different page types; verify
that the site description, data source credit, and section links are present
on all five.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the bottom of any page, **When** they reach
   the footer, **Then** a brief description of the site is visible.
2. **Given** a visitor reads the footer, **When** they look for credits,
   **Then** a note explaining that the data comes from Google Sheets and is
   maintained by the site author is present.
3. **Given** a visitor is in the footer, **When** they want to navigate to
   a section, **Then** links to all four main sections are present in the
   footer.

---

### User Story 4 — Check What's New (Priority: P2)

A family member returns to the site after a few weeks. They visit the changelog
to see what has been added or corrected since their last visit. They scan the
entries, find the recent ones at the top, and click a link to a newly added
profile.

**Why this priority**: The changelog is the mechanism for rewarding returning
visitors and communicating the site's activity.

**Independent Test**: Open the changelog with 5+ entries; verify entries are
sorted newest-first, each shows a date and description, and linked entries
navigate correctly.

**Acceptance Scenarios**:

1. **Given** a visitor opens the changelog page, **When** the page renders,
   **Then** entries are listed newest-first, each showing at minimum a date
   and a short description.
2. **Given** a changelog entry includes an optional link, **When** the visitor
   clicks it, **Then** they are taken to the referenced profile or post.
3. **Given** the author adds a new changelog entry, **When** the page is
   rebuilt, **Then** the new entry appears at the top of the list.

---

### User Story 5 — Land on a Broken URL (Priority: P2)

A visitor follows a stale link from a family member's email and arrives at a
URL that no longer exists. Instead of a browser error page, they see a
friendly page that explains the site and offers clear paths forward.

**Why this priority**: Broken links will happen as the site evolves. A helpful
404 page converts a dead end into an opportunity to orient the visitor.

**Independent Test**: Navigate to a non-existent URL on the site; verify the
custom 404 page appears (not the browser/host default), includes the site name,
a brief explanation, and links to the home page and profiles search.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to a URL that does not exist on the site,
   **When** the page loads, **Then** a custom page appears (not a browser
   default error screen) with the site name and a brief explanation.
2. **Given** the visitor is on the 404 page, **When** they look for a way
   forward, **Then** a link to the home page and a link to the profiles search
   are both present.

---

### User Story 6 — Use Navigation on a Phone (Priority: P2)

A family member opens the site on their phone. The navigation is usable: not
a tiny unreadable bar, not a list that takes up the whole screen — a collapsed
control that expands clearly when needed.

**Why this priority**: The navigation must be functional on mobile even though
desktop is the primary target. An unusable mobile nav breaks the mobile
experience completely.

**Independent Test**: Open the site on a 375px screen; tap the navigation
toggle; verify all four section links appear and are tappable.

**Acceptance Scenarios**:

1. **Given** a visitor opens any page on a screen narrower than 768px,
   **When** the page loads, **Then** the navigation is collapsed to a single
   toggle control (e.g., a menu button).
2. **Given** a visitor taps the navigation toggle, **When** the menu opens,
   **Then** all four main section links are visible and tappable.
3. **Given** the mobile menu is open, **When** the visitor taps a section
   link, **Then** they are navigated to that section and the menu closes.

---

### Edge Cases

- What if the visitor activates global search and there are no matching results?
  The search MUST display a clear "no results" message rather than an empty
  list or silence.
- What if a changelog entry references a profile or post that no longer exists?
  The entry MUST still render; the broken link may show a "not found" state
  when followed, but the changelog itself MUST not break.
- What if JavaScript is disabled? The navigation section links MUST still
  be accessible (progressive enhancement); only the search overlay and mobile
  menu toggle may degrade gracefully with a visible fallback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A global navigation MUST appear on every page of the site, fixed
  to the top of the viewport so it remains visible as the visitor scrolls.
- **FR-002**: The navigation MUST provide links to Home, Blog, Tree, and
  Profiles — all visible without scrolling on a 1280px desktop screen. The
  changelog is NOT a top-navigation item.
- **FR-003**: The navigation MUST visually distinguish the currently active
  section from the others.
- **FR-004**: The navigation MUST include a search icon; clicking it MUST open
  a search overlay with an input field, without a full page reload.
- **FR-005**: The navigation search MUST return results for partial name
  matches and display them as links to individual profile pages. Results MUST
  update after each keystroke (debounced); no submit action is required.
- **FR-006**: The navigation search MUST display a "no results" message when
  no individuals match the query.
- **FR-007**: On screens narrower than 768px, the navigation MUST collapse
  to a toggle control; tapping it MUST reveal all section links. The search
  icon MUST remain permanently visible in the mobile nav bar alongside the
  toggle, not hidden inside the collapsed menu.
- **FR-008**: A global footer MUST appear on every page.
- **FR-009**: The footer MUST include a brief site description, a credit noting
  that data comes from Google Sheets maintained by the site author, links to
  all four main sections, and a link to the changelog page.
- **FR-010**: A changelog page MUST exist at a stable URL (e.g., `/changelog`).
- **FR-011**: The changelog MUST list entries newest-first; each entry MUST
  have a date and a short description.
- **FR-012**: Changelog entries MUST optionally include a link to a profile
  or blog post.
- **FR-013**: Changelog entries are authored manually by the site owner; no
  automated generation is required.
- **FR-014**: A custom 404 page MUST be served when a visitor navigates to a
  URL that does not exist on the site.
- **FR-015**: The 404 page MUST include the site name, a brief explanation,
  a link to the home page, and a link to the profiles search.
- **FR-016**: The navigation and footer HTML/CSS MUST be structured so they
  can be included consistently across all page types without duplication of
  logic.

### Key Entities

- **Navigation item**: A labelled link to one of the four main sections
  (Home, Blog, Tree, Profiles). Displayed in the global nav and footer.
- **Global search result**: A matching individual from `data/individuals.json`,
  displayed by name and linking to their profile page.
- **Changelog entry**: A manually authored record with a date, short
  description, and an optional link to a profile or post.
- **404 page**: A static page served by the host for all unmatched URLs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any page on the site, a visitor can reach any of the four
  main sections within one click.
- **SC-002**: A visitor on any page can search for and navigate to an
  individual's profile within 15 seconds, without visiting the profiles index.
- **SC-003**: The changelog page loads with entries in newest-first order;
  100% of entries with links navigate correctly.
- **SC-004**: Navigating to a non-existent URL on the site always shows the
  custom 404 page (not a browser or host error page).
- **SC-005**: On a 375px screen, all four navigation links are reachable
  within two taps (toggle + link).
- **SC-006**: The footer is present and contains a site description and
  section links on every page type (home, blog, tree, profiles, changelog,
  404).

## Assumptions

- The navigation and footer are implemented as shared HTML snippets included
  in every page template; the exact mechanism (build-time include, copy-paste
  with a shared partial) is a planning/implementation decision.
- The global search in the navigation uses the same `data/individuals.json`
  data as the profiles search (Feature 005); it shares the search approach
  but is rendered as an overlay/dropdown rather than a dedicated page.
- The changelog is a hand-edited static page (or Markdown file processed at
  build time); there is no database or CMS.
- The 404 page must be deployed as a static file named `404.html` at the site
  root; GitHub Pages serves this file automatically for unmatched URLs.
- "Every page" includes: home, blog listing, individual blog posts, tree,
  profiles index, individual profile pages, changelog, and 404.
- The navigation does not include authentication or user-account controls;
  the site is fully public and read-only.
- A copyright notice or year in the footer is optional and at the author's
  discretion; it is not a requirement.

## Clarifications

### Session 2026-04-27

- Q: Where should the changelog be discoverable from the navigation? → A: Footer only — linked from the footer on every page, not from the top navigation bar.
- Q: How does a visitor activate the navigation search? → A: Icon-triggered overlay — a search icon in the nav bar opens an input overlay on click, without a page reload.
- Q: Does the navigation bar stay visible as the visitor scrolls? → A: Sticky everywhere — fixed to the top of the viewport on all screen sizes.
- Q: When do navigation search results appear? → A: As-you-type with debounce — results update after each keystroke; no Enter or submit required.
- Q: Where is the search icon placed on mobile? → A: Always visible alongside the mobile toggle — the search icon stays in the nav bar next to the hamburger on all screen sizes.
