# Content Architecture Refactor

Status: Completed and accepted on 2026-08-10

## Acceptance Result

The staged implementation was integrated on the shared content-architecture
branch. Final acceptance confirmed:

- 87 Blog entries, 45 Music tracks, two Albums, and the current Watch corpus
  pass offline content-integrity validation with zero errors;
- all 50 Node tests and both Python analytics tests pass;
- TypeScript reports no diagnostics and the production build emits 119 static
  pages;
- the 57 migrated tracked Blog files retain byte-identical MDX bodies;
- all 45 migrated Music records preserve their original authored data and date
  values after the `pubDate` to `recordedAt` field migration;
- desktop and 390 px mobile review passed for Header navigation, Blog series,
  Album reviews, Watch details, Music calendar, `/space`, and `/space/2026`;
- direct Space detail hashes, Close, Enter, Escape, and Arrow-key chapter
  navigation behave as documented.

The remaining content-integrity output consists of non-blocking authoring
warnings for existing unknown tags, draft links, and ambiguous relative links.

## Goal

Reshape the site around explicit content domains without changing the existing
public archive URLs or turning all records into one generic collection.

The target separates:

- writing: authored Blog entries and ordered Blog series;
- watch: movie and television records;
- music: tracks and first-class albums;
- editions: annual Space publications projected from the maintained domains;
- projections: homepage, search, RSS, Space, and future annual summaries.

The refactor must preserve authored content, current slugs, and the visual
behavior of the existing Blog, Watch, and Music routes.

## Why Now

At planning time the repository contains approximately:

- 87 Blog MDX entries;
- 38 Watch YAML records;
- 45 Music YAML records;
- one complete `2025.08—2026.08` Space edition.

The current model has several scaling problems:

- Blog series titles and section metadata are repeated in every member post.
- Album identity is repeated across an album-review article, track records,
  asset paths, and directory names.
- Music `pubDate` describes when a listening record was kept, not necessarily
  when a track was published.
- Watch uses one object with many optional fields instead of an explicit
  movie/television union.
- route entry points and components still perform some collection querying and
  domain transformation directly.
- `/space` is one edition today, but the intended product is an annual family
  with a stable top-level entry.

## Architectural Decisions

### Keep domain collections

Do not introduce a universal `content` or `media` collection. Blog entries,
Watch records, Music tracks, albums, and annual editions have different
lifecycles and validation rules.

Keep the current collection names where changing them would create widespread
churn:

- `blog` remains the authored MDX collection;
- `watch` remains the movie and television record collection;
- `music` remains the track/listening collection.

Add only the missing first-class entities:

- `blogSeries` from `src/content/blog-series`;
- `albums` from `src/content/albums`.

### Separate schema, domain, and projection layers

The intended dependency direction is:

```text
content files
    ↓
content schemas and cross-entry integrity checks
    ↓
domain queries and resolved view models
    ↓
routes, components, RSS, search, homepage, and Space
```

- `src/content.config.ts` is a small composition root.
- `src/content-schema/*` defines collection schemas and entry-local rules.
- `src/domain/*` owns filtering, ordering, relationships, and stable hrefs.
- pages load collections at build boundaries and pass them to pure domain
  functions.
- reusable components should not independently query collections when their
  caller can supply a resolved model.
- cross-collection IDs are validated before the Astro build.

### Preserve public URLs in the content refactor

The following route families remain unchanged:

- `/blog/*`
- `/watch/*`
- `/music/*`

Existing Blog, Watch, and Music IDs/slugs remain stable. Internal file movement
must not silently change generated entry IDs.

Space is the one intentional route evolution:

- `/space` becomes the stable edition index;
- `/space/2026` hosts the existing `2025.08—2026.08` edition;
- later editions use `/space/<edition-year>`.

The Header links to `/space`, not directly to an edition. Individual editions
remain isolated documents and are allowed to use completely different visual
systems.

### Make Blog series first-class

Series-level metadata moves to `src/content/blog-series/<id>.yaml`:

```yaml
title: "机器学习"
description: "..."
sections:
  - id: fundamentals
    title: "机器学习基础"
    order: 1
```

Blog members keep only membership data:

```yaml
series:
  id: machine-learning
  section: fundamentals
  subtitle: "概论"
  order: 1
```

The schema and integrity layer must enforce:

- referenced series IDs exist;
- referenced section IDs exist in that series;
- item order is a positive integer;
- item order is unique within a series section;
- draft entries participate in integrity checks;
- published navigation continues to exclude drafts.

