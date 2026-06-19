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

Tags are normalized by `normalizeBlogTag` from `src/utils/blogTaxonomy.ts`. Duplicate normalized tags are removed.

Technical learning-note series can use `series` to opt into article-to-article navigation on the detail page:

- `series.key`: stable grouping key shared by every post in the same set.
- `series.title`: display title for the set.
- `series.section.title`: optional second-level group title shown inside the series navigation.
- `series.section.order`: positive integer used for ordering second-level groups.
- `series.subtitle`: optional per-post label shown in the series navigation.
- `series.order`: positive integer used for ordering within its group.

Draft posts may carry `series` metadata, but detail-page navigation only lists published posts.

Large animated images such as GIF or animated WebP demos should live under `public/blog/gif` and be referenced with site-root paths, for example `/blog/gif/demo-name.webp`. This keeps Astro's image optimization pipeline from trying to transform every animation frame during build.

## Movie Collection

Source directory: `src/content/movie`

File type: YAML, YML, or JSON

Fields:

- `title`
- `releaseDate`
- `viewingDate`
- `rating`
- `coverImage`
- `shortReview`

`rating` must be between `0` and `5`. `coverImage` is required.

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
- Update this document when fields, category requirements, or collection loading behavior changes.
- Run `npm run build` after content schema changes.
