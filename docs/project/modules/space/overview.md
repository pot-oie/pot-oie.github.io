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
| `src/utils/space/editionCovers.ts` | Attach Astro image metadata without making the pure registry depend on image loaders. |
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
  Every full refresh draws six records and assigns them to six authored
  layout slots. Crop exceptions remain explicit configuration.
- Music candidates are standalone annual records selected by `recordedAt` with
  previews; records carrying `albumId` are excluded. Every full refresh draws
  six; artist and recorded-date limits prevent avoidable concentration.
- Development is five explicit project links. Direction is five qualitative
  states with no percentages.
- Fewer than six eligible Film or Music candidates, invalid articles, empty
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
- Enhanced details at desktop widths compose their complete content within one
  viewport and do not require internal scrolling. Compact layouts retain native
  detail scrolling so typography and controls are never compressed to fit.
- Fixed top-left `← HOME` and `← SPACE INDEX` links remain available in abstract,
  detail, and Colophon states and perform full document loads back to `/` and
  `/space`. After
  Direction, the sticky stage releases into the `100svh` Colophon; its only
  local action restarts from Learning.

Without JavaScript, the same content remains available as linear semantic HTML.

## Presentation Contract

The `/space` index uses `BaseLayout.astro` and the same `ArchiveHeader` title,
breadcrumb, count, border, and responsive rhythm as Blog and Watch archives.
Its edition covers remain content inside that shared archive language rather
than defining a separate page shell. Space appears in desktop and mobile Header
navigation between Music and About, and is indexable in both the sitemap and
Pagefind. The homepage Space hero bypasses the index and resolves the registry's
current edition, so marking a future registry entry as current updates that
destination automatically.

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

### Edition Cover System

Each annual edition may have one generated cover image on the `/space` index.
The index remains part of the normal site system; the image supplies edition
identity without turning the index into a second annual-document experience.
All edition covers must begin with the following shared style prompt. A short
year-specific concept may be appended after it, but must not replace or weaken
these series constraints.

> 为年度文化出版物系列创作一张经过明确艺术指导的编辑设计横幅。使用 16:5 超宽画幅，建议输出 3200×1000 px，最低不得小于 1920×600 px，画面必须延伸至四边。画面从左至右都必须具有明确、可辨认的视觉内容，不为网页文字预留空白或低细节安全区；任何单一纯背景区域不得大于画面的约 12%。使用中大型构成贯穿全幅，并允许图形在四边大胆裁切；主要视觉焦点可以偏离中心，但不能让其余区域退化为装饰性留白。画面应具有清晰的主次关系和非对称构图；缩小为约 560×175 px 时仍能辨认主要视觉。单张图片能够独立成立，多年份并列时也应呈现为同一出版系列。不要生成任何文字、字母、数字、标志、水印、界面、边框、实体书样机或摄影棚展示场景。标题、年份、时间跨度与状态信息将由网页 HTML 单独排版。颜色、材质、媒介、光线与具体视觉内容由当年 edition 单独定义。

The generated asset is visual material, not a finished card. Edition title,
year, period, description, and interaction affordances remain semantic HTML.
The cover fills each card edge to edge. On hover-capable desktop layouts, the
card initially shows only the artwork; hover or keyboard focus slides a left
metadata panel into view. Compact layouts keep that panel visible because they
cannot depend on hover, and reduce the edition label, title, and period scale so
the status remains aligned with the title. The panel background owns a diagonal
masked fade and local edge shadow so it remains readable without forming a hard
vertical boundary. Cards keep their neutral border and add no outer box shadow
in either the resting or hover state; there is no separate corner arrow
affordance. The registry description is not repeated in the card. The cover
series is held together by its editorial role, composition system, landscape
specification, and typography-free presentation—not by a required palette,
texture, or medium.

Cover source files use a `16:5` aspect ratio and remain visually active across
the full canvas. CSS alone owns the metadata fade and readability treatment.
Cover cards render above the global paper-noise overlay and provide source
widths up to the original asset for crisp high-density displays. New covers
should be reviewed at both source size and the approximate `560 × 175 px`
rendered size before registration.

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