The initial refactor adds no public Series discovery route. That information
architecture remains a separate product decision.

### Make albums first-class

Album metadata moves to `src/content/albums/<id>.yaml`:

```yaml
title: "THE PROTÉGÉ"
artist: "Gareth.T"
coverImage: "../../assets/music/t-h-e-p-r-o-t-e-g-e/cover.jpg"
releaseDate: "2026-03-30"
```

Tracks use a stable optional relationship:

```yaml
albumId: t-h-e-p-r-o-t-e-g-e
trackNumber: 1
recordedAt: "2026-03-30"
```

Album review posts use the same stable relationship instead of duplicating the
album title and artist:

```yaml
albumId: t-h-e-p-r-o-t-e-g-e
```

Rules:

- `recordedAt` replaces the misleading Music field name `pubDate`;
- a track with `albumId` must reference an existing album;
- track `coverImage` becomes an optional override and otherwise resolves from
  its album;
- album-review posts require a valid `albumId`;
- non-album Blog posts cannot carry `albumId`;
- track numbers must be unique within an album when present;
- album pages and routes are not part of this migration unless separately
  approved.

### Tighten Watch without premature event modeling

Represent Watch schema data as a discriminated union:

```text
MovieRecord  = shared fields + rating + finishedDate
SeriesRecord = shared fields + seasons + optional finishedDate
```

Keep seasons nested for now. Do not introduce viewing-event files until the
site needs rewatches, per-episode logs, multiple viewing periods, or viewing
context.

No Watch content rewrite should occur beyond what is required for the explicit
union, because the current YAML shape already carries the necessary data.

### Treat Space as an annual publication family

`/space` uses the normal site shell and lists editions. Each edition owns its
own route, components, styles, and configuration. Share only genuinely stable
infrastructure such as source projections, media optimization helpers, and
accessibility primitives.

The existing edition moves without visual or interaction redesign:

```text
src/pages/space/index.astro
src/pages/space/2026.astro
src/components/space/shared/
src/components/space/2026/
src/styles/space/2026/
src/utils/space/shared/
src/utils/space/2026/
```

Exact directory names may be simplified when a move would create needless
churn, but edition-owned files must be clearly identifiable before a second
edition is added.

The `/space` index should be indexable and included in the sitemap. Edition
pages may stay out of Pagefind to avoid indexing projected duplicate content.
Unless an edition is intentionally private, use `index, follow` rather than
`noindex, nofollow`.

## Compatibility Boundaries

Every implementation agent must preserve these constraints:

- no Blog, Watch, or Music URL changes;
- no deletion or rewriting of unrelated drafts or untracked assets;
- no visual redesign of existing archive or detail pages;
- no standalone Series, Tags, or Album route in this project;
- no generic repository or ORM abstraction over static content collections;
- no network calls during content integrity checks;
- no silent fallback for broken series or album references;
- production build remains `check:content → astro build → Pagefind`;
- `/space/2026` retains the current edition behavior and no-JavaScript content;
- existing homepage, RSS, SEO, and search behavior must be deliberately
  rechecked after data-field migrations.

## Execution Prerequisite

Before any asynchronous agent starts, create a baseline checkpoint commit that
contains the intended current Space implementation and every new authored
resource. At the time this plan was written, several Blog, Watch, and asset
files were untracked.

Do not use a stash as the shared baseline for multiple worktrees. Each agent
must branch from the same committed checkpoint so that it sees the same corpus.

Suggested integration branch:

```text
codex/content-architecture
```

Each worker should use a separate branch/worktree and return one focused commit
or a short linear commit series. The main agent merges and resolves shared
documentation only after worker verification passes.

## Agent Schedule

```text
Baseline checkpoint
        │
        ▼
Agent 1: schema/domain foundation
        │
        ├── Agent 2: Blog series migration ──┐
        ├── Agent 3: Album/music migration ─├── parallel
        ├── Agent 4: Watch union/domain ───┘
        └── Agent 5: Space annualization ──── parallel
                                      │
                                      ▼
                         Main agent integration/acceptance
```

Agents 2–5 begin only after Agent 1 is merged into the integration branch.
They may then run asynchronously in separate worktrees. Merge in the order
2, 3, 4, 5 so content-model changes are reviewed before route/navigation
changes. If Agent 5 does not depend on any moved shared utility after Agent 1,
it may begin at the same time as Agents 2–4.

