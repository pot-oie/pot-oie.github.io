# Pot's Blog

Language: [中文](README.md) | English

Pot's Blog is a personal Astro content site for technical writing, life notes, movie records, and music listening logs. The site uses a modern ink-inspired visual system with grayscale ink tones and vermilion accents.

## Preview

### Home Page

| Light Mode | Dark Mode |
| --- | --- |
| ![Home page light mode](image/readme-home-light.webp) | ![Home page dark mode](image/readme-home-dark.webp) |

| Recent Watches | Recent Listening |
| --- | --- |
| ![Home movie module](image/readme-home-movie.webp) | ![Home music module](image/readme-home-music.webp) |

### Content Modules

| Learning List | Life List |
| --- | --- |
| ![Learning list](image/readme-blog-learn.webp) | ![Life list](image/readme-blog-life.webp) |

| Movie List | Music Calendar |
| --- | --- |
| ![Movie list](image/readme-movie-list.webp) | ![Music calendar](image/readme-music-calendar.webp) |

| About Page |
| --- |
| ![About page](image/readme-about.webp) |

## Features

- Blog archive for technical notes, life writing, album reviews, and movie essays.
- Movie records with cards, ratings, and Grid/Scroll views.
- Music records with recent listening, calendar views, album entries, and track entries.
- Static full-site search powered by Pagefind.
- Reading-focused MDX experience with table of contents, math rendering, custom code blocks, and dark mode.
- Interaction polish with Lenis smooth scrolling, Astro View Transitions, and a global audio player.
- Responsive layouts for mobile reading and browsing across the main pages and content modules.

## Feature Details

| Blog Post | Code Block |
| --- | --- |
| ![Blog post detail](image/readme-post-detail.webp) | ![Code block](image/readme-code-block.webp) |

| MDX Component | Search UI |
| --- | --- |
| ![Embedded MDX component](image/readme-mdx-component.webp) | ![Search UI](image/readme-search.webp) |

| Album Post | Movie Post |
| --- | --- |
| ![Album post](image/readme-album-detail.webp) | ![Movie post](image/readme-movie-detail.webp) |

## Tech Stack

- Astro 5
- Tailwind CSS v4
- Astro Content Collections
- MDX and YAML content sources
- Pagefind
- `astro-icon` and Iconify icon sets
- Lenis

## Getting Started

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Content scripts:

```bash
npm run new
npm run update
npm run album
```

## Project Documentation

- Collaboration entry: [AGENTS.md](AGENTS.md)
- Project documentation index: [docs/project/README.md](docs/project/README.md)
- Architecture: [docs/project/architecture.md](docs/project/architecture.md)
- Routes: [docs/project/routing.md](docs/project/routing.md)
- Content model: [docs/project/content-model.md](docs/project/content-model.md)
- Styling system: [docs/project/styling.md](docs/project/styling.md)
- Components: [docs/project/components.md](docs/project/components.md)
- Interactions: [docs/project/interaction.md](docs/project/interaction.md)

## Repository Shape

```text
src/
  assets/      imported images and content assets
  components/  reusable UI and article demo components
  content/     blog, movie, and music content collections
  layouts/     page and post layout shells
  pages/       Astro routes
  styles/      global and Markdown styles
  utils/       taxonomy, tag, and calendar helpers
docs/project/  maintained project knowledge base
scripts/       content automation scripts
public/        static passthrough assets
```
