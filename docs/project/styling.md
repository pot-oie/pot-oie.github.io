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
  the text.

## Global Texture And Motion

- `body::before` adds a subtle fixed noise texture.
- `main` uses a short fade-in animation.
- Astro View Transitions are enabled in `BaseLayout.astro`.
- Lenis smooth scrolling is initialized globally in `BaseLayout.astro`.
- Article images in `.prose-ink` can open in a focused lightbox overlay. The
  overlay uses a dark ink backdrop, restrained motion, and the vermilion accent
  for the close affordance.

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
content.

## Maintenance Rules

- Keep new UI aligned with the ink grayscale and vermilion accent system.
- Prefer existing CSS variables and Tailwind tokens before adding new colors.
- Update this document when the visual language, global tokens, typography, or article rendering changes.