## Agent 1 Prompt: Schema And Domain Foundation

```text
You are the foundation agent for Pot's Astro content-architecture refactor.

Repository context:
- Read AGENTS.md and docs/project/README.md first.
- Read docs/project/architecture.md, content-model.md, routing.md, and the Blog,
  Watch, Music, and Space module overviews.
- Start from the committed baseline supplied by the main agent. Preserve all
  authored content and unrelated changes.

Objective:
Create the structural foundation for later domain migrations without changing
content fields, public URLs, rendered output, or collection names.

Required work:
1. Split the collection definitions currently concentrated in
   src/content.config.ts into focused modules under src/content-schema/.
   Keep src/content.config.ts as the small composition/export root Astro needs.
2. Establish clear domain module boundaries under src/domain/ or an equally
   coherent structure. Move existing Blog and Watch domain utilities only when
   imports can be updated mechanically and behavior remains identical.
3. Identify collection reads inside reusable components. Move only the safe,
   low-risk reads to route/layout boundaries; document remaining exceptions.
4. Add or adjust unit tests proving collection names, Blog ordering and series
   behavior, Watch sorting, and existing route helpers are unchanged.
5. Do not add blogSeries or albums yet. Do not migrate frontmatter/YAML.
6. Update only architecture/module documentation needed to explain the new
   code ownership. Leave the final cross-domain content-model rewrite to the
   integration pass.

Constraints:
- No changes to /blog, /watch, /music, or /space routes.
- No visual changes.
- No broad component rewrite.
- No changes to authored content files.
- Keep compatibility re-exports if they materially reduce downstream churn.

Verification:
- npm test
- npx tsc --noEmit
- npm run build
- git diff --check

Deliverable:
A focused commit plus a short report listing moved modules, compatibility
exports, intentionally deferred collection reads, and verification results.
```

## Agent 2 Prompt: First-Class Blog Series

```text
You are the Blog-series migration agent. Start after the foundation commit is
merged. Work in your own branch/worktree.

Context to read:
- AGENTS.md
- docs/project/content-model.md
- docs/project/modules/blog/overview.md
- docs/project/modules/blog/taxonomy.md
- docs/project/plans/series-and-tags-discovery.md
- docs/project/plans/content-architecture-refactor.md
- the foundation's content-schema and Blog domain modules
- scripts/check-blog-content.ts and its supporting scanner

Objective:
Make Blog series a first-class content entity while preserving all existing
Blog URLs and reading-navigation behavior.

Required work:
1. Add a blogSeries collection loaded from src/content/blog-series.
2. Create one series record for every current unique series key and move stable
   title/section metadata into those records.
3. Migrate every Blog member to the compact shape:
   series.id, optional series.section, optional series.subtitle, series.order.
4. Update Blog schema, domain assembly, layouts/components, SEO consumers if
   relevant, and the integrity scanner.
5. Validate missing series, missing sections, duplicate item order within a
   section, and all current draft-inclusive consistency requirements.
6. Published series navigation must still omit drafts and retain the same item
   order, grouped sections, previous/next behavior, mobile behavior, and stable
   series storage key where possible.
7. Add fixtures/tests for valid, invalid, draft, sectioned, and unsectioned
   series.
8. Update the Blog module documentation. Do not create Series discovery routes
   or Header links.

Content safety:
- Treat every MDX body as immutable; change frontmatter only.
- Do not normalize titles or invent new editorial copy beyond a concise series
  description when the schema makes it optional.
- Preserve series IDs currently used as keys.

Verification:
- npm run check:content
- npm test
- npx tsc --noEmit
- npm run build
- git diff --check

Deliverable:
A focused commit and a migration table: old key -> series file -> member count,
plus verification results and any intentionally deferred discovery work.
```

## Agent 3 Prompt: First-Class Albums And Music Semantics

