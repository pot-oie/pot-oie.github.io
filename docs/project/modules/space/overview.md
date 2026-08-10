# Space Module

Space is an annual publication family. `/space` is the stable edition index in
the normal site shell. `/space/2026` is the isolated `2025.08—2026.08` annual
edition: five abstract chapters open five concrete spaces—Articles, Film,
Music, Development, and Direction—and an unnumbered Colophon ends the document.

This file is the authoritative Space reference. General project documents only
record the route's cross-module boundary.

## Ownership

| Source | Responsibility |
| --- | --- |
| `src/pages/space/index.astro` | Render the index in `BaseLayout.astro` and link every registered edition. |
| `src/utils/space/editions.ts` | Define the small typed public registry and enforce exactly one current edition. |
| `src/pages/space/2026.astro` | Load collections, optimize eligible posters, and compose the 2026 route. |
| `src/utils/space/2026/edition.ts` | Own 2026 identity, chapter copy and transitions, selection limits, crop exceptions, projects, and Direction states. |
| `src/utils/space/2026/resolveSpaceEdition.ts` | Validate 2026 data and project Blog, Watch, and Music entries into browser-safe records. |
| `src/components/space/2026/SpaceEdition.astro` | Compose the 2026 page shell. |
| `src/components/space/2026/SpaceAbstractExhibition.astro` | Render abstract views, rail, directory, progress, and detail entry. |
| `src/components/space/2026/SpaceDetails.astro` | Render all concrete content spaces and local Music audio. |
| `src/components/space/2026/SpaceCloseButton.astro` | Own the shared 2026 detail Close control. |
| `src/components/space/2026/SpaceColophon.astro` | Render the normal-flow ending. |
| `src/scripts/space/2026.ts` | Own 2026 chapter state, history, focus, rail observation, transitions, and audio behavior. |
| `src/scripts/space/2026/randomizeEditionMedia.ts` | Apply the per-refresh Film and Music draws to 2026 candidate DOM. |
| `src/utils/space/randomSelection.ts` | Provide the genuinely shared deterministic shuffle/diversity primitives. |
| `src/layouts/space/Space2026Layout.astro` | Own the isolated 2026 document head and shell. |
| `src/styles/space/2026.css` | Own the isolated 2026 responsive visual system. |

The registry is a discovery contract, not a generic edition renderer. A future
edition adds a registry entry and matching annual route, but may use completely
different components, utilities, scripts, styles, and interaction patterns.

## Data Contract

- The edition period and five-chapter order are fixed.
- Articles are six explicit published Blog references with Space-only display
  copy; Blog frontmatter remains authoritative for routes and publication.
- Film candidates are annual movie records with a poster and numeric rating.
  Every full refresh draws eight records and assigns them to eight authored
  layout slots. Crop exceptions remain explicit configuration.
- Music candidates are annual records selected by `recordedAt` with previews.
  Every full refresh draws eight; artist and recorded-date limits prevent
  avoidable concentration.
- Development is five explicit project links. Direction is five qualitative
  states with no percentages.
- Fewer than eight eligible Film or Music candidates, invalid articles, empty
  project URLs, or an invalid edition shape fail the build.

The browser receives projected records, not collection entries or Blog bodies.
Selection geometry never becomes random: only Film/Music record assignment
changes on refresh.

## Interaction Contract

- Native document scrolling moves through five `100svh` rail steps. A sticky
  stage shows the active abstract chapter; Lenis and wheel/touch interception
  are not used.
- The directory and Arrow keys navigate without wrapping. Chapter hashes use
  `#learning` through `#direction`; detail hashes append `-detail`.
- A detail owns native scrolling in a fixed surface. Opening pushes history;
  Escape, Back, or the shared Close returns to the same chapter and restores
  rail position and focus.
- Inactive views and the background document are `hidden`/`inert` as
  appropriate. Detail focus cannot reach the abstract stage or Colophon.
- One opaque transition plane animates only `transform` and `opacity`; reduced
  motion uses short fades.
- Film and Music randomize once during each full-page initialization. Music
  playback is local, non-persistent, and stops when its detail is left or the
  page is hidden.
- A fixed top-left `← SPACE INDEX` link remains available in abstract, detail,
  and Colophon states and performs a full document load back to `/space`. After
  Direction, the sticky stage releases into the `100svh` Colophon; its only
  local action restarts from Learning.

Without JavaScript, the same content remains available as linear semantic HTML.

## Presentation Contract

The `/space` index uses `BaseLayout.astro` and the normal ink-and-vermilion site
system. It appears in desktop and mobile Header navigation between Music and
About, is the homepage Space target, and is indexable in both the sitemap and
Pagefind.

The 2026 edition uses `src/layouts/space/Space2026Layout.astro` and
`src/styles/space/2026.css`, not the normal site shell or global runtime.
Abstract scenes share geometric typography; concrete spaces intentionally use
distinct visual systems. Persistent abstract chrome stays limited to the Space
index link, chapter position, the `01—05` directory, one detail entry action,
and a hairline progress indicator. Each detail has one Close; only Articles,
Film, and Music link onward to archives.

`/space/2026` emits `index, follow` because it is public and intentionally
discoverable from the index. It remains omitted from the sitemap and its entire
edition shell carries `data-pagefind-ignore`, preventing projected Blog, Watch,
and Music content from becoming duplicate search entries. It does not use the
global Lenis, audio, analytics, or Astro client-router runtime. Links crossing
between the normal site shell and the annual document use `data-astro-reload`.

## Verification

```sh
npm test
npx tsc --noEmit
npm run build
```

When behavior or responsive styling changes, additionally review the `/space`
index and Header at desktop/mobile widths, then verify `/space/2026` direct
hashes, keyboard focus, Escape/Back, reduced motion, no-JavaScript reading
order, compact layout, and the Colophon at the document bottom. Confirm the
generated sitemap contains `/space/` but not `/space/2026/`, and that Pagefind
does not index the edition's projected records.
