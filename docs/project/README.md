# Project Documentation

This directory is the maintained knowledge base for the blog repository. It is organized from broad project structure to module-specific details.

## Read Order

1. `architecture.md`: understand the repository layers and how data flows through the site.
2. `routing.md`: understand URL structure and page entry points.
3. `content-model.md`: understand collection schemas and frontmatter rules.
4. `writing-style.md`: understand Pot's article voice before editing or expanding blog content.
5. `styling.md`: understand the visual system and global style constraints.
6. `components.md`: understand the UI component groups and ownership boundaries.
7. `interaction.md`: understand global events, storage keys, and page-transition behavior.
8. `scripts.md`: understand local automation and content creation scripts.
9. `deployment.md`: understand the build and deployment path.
10. `modules/*/overview.md`: understand each content module in more detail.

## Documentation Layers

- Root entry: `AGENTS.md` keeps short collaboration notes for AI-assisted maintenance.
- Project layer: files directly under `docs/project` describe cross-cutting architecture, routes, content, styling, components, interactions, scripts, and deployment.
- Writing layer: `docs/project/writing-style.md` captures article voice and expansion preferences for future blog edits.
- Module layer: `docs/project/modules/*` describes blog, movie, music, search, or other feature areas.
- Decision layer: future files under `docs/project/decisions` should record important design decisions and tradeoffs.

## Maintenance Rule

When a change modifies a project convention, update the nearest matching document in this tree during the same change. Keep documents focused: one document should explain one level of the system, not every detail in the repository.
