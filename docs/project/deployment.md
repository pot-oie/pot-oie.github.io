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

## Build Check

The repository also keeps a separate build-check workflow:

- `.github/workflows/ci.yml`

It runs on push, pull request, and manual dispatch. This workflow validates the build but does not deploy.

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

## Maintenance Notes

- Run `npm run build` locally before changing deployment-sensitive behavior when possible.
- If deployment target, Node version, build command, workflow behavior, or server process changes, update this document.
