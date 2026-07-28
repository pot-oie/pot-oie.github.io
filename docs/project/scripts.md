# Scripts

Project scripts are defined in `package.json`. Content automation scripts live in `scripts`.

## NPM Scripts

- `npm run dev`: start Astro development server.
- `npm run build`: run `astro build`, then generate the Pagefind index with `pagefind --site dist`.
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

## Maintenance Notes

- Copy `.env.example` to `.env` for local content automation that needs external APIs or a proxy.
- When adding a script, document its purpose, inputs, and outputs here.
- If a script changes content schema expectations, update `docs/project/content-model.md`.
- If a script needs secrets or environment variables, document them here and in deployment notes when relevant.