```text
You are the Album/Music migration agent. Start after the foundation commit is
merged. Work in your own branch/worktree and do not depend on Agent 2 changes.

Context to read:
- AGENTS.md
- docs/project/content-model.md
- docs/project/modules/music/overview.md
- docs/project/modules/blog/overview.md
- docs/project/scripts.md
- docs/project/plans/content-architecture-refactor.md
- scripts/fetch-album.mjs, scripts/update-music.mjs, and scripts/new.mjs
- representative standalone tracks, nested album tracks, and album-review MDX

Objective:
Create authoritative Album entities and clarify that Music dates represent a
listening/recording date, while preserving /music behavior and Blog URLs.

Required work:
1. Add an albums collection under src/content/albums.
2. Create album records for every current nested album corpus and every album
   review that has a corresponding track set.
3. Replace track album-name duplication with albumId where a real album entity
   exists. Rename Music pubDate to recordedAt across content, queries,
   calendars, homepage, Space projection, tests, and scripts.
4. Make track coverImage an optional override; resolved track view models must
   fall back to the referenced album cover. Components should consume resolved
   models rather than each implementing fallback logic.
5. Replace albumTitle/albumArtist on album-review Blog entries with albumId and
   enforce the lifeCategory=album relationship.
6. Add offline cross-collection integrity checks for missing albums and
   duplicate track numbers within an album.
7. Update album-fetching and authoring scripts so newly generated content uses
   the new canonical fields.
8. Preserve calendar grouping, playback IDs, nested track IDs, external links,
   homepage ordering, and Space selection dates.
9. Update the Music module and scripts documentation. Do not add album routes.

Content safety:
- Do not alter reviews, titles, artists, links, previews, or authored dates.
- If album identity is ambiguous, leave the track standalone and report it;
  do not guess.

Verification:
- npm run check:content
- npm test
- npx tsc --noEmit
- npm run build
- git diff --check

Deliverable:
A focused commit and a table of album IDs, migrated tracks, related review
posts, unresolved standalone records, and verification results.
```

## Agent 4 Prompt: Watch Discriminated Union And Domain Boundary

```text
You are the Watch-domain agent. Start after the foundation commit is merged.
Work in your own branch/worktree.

Context to read:
- AGENTS.md
- docs/project/content-model.md
- docs/project/modules/watch/overview.md
- docs/project/scripts.md
- docs/project/plans/content-architecture-refactor.md
- the Watch schema, domain helpers, pages, layouts, cards, creation script, and
  representative movie/series YAML including newly added long-running series

Objective:
Replace the optional-field Watch object with an explicit movie/series
discriminated union and make routes/components consume stable Watch domain
models without changing YAML meaning or UI.

Required work:
1. Define shared Watch fields, MovieRecord, and SeriesRecord schemas using
   mediaType as the discriminator.
2. Preserve every current validation rule: movie rating/finishedDate, unique
   season numbers, at least one numeric season, trailing to-watch block, and no
   finishedDate while pending seasons exist.
3. Improve TypeScript narrowing so movie-only and series-only fields do not
   require unsafe optional assumptions in domain and rendering code.
4. Centralize Watch href, score, pending state, latest-season, sorting, and
   resolved-card/detail models in the Watch domain layer.
5. Update the creation script to keep generating schema-valid movie and series
   drafts with the same authoring semantics.
6. Add direct unit tests for the discriminated schema and domain projections.
7. Update the Watch module documentation. Do not split seasons into files and
   do not add viewing-event data.

Constraints:
- Preserve all Watch YAML unless a schema-equivalent mechanical correction is
  required.
- Preserve /watch routes and current card/detail interactions.
- Do not redesign sorting or rating semantics.

Verification:
- npm test
- npx tsc --noEmit
- npm run build
- git diff --check

Deliverable:
A focused commit and report covering schema narrowing, preserved validation
rules, any YAML touched, and verification results.
```

## Agent 5 Prompt: Annual Space Family And Header Entry

