# Routing

Astro file routing maps files in `src/pages` to site URLs. Dynamic routes are used for blog categories, individual posts, watch details, and music month pages.

## Top-Level Routes

- `/`: `src/pages/index.astro`
- `/about`: `src/pages/about.astro`
- `/dashboard`: `src/pages/dashboard.astro`
- `/404`: `src/pages/404.astro`
- `/rss.xml`: `src/pages/rss.xml.js`

## Blog Routes

- `/blog`: `src/pages/blog/index.astro`
- `/blog/[slug]`: `src/pages/blog/[...slug].astro`
- `/blog/[category]`: `src/pages/blog/[category].astro`
- `/blog/learn/[techCategory]`: `src/pages/blog/learn/[techCategory].astro`
- `/blog/life/[lifeCategory]`: `src/pages/blog/life/[lifeCategory].astro`

Blog routes read from the `blog` content collection and exclude entries with `draft: true` in list views.

## Watch Routes

- `/watch`: `src/pages/watch/index.astro`
- `/watch/movie`: `src/pages/watch/[mediaType].astro`
- `/watch/series`: `src/pages/watch/[mediaType].astro`
- `/watch/series/[slug]`: `src/pages/watch/series/[...slug].astro`

Watch routes read from the `watch` content collection. The archive filter uses
real static routes for all records, movies, and series. Only series generate
detail pages for per-season ratings; movies keep their list-card short-review
interaction.

## Music Routes

- `/music`: `src/pages/music/index.astro`
- `/music/[month]`: `src/pages/music/[month].astro`

Music routes read from the `music` content collection, including nested YAML files loaded by the glob loader.

## Route Maintenance

When adding or changing a route:

1. Update this file.
2. Update the relevant module document under `docs/project/modules`.
3. Confirm related collection fields still match `src/content.config.ts`.
4. Run `npm run build` when the change affects routing, content loading, or generated paths.
