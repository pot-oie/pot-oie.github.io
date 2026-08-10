# Blog Module

The blog module handles technical notes, life writing, album review posts, and movie long-form posts stored in the `blog` collection.

## Source Areas

- Content: `src/content/blog`
- Routes: `src/pages/blog`
- Layouts: `src/layouts/TechPost.astro`, `src/layouts/LifePost.astro`, `src/layouts/AlbumPost.astro`
- Cards: `src/components/PostCard.astro`, `src/components/PostCardForIndex.astro`, `src/components/BlogRowCard.astro`
- Schema: `src/content-schema/blog.ts`
- Domain and queries: `src/domain/blog.ts`
- Archive route rules: `src/domain/blogRoutes.ts`
- Integrity rules: `src/utils/blogIntegrity.ts`
- Integrity scanner: `scripts/check-blog-content.ts`
- Taxonomy: `src/utils/blogTaxonomy.ts`

## Domain And Query Layer

Blog collection reads stay in route entry points. After a route loads the
collection, `src/domain/blog.ts` provides the typed, pure transformations shared
by blog archives and detail routes:

- published-post filtering treats only `draft: true` as unpublished
- root, primary-category, and second-level-category archive models
- archive filters and counts computed from the full published collection
- archive pagination slices and static page-link models
- canonical post slugs and hrefs
- ordered and section-grouped series navigation data

`src/domain/blogRoutes.ts` is the shared route-policy layer for blog archives. It
owns canonical page links, registered archive route shapes, and the exact
published route set derived from category counts. Static route generation,
Pagefind result classification, and content-link validation use these rules
instead of maintaining separate path heuristics.

Archive order represents the latest visible activity: `updatedDate` is used
when present, otherwise `pubDate`, with newest entries first. Publication order
is a separate explicit operation that ignores `updatedDate`. Series order is
ascending by `series.section.order`, then `series.order`, then `pubDate`;
unsectioned entries sort after numbered sections. Equal sort keys preserve
collection input order.

The series navigation types also live in this domain layer. Rendering
components consume the assembled model and do not query or regroup collection
entries themselves.

Entry-local category and album relationships are shared by the Astro schema and
the content integrity layer. Cross-entry series conflicts, tag diagnostics, and
reliable link/asset references are checked by `npm run check:content`; the
production build runs this check automatically.

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
- `TechnicalReadingRuntime.astro` for desktop/mobile series state, persisted
  navigation scroll, mobile panels, and table-of-contents behavior
- `TechnicalCodeRuntime.astro` for code action templates plus copy,
  collapse/expand, scroll-lock, and style-switching behavior

Life posts use `LifePost.astro`, which has a quieter centered article layout.
Blog detail layouts mount a floating return-to-top control once the reader has scrolled down the page.

## Article Metadata

`TechPost.astro`, `LifePost.astro`, and `AlbumPost.astro` assemble typed article
SEO context from existing frontmatter and taxonomy metadata, then pass it
through `BaseLayout.astro`. `BaseHead.astro` is the only renderer for:

- stable canonical URLs without query strings or fragments
- article Open Graph and Twitter metadata with absolute share images
- publication and modification timestamps
- one JSON-LD graph containing `BlogPosting` and `BreadcrumbList`

Share images prefer `heroImage`, then `coverImage`, then the site-level
`/og.png` fallback. Missing `updatedDate` falls back to `pubDate`. Breadcrumbs
follow the existing `/blog`, primary-category, and second-level-category routes;
no discovery routes are synthesized by metadata.

RSS excludes drafts and treats `pubDate` as the feed publication date, matching
the blog domain's explicit publication-order semantics. An `updatedDate` changes
archive activity order and article modified metadata, but does not republish the
entry in RSS.

## Archives

`/blog` is the root archive for all published writing and links to the `learn`
and `life` archives through route-backed filters. The learn and life archive
pages expose their own second-level filters, including an `all` option and
counts for every category. All archive levels use `BlogArchive.astro` for one
shared header, post list, empty state, pagination, and return-link composition.
`ArchiveHeader.astro` continues to own the header presentation.

Archives render 12 posts per page. The existing archive URL is always page one;
later pages use `/page/N/`, so no competing `/page/1/` canonical is generated.
Pagination uses ordinary static links, breadcrumbs identify later pages, and
the header count always describes the full active archive rather than the
current slice. Empty categories retain their first page and do not generate
later pages.

The primary site navigation links to `/blog`; learn and life are selected
inside the archive rather than occupying separate global navigation items.

## Deferred Discovery Modules

Series and Tags are not extensions of the Blog archive filters:

- Series is intended to become an independent information architecture,
  top-level entry, and ordered reading experience.
- Tags is intended to become an independent topic map or knowledge index.

The requirements are not yet defined well enough to add either module. No
standalone Series or Tags routes or UI are generated, existing in-article series
navigation and tag rendering remain unchanged, and future route names must be
designed rather than inferred from the current `/blog` hierarchy.

## Related Documents

- `docs/project/content-model.md`
- `docs/project/routing.md`
- `docs/project/modules/blog/taxonomy.md`
