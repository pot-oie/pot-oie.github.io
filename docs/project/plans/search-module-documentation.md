# Search Module Documentation

Status: Parked

Former priority: P2

## Goal

Create `docs/project/modules/search/overview.md` as the maintained module-level
description of site search.

## Scope

The document should explain:

- Pagefind generation and the indexed page region
- modal ownership and keyboard behavior
- detail-versus-summary result classification
- shared blog archive route classification
- detail-result text-target hashes and post-navigation scrolling
- result quotas and search metrics
- production-only behavior and local verification
- ownership boundaries across `Search.astro`, runtime scripts, route utilities,
  and the build command

This is a documentation task. It should not redesign search, change result
ranking, add analytics, or introduce new routes unless a separately approved
implementation task identifies a real mismatch.

## Restart Conditions

- Recheck the production search flow and current Pagefind output before writing.
- Resolve any discrepancy between implementation and the existing architecture,
  components, interaction, routing, or deployment documents.
- Add the new module document to `docs/project/README.md`.

## Context For A Future Conversation

Read:

- `docs/project/architecture.md`
- `docs/project/components.md`
- `docs/project/interaction.md`
- `docs/project/routing.md`
- `docs/project/deployment.md`

Inspect:

- `src/components/Search.astro`
- `src/scripts/runtime/hashScroll.ts`
- `src/scripts/runtime/analytics.ts`
- `src/utils/blogRoutes.ts`
- `package.json`
- `astro.config.mjs`

Verify the completed document against a production build and one real search
flow.
