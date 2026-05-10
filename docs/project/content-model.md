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

## Movie Collection

Source directory: `src/content/movie`

File type: MDX

Fields:

- `title`
- `releaseDate`
- `viewingDate`
- `rating`
- `coverImage`
- `shortReview`
- `haveReview`

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
