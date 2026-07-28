# Interaction

This document records cross-page runtime behavior, browser events, storage keys, and initialization points. Update it whenever an interaction crosses component or page boundaries.

## Initialization Lifecycle

The project uses Astro View Transitions through `ClientRouter` in `src/layouts/BaseLayout.astro`.

Most browser-side initializers are attached to `astro:page-load` so they run after initial load and after view transitions. Some scripts also listen to `DOMContentLoaded` for the first non-transition load.

Common pattern:

```ts
document.addEventListener("astro:page-load", initFeature);
```

When adding a script, make it idempotent. View transitions can re-run setup on the same browser session.

## Global Runtime Composition

`src/layouts/BaseLayout.astro` owns the page skeleton and composes these focused
runtime entries:

- `GlobalRuntime.astro` initializes Lenis, installs anonymous analytics,
  and retries normal or `#pf-text-*` hash scrolling after page loads.
- `GlobalAudioRuntime.astro` renders the persistent global audio element and
  installs the audio and MediaSession controller.
- `ArticleRuntime.astro` is opt-in through the `articleRuntime` layout prop. It
  initializes KaTeX overflow hints and the article image lightbox only on pages
  that can contain supported prose.

The implementations live under `src/scripts/runtime`. Global listeners use
window-level install guards, while page-bound elements use `data-*` installation
markers. Each lifecycle component also covers the initial document load before
continuing through `astro:page-load`.

Article math overflow checks run after layout, after a short retry, and again
after font loading so `.katex-display` width checks use the rendered formula
size. Overflowing formulas also support mouse drag-to-scroll for devices without
horizontal touchpad gestures.

The article image lightbox skips linked images and `.not-prose` component
content. It supports click, keyboard activation, touch pinch zoom,
trackpad/browser pinch zoom, drag panning when zoomed, toolbar zoom controls,
original-image opening, previous/next navigation, loading/error feedback, focus
restoration on close, overlay/close-button dismissal, and `Escape`. Keyboard
controls inside the open lightbox include `ArrowLeft`/`ArrowRight` for image
navigation, `+`/`-` for zoom, and `0` for zoom reset.

Other cross-page helpers retain their nearest component ownership:

- Article return-to-top controls mounted by post layouts. `BackToTop.astro`
  installs idempotent global scroll/resize listeners, appears after a fixed
  scroll threshold, and scrolls through Lenis when the global instance exists.

Keep `BaseLayout.astro` limited to composition and genuinely global structure.
New runtime behavior should receive a focused module and the narrowest practical
lifecycle entry point.

## Storage Keys

- `theme`: selected color mode, managed by `BaseHead.astro` and `Header.astro`.
- `pot-analytics-session-v1`: random tab-scoped `sessionStorage` identifier.
  Closing the tab ends the访问会话.
- `pot-search-debug`: optional localStorage debug flag. When set to `1`, final
  sanitized analytics events are logged in the console. It stores no metrics.

The removed `pot-search-metrics-v1` localStorage aggregate must not be restored.

## Anonymous Analytics

`src/scripts/runtime/analytics.ts` owns the event whitelist, normalization,
client-side rate limit, transport, page-view lifecycle, article-depth
thresholds, 404 events, and bounded client-error events. It prefers
`navigator.sendBeacon()` and falls back to a keepalive empty POST.

Search calls the same typed tracker directly:

- positive visible result count: `search_success`;
- zero visible results: `search_no_results`;
- Pagefind initialization/query failure: `search_error`.

Only the no-result event contains the normalized, 64-character query. See
`docs/project/analytics.md` for the complete event and privacy contract.

## Custom Events

### Audio

Playback requests are emitted by music UI and consumed by
`src/scripts/runtime/globalAudio.ts`, mounted through
`GlobalAudioRuntime.astro`.

Inbound events listened to by the global audio controller:

- `pot:play-request`
- `pot:seek-request`
- `pot:volume-request`

Outbound events emitted by the global audio controller:

- `pot:audio-state`
- `pot:audio-progress`

Important producers:

- `RecentMusic.astro`
- `TrackControl.astro`

Important consumers:

- `RecentMusic.astro`
- `TrackControl.astro`
- `AlbumSidebar.astro`

