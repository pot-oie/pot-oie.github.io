# Blog Module

The blog module handles technical notes, life writing, album review posts, and movie long-form posts stored in the `blog` collection.

## Source Areas

- Content: `src/content/blog`
- Routes: `src/pages/blog`
- Layouts: `src/layouts/TechPost.astro`, `src/layouts/LifePost.astro`, `src/layouts/AlbumPost.astro`
- Cards: `src/components/PostCard.astro`, `src/components/PostCardForIndex.astro`, `src/components/BlogRowCard.astro`
- Taxonomy: `src/utils/blogTaxonomy.ts`
- Archive helpers: `src/utils/blogArchive.ts`

## Content Rules

Blog entries are MDX files with frontmatter validated by the `blog` collection schema.

- Technical posts use `category: "learn"` and must set `techCategory`.
- Life posts use `category: "life"` and must set `lifeCategory`.
- Draft posts should use `draft: true`.
- Tags are optional, normalized, and rendered in technical post layouts.
- Technical posts can opt into same-series navigation with `series.key`, `series.title`, `series.subtitle`, and `series.order`. Long series can add `series.section.title` and `series.section.order` for a second-level grouped guide.

## Rendering

Technical posts use `TechPost.astro`, which includes:

- category and tag pills
- optional hero image
- optional left-side series navigation for published posts sharing the same `series.key`; entries can be grouped by `series.section`, and item labels use each post's `series.subtitle`
- table of contents; on mobile, series navigation and the table of contents share one two-sided toggle panel when both are available
- bottom previous/next links for posts that belong to a multi-post series
- code block interaction templates

Life posts use `LifePost.astro`, which has a quieter centered article layout.
Blog detail layouts mount a floating return-to-top control once the reader has scrolled down the page.

## Archives

`/blog` is the root archive for all published writing and links to the `learn`
and `life` archives through route-backed filters. The learn and life archive
pages expose their own second-level filters, including an `all` option and
counts for every category. All archive levels share `ArchiveHeader.astro` for
breadcrumbs, bilingual titles, descriptions, current counts, and filter
placement.

The primary site navigation links to `/blog`; learn and life are selected
inside the archive rather than occupying separate global navigation items.

## Related Documents

- `docs/project/content-model.md`
- `docs/project/routing.md`
- `docs/project/modules/blog/taxonomy.md`
