# Series And Tags Discovery

Status: Parked

This plan preserves the unresolved discovery work formerly tracked as
conversation 06 of the completed blog improvement plan. It does not authorize
routes, navigation entries, or UI implementation.

## Product Boundary

Series and Tags are two independent modules:

- Series needs its own information architecture, top-level entry, and ordered
  reading experience.
- Tags needs its own topic map or knowledge-index model.

Neither module belongs in the existing Blog filters or as a subordinate way to
filter the article archive.

## Current Behavior

- Series metadata continues to power in-article desktop/mobile reading
  navigation and previous/next links.
- Tags continue to render on technical articles using the existing registry,
  aliases, and fallback styles.
- No standalone Series or Tags route, top-level entry, or discovery UI exists.

Keep this behavior unchanged while the plan is parked.

## Route Decision

No route family is approved or reserved. Earlier provisional paths such as
`/blog/series/`, `/blog/series/[key]/`, and `/blog/tags/[tag]/` must not be used
as implementation defaults.

Route ownership should follow the eventual module positioning and top-level
navigation design rather than inherit the current Blog archive hierarchy.

## Restart Conditions

Restart Series work only after defining:

- the reader goal and relationship to article-level series navigation
- the top-level entry and navigation placement
- the ordered/sectioned reading model
- route ownership, canonical URLs, search indexing, and sitemap behavior

Restart Tags work only after defining:

- whether the module is a topic map, knowledge index, or another discovery model
- the top-level entry and navigation placement
- tag grouping, aliases, renamed tags, non-ASCII URLs, and thin-topic policy
- route ownership, canonical URLs, search indexing, and sitemap behavior

Treat the two implementations as separate conversations. Shared taxonomy or
domain utilities do not make their information architecture or UI a shared
feature.

## Context For Future Design

Read:

- `docs/project/architecture.md`
- `docs/project/routing.md`
- `docs/project/content-model.md`
- `docs/project/modules/blog/overview.md`
- `docs/project/modules/blog/taxonomy.md`
- `docs/project/styling.md`

Inspect:

- `src/utils/blog.ts`
- `src/utils/blogTaxonomy.ts`
- series navigation components and technical reading runtime
- current tag rendering in `src/layouts/TechPost.astro`
- existing top-level navigation and Pagefind result behavior

The next conversation should produce a design decision and bounded
implementation plan before changing routes or UI.
