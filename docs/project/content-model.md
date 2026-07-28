# Content Model

Content is managed through Astro Content Collections in `src/content.config.ts`.

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
- `albumTitle`
- `albumArtist`
- `tags`
- `series`

Category rules:

- `category: "learn"` requires `techCategory`.
- `category: "life"` requires `lifeCategory`.
- `techCategory` and `lifeCategory` are mutually exclusive; each is only valid
  for its matching primary category.
- `series` is only valid for `learn` entries.
- `lifeCategory: "album"` requires both `albumTitle` and `albumArtist`.
- `albumTitle` and `albumArtist` are invalid on non-album entries.

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

- `series.key`: stable grouping key shared by every post in the same set.
- `series.title`: display title for the set.
- `series.section.title`: optional second-level group title shown inside the series navigation.
- `series.section.order`: positive integer used for ordering second-level groups.
- `series.subtitle`: optional per-post label shown in the series navigation.
- `series.order`: positive integer used for ordering within its group.

Draft posts may carry `series` metadata, but detail-page navigation only lists published posts.

Across all entries sharing a `series.key`:

- `series.title` must be consistent.
- one `series.section.order` must map to one section title, and one section
  title must map to one order.
- `series.order` must be unique inside its section; unsectioned series entries
  share one unsectioned ordering scope.

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

- series title, section, and item-order consistency
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

Shared fields:

- `title`
- `originalTitle`
- `tmdbId`
- `mediaType`: `movie` or `series`
- `releaseDate`
- `finishedDate`
- `coverImage`
- `shortReview`

Movie records require:

- `rating`: between `0` and `5`
- `finishedDate`

Series records require:

- `seasons`: a non-empty list of season records
- `seasons[].number`: a unique non-negative season number
- `seasons[].rating`: a number between `0` and `5`, or `to-watch`

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
instead of downloading a Chinese-localized poster.

## Music Collection

Source directory: `src/content/music`

File type: YAML, YML, or JSON

Music entries are loaded through `glob` with the pattern `**/*.{yaml,yml,json}`.

Fields:

- `title`
- `artist`
- `album`
- `trackNumber`
- `coverImage`
- `pubDate`
- `audioPreview`
- `links.spotify`
- `links.netease`
- `links.qqMusic`
- `appLinks.netease`
- `appLinks.qqMusic`

## Maintenance Notes

- Schema changes should be made in `src/content.config.ts`.
- Category and tag metadata changes should be made in `src/utils/blogTaxonomy.ts`.
- Cross-entry rules live in `src/utils/blogIntegrity.ts`; filesystem scanning
  lives in `scripts/lib/blogContentFiles.ts`.
- Update this document when fields, category requirements, or collection loading behavior changes.
- Run `npm test` and `npm run build` after content schema or integrity changes.
