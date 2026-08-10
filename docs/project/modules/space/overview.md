# Space Module

`/space` is the isolated `2025.08—2026.08` annual edition. Five abstract
chapters open five concrete spaces: Articles, Film, Music, Development, and
Direction. An unnumbered Colophon ends the document.

This file is the authoritative Space reference. General project documents only
record the route's cross-module boundary.

## Ownership

| Source | Responsibility |
| --- | --- |
| `src/pages/space.astro` | Load collections, optimize eligible posters, and compose the route. |
| `src/utils/space/edition.ts` | Own identity, chapter copy and transitions, selection limits, crop exceptions, projects, and Direction states. |
| `src/utils/space/resolveSpaceEdition.ts` | Validate edition data and project Blog, Watch, and Music entries into browser-safe records. |
| `src/components/space/SpaceEdition.astro` | Compose the page shell. |
| `SpaceAbstractExhibition.astro` | Render abstract views, rail, directory, progress, and detail entry. |
| `SpaceDetails.astro` | Render all concrete content spaces and local Music audio. |
| `SpaceCloseButton.astro` | Own the shared detail Close control. |
| `SpaceColophon.astro` | Render the normal-flow ending. |
| `src/scripts/spaceEdition.ts` | Own chapter state, history, focus, rail observation, transitions, and audio behavior. |
| `src/scripts/space/randomizeEditionMedia.ts` | Apply the per-refresh Film and Music draws to candidate DOM. |
| `src/styles/space/index.css` | Own the isolated responsive visual system. |

## Data Contract

- The edition period and five-chapter order are fixed.
- Articles are six explicit published Blog references with Space-only display
  copy; Blog frontmatter remains authoritative for routes and publication.
- Film candidates are annual movie records with a poster and numeric rating.
  Every full refresh draws eight records and assigns them to eight authored
  layout slots. Crop exceptions remain explicit configuration.
- Music candidates are annual records with previews. Every full refresh draws
  eight; artist and date limits prevent avoidable concentration.
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
- A fixed top-left Home link remains available in abstract, detail, and
  Colophon states. After Direction, the sticky stage releases into the
  `100svh` Colophon; its only local action restarts from Learning.

Without JavaScript, the same content remains available as linear semantic HTML.

## Presentation Contract

Space uses `SpaceLayout.astro` and `src/styles/space/index.css`, not the normal
site shell or global runtime. Abstract scenes share geometric typography;
concrete spaces intentionally use distinct visual systems. Persistent abstract
chrome stays limited to Home, chapter position, the `01—05` directory, one
detail entry action, and a hairline progress indicator. Each detail has one
Close; only Articles, Film, and Music link onward to archives.

The route is `noindex, nofollow`, omitted from sitemap and Pagefind, and does
not use the global Lenis, audio, analytics, or Astro client-router runtime.

## Verification

```sh
npm test
npx tsc --noEmit
npm run build
```

When behavior or responsive styling changes, additionally review direct hashes,
keyboard focus, Escape/Back, reduced motion, compact layout, and the Colophon
at the document bottom.
