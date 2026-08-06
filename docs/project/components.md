# Components

This document maps the component layer and records ownership boundaries. Use it when changing UI structure or deciding where a new UI unit belongs.

## Component Groups

### Site Shell

- `src/components/BaseHead.astro`: document metadata, favicon, theme bootstrap,
  and global head-level setup. It owns canonical, Open Graph, Twitter, article
  date metadata, and the single article JSON-LD graph; layouts provide typed
  data rather than emitting competing metadata blocks.
- `src/components/Header.astro`: primary navigation, search trigger, theme toggle, and mobile navigation behavior.
- `src/components/HeaderLink.astro`: reusable navigation link styling.
- `src/components/Footer.astro`: site footer.

These components are part of the site shell and should stay broadly content-agnostic.
The primary content navigation is Blog, Watch, Music, and About; Blog owns the
learn/life split inside its archive.

### Runtime Composition

- `src/components/runtime/GlobalRuntime.astro`: lifecycle entry point for
  Lenis, anonymous analytics, and normal/search-result hash scrolling.
- `src/components/runtime/GlobalAudioRuntime.astro`: owns the
  `transition:persist` audio element and installs the audio/MediaSession
  controller.
- `src/components/runtime/ArticleRuntime.astro`: lifecycle entry point for
  KaTeX overflow hints and the article image lightbox.
- `src/components/runtime/TechnicalReadingRuntime.astro`: technical-post
  lifecycle entry point for series state, reading-panel controls, scroll fades,
  and table-of-contents highlighting and navigation.
- `src/components/runtime/TechnicalCodeRuntime.astro`: owns technical-post code
  action templates and initializes copy, collapse, scroll-lock, and visual-style
  controls.

The components in this group compose focused implementations from
`src/scripts/runtime`. `BaseLayout.astro` always mounts the two global entries;
article layouts and the About prose page opt into `ArticleRuntime.astro` through
the `articleRuntime` prop. `TechPost.astro` additionally mounts the two
technical-post runtime entries.

### Content Cards And Lists

- `src/components/PostCard.astro`: blog archive/list card. The whole card is
  clickable on mobile; the `READ MORE` affordance is desktop-only and appears
  through hover/active states.
- `src/components/PostCardForIndex.astro`: compact recent-post card for the home page.
- `src/components/BlogRowCard.astro`: row-style blog card for category/list contexts.
- `src/components/WatchCard.astro`: movie and series list card.
- `src/components/MusicCard.astro`: music item card.
- `src/components/DownloadCard.astro`: document/download presentation card.
- `src/components/ArchiveHeader.astro`: shared archive breadcrumbs, bilingual
  title, description, full active-archive count, optional compact archive
  metadata, and filter placement.
- `src/components/ArchiveFilter.astro`: compact route-backed archive links with
  category counts and current-page state.
- `src/components/BlogPagination.astro`: static previous/next and numbered links
  for paginated blog archives.
- `src/layouts/BlogArchive.astro`: shared blog archive composition for the
  header, post list, empty state, pagination, and return link.

Cards should receive data through props and avoid fetching collections directly unless there is a strong local reason.

### Article And Reading Helpers

- `src/components/FormattedDate.astro`: date display helper.
- `src/components/TableOfContents.astro`: static article heading navigation,
  rendered as a right-side desktop helper; its active-heading and smooth-scroll
  behavior is owned by `TechnicalReadingRuntime.astro`.
- `src/components/SeriesNavigation.astro`: technical-note series navigation for
  jumping between posts in the same set, visually distinct from the table of
  contents through block-style active states. It renders collapsible
  second-level `series.section` groups, uses each post's `series.subtitle` as
  the item label, and exposes the data hooks consumed by the technical reading
  runtime.
- `src/components/MobileReadingNavigation.astro`: mobile-only reading navigation
  that renders both series guide entries and table-of-contents entries through
  one shared compact style and toggle surface. Series sections use the same
  collapsible grouping as the desktop guide and share runtime-managed state.
- `src/components/SeriesPostPager.astro`: bottom previous/next navigation for technical posts that belong to a series, using the same ordered `series.items` data as the side guide.
- `src/components/BackToTop.astro`: article-page floating return-to-top control that appears after the reader scrolls down and uses Lenis when available.
- `src/components/QRCodeTooltip.astro`: QR-code tooltip behavior.
- `src/components/ScoreBox.astro`: legacy rating presentation.

These components are shared reading helpers. Keep styling aligned with `docs/project/styling.md`.

### Search

- `src/components/Search.astro`: global search modal, Pagefind loading, result
  classification, text-target result hashes, keyboard shortcut, and exactly one
  sanitized final metric per search. Blog archive results are classified
  through the shared route policy in `src/utils/blogRoutes.ts`, including
  paginated root and category archives.

Search is mounted through the header/site shell. Runtime behavior is documented in `docs/project/interaction.md`.

### Dashboard

- `src/pages/dashboard.astro`: private static analytics presentation. It fetches
  `/dashboard/metrics.json`, validates the response shape, and renders Overview,
  Content, Search, and Quality sections with native DOM, CSS, and SVG.

The Dashboard has explicit loading, empty, failed, and stale states. It neither
reads nor clears localStorage and must not introduce a client chart dependency.

### Music

- `src/components/RecentMusic.astro`: recent listening module and richer playback controls.
- `src/components/MusicCalendar.astro`: music calendar UI.
- `src/components/MusicCalendarView.astro`: month/calendar view composition.
- `src/components/TrackControl.astro`: inline track play button for article content.
- `src/components/AlbumSidebar.astro`: album-specific track/sidebar behavior.

Music components coordinate through global audio events handled by
`GlobalAudioRuntime.astro` and `src/scripts/runtime/globalAudio.ts`.

### Watch

- `src/components/WatchScroll.astro`: horizontal movie and series presentation.
- `src/components/WatchCard.astro`: reusable watch record card.
- `src/layouts/WatchArchive.astro`: shared all/movie/series archive composition.
- `src/layouts/WatchDetail.astro`: series detail composition.

The home page owns a local grid/scroll toggle for recent watch records in
`src/pages/index.astro`. `WatchArchive.astro` owns the route-backed media-type
navigation. Movie cards retain the hover/tap short-review overlay; series cards
link to details.

### Article Demos

- `src/components/blog/amazon/*`: interactive menu/safe-triangle demos for the Amazon menu article.
- `src/components/blog/leetcode/*`: algorithm and data-structure visualizers for LeetCode/classroom articles.
- `src/components/blog/ml/*`: machine-learning article visualizations, starting with the feature transformation demo for ML note 09.

Article demo components are allowed to be article-specific. Keep them isolated under `src/components/blog/<topic>` rather than promoting them to shared components too early.

## Ownership Rules

- Put route-level data fetching in `src/pages` unless the component is inherently content-bound, such as `TrackControl.astro`.
- Put page skeleton and runtime composition in `src/layouts`; keep focused
  browser implementations under `src/scripts/runtime`.
- Use `src/components/runtime` for lifecycle entry points and persistent runtime
  markup shared by layouts.
- Put reusable display units in `src/components`.
- Put one-off article visualizations under `src/components/blog`.
- Avoid adding cross-page global event listeners in leaf components unless the interaction document is updated.

## Maintenance Checklist

When adding or changing a component:

1. Identify whether it is site shell, shared UI, module UI, or article-specific demo.
2. Keep props explicit and avoid hidden collection reads when possible.
3. If it adds global events, storage, keyboard shortcuts, or page-transition behavior, update `docs/project/interaction.md`.
4. If it changes visual rules, update `docs/project/styling.md`.
