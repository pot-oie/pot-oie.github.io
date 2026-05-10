# Blog Module

The blog module handles technical notes, life writing, album review posts, and movie long-form posts stored in the `blog` collection.

## Source Areas

- Content: `src/content/blog`
- Routes: `src/pages/blog`
- Layouts: `src/layouts/TechPost.astro`, `src/layouts/LifePost.astro`, `src/layouts/AlbumPost.astro`
- Cards: `src/components/PostCard.astro`, `src/components/PostCardForIndex.astro`, `src/components/BlogRowCard.astro`
- Taxonomy: `src/utils/blogTaxonomy.ts`

## Content Rules

Blog entries are MDX files with frontmatter validated by the `blog` collection schema.

- Technical posts use `category: "learn"` and must set `techCategory`.
- Life posts use `category: "life"` and must set `lifeCategory`.
- Draft posts should use `draft: true`.
- Tags are optional, normalized, and rendered in technical post layouts.

## Rendering

Technical posts use `TechPost.astro`, which includes:

- category and tag pills
- optional hero image
- table of contents
- code block interaction templates

Life posts use `LifePost.astro`, which has a quieter centered article layout.

## Related Documents

- `docs/project/content-model.md`
- `docs/project/routing.md`
- `docs/project/modules/blog/taxonomy.md`