The global audio element has `transition:persist`, so playback state can survive Astro page transitions.

## Keyboard Shortcuts

`Search.astro` owns global search shortcuts:

- `Escape`: close search modal.
- `Ctrl+K` or `Meta+K`: open search modal.

Pagefind result links for detail pages include `#pf-text-*` hashes derived from
the rendered excerpt. `src/scripts/runtime/hashScroll.ts`, mounted through
`GlobalRuntime.astro`, decodes these hashes after Astro page load, retries
briefly while View Transitions settle, prefers matches inside `.prose-ink`,
falls back through the page body when needed, and uses the global Lenis instance
with native scroll fallback to reach the hit with the same offset as normal
anchor links.

When adding a new global shortcut, check for conflicts here first.

## Page-Specific Interactions

### Home Page

`src/pages/index.astro` owns:

- watch grid/scroll view toggle
- active-state cleanup for BFCache restore
- delayed navigation for selected links/cards

This behavior is page-local and should not move into shared components unless it is reused elsewhere.

### Watch List

The `all`, `movie`, and `series` choices rendered by `ArchiveFilter.astro` are
normal links to static archive routes, so they require no local filter state or
query-parameter restoration. `WatchScroll.astro` owns idempotent wheel and drag
handling for horizontal poster browsing. Movie cards toggle their short-review
overlay on click/tap, while series cards navigate to their detail page.

### Technical Post Detail

`src/layouts/TechPost.astro` composes the technical-post presentation with
`TechnicalReadingRuntime.astro` and `TechnicalCodeRuntime.astro`. Their focused
implementations live in `src/scripts/runtime/technicalReadingNavigation.ts` and
`src/scripts/runtime/technicalCodeBlocks.ts`. Each runtime tracks the current
`main` element with a `WeakSet`, so repeated `astro:page-load` delivery is
idempotent while a newly swapped View Transition page is initialized.

`src/components/MobileReadingNavigation.astro` owns the mobile reading toggle UI
for series navigation and the table of contents. The technical reading runtime
initializes `[data-mobile-reading-nav]`, opens one active panel at a time, and
coordinates the desktop and mobile navigation copies. Series section collapse
uses native `details` / `summary` behavior in both surfaces.

`src/components/SeriesPostPager.astro` renders static previous/next links at the bottom of technical posts when the current entry belongs to a multi-post series.

Desktop and mobile series sections share persisted open/closed state through `localStorage` keys shaped as `pot-series-nav-sections-v1:<seriesKey>`. The technical reading runtime restores `[data-series-section]` details after `astro:page-load`, writes changes on `toggle`, and mirrors the state between desktop and mobile copies of the same section.

Series navigation scroll surfaces also persist their local `scrollTop` across article route changes through `localStorage` keys shaped as `pot-series-nav-scroll-v1:<seriesKey>:<surfaceKey>`. Desktop and mobile surfaces use separate `surfaceKey` values so their positions do not overwrite each other.

Table-of-contents observation and Lenis-aware anchor navigation are also
installed by the technical reading runtime. The technical code runtime wraps
each uninitialized `pre.astro-code` independently and preserves copy feedback,
long-block collapse/expand, wheel containment, and macOS/water-ink style
switching across View Transitions.

### Dashboard

`src/pages/dashboard.astro` performs a same-origin, no-store fetch of
`/dashboard/metrics.json`. A root `WeakSet` makes setup idempotent after
`astro:page-load`. The Dashboard emits no analytics events.

## Scroll Boundaries

Components with their own scroll surface should use `data-lenis-prevent` to avoid Lenis taking over nested scrolling.

Current examples:

- Search modal scroll container.
- Desktop series internal item list and table-of-contents sidebar in `TechPost.astro`.
- Mobile technical-post reading toggle panels in `MobileReadingNavigation.astro`.

## Maintenance Checklist

When changing interactions:

1. Confirm initialization is idempotent across `astro:page-load`.
2. Document new custom events and storage keys.
3. Avoid duplicate global listeners after View Transitions.
4. Check nested scroll behavior with Lenis.
5. If the change affects search or audio, test at least one route transition.
