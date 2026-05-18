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

## Global Layout Behavior

`src/layouts/BaseLayout.astro` owns these global behaviors:

- Lenis smooth scrolling.
- Search metrics storage and event collection.
- Persistent global audio element.
- MediaSession metadata for audio playback.
- Math overflow scroll hints for KaTeX block formulas. The initializer runs
  after layout and again after font loading so `.katex-display` width checks
  are based on the rendered formula size. Overflowing formulas also support
  mouse drag-to-scroll for devices without horizontal touchpad gestures.
- Article image lightbox for `.prose-ink` images. The initializer skips linked
  images and `.not-prose` component content, supports click, keyboard activation,
  touch pinch zoom, trackpad/browser pinch zoom, drag panning when zoomed,
  toolbar zoom controls, original-image opening, previous/next navigation,
  loading/error feedback, focus restoration on close, overlay/close-button
  dismissal, and `Escape`. Keyboard controls inside the open lightbox include
  `ArrowLeft`/`ArrowRight` for image navigation, `+`/`-` for zoom, and `0` for
  zoom reset.
- Hash scrolling after View Transitions.

Global layout behavior should remain narrowly scoped. If it grows, prefer extracting a focused script/component while keeping this document updated.

## Storage Keys

- `theme`: selected color mode, managed by `BaseHead.astro` and `Header.astro`.
- `pot-search-metrics-v1`: search metrics store, written by `BaseLayout.astro` in response to search metric events.
- `pot-search-debug`: optional debug flag. When set to `1`, search metrics are logged in the console.

## Custom Events

### Search

`Search.astro` dispatches:

- `pot:search-metric`

Payload shape:

```ts
{
  event: string;
  payload: Record<string, unknown>;
  timestamp: number;
}
```

Known event names:

- `search_success`
- `search_no_results`
- `search_error`

`BaseLayout.astro` listens for these events and writes aggregate data to `localStorage`.

### Audio

Playback requests are emitted by music UI and consumed by `BaseLayout.astro`.

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

When adding a new global shortcut, check for conflicts here first.

## Page-Specific Interactions

### Home Page

`src/pages/index.astro` owns:

- movie grid/scroll view toggle
- movie review overlay selection for recent movie cards
- active-state cleanup for BFCache restore
- delayed navigation for selected links/cards

This behavior is page-local and should not move into shared components unless it is reused elsewhere.

### Movie List

`src/pages/movie/[...page].astro` owns movie review overlay selection for the paginated movie list. Movie cards show short reviews on hover-capable devices and toggle the overlay with a click/tap for touch devices.

### Technical Post Detail

`src/components/MobileReadingNavigation.astro` owns the mobile reading toggle UI for series navigation and the table of contents. `src/layouts/TechPost.astro` provides the idempotent initializer scoped to `[data-mobile-reading-nav]`, so the toggle works across View Transitions and opens one active panel at a time. Series section collapse uses native `details` / `summary` behavior in both desktop and mobile navigation.

Desktop and mobile series sections share persisted open/closed state through `localStorage` keys shaped as `pot-series-nav-sections-v1:<seriesKey>`. The initializer in `TechPost.astro` restores `[data-series-section]` details after `astro:page-load`, writes changes on `toggle`, and mirrors the state between desktop and mobile copies of the same section.

Series navigation scroll surfaces also persist their local `scrollTop` across article route changes through `localStorage` keys shaped as `pot-series-nav-scroll-v1:<seriesKey>:<surfaceKey>`. Desktop and mobile surfaces use separate `surfaceKey` values so their positions do not overwrite each other.

### Dashboard

`src/pages/dashboard.astro` reads and clears `pot-search-metrics-v1`.

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
