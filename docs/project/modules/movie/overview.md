# Movie Module

The movie module records watched movies and optional long reviews.

## Source Areas

- Content: `src/content/movie`
- Assets: `src/assets/movie`
- Routes: `src/pages/movie/[...page].astro`, `src/pages/movie/[slug].astro`
- Layout: `src/layouts/MoviePost.astro`
- Components: `src/components/MovieCard.astro`, `src/components/MovieScroll.astro`, `src/components/ScoreBox.astro`
- Creation script: `scripts/new.mjs`

## Content Rules

Movie entries are MDX files validated by the `movie` collection schema.

Required fields:

- `title`
- `viewingDate`
- `rating`
- `coverImage`
- `shortReview`
- `haveReview`

Optional field:

- `releaseDate`

`rating` must be between `0` and `5`. `coverImage` must point to an imported asset.

## Behavior

Movie list views sort primarily by `viewingDate`. The home page shows recent movie records and includes a grid/scroll view toggle.

The interactive movie creation path in `scripts/new.mjs` can search TMDB, download a poster, and generate a movie MDX entry when `TMDB_API_KEY` is configured.

## Maintenance Notes

- If changing movie fields, update `src/content.config.ts` and `docs/project/content-model.md`.
- If changing movie URLs, update `docs/project/routing.md`.
