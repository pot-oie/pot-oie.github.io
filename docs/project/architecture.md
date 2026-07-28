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
- Lenis and Astro View Transitions for page interaction polish.

## Repository Layers

`src/pages` is the route layer. Astro files here define URLs and assemble data, layouts, and components.

`src/layouts` is the page skeleton layer. Layouts such as `BaseLayout.astro`, `TechPost.astro`, `LifePost.astro`, and `AlbumPost.astro` define major page structures.

`src/components` is the reusable UI and interaction layer. It includes site chrome, cards, search, music controls, table of contents, and article-specific demos.

`src/content` is the content source layer. Blog entries are MDX. Watch and music entries are YAML loaded through glob loaders.

`src/styles` is the global style layer. `global.css` defines the theme tokens and site-wide behavior. `markdown.css` handles rendered article content.

`src/scripts/runtime` is the browser-runtime layer. Focused modules own Lenis,
search-result hash scrolling, anonymous analytics, persistent audio, math overflow,
and the article image lightbox; small Astro runtime components compose them at
page boundaries.

`src/utils` is the domain utility layer. Current examples include calendar
helpers, blog taxonomy metadata, the typed blog domain/query layer, and shared
SEO URL/image/structured-data helpers.

`src/assets` stores imported build-time assets for blog, watch, and music content. `public` stores files served as-is.

`scripts` contains content production automation and the standard-library
analytics aggregator.

`ops/passpot-metrics` contains copyable, manually installed server
configuration for the anonymous metrics pipeline. These files are not copied
into `dist`.

## Data Flow

Content starts in `src/content`. Collection schemas in `src/content.config.ts` validate fields and normalize some data at build time.

Pages call `getCollection(...)` at route or build boundaries. Blog routes pass
the loaded entries to pure functions in `src/utils/blog.ts`, which own published
post filtering, archive ordering and counts, post URLs, and series assembly.
`src/utils/blogRoutes.ts` owns archive route shapes, canonical pagination links,
and exact route sets derived from the published corpus; page generation, search
classification, and content-reference validation share that policy.
Other modules keep their transformations in their nearest domain utilities.

Blog entry relationships are enforced by the collection schema and shared pure
rules in `src/utils/blogIntegrity.ts`. Before Astro builds, a filesystem adapter
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
- `astro.config.mjs` filters `/dashboard` from sitemap generation.
- `npm run build` validates blog content, runs `astro build`, then runs
  `pagefind --site dist`.

## Source References

- `astro.config.mjs`
- `package.json`
- `src/content.config.ts`
- `src/utils/blog.ts`
- `src/utils/blogRoutes.ts`
- `src/utils/blogIntegrity.ts`
- `src/pages`
- `src/layouts`
- `src/components`
- `src/scripts/runtime`
- `src/styles`
- `src/utils`
