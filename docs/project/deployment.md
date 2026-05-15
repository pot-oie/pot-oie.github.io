# Deployment

The site is built as a static Astro site on the cloud server that hosts `passpot.cn`.

## Build Environment

Use the Node.js version declared in the repository root:

- `.node-version`: `24.11.0`

Server build command:

```bash
npm ci
npm run build
```

The production output is written to `dist/`.

## GitHub Workflow

GitHub Actions is used as a build check only. It does not deploy the site.

Workflow:

- `.github/workflows/ci.yml`

Triggers:

- push to `main`
- pull request targeting `main`
- manual `workflow_dispatch`

The workflow installs dependencies with `npm ci` and runs `npm run build`.

## Environment Variables

Runtime deployment does not require repository secrets.

Local content automation can use the variables documented in `.env.example`.

## Site Configuration

The canonical site URL is configured in `astro.config.mjs` as:

```js
site: "https://passpot.cn"
```

This value is used by sitemap and RSS-related output.

## Maintenance Notes

- Run `npm run build` locally before changing deployment-sensitive behavior when possible.
- If deployment target, Node version, build command, or server process changes, update this document.
