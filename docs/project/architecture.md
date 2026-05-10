# Architecture

This project is a personal content site built with Astro 5. It combines a blog archive, movie records, and music records into one static site.

## Core Stack

- Astro 5 for file-based routing and static generation.
- Astro Content Collections for typed MDX and YAML content.
- Tailwind CSS v4 through `@tailwindcss/vite`.
- MDX through `@astrojs/mdx`.
- Sitemap through `@astrojs/sitemap`.
- RSS through `src/pages/rss.xml.js`.
- Pagefind for static full-site search after production build.
- `astro-icon` with Iconify icon sets.
- Lenis and Astro View Transitions for page interaction polish.

## Repository Layers

`src/pages` is the route layer. Astro files here define URLs and assemble data, layouts, and components.

`src/layouts` is the page skeleton layer. Layouts such as `BaseLayout.astro`, `TechPost.astro`, `LifePost.astro`, and `AlbumPost.astro` define major page structures.

`src/components` is the reusable UI and interaction layer. It includes site chrome, cards, search, music controls, table of contents, and article-specific demos.

`src/content` is the content source layer. Blog entries are MDX. Movie and music entries are YAML loaded through glob loaders.

`src/styles` is the global style layer. `global.css` defines the theme tokens and site-wide behavior. `markdown.css` handles rendered article content.

`src/utils` is the domain utility layer. Current examples include calendar helpers and blog taxonomy helpers.

`src/assets` stores imported build-time assets for blog, movie, and music content. `public` stores files served as-is.

`scripts` contains content production automation.

## Data Flow

Content starts in `src/content`. Collection schemas in `src/content.config.ts` validate fields and normalize some data at build time.

Pages call `getCollection(...)` to load content, sort or filter entries, and pass entries to layouts or components.

Layouts provide page-level structure and shared behavior. Components render cards, lists, controls, search UI, and module-specific interactions.

Global CSS and Tailwind utility classes define the visual system. Production build emits the static site into `dist`, then Pagefind indexes `dist`.

## Important Cross-Cutting Behavior

- `BaseLayout.astro` installs global page chrome, Lenis scrolling, search metrics storage, and the global audio element.
- Search metrics are stored in browser `localStorage` under `pot-search-metrics-v1`.
- `astro.config.mjs` filters `/dashboard` from sitemap generation.
- `npm run build` runs `astro build` first, then `pagefind --site dist`.

## Source References

- `astro.config.mjs`
- `package.json`
- `src/content.config.ts`
- `src/pages`
- `src/layouts`
- `src/components`
- `src/styles`
- `src/utils`