```text
You are the Space annualization agent. Start from the foundation baseline (or
after it is merged) in your own branch/worktree.

Context to read:
- AGENTS.md
- docs/project/architecture.md, routing.md, styling.md, components.md, and
  interaction.md
- docs/project/modules/space/overview.md
- docs/project/plans/content-architecture-refactor.md
- all current Space page, layout, components, utilities, scripts, styles, and
  tests
- src/components/Header.astro and the homepage Space link

Objective:
Turn the current one-off /space page into an annual Space family with a stable
Header entry, while preserving the current edition's visual and interaction
behavior.

Required work:
1. Make /space a normal BaseLayout-backed edition index. It should introduce
   Space briefly, identify the current edition, and list available editions.
2. Move the existing 2025.08—2026.08 experience to /space/2026. Keep its title,
   period, content, five chapters, hashes, randomization, history/focus
   behavior, no-JS reading order, and Colophon behavior.
3. Add a small typed edition registry used by the index. Do not force future
   editions to reuse the 2026 visual components.
4. Add Space to desktop and mobile Header navigation as a content link between
   Music and About.
5. Update the homepage Space link deliberately: either lead to the /space
   index or clearly label a direct /space/2026 destination. Prefer the index
   unless the design supplies distinct wording.
6. Include /space in the sitemap and allow the index to be indexed. Keep
   duplicate projected edition content out of Pagefind through explicit page
   boundaries. Use an intentional robots policy for /space/2026; do not retain
   nofollow without a documented reason.
7. Ensure edition Home links return to the site or Space index according to a
   documented, consistent rule.
8. Update Space, routing, architecture, component, styling, and interaction
   documentation for the new route family.
9. Add route/registry tests and adjust the existing Space tests without
   weakening them.

Constraints:
- This is a route/packaging change, not a Space redesign.
- Do not change Blog, Watch, or Music data models.
- Do not create a generic annual template that limits future visual direction.
- Preserve data-astro-reload boundaries when moving between normal site pages
  and isolated edition documents.

Verification:
- npm test
- npx tsc --noEmit
- npm run build
- manually inspect /space and /space/2026 at desktop and mobile widths
- verify direct chapter/detail hashes, Escape/Back, keyboard focus, reduced
  motion, no-JS output, sitemap output, robots metadata, and Header mobile menu
- git diff --check

Deliverable:
A focused commit, before/after route map, screenshots of the index and current
edition at desktop/mobile widths, and verification results.
```

## Merge And Integration Order

The main agent performs integration; workers should not merge one another.

1. Merge Agent 1 and rerun all verification.
2. Merge Agent 2; resolve only foundation compatibility issues.
3. Rebase or merge the updated integration branch into Agent 3, then merge it.
   Pay special attention to Blog schema and Space date projections.
4. Merge Agent 4 and resolve `content.config`/schema exports structurally rather
   than reintroducing a monolithic file.
5. Rebase Agent 5 on the integrated domain changes. Its Space projection must
   consume `recordedAt` and any resolved Music model introduced by Agent 3.
6. The main agent owns final edits to shared documentation, migration notes,
   and cross-module tests.

If a worker discovers a required change in another worker's owned domain, it
should report the dependency instead of broadening its patch.

## Main-Agent Acceptance Checklist

### Repository and migration safety

- baseline commit includes every intended new resource;
- no authored MDX body or review text changed unexpectedly;
- no content or asset disappeared across branches;
- `git diff --check` passes and the final tree has no accidental generated
  output;
- migration tables account for every old series key and nested album track.

### Content contracts

- `src/content.config.ts` is a composition root rather than a schema monolith;
- Blog, Watch, Music, `blogSeries`, and `albums` build successfully;
- broken series, section, album, and track-number relationships fail before
  Astro build;
- drafts participate in structural checks without being published;
- all renamed Music dates preserve their exact original values;
- Watch union accepts every intended current record and rejects invalid mixed
  movie/series shapes.

### Behavior and URLs

- existing `/blog/*`, `/watch/*`, and `/music/*` paths are unchanged;
- Blog archive ordering, RSS order, SEO metadata, and series navigation match
  the baseline;
- Music calendar dates, recent ordering, playback, external links, album-review
  TrackControls, and Space track selection match the baseline;
- Watch archive filtering, unfinished-first ordering, scores, card behavior,
  and series detail pages match the baseline;
- `/space` is the index and Header target;
- `/space/2026` reproduces the current annual edition and direct hashes;
- sitemap, robots, Pagefind, and canonical behavior match the documented
  policy.

### Verification commands

Run from a clean integration tree:

```sh
npm run check:content
npm test
npx tsc --noEmit
npm run build
git diff --check
```

Then run a production preview and visually inspect at least:

- homepage and Header desktop/mobile;
- one normal Blog post;
- one sectioned Blog-series post and one unsectioned series post;
- Music index and a month containing album tracks;
- one movie archive card and one unfinished television detail;
- `/space` desktop/mobile;
- `/space/2026` abstract, every detail type, Colophon, and direct hashes.

## Completion Rule

The refactor is complete only when the new entities and annual Space routing
are in production-compatible form, all existing public content remains
reachable, shared documentation describes the final state rather than the
migration process, and the main agent has completed the acceptance checklist.

After completion, preserve lasting decisions in the maintained architecture,
routing, content-model, and module documents. This execution plan may then be
marked Completed or removed once it no longer contains unique operational
knowledge.
