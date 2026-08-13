# Content Model

Content is managed through Astro Content Collections. Focused definitions live
under `src/content-schema`; `src/content.config.ts` composes and exports them
under the `blog`, `blogSeries`, `watch`, `music`, and `albums` collection names.

## Blog Series Collection

Source directory: `src/content/blog-series`

File type: YAML, YML, or JSON

Required field: `title`

Optional fields:

- `description`
- `sections`

Each item in `sections`, when present, requires:

- `id`
- `title`
- `order`

Every section ID and positive integer order is unique within its series. The
record filename without its data-file extension is the stable series ID.

## Blog Collection

Source directory: `src/content/blog`

File type: MDX

Required fields:

- `title`
- `description`
- `pubDate`
- `category`

Optional fields:

- `shortTitle`
- `updatedDate`
- `heroImage`
- `coverImage`
- `draft`
- `lifeCategory`
- `techCategory`
- `albumId`
- `tags`
- `series`

Category rules:

- `category: "learn"` requires `techCategory`.
- `category: "life"` requires `lifeCategory`.
- `techCategory` and `lifeCategory` are mutually exclusive; each is only valid
  for its matching primary category.
- `series` is only valid for `learn` entries.
- `lifeCategory: "album"` requires `albumId` referencing an `albums` record.
- `albumId` is invalid on non-album entries.

Current technical categories:

- `frontend`
- `backend`
- `ai`
- `leetcode`
- `classroom`

Current life categories:

- `daily`
- `album`
- `movie`

Tags are trimmed and normalized by `normalizeBlogTag` from
`src/utils/blogTaxonomy.ts`. Duplicate normalized tags fail the separate content
integrity check instead of being silently accepted. Unknown tags remain
publishable and use fallback rendering, but the checker reports them as
warnings.

Technical learning-note series can use `series` to opt into article-to-article navigation on the detail page:

- `series.id`: stable ID of a record in `blogSeries`.
- `series.section`: optional section ID declared by that series record.
- `series.subtitle`: optional per-post label shown in the series navigation.
- `series.order`: positive integer used for ordering within its section, or in
  the unsectioned scope when `series.section` is absent.

Draft posts may carry `series` metadata, but detail-page navigation only lists published posts.

Across all entries sharing a `series.id`:

- the referenced series record must exist;
- `series.section`, when present, must exist in that series record;
- `series.order` must be unique inside its section; unsectioned members share
  one unsectioned ordering scope.

These cross-entry rules include drafts so conflicts are caught before a draft
is published.

## Blog SEO Mapping

Article metadata uses the existing blog fields; no SEO-only content fields are
required:

- `title` and `description` populate primary, Open Graph, Twitter, and
  `BlogPosting` text.
- `pubDate` is the publication date. `updatedDate` is the modified date when
  present; otherwise metadata uses `pubDate` for both.
- `heroImage` is the preferred share image and `coverImage` is the secondary
  fallback. Articles without either use the site-level `public/og.png`.
- category metadata becomes `article:section` and breadcrumb ancestors.
- `tags` become repeated Open Graph article tags and JSON-LD keywords.

Dates in frontmatter represent calendar dates in the site's Asia/Shanghai
timezone rather than arbitrary instants. SEO timestamps therefore serialize at
midnight with the `+08:00` offset.

## Blog Content Integrity

`npm run check:content` validates cross-entry metadata and reliable local
references before the Astro build:

- series and section references plus item-order consistency
- album-review references, Music album references, and duplicate album track numbers
- tag normalization, normalized duplicates, and unknown-tag diagnostics
- Markdown links to published blog routes
- Markdown images, relative imports, and `heroImage` / `coverImage` files
- site-root assets under `public`

Missing references in published entries fail the check. References to known
draft posts and missing files inside drafts remain warnings so unfinished
content can stay in the repository. Ambiguous bare relative links are also
warnings; authors should use `/blog/<slug>/` or an explicit file path.

