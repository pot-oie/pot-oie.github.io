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

`scripts/new.mjs` is an interactive content manager for movie and music records. Movie creation can use TMDB through `TMDB_API_KEY` and a proxy configured by `PROXY_URL`, then writes a YAML record under `src/content/movie`.

`scripts/update-music.mjs` updates music records.

`scripts/fetch-album.mjs` fetches album data.

## Maintenance Notes

- When adding a script, document its purpose, inputs, and outputs here.
- If a script changes content schema expectations, update `docs/project/content-model.md`.
- If a script needs secrets or environment variables, document them here and in deployment notes when relevant.
