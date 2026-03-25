# Blog Tags Registry

## Purpose

This document defines how to maintain technical tags used in blog posts.
The tag system supports:

- icon rendering
- style token based visual themes
- alias based normalization
- fallback rendering for unknown tags

## Source Of Truth

- Tags registry: src/utils/blogTaxonomy.ts
- Rendering usage: src/layouts/TechPost.astro
- Content schema transform: src/content.config.ts

## Rules

1. Keep tags concise and stable.
2. Prefer Chinese labels for UX consistency, unless the term is naturally English (for example JavaScript, CSS, SQL).
3. Add aliases for likely variants (for example js -> JavaScript).
4. Do not block publishing for unknown tags. Unknown tags should use fallback style first, then be registered later.

## Add A New Tag

1. Add a registry item in TAG_REGISTRY.
2. If needed, add alias mappings in TAG_ALIASES.
3. Reuse an existing styleToken when possible.
4. Only add a new styleToken if existing buckets are not suitable.

Example:

```ts
'性能优化': {
  label: '性能优化',
  icon: 'mingcute:flash-line',
  styleToken: 'frontend',
}
```

## Style Tokens

- interaction: interaction and behavior design
- design: UI and UX aesthetics
- frontend: browser and framework engineering
- backend: protocol and server side topics
- algorithm: data structure and algorithm topics
- study: notes, materials, and review oriented tags
- system: embedded, OS, architecture topics
- database: SQL and data persistence topics
- default: fallback bucket

## Suggested Review Checklist

- Tag appears in article frontmatter.
- Tag resolves to correct icon and style.
- Dark mode contrast remains readable.
- Alias mapping works for old tag spellings.
