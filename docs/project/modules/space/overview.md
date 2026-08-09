# Space Module

`/space` is currently a deliberately minimal **Between Editions** page. The
previous four-act Canvas exhibition has been retired so a future visual concept
can start without compatibility constraints or dormant animation code.

## Current Route

- `src/pages/space.astro` reads the existing Blog, Watch, and Music collections.
- `src/utils/space/buildSpaceCatalog.ts` projects those collections into a small
  server-side catalog of writing excerpts and optimized cover images.
- `src/components/space/SpaceArchive.astro` renders the catalog as static,
  responsive editorial HTML.
- `src/layouts/SpaceLayout.astro` remains isolated from the normal site shell,
  global CSS, Lenis, global audio, Astro client navigation, and Pagefind.
- The route remains `noindex, nofollow` and excluded from the sitemap.

There is no client payload, Canvas, custom animation loop, scroll director,
preloader, audio pipeline, or mandatory interaction. The current page is a
working content baseline, not the visual direction for the next edition.

## Preserved Material

- all source Blog, Watch, and Music entries;
- all shared poster and album-cover files under `src/assets`;
- published-blog filtering and stable Blog URLs;
- MDX plain-text extraction for clean excerpts;
- explicit Space category labels and the maintained operator identity;
- Astro image optimization for a compact cover catalog;
- the isolated document layout and route boundary.

## Removed Legacy System

The retired system included the Optical Track, winding record, Orbital Record,
mechanical handoff, Kinetic Mobile, Grid Lock, and Colophon runtime; its Canvas
systems, geometry and physics helpers, responsive session planners, visual
signal quantizer, preloader/chrome views, scroll controller, and focused tests
were removed together. Its two implementation plans were also removed because
they described constraints that no longer apply.

See `docs/project/plans/space-rebuild-inventory.md` for the reusable inventory
and boundaries for the next concept.

## Verification

```sh
npm test
npx tsc --noEmit
npm run build
```