Large animated images such as GIF or animated WebP demos should live under `public/blog/gif` and be referenced with site-root paths, for example `/blog/gif/demo-name.webp`. This keeps Astro's image optimization pipeline from trying to transform every animation frame during build.

## Watch Collection

Source directory: `src/content/watch`

File type: YAML, YML, or JSON

The Watch schema is a strict discriminated union keyed by `mediaType`. Shared
fields are:

- `title`
- `mediaType`: `movie` or `series`
- `coverImage`
- `shortReview`

Shared optional fields:

- `originalTitle`
- `tmdbId`
- `releaseDate`

Movie records require:

- `rating`: between `0` and `5`
- `finishedDate`

Movie records cannot define `seasons`.

Series records use exactly one of two rating modes. Overall-rated series
require:

- `rating`: between `0` and `5`
- no `seasons`

Season-rated series require:

- `seasons`: a non-empty list of season records
- `seasons[].number`: a unique non-negative season number
- `seasons[].rating`: a number between `0` and `5`, or `to-watch`

Season-rated series cannot define a top-level `rating`. Series `finishedDate`
remains optional; for season-rated records it is valid only when no season is
`to-watch`.

Optional season fields:

- `seasons[].posterImage`: a local season-poster asset
- `seasons[].shortReview`: a short note for that season

`to-watch` marks every season that has not been started. It may therefore appear
on multiple seasons, but the values must form one trailing block: after the
first `to-watch`, every higher recorded season must also be `to-watch`. Every
series record must include at least one started season with a numeric rating. A
series with any `to-watch` season cannot have `finishedDate`.

`finishedDate` is optional for series and is only set after the final season is
finished. Season 0 is allowed by the schema for manual special-episode records,
but the creation script excludes it by default.

`coverImage` is required. Automated TMDB creation requests English metadata for
poster selection, allowing TMDB to fall back to the original-language poster
instead of downloading a Chinese-localized poster. Series creation applies the
same metadata choice to regular-season posters and writes `posterImage` only
when a poster was downloaded successfully.

## Albums Collection

Source directory: `src/content/albums`

File type: YAML, YML, or JSON

Each record is the authoritative identity for one album. Its filename without
the data-file extension is the stable album ID.

Required fields:

- `title`
- `artist`
- `coverImage`
- `releaseDate`

Albums do not have standalone public routes. Album-review Blog posts and album
tracks reference the same record through `albumId`.

## Music Collection

Source directory: `src/content/music`

File type: YAML, YML, or JSON

Music entries are loaded through `glob` with the pattern `**/*.{yaml,yml,json}`.

Required fields:

- `title`
- `artist`
- `recordedAt`: the date the listening record was kept, not the release date

Optional fields:

- `albumId`
- `trackNumber`: a positive integer, unique within an album when present
- `coverImage`: required in practice for standalone tracks; album tracks fall
  back to their album's cover
- `audioPreview`
- `links.spotify`
- `links.netease`
- `links.qqMusic`
- `appLinks.netease`
- `appLinks.qqMusic`

## Maintenance Notes

- Schema changes should be made in the matching module under
  `src/content-schema`; collection registration belongs in
  `src/content.config.ts`.
- Category and tag metadata changes should be made in `src/utils/blogTaxonomy.ts`.
- Cross-entry rules live in `src/utils/blogIntegrity.ts`; filesystem scanning
  lives in `scripts/lib/blogContentFiles.ts`. Album/Music relationships are
  validated by `src/utils/musicIntegrity.ts` and
  `scripts/lib/musicContentFiles.ts`.
- Update this document when fields, category requirements, or collection loading behavior changes.
- Run `npm test` and `npm run build` after content schema or integrity changes.

## Space Build Projection

`/space` adds no collection. Its edition configuration references Blog content,
defines presentation-only project and Direction data, and sets random draw
limits. The resolver validates those references and projects eligible annual
Watch and standalone Music pools into browser-safe records; Music records with
`albumId` are excluded, and each pool must contain at least eight entries.
Source collections remain authoritative for titles, dates, ratings, posters,
previews, routes, and publication state. See
`modules/space/overview.md` for the full edition contract.
