# Project Quality Baselines

Status: Parked

Former priority: P2

## Goal

Establish maintained project-level documentation for testing, performance
budgets, and accessibility.

These are three separate workstreams. They may share measurements and CI
context, but each should be handled in its own conversation.

## Testing Documentation

Define:

- current unit, content-integrity, build, and browser verification layers
- what belongs in each layer
- fixture and test-data conventions
- local commands and CI ownership
- minimum verification by change type

The expected durable document is `docs/project/testing.md`.

## Performance Budget Documentation

Measure the current production build before choosing budgets. Define:

- relevant page archetypes
- JavaScript, CSS, image, and font measurements
- exceptions for intentionally heavy interactive pages
- warning versus blocking thresholds
- local and CI measurement commands

The expected durable document is `docs/project/performance.md`. Do not add a
blocking CI budget before a measured baseline and exception policy exist.

## Accessibility Documentation

Audit representative site-shell, archive, article, search, media, and
interactive-demo experiences. Define:

- keyboard and focus expectations
- semantic structure and accessible naming
- color contrast and reduced-motion behavior
- modal, nested-scroll, audio, and View Transition considerations
- manual and automated verification responsibilities

The expected durable document is `docs/project/accessibility.md`.

## Shared Restart Conditions

- Select representative pages and environments before measuring.
- Separate existing known debt from the standard expected for new changes.
- Prefer documented, repeatable checks over aspirational requirements that
  cannot yet be verified.
- Update `docs/project/README.md` only as each durable document is created.

## Context For Future Conversations

Read:

- `docs/project/architecture.md`
- `docs/project/components.md`
- `docs/project/interaction.md`
- `docs/project/styling.md`
- `docs/project/scripts.md`
- `docs/project/deployment.md`

Inspect:

- `package.json`
- `.github/workflows/ci.yml`
- `tests`
- representative generated pages and client bundles

Do not combine all three workstreams into one implementation conversation.
