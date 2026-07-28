# Blog Authoring Workflow

Status: Parked

Former priority: P2

## Goal

Extend the existing `npm run new` content manager with a safe blog-authoring
flow. The first useful version should create an editable MDX draft without
rewriting or publishing existing content.

## Initial Scope

The interactive flow should cover:

- learn or life category selection and its required second-level category
- registered tag selection with an explicit path for intentionally unknown tags
- optional series key, title, subtitle, order, and section metadata
- draft state
- title, description, date, and a valid MDX template
- collision-safe output paths and a final summary before writing

Generated content must satisfy the current collection schema and
`npm run check:content`.

## Deferred Expansion

Broader authoring automation remains a later phase. Do not add content
migration, bulk metadata rewriting, automatic tag invention, automatic series
ordering, or publishing workflows merely because the creation command is being
edited.

Consider broader automation only after the initial blog creation flow has been
used enough to show stable authoring needs and the content-integrity rules have
stabilized.

## Restart Conditions

- Decide whether blog creation belongs inside `scripts/new.mjs` or a focused
  module called by that command.
- Define overwrite/collision behavior and confirm that drafts are the default.
- Choose the minimum prompts needed for album and non-album life posts.
- Agree on whether unknown tags are selectable, free-form, or a separate
  confirmation step.

## Context For A Future Conversation

Read:

- `docs/project/content-model.md`
- `docs/project/modules/blog/overview.md`
- `docs/project/modules/blog/taxonomy.md`
- `docs/project/scripts.md`
- `docs/project/writing-style.md`

Inspect:

- `scripts/new.mjs`
- `src/content.config.ts`
- `src/utils/blogTaxonomy.ts`
- `scripts/check-blog-content.ts`
- representative learn, life, album, series, and draft MDX files

Treat the initial creation flow and broader authoring automation as separate
implementation phases.
