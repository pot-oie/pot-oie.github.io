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
  original-image link while keeping the controls visually minimal.

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

## Movie Cards

Movie posters are shown in color by default. Short reviews live in an image overlay that appears on hover and through the `.is-active` selected state used for touch interactions.

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

## Maintenance Rules

- Keep new UI aligned with the ink grayscale and vermilion accent system.
- Prefer existing CSS variables and Tailwind tokens before adding new colors.
- Update this document when the visual language, global tokens, typography, or article rendering changes.
