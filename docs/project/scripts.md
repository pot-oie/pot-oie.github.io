# Scripts

Project scripts are defined in `package.json`. Content automation scripts live in `scripts`.

## NPM Scripts

- `npm run dev`: start Astro development server.
- `npm run build`: validate blog content, run `astro build`, then generate the
  Pagefind index with `pagefind --site dist`.
- `npm run check:content`: validate blog entry relationships, cross-entry series
  metadata, tags, internal blog links, and reliable local asset references.
- `npm test`: run the Node test suite through the lightweight `tsx` TypeScript
  loader, then run the Python analytics fixture tests.
- `npm run preview`: preview the built site.
- `npm run astro`: run Astro CLI.
- `npm run new`: run `scripts/new.mjs`.
- `npm run update`: run `scripts/update-music.mjs`.
- `npm run album`: run `scripts/fetch-album.mjs`.

## Content Scripts

`scripts/new.mjs` is an interactive content manager for movie, series, and
music records. Movie and series creation use TMDB through `TMDB_API_KEY` and a
proxy configured by `PROXY_URL`, then write YAML records under
`src/content/watch`.

TMDB search uses Chinese metadata for the display title and English metadata
for poster selection, with original-language fallback. Like the album scraper,
watch creation writes an editable draft instead of asking for ratings and
reviews interactively. Movie drafts start with `rating: 0` and an empty review.
Series drafts exclude Season 0, give the first regular season a `rating: 0`
placeholder, mark every later regular season `to-watch`, leave `finishedDate`
absent, and leave the review empty. The author replaces numeric placeholders
for every season already started.

`scripts/update-music.mjs` updates music records.

`scripts/fetch-album.mjs` fetches album data.

`scripts/check-blog-content.ts` scans all blog MDX sources and delegates pure
metadata checks to `src/utils/blogIntegrity.ts`. It prints actionable
`entry [field] message` diagnostics and exits nonzero when errors exist.
Warnings do not block builds. Its filesystem adapter is
`scripts/lib/blogContentFiles.ts`. Internal blog links are checked against the
exact published article and archive route set; archive paths and page counts
come from `src/utils/blogRoutes.ts`, so nonexistent categories and out-of-range
pages fail validation.

## Analytics Script

`scripts/analytics/aggregate_metrics.py` uses only the Python standard library.
It reads the current and rotated
`/var/log/nginx/passpot-metrics.log*` JSONL files, validates the anonymous event
contract, keeps a 30-calendar-day window, and atomically writes
`/var/lib/passpot/metrics.json`. It supports `.gz` rotations, repeatable
`--log-glob`, `--period-days`, `--timezone`, and an optional output `--group`.

The production cron and manual installation instructions live under
`ops/passpot-metrics/`. Tests use only isolated fixtures and temporary output.

## Maintenance Notes

- Copy `.env.example` to `.env` for local content automation that needs external APIs or a proxy.
- When adding a script, document its purpose, inputs, and outputs here.
- If a script changes content schema expectations, update `docs/project/content-model.md`.
- If a script needs secrets or environment variables, document them here and in deployment notes when relevant.
- Content integrity checks must stay deterministic and must not require network
  access.
