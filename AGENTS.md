# Codex Collaboration Notes

This repository is Pot's personal Astro content site. Read this file first, then follow the project documentation index at `docs/project/README.md`.

## Project Shape

- Framework: Astro 5 static site generation.
- Styling: Tailwind CSS v4 through the Vite plugin, plus global CSS in `src/styles/global.css`.
- Content system: Astro Content Collections in `src/content.config.ts`.
- Main content collections:
  - `src/content/blog`: MDX blog posts.
  - `src/content/movie`: MDX movie records.
  - `src/content/music`: YAML music records.
- Site URL: `https://passpot.cn`, configured in `astro.config.mjs`.

## Common Commands

- `npm run dev`: start local development.
- `npm run build`: build the site and generate the Pagefind index.
- `npm run preview`: preview the production build.
- `npm run new`: interactive content creation for movie/music records.
- `npm run update`: update music data.
- `npm run album`: fetch album data.

## Collaboration Rules

- Preserve user-created content. The content directories may contain drafts or untracked files.
- Prefer updating the relevant document under `docs/project` when changing structure, routes, content schema, styling rules, or module behavior.
- For content schema changes, update `docs/project/content-model.md`.
- For route changes, update `docs/project/routing.md` and the affected module document.
- For visual-system changes, update `docs/project/styling.md`.
- For blog taxonomy or tag changes, update `docs/project/modules/blog/taxonomy.md`.

## Current Documentation Map

- Project documentation index: `docs/project/README.md`
- Overall architecture: `docs/project/architecture.md`
- Routes: `docs/project/routing.md`
- Content model: `docs/project/content-model.md`
- Writing style guide: `docs/project/writing-style.md`
- Styling system: `docs/project/styling.md`
- Components: `docs/project/components.md`
- Interaction behavior: `docs/project/interaction.md`
- Scripts: `docs/project/scripts.md`
- Deployment: `docs/project/deployment.md`
- Blog module: `docs/project/modules/blog/overview.md`
- Movie module: `docs/project/modules/movie/overview.md`
- Music module: `docs/project/modules/music/overview.md`
