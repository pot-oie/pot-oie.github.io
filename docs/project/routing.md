# Routing

Astro file routing maps files in `src/pages` to site URLs. Dynamic routes are used for blog categories, individual posts, watch details, and music month pages.

## Top-Level Routes

- `/`: `src/pages/index.astro`
- `/about`: `src/pages/about.astro`
- `/dashboard`: `src/pages/dashboard.astro`; private static analytics UI,
  excluded from sitemap and Pagefind content.
- `/space`: `src/pages/space/index.astro`; normal `BaseLayout.astro` edition
  index backed by `src/utils/space/editions.ts`. It is the stable Header
  destination, is included in the sitemap and Pagefind, and explicitly emits
  `index, follow`. The homepage hero resolves the registry's current edition
  and links directly to its annual route.
- `/space/2026`: `src/pages/space/2026.astro`; standalone `2025.08—2026.08`
  edition with five abstract chapters, five corresponding detail hashes, and
  an unnumbered normal-flow Colophon at the document end. Valid hashes are
  `#learning`, `#film`, `#music`, `#development`, `#direction`, and each value
  with `-detail`. It emits `index, follow`, is linked from the edition index,
  and is deliberately omitted from both the sitemap and Pagefind to avoid
  indexing duplicate projected domain content. It bypasses `BaseLayout.astro`,
  Astro View Transitions, and the global audio controller.
- `/404`: `src/pages/404.astro`
- `/rss.xml`: `src/pages/rss.xml.js`

## Nginx-Only Endpoints

These paths are not Astro routes and are installed manually on the server:

- `POST /__metrics`: write-only anonymous event collector; returns `204`.
- `GET /dashboard/metrics.json`: exact alias for
  `/var/lib/passpot/metrics.json`, protected by Dashboard Basic Auth and
  `Cache-Control: no-store`.

The aggregate path deliberately lives outside `/var/www/passpot`, which is
replaced with `rsync --delete` during deployment.

## Blog Routes

- `/blog`: `src/pages/blog/index.astro`
- `/blog/[slug]`: `src/pages/blog/[...slug].astro`
- `/blog/[category]`: `src/pages/blog/[category].astro`
- `/blog/learn/[techCategory]`: `src/pages/blog/learn/[techCategory].astro`
- `/blog/life/[lifeCategory]`: `src/pages/blog/life/[lifeCategory].astro`
- `/blog/page/[page]`: `src/pages/blog/page/[page].astro`
- `/blog/[category]/page/[page]`: `src/pages/blog/[category]/page/[page].astro`
- `/blog/learn/[techCategory]/page/[page]`: `src/pages/blog/learn/[techCategory]/page/[page].astro`
- `/blog/life/[lifeCategory]/page/[page]`: `src/pages/blog/life/[lifeCategory]/page/[page].astro`

Blog routes read from the `blog` content collection and exclude entries with
`draft: true` in list views. Every archive uses its existing route as the
canonical first page and generates later pages under `/page/N/`; `/page/1/` is
never generated. Pagination is static, uses 12 posts per page, and invalid page
numbers fall through to the static 404 response.

There are currently no standalone Series or Tags discovery routes. Existing
series navigation and tag presentation remain inside article reading
experiences. Future Series and Tags modules require independent information
architecture, top-level entry, and route design; provisional `/blog/series/*`
and `/blog/tags/*` paths are not reserved.

## Watch Routes

- `/watch`: `src/pages/watch/index.astro`
- `/watch/movie`: `src/pages/watch/[mediaType].astro`
- `/watch/series`: `src/pages/watch/[mediaType].astro`
- `/watch/series/[slug]`: `src/pages/watch/series/[...slug].astro`

Watch routes read from the `watch` content collection. The archive filter uses
real static routes for all records, movies, and series. Only season-rated series
generate detail pages; movies and overall-rated series keep their list-card
short-review interaction.

## Music Routes

- `/music`: `src/pages/music/index.astro`
- `/music/[month]`: `src/pages/music/[month].astro`

Music routes read from the `music` content collection, including nested YAML files loaded by the glob loader.

## Space Route Boundary

The stable index and isolated annual documents intentionally use different
page shells. Header links to `/space` use the Astro client router. The homepage
hero links directly to the registry's current edition. That link, links from
`/space` into an edition, and the edition's `← HOME` and `← SPACE INDEX` links carry
`data-astro-reload` so global and edition-owned styles and runtimes cross the
boundary through a full document load. Future editions must add one typed
registry entry and one matching `src/pages/space/<year>.astro` route; they are
not required to reuse the 2026 layout or components.

## Route Maintenance

When adding or changing a route:

1. Update this file.
2. Update the relevant module document under `docs/project/modules`.
3. Confirm related collection fields still match `src/content.config.ts`.
4. Run `npm run build` when the change affects routing, content loading, or generated paths.
