# Styling System

The visual language is a modern ink-inspired system: quiet layout, high reading focus, ink grayscale tokens, and vermilion as the primary accent.

## Source Files

- `src/styles/global.css`: Tailwind import, theme tokens, global body styles, selection, animation, and base prose setup.
- `src/styles/markdown.css`: rendered Markdown and MDX content styles, including code blocks and article typography.

## Color System

Ink tokens are defined in `@theme`:

- `--color-ink-900`: deepest ink, used for strong text and emphasis.
- `--color-ink-700`: main body ink.
- `--color-ink-500`: secondary text.
- `--color-ink-300`: lines, borders, muted states.
- `--color-ink-100`: paper-like light surface.

Accent:

- `--color-vermilion`: vermilion red for hover, selected, seal-like emphasis, and important interaction states.

Transparent and component-specific colors are centralized in `src/styles/global.css` as commented CSS variables. Use the `--color-rgb-*` channel assets for opacity-based colors, and prefer semantic tokens such as `--lightbox-*`, `--math-*`, `--reading-nav-*`, `--toc-scroll-*`, and `--tag-*` before introducing raw `rgb(...)` or `rgba(...)` values in components. Technical article tags include a dedicated `ai` token for AI, machine learning, deep learning, and model-concept labels.

Dark mode is enabled through:

```css
@variant dark (&:where(.dark, .dark *));
```

## Typography

- Sans stack: `Inter`, system UI, sans-serif.
- Serif stack: `Noto Serif SC`, `Songti SC`, serif.
- Headings use the serif stack globally.
- Article content is rendered through `.prose` and `.prose-ink` patterns.
- Article `h2` headings use a faint generated chapter watermark. Article `h3`
  and `h4` headings use restrained paper-highlight backgrounds, with separate
  dark-mode decoration tokens so the effects stay visible without competing with
  the text. Article heading spacing steps down by depth: `h2` keeps the largest
  context gap, `h3` is tighter, and `h4` is the compact fixed baseline.
- Article quote blocks use a full-height left accent line and shared quote
  background across desktop and mobile. Mobile quote blocks use compact spacing
  with quote-local paragraph margins so inherited prose spacing does not pull the
  text block out of balance.

## Global Texture And Motion

- `body::before` adds a subtle fixed noise texture.
- Page entry motion is opt-in through `.page-fade-in`; technical article
  content uses it while fixed side navigation stays outside transformed
  animation scopes.
- Astro View Transitions are enabled in `BaseLayout.astro`.
- Lenis smooth scrolling is initialized globally in `BaseLayout.astro`.
- Article images in `.prose-ink` can open in a focused lightbox overlay. The
  overlay uses a dark ink backdrop, restrained motion, and the vermilion accent
  for the close affordance. Lightbox images support zoom, drag gestures,
  previous/next navigation, a compact zoom toolbar, a loading state, and an
  original-image link while keeping the controls visually minimal. Individual
  article images can opt into `.sensitive-image` when the inline view should be
  visually shielded while still opening normally in the lightbox. The default
  shield label is `点击查看大图`, and individual figures can override it with
  `data-sensitive-label`.

## Article Navigation

- Desktop technical posts use distinct side helpers: the series guide emphasizes
  the current article through vermilion number color, stronger text weight, and
  deep ink title color instead of row or number fills. It can group long series under
  borderless collapsible second-level section controls with count badges, while
  the table of contents keeps a linear active indicator. The desktop series
  guide is intentionally capped near the viewport middle instead of spanning the
  full page height. Its outer card remains fixed while the internal item list
  scrolls with a taller local edge fade. Series item subtitles use compact text
  with tightened row spacing to keep long labels scannable. Long reading
  navigation panels hide native scrollbars, relying on the edge fade as the
  overflow cue.
- Mobile technical posts use `MobileReadingNavigation.astro`, a separate compact
  toggle surface that renders series entries and table-of-contents entries with
  one shared rhythm instead of reusing the two desktop components directly.
- Technical posts with series metadata also show a restrained bottom previous/next
  pager after the article body, using the same ink border treatment and vermilion
  hover accent as other reading helpers.
- Blog detail pages include a compact fixed return-to-top button after a scroll
  threshold; it stays visually secondary until hover/focus.

## Watch Cards

