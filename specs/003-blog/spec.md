# Feature Specification: Blog

**Feature Branch**: `003-blog`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description — Feature 003

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse All Posts (Priority: P1)

A visitor arrives at the blog section wanting to explore available research
articles. They scan a list of posts, read titles and summaries, and decide
which ones to open.

**Why this priority**: The listing page is the entry point to all blog content.
Without it, visitors have no way to discover articles.

**Independent Test**: Open the blog listing with 10+ posts present; a new
visitor can name 3 posts they would want to read based only on the listing.

**Acceptance Scenarios**:

1. **Given** a visitor loads the blog listing page, **When** the page renders,
   **Then** all published posts are listed, sorted from newest to oldest, each
   showing title, date, and a short excerpt.
2. **Given** a visitor scans the listing, **When** they click a post entry,
   **Then** they are taken to that post's full reading page.
3. **Given** the listing contains more than one page worth of posts, **When**
   a visitor scrolls to the bottom, **Then** all posts are accessible without
   pagination barriers (single continuous list or load-more, no mandatory
   pagination).

---

### User Story 2 — Read a Full Article (Priority: P1)

A visitor opens a post and reads it from start to finish. The article is
comfortable to read: the text is legible, lines are an appropriate length,
images are well-placed, and sections are clearly separated.

**Why this priority**: The reading experience is the core value of the blog.
Poor readability directly undermines the purpose.

**Independent Test**: Open a 2,000-word article on a 1280px desktop screen;
a reader can finish it without adjusting text size, zooming, or horizontal
scrolling.

**Acceptance Scenarios**:

1. **Given** a visitor opens a post page, **When** the page renders, **Then**
   the full article text is displayed in a single column at a comfortable
   reading width (approximately 60–75 characters per line).
2. **Given** a post contains images, **When** the visitor reads the article,
   **Then** images are displayed inline at an appropriate size and do not
   disrupt the reading flow.
3. **Given** a post page is viewed on a desktop, **When** a visitor reads the
   full article, **Then** font size, line height, and paragraph spacing result
   in a comfortable reading experience without the visitor needing to adjust
   any settings.

---

### User Story 3 — Follow a Reference to an Individual's Profile (Priority: P2)

A visitor is reading an article that mentions a specific ancestor. The article
contains a link to that person's profile. The visitor clicks it and is taken
directly to the individual profile.

**Why this priority**: Cross-linking posts to profiles is explicitly required
and is what distinguishes this blog from a generic one.

**Independent Test**: A post with at least one profile link; clicking the link
navigates to the correct profile page.

**Acceptance Scenarios**:

1. **Given** a post references a named individual with a profile link, **When**
   the visitor clicks the link, **Then** they are taken to that individual's
   profile page.
2. **Given** a visitor follows a profile link from a post, **When** they
   navigate back, **Then** they return to the same position in the article.

---

### User Story 4 — Author Publishes a New Post (Priority: P1)

The site author adds a new article by placing a file in the correct location.
The next time the site's automated build process runs, the new post appears in
the listing and has its own readable URL.

**Why this priority**: If publishing a post requires extra steps beyond adding
a file, the blog becomes a burden to maintain.

**Independent Test**: Add a new post file; after the automated build completes,
the post appears in the listing and its permalink is accessible.

**Acceptance Scenarios**:

1. **Given** the author adds a new post file to the project, **When** the
   automated build completes, **Then** the post appears at the top of the
   listing (assuming it is the newest) and is accessible at its permalink.
2. **Given** the new post file exists, **When** the build runs, **Then** no
   additional configuration, registration, or manual rebuild step is required
   from the author beyond adding the file.

---

### Edge Cases

- What if a post references an individual ID that no longer exists? The link
  MUST still render (not break the page), but may display a "profile not found"
  state when followed.
- What if a post has no excerpt defined? The listing MUST still show the post,
  using the first ~150 characters of the body as a fallback excerpt.
- What if the post contains no images? The layout MUST remain clean and
  well-proportioned without image-shaped gaps.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The blog listing page MUST display all published posts sorted from
  newest to oldest.
- **FR-002**: Each listing entry MUST show the post title, publication date, and
  a short excerpt or summary (explicitly authored or auto-derived from the first
  ~150 characters of the body).
- **FR-003**: Each listing entry MUST link to the full post page.
- **FR-004**: Each post page MUST display the complete article text, including
  inline images where present.
- **FR-005**: Post pages MUST support inline links to individual profile pages
  (by individual ID).
- **FR-006**: The reading column width on desktop MUST be constrained to
  approximately 60–75 characters per line to ensure comfortable readability.
- **FR-007**: Publishing a new post MUST require only adding a file to the
  project — no other configuration or manual step is needed.
- **FR-008**: Each post MUST have a stable, human-readable permalink derived
  from the post's slug (defined when the file is authored).
- **FR-009**: The listing and post pages MUST be fully readable on a 375px
  mobile screen without horizontal scrolling.

### Key Entities

- **Post**: A long-form article authored by the site owner. Key attributes:
  `slug` (permanent URL identifier), `title`, `date` (publication date),
  `excerpt` (optional short summary), `body` (full article content, may include
  images and profile links).
- **Profile reference**: An inline link within a post body pointing to a
  specific individual by their permanent `id`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can scan the listing of 20+ posts and identify articles
  of interest in under 60 seconds.
- **SC-002**: A 2,000-word article is readable on a 1280px desktop screen with
  no zoom, no horizontal scroll, and no accessibility complaints about text
  size or contrast.
- **SC-003**: Adding a new post file results in that post appearing in the
  listing within one automated build cycle, with no additional steps by the
  author.
- **SC-004**: 100% of inline profile links in posts navigate correctly to the
  referenced individual's profile page.
- **SC-005**: The listing and all post pages load in under 2 seconds on a
  standard broadband connection.

## Assumptions

- Posts are authored as Markdown files with YAML front matter (title, date,
  slug, optional excerpt); this matches the existing build pipeline in the repo.
- The automated build pipeline (from Feature 001 / CLAUDE.md) already handles
  converting Markdown to HTML; this feature builds on top of that pipeline.
- The listing page reads from `assets/data/blog-entries.json` (already produced
  by the build pipeline).
- There is no pagination — all posts appear in a single scrollable list. This
  is reasonable for a personal genealogy blog that will have tens, not hundreds,
  of posts.
- The author is the only person who can publish posts; there is no public
  submission mechanism.
- Comments, social sharing buttons, and analytics are explicitly out of scope.
