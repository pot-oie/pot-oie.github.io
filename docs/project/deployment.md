# Deployment

The site is built as a static Astro site and deployed to the Aliyun server that hosts `passpot.cn` through GitHub Actions.

## Workflow

Deployment workflow:

- `.github/workflows/deploy.yml`

Triggers:

- push to `main`
- manual `workflow_dispatch`

Build environment:

- Ubuntu latest runner
- Node.js from `.node-version`
- `npm ci`
- `npm run build`

Deployment target:

- Aliyun server through `easingthemes/ssh-deploy`
- Source directory: `dist/`
- Remote target: `/var/www/passpot`

The analytics aggregate is deliberately outside this target at
`/var/lib/passpot/metrics.json`; otherwise `rsync --delete` would remove it.

## Build Check

The repository also keeps a separate build-check workflow:

- `.github/workflows/ci.yml`

It runs on push, pull request, and manual dispatch. The workflow runs
`npm test`, then `npm run build`. The build command includes the deterministic
blog content integrity check before Astro generation and Pagefind indexing.
This workflow validates tests, content, and the production build but does not
deploy.

The deployment workflow also uses `npm run build`, so invalid published blog
metadata, series conflicts, broken published-blog links, or missing referenced
assets stop deployment. These checks use only repository files and do not
require network access.

## Environment Variables

Required GitHub Actions secrets:

- `ALIYUN_KEY`
- `ALIYUN_HOST`
- `ALIYUN_USER`

Local content automation can use the variables documented in `.env.example`.

## Site Configuration

The canonical site URL is configured in `astro.config.mjs` as:

```js
site: "https://passpot.cn"
```

This value is used by sitemap and RSS-related output.

Canonical links, Open Graph/Twitter URLs, article share-image URLs, and JSON-LD
URLs are also resolved against `Astro.site`. The shared fallback social card is
served from `/og.png`; build-time article images resolve to their generated
absolute `/_astro/...` URLs.

## Maintenance Notes

- Run `npm test` and `npm run build` locally before changing
  deployment-sensitive behavior when possible.
- If deployment target, Node version, build command, workflow behavior, or server process changes, update this document.

## Anonymous Analytics Operations

Analytics does not change the static deployment workflow. Nginx accepts a
write-only empty POST and writes JSONL; root cron runs the standard-library
Python aggregator every ten minutes. No Codex CLI, database, Node service,
Umami, or PostgreSQL is installed on the server.

Manual server files and exact commands live in `ops/passpot-metrics/`. The
server operator must:

1. install `scripts/analytics/aggregate_metrics.py` outside the deployment
   target;
2. create `/var/lib/passpot` as `root:www-data` mode `0750`;
3. install the cron file and generate the first aggregate;
4. add the exact Basic Auth-protected `/dashboard/metrics.json` Nginx location;
5. retain the metrics log for 30 daily rotations without defining duplicate
   logrotate stanzas;
6. run `nginx -t`, reload Nginx, and verify authenticated JSON access.

See `docs/project/analytics.md` for the data contract and privacy boundaries.
