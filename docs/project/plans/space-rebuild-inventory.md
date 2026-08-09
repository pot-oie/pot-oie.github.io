# Space Rebuild Inventory

## Status

The previous `/space` visual system has been cleared. The route now exposes a
static **Between Editions** catalog so it remains valid while the next, simpler
visual direction is designed. This holding page is infrastructure, not a style
brief.

## Keep

- Blog, Watch, and Music source collections and all shared media assets.
- `SpaceLayout.astro`: isolated document, canonical metadata, noindex policy,
  and full-load boundary.
- `buildSpaceCatalog.ts` and `catalog.ts`: server-side content projection with
  no browser payload contract.
- `extractBlogExcerpt.ts`: executable/non-prose MDX removal and excerpt sizing.
- `categoryLabels.ts`: explicit editorial labels for Blog categories.
- `identity.ts`: maintained operator and location copy.
- Astro's build-time image optimization for Watch and Music covers.
- `SpaceArchive.astro` and the current stylesheet only as a replaceable,
  responsive holding page.

## Remove

- all four-act Canvas rendering and transition systems;
- the optical-material, polar-record, suspension, and grid-lock geometry;
- the private frame loop, scroll director, springs, and progress choreography;
- session curation/layout plans and performance-governor branches;
- signal/audio decoding, quantization, playlist, and audio UI;
- mechanical preloader, persistent chrome, and stage-specific DOM views;
- tests coupled to those visual mechanisms;
- the old experience and code-architecture plans;
- dependencies used only by that implementation (`gsap` and `tone`).

## Explicitly Untouched

No files are removed from `src/content`, `src/assets/watch`,
`src/assets/music`, or Blog public media. They belong to the shared site and may
be reused by the next edition without copying them into a Space-only asset tree.

## Next-Edition Boundaries

- Choose the visual idea before choosing an animation framework.
- Prefer a few legible, robust transformations over a continuous simulation.
- Treat the content catalog as optional input, not a requirement to show every
  collection or cover.
- Design desktop and mobile together; do not add a rejection page.
- Do not restore audio unless the product decision changes explicitly.
- The new direction does not need to preserve legacy material IDs, geometry,
  stage names, scroll ranges, or transition reversibility.
