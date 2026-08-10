# Architecture

This project is a personal content site built with Astro 5. It combines a blog archive, watch records, and music records into one static site.

## Core Stack

- Astro 5 for file-based routing and static generation.
- Astro Content Collections for typed MDX and YAML content.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- MDX through `@astrojs/mdx`.
- Sitemap through `@astrojs/sitemap`.
- RSS through `src/pages/rss.xml.js`.
- Pagefind for static full-site search after production build. Indexing is scoped to the shared `main[data-pagefind-body]` region so global chrome and search modal copy do not pollute excerpts.
- `astro-icon` with Iconify icon sets.
- Lenis and Astro View Transitions for normal-site interaction polish.

## Repository Layers

`src/pages` is the route layer. Astro files here define URLs and assemble data, layouts, and components.

`src/layouts` is the page skeleton layer. Layouts such as `BaseLayout.astro`,
`TechPost.astro`, `LifePost.astro`, and `AlbumPost.astro` define normal page
structures.

`src/components` is the reusable UI and interaction layer. It includes site chrome, cards, search, music controls, table of contents, and article-specific demos.

`src/content` is the content source layer. Blog entries are MDX. Watch, Music,
first-class Blog series, and Album entries are data files loaded through glob
loaders where appropriate.

`src/content-schema` is the collection-schema layer. Each maintained content
domain owns a focused schema module, while `src/content.config.ts` remains the
small Astro composition root that exports the registered collection names.

`src/domain` is the pure domain/query layer. It owns stable Blog and Watch
filtering, ordering, relationships, and href behavior without loading
collections itself.

`src/styles` is the global style layer. `global.css` defines the theme tokens and site-wide behavior. `markdown.css` handles rendered article content.

`src/scripts/runtime` is the browser-runtime layer. Focused modules own Lenis,
search-result hash scrolling, anonymous analytics, persistent audio, math overflow,
and the article image lightbox; small Astro runtime components compose them at
page boundaries.

Space is an annual publication family. `/space` is a normal `BaseLayout.astro`
index backed by a typed edition registry, while each `/space/<edition-year>`
route is an edition-owned static document with build-time collection projection
and route-local progressive enhancement. Annual documents do not share the
normal site shell, Lenis, audio, analytics, or client-router runtime. See
`modules/space/overview.md` for the route, component, data, and interaction
boundaries.

`src/utils` contains cross-cutting helpers such as calendar calculations, Blog
taxonomy metadata, content-integrity diagnostics, and shared SEO
URL/image/structured-data helpers. Compatibility re-exports remain at
`src/utils/blog.ts`, `src/utils/blogRoutes.ts`, and `src/utils/watch.ts` while
callers migrate to `src/domain`.

`src/assets` stores imported build-time assets for blog, watch, and music content. `public` stores files served as-is.

`scripts` contains content production automation and the standard-library
analytics aggregator.

`ops/passpot-metrics` contains copyable, manually installed server
configuration for the anonymous metrics pipeline. These files are not copied
into `dist`.

## Data Flow

Content starts in `src/content`. Focused collection schemas in
`src/content-schema` validate fields and normalize some data at build time;
`src/content.config.ts` only composes the `blog`, `watch`, and `music`
collections Astro loads.

Pages call `getCollection(...)` at route or build boundaries. Blog routes pass
the loaded entries to pure functions in `src/domain/blog.ts`, which own published
post filtering, archive ordering and counts, post URLs, and series assembly.
`src/domain/blogRoutes.ts` owns archive route shapes, canonical pagination links,
and exact route sets derived from the published corpus; page generation, search
classification, and content-reference validation share that policy.
Music routes resolve tracks through `src/domain/music.ts`, including album
relationships and the album-cover fallback, before passing view models to
components. Other modules keep their transformations in their nearest domain
utilities.

Blog entry-local relationships are enforced by the collection schema and
`src/content-schema/blogRelations.ts`; cross-entry rules remain in
`src/utils/blogIntegrity.ts`. Before Astro builds, a filesystem adapter
checks cross-entry series metadata, tag diagnostics, and reliable local
references without network access.

Layouts provide page-level structure and select the runtime composition needed
by each page. `BaseLayout.astro` keeps the shared document skeleton and composes
global runtime components, while article-capable layouts opt into the separate
article runtime. Components render cards, lists, controls, search UI, and
module-specific interactions.

Global CSS and Tailwind utility classes define the visual system. Production build emits the static site into `dist`, then Pagefind indexes `dist`.

Anonymous metrics follow a separate static-compatible data path: browser events
are accepted and logged by Nginx, a scheduled Python script atomically generates
`/var/lib/passpot/metrics.json`, and the static Dashboard fetches that file
through an exact Basic Auth-protected Nginx alias. See
`docs/project/analytics.md`.

## Important Cross-Cutting Behavior

- `BaseLayout.astro` owns global page chrome and composes
  `GlobalRuntime.astro`, `GlobalAudioRuntime.astro`, and, when requested,
  `ArticleRuntime.astro`.
- `BaseHead.astro` owns canonical, Open Graph, Twitter, and JSON-LD output.
  Article layouts supply typed article context through `BaseLayout.astro`;
  `src/utils/seo.ts` resolves absolute assets and builds the single
  `BlogPosting`/`BreadcrumbList` graph.
- Focused modules under `src/scripts/runtime` own the browser implementations;
  all initializers are safe to call again after `astro:page-load`.
- Anonymous analytics use a tab-scoped `sessionStorage` ID and never persist
  metric data in the browser.
- `astro.config.mjs` filters `/dashboard` and the current `/space/2026` annual
  document from sitemap generation; the `/space` edition index is included.
- `src/layouts/space/Space2026Layout.astro` is a self-contained annual document
  and intentionally does not import `BaseHead.astro` or global CSS.
- `npm run build` validates blog content, runs `astro build`, then runs
  `pagefind --site dist`.

## Source References

- `astro.config.mjs`
- `package.json`
- `src/content.config.ts`
- `src/content-schema`
- `src/domain/blog.ts`
- `src/domain/blogRoutes.ts`
- `src/domain/watch.ts`
- `src/utils/blogIntegrity.ts`
- `src/pages`
- `src/layouts`
- `src/components`
- `src/scripts/runtime`
- `src/styles`
- `src/utils`
