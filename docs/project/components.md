# Components

This document maps the component layer and records ownership boundaries. Use it when changing UI structure or deciding where a new UI unit belongs.

## Component Groups

### Site Shell

- `src/components/BaseHead.astro`: document metadata, favicon, theme bootstrap, and global head-level setup.
- `src/components/Header.astro`: primary navigation, search trigger, theme toggle, and mobile navigation behavior.
- `src/components/HeaderLink.astro`: reusable navigation link styling.
- `src/components/Footer.astro`: site footer.

These components are part of the site shell and should stay broadly content-agnostic.

### Content Cards And Lists

- `src/components/PostCard.astro`: blog archive/list card. The whole card is
  clickable on mobile; the `READ MORE` affordance is desktop-only and appears
  through hover/active states.
- `src/components/PostCardForIndex.astro`: compact recent-post card for the home page.
- `src/components/BlogRowCard.astro`: row-style blog card for category/list contexts.
- `src/components/MovieCard.astro`: movie list card.
- `src/components/MusicCard.astro`: music item card.
- `src/components/DownloadCard.astro`: document/download presentation card.

Cards should receive data through props and avoid fetching collections directly unless there is a strong local reason.

### Article And Reading Helpers

- `src/components/FormattedDate.astro`: date display helper.
- `src/components/TableOfContents.astro`: article heading navigation, rendered as a right-side desktop helper.
- `src/components/SeriesNavigation.astro`: technical-note series navigation for jumping between posts in the same set, visually distinct from the table of contents through block-style active states. It supports collapsible second-level `series.section` groups, item labels come from each post's `series.subtitle`, persisted section state, persisted item-list scroll position, and the desktop item list owns its internal scroll fade while the outer card remains fixed.
- `src/components/MobileReadingNavigation.astro`: mobile-only reading navigation that renders both series guide entries and table-of-contents entries through one shared compact style and toggle surface. Series sections use the same collapsible grouping as the desktop guide.
- `src/components/QRCodeTooltip.astro`: QR-code tooltip behavior.
- `src/components/ScoreBox.astro`: rating presentation, currently used by movie-facing UI.

These components are shared reading helpers. Keep styling aligned with `docs/project/styling.md`.

### Search

- `src/components/Search.astro`: global search modal, Pagefind loading, result classification, keyboard shortcut, and search metric emission.

Search is mounted through the header/site shell. Runtime behavior is documented in `docs/project/interaction.md`.

### Music

- `src/components/RecentMusic.astro`: recent listening module and richer playback controls.
- `src/components/MusicCalendar.astro`: music calendar UI.
- `src/components/MusicCalendarView.astro`: month/calendar view composition.
- `src/components/TrackControl.astro`: inline track play button for article content.
- `src/components/AlbumSidebar.astro`: album-specific track/sidebar behavior.

Music components coordinate through global audio events handled in `BaseLayout.astro`.

### Movie

- `src/components/MovieScroll.astro`: horizontal/scrolling movie presentation.
- `src/components/MovieCard.astro`: reusable movie card.
- `src/components/ScoreBox.astro`: score/rating display.

The home page also owns a local grid/scroll toggle for recent movies in `src/pages/index.astro`.

### Article Demos

- `src/components/blog/amazon/*`: interactive menu/safe-triangle demos for the Amazon menu article.
- `src/components/blog/leetcode/*`: algorithm and data-structure visualizers for LeetCode/classroom articles.

Article demo components are allowed to be article-specific. Keep them isolated under `src/components/blog/<topic>` rather than promoting them to shared components too early.

## Ownership Rules

- Put route-level data fetching in `src/pages` unless the component is inherently content-bound, such as `TrackControl.astro`.
- Put page skeleton and global persistent behavior in `src/layouts`, especially `BaseLayout.astro`.
- Put reusable display units in `src/components`.
- Put one-off article visualizations under `src/components/blog`.
- Avoid adding cross-page global event listeners in leaf components unless the interaction document is updated.

## Maintenance Checklist

When adding or changing a component:

1. Identify whether it is site shell, shared UI, module UI, or article-specific demo.
2. Keep props explicit and avoid hidden collection reads when possible.
3. If it adds global events, storage, keyboard shortcuts, or page-transition behavior, update `docs/project/interaction.md`.
4. If it changes visual rules, update `docs/project/styling.md`.
