# Immersive 404

Status: Parked

This plan records a possible interactive treatment for the existing `/404`
route. It does not authorize implementation or a change to current routing.

## Goal

Turn a missing page into a short, memorable expression of the site's visual
identity while helping the visitor recover immediately.

The useful outcome remains navigation. The immersive layer should reward a few
seconds of exploration without turning an error into a puzzle that must be
solved.

## Product Boundary

The 404 experience should:

- identify the error as soon as the page renders
- provide immediate links to Home and Blog
- offer Search when the existing search surface can be reused safely
- remain understandable and navigable with animation disabled
- keep the interaction short, self-contained, and page-local

It should not:

- require a loader, WebGL, audio, dragging, or a completed animation
- conceal recovery actions behind an interaction
- add global shortcuts, storage, or persistent state without a separate
  decision
- collect new error details beyond the existing anonymous 404 behavior

## Candidate Concept

One possible direction is a "lost coordinate in an ink sea":

- `404` appears as a missing coordinate or broken constellation.
- Subtle ink particles react to pointer movement or device tilt.
- A vermilion seal marks the reliable route home.
- Short copy frames the page as being outside the recorded space.
- An optional micro-interaction briefly reveals nearby destinations.

This concept is not approved art direction. A future design pass should compare
it with at least one quieter alternative.

## Recovery Hierarchy

The default hierarchy should remain:

1. Clear `404` and missing-page message.
2. Primary return to Home.
3. Secondary link to Blog.
4. Search trigger or search link if it can reuse the existing accessible search
   behavior without duplicating it.
5. Optional decorative interaction.

Browser Back may be offered only as an enhancement. It cannot be the only
recovery path because direct visits have no useful previous page.

## Interaction And Accessibility

The eventual implementation must:

- preserve semantic headings and normal links
- keep focus indication visible against the art direction
- avoid pointer-only instructions
- respect `prefers-reduced-motion`
- avoid flashes and uncontrolled high-frequency movement
- provide a lightweight mobile treatment
- keep decorative canvas or SVG content out of the accessibility tree
- preserve recovery controls if visual assets or client scripts fail

No audio should autoplay. If sound is proposed later, it requires an explicit
opt-in control and a reason beyond decoration.

## Runtime And Analytics Boundary

The current 404 page already participates in global runtime behavior and uses
the `not-found` analytics page kind. Preserve that contract unless analytics
requirements change independently.

Prefer page-local initialization that is idempotent across Astro View
Transitions. A decorative layer should sit behind semantic HTML rather than
become the only rendered interface. Do not introduce Three.js solely to deliver
this small experience unless a measured prototype justifies its cost.

## Restart Conditions

Restart this work only after:

- reviewing the current 404 copy and recovery links
- selecting a visual concept and a reduced-motion equivalent
- deciding whether Search is embedded, opened through the shared surface, or
  omitted
- defining mobile, keyboard, failure, and no-JavaScript behavior
- setting a strict page-specific asset and JavaScript budget
- confirming that any interaction is compatible with View Transitions and the
  existing global runtime

The next conversation should produce a compact storyboard and recovery-state
wireframe before code is written.

## Context For A Future Conversation

Read:

- `docs/project/routing.md`
- `docs/project/styling.md`
- `docs/project/components.md`
- `docs/project/interaction.md`
- `docs/project/analytics.md`

Inspect:

- `src/pages/404.astro`
- `src/layouts/BaseLayout.astro`
- `src/components/Search.astro`
- `src/scripts/runtime/analytics.ts`
