# Deployment

The site is built as a static Astro site and deployed through GitHub Actions.

## Workflow

Deployment workflow:

- `.github/workflows/deploy.yml`

Triggers:

- push to `main`
- manual `workflow_dispatch`

Build environment:

- Ubuntu latest runner
- Node.js `24.11.0`
- `npm ci`
- `npm run build`

Deployment target:

- Aliyun server through `easingthemes/ssh-deploy`
- Source directory: `dist/`
- Remote target: `/var/www/passpot`

## Required Secrets

- `ALIYUN_KEY`
- `ALIYUN_HOST`
- `ALIYUN_USER`

## Site Configuration

The canonical site URL is configured in `astro.config.mjs` as:

```js
site: "https://passpot.cn"
```

This value is used by sitemap and RSS-related output.

## Maintenance Notes

- Run `npm run build` locally before changing deployment-sensitive behavior when possible.
- If deployment target, Node version, or build command changes, update this document.