Movie and series posters are shown in color by default. Cards retain the
existing poster ratio, ink shadow, serif title, and vermilion hover treatment.
The series badge and optional season marker stay visually secondary, while
movie cards retain the earlier badge-free presentation. Movie short reviews
appear in the hover/tap overlay, preceded by the release year and the full
`WATCHED YYYY.MM.DD` date when available. Series short reviews also appear on
their detail pages.

Series detail pages adapt the album article's two-column rhythm: a sticky poster
on desktop and the record content on the right. Season records form a restrained
linear archive with small 2:3 posters, typographic fallbacks, rating rules, and
optional review copy. They do not reuse music-specific grayscale, vinyl, or
playback effects.

Blog, learn, life, and watch archives share one header rhythm: hierarchical
breadcrumbs, a bilingual serif title, one concise English description, the
current entry count, and route-backed filters. Filters use compact outlined
labels with small category icons, restrained ink borders, and a vermilion
border/text active state. They sit inside the archive header rather than
forming a separate full-width control band. Blog archive pagination continues
that compact outlined treatment: numbered and previous/next links use ink
borders, the active page uses a solid vermilion state, and unavailable edge
controls remain visible but subdued.

The watch archive appends its automatically derived `SINCE YYYY.MM` coverage
metadata to the entry count. Movie and series routes show one boundary; the
combined route labels both boundaries, moving them to a second centered line on
small screens when needed. The coverage text remains unboxed so it cannot be
mistaken for a filter.

## Code Blocks

Code blocks support a customized reading experience with:

- macOS-style controls.
- Copy, collapse, and style toggle affordances.
- Alternative ink-style actions and seal trigger templates in `TechPost.astro`.

Most article-specific code rendering styles live in `src/styles/markdown.css`.

## Article Math

MDX math is rendered through KaTeX. Article math keeps large, non-wrapping
formula text for readability, while overflowing block formulas hide the native
horizontal scrollbar and use a subtle right-edge fade to indicate additional
content. Block formulas use compact vertical spacing, and the optional
`滑动查看` overflow hint sits close to the formula instead of opening a separate
visual gap.

## Private Dashboard

The protected analytics Dashboard uses an editorial report treatment within the
same ink-and-paper system. Its masthead is a raised paper panel with a restrained
`匿` watermark, while numbered section dividers make Overview, Content, Search,
and Quality easy to scan. KPI cards use faint folio numbers and a short
vermilion rule instead of saturated backgrounds.

Charts remain dependency-free: the daily trend is native SVG, ranked lists use
compact bars, and reading completion uses a CSS conic ring. Panels retain strong
contrast in dark mode, motion respects `prefers-reduced-motion`, and the mobile
layout reduces type and card density without hiding any metric.

## Space Systems

The `/space` edition index uses the normal ink-and-vermilion site system through
`BaseLayout.astro`. Its edition list may use one generated cover per year, but
the covers share a full-bleed `16:5` ultrawide editorial composition with
meaningful visual content across the complete canvas; palette, texture, medium,
and concrete art direction remain edition-owned. Covers never
define the visual template for the annual documents and contain no generated
typography; all titles and metadata remain HTML. Desktop entries show the cover
alone until hover or keyboard focus reveals a masked, shadowed left metadata
panel with a diagonal fade; compact layouts keep the same panel visible with a
smaller edition title and metadata scale. The card border stays constant and no
outer box shadow is applied at rest or on hover. Cover cards sit above the
global paper-noise overlay and retain high-density image sources so the artwork
stays crisp. The authoritative prompt and series constraints live in
`modules/space/overview.md`.

`/space/2026` is isolated through `src/layouts/space/Space2026Layout.astro` and
`src/styles/space/2026.css`. It preserves the chapter-specific abstract
palettes, distinct concrete-space systems, separately authored desktop/compact
layouts, and low-density Colophon of the original edition. Inter, Geist Mono,
and Noto Serif SC are its only faces; enhanced motion changes only transform
and opacity. Later editions own their styles independently. Detailed visual and
interaction invariants live in `modules/space/overview.md`.

## Maintenance Rules

- Keep new UI aligned with the ink grayscale and vermilion accent system.
- Prefer existing CSS variables and Tailwind tokens before adding new colors.
- Update this document when the visual language, global tokens, typography, or article rendering changes.
