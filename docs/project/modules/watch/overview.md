# Watch Module

The watch module records movies and series as structured data. Long-form
screen writing belongs in the `blog` collection.

## Source Areas

- Content: `src/content/watch`
- Assets: `src/assets/watch`
- Schema: `src/content-schema/watch.ts`
- Domain: `src/domain/watch.ts`
- Routes: `src/pages/watch/index.astro`, `src/pages/watch/[mediaType].astro`,
  `src/pages/watch/series/[...slug].astro`
- Components: `src/components/WatchCard.astro`, `src/components/WatchScroll.astro`
- Layouts: `src/layouts/WatchArchive.astro`, `src/layouts/WatchDetail.astro`
- Creation script: `scripts/new.mjs`

## Content Rules

Watch entries are YAML/YML/JSON files loaded by a strict discriminated union in
the `watch` collection schema. `mediaType` narrows each record to exactly one
of the movie or series shapes; movie-only and series-only fields cannot be
mixed.

Shared required fields:

- `title`
- `mediaType`
- `coverImage`
- `shortReview`

Shared optional fields:

- `originalTitle`
- `tmdbId`
- `releaseDate`

Movies require a top-level `rating` and `finishedDate` and cannot define
`seasons`. Series cannot define a top-level `rating` and instead use a `seasons`
array whose ratings are numbers from `0` to `5` or `to-watch`; each season may
also define its own `posterImage` and `shortReview`. Every season not yet
started uses `to-watch`, so multiple trailing seasons may carry it. Once a
season is marked `to-watch`, all higher recorded seasons must use the same
value. Each record still includes at least one numeric season rating. Series
only set `finishedDate` after the final season is complete.

## Behavior

The watch archive combines both media types and links between `/watch`,
`/watch/movie`, and `/watch/series` through route-backed filters. Unfinished
series are surfaced before completed records; completed records sort by
`finishedDate`.

Each archive header derives its `SINCE YYYY.MM` boundary from the earliest
available `finishedDate` for that media type. The movie and series routes show
their own boundary. The combined route shows both labeled boundaries and omits
a media type when none of its records has a `finishedDate`.

Watch cards keep posters in color and show `shortReview` in a desktop hover
overlay. Movie cards keep the original hover/tap behavior and do not link to a
detail page. Series cards link to a season archive detail page under
`/watch/series/[slug]`, where each row combines its poster or numbered fallback,
rating state, and optional short review.

Routes load the `watch` collection at build boundaries. Stable hrefs, slugs,
scores, pending-season state, latest-season state, date boundaries, ordering,
and resolved archive/card/detail models live in `src/domain/watch.ts`.
Layouts and cards render those resolved models rather than independently
recomputing Watch semantics.

The interactive creation path in `scripts/new.mjs` searches TMDB for both
movies and international series. It uses Chinese titles while deliberately
avoiding Chinese-localized posters. Series creation also downloads the available
regular-season posters from the English metadata response. Season 0 specials
are excluded by default. As with the album scraper, generated files are drafts:
ratings start at `0`, reviews are empty, and the author completes the YAML after
generation. A generated series includes a commented `finishedDate` template,
gives its first regular season a numeric placeholder, and marks every later
regular season `to-watch`.

## Maintenance Notes

- If changing watch fields, update `src/content-schema/watch.ts` and
  `docs/project/content-model.md`.
- Pure union validation lives in `src/content-schema/watchRecord.ts`; Astro
  collection registration and image-schema injection stay in
  `src/content-schema/watch.ts`.
- If changing watch URLs, update `docs/project/routing.md`.
