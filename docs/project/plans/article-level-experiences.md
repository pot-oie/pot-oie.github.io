# Article-Level Experiences

Status: Parked

This plan defines how motion-rich or interactive article experiences should be
selected and bounded. It does not approve an experience for any specific
article and does not authorize implementation.

## Goal

Use interaction to explain, demonstrate, or make a subject tangible inside an
article. The experience should improve understanding or memory rather than act
as an unrelated showcase placed beside the writing.

The normal article remains the canonical, readable source. Interactive pieces
are progressive enhancements within that reading experience.

## Qualification Criteria

An article is a good candidate only when it has:

- a concept whose state, transformation, relationship, or sequence benefits
  materially from interaction
- a clear learning or narrative outcome
- enough stable source material to justify maintenance
- a useful static or reduced-motion representation
- a bounded interaction that can be tested independently

Examples worth exploring include diffusion denoising, Transformer attention,
token flow, graph propagation, algorithm execution, or another concept where
the reader can manipulate meaningful inputs.

An article is not a good candidate merely because it is important, new, or
visually sparse.

## Experience Levels

Choose the smallest level that communicates the idea:

1. **Inline instrument**: a focused control, diagram, or state transition inside
   the prose.
2. **Section experience**: a larger sticky or scroll-linked explanation that
   owns one article chapter.
3. **Article-specific opening**: a distinctive hero or short introduction that
   hands off quickly to normal reading.
4. **Companion lab**: a more exploratory tool linked from the article when its
   controls or state would overwhelm the reading flow.

A full-page immersive article should be exceptional. It still needs a readable
canonical path and cannot become the default template for technical posts.

## Content And Component Ownership

Keep article-specific implementations under
`src/components/blog/<topic>` as documented by the current component ownership
rules. MDX may import and place these components explicitly.

Do not:

- add a global dependency or listener for one article without a measured reason
- move a one-off demo into shared components prematurely
- hide required article content inside a canvas
- duplicate prose, metadata, or canonical routes in an experience-only page
- create a universal "immersive article" schema before repeated needs exist

Promote shared primitives only after at least two experiences demonstrate the
same stable behavior.

## Reading And Interaction Contract

Every experience must define:

- the question or concept it helps the reader understand
- the initial state and a clear reset path
- keyboard and touch behavior
- visible instructions that do not assume a mouse
- reduced-motion and static fallbacks
- loading and failure behavior
- whether state survives Astro View Transitions
- how it behaves inside Pagefind excerpts and print-like reading contexts

Scroll-linked sections must release the reader predictably. Avoid trapping
scroll, requiring exact gesture timing, or taking over global Lenis behavior.
Nested interaction surfaces should follow the documented scroll-boundary
rules.

## Visual Direction

Article experiences may be more expressive than the surrounding prose, but
should translate the site's ink, paper, serif, and vermilion language rather
than introduce a disconnected generic technology aesthetic.

The visualization's encoding must remain legible without color alone. Motion
should expose causality, progression, or feedback; decorative motion should
remain secondary.

## Performance And Verification

Before implementation, each candidate needs an experience-specific budget for:

- client JavaScript
- media and model assets
- canvas or WebGL cost
- initialization time
- mobile memory and battery impact

Prefer lazy initialization near the experience and avoid loading large
libraries on articles that do not use them. Verification should cover initial
load, keyboard, touch, reduced motion, View Transitions, and failure with the
enhancement unavailable.

## Relationship To Other Experience Work

Article-level experiences explain a particular piece of content.

The annual scroll will own a linear retrospective. The immersive 404 will own
error recovery. Shared visual motifs are welcome, but runtime and information
architecture should remain independent.

## Restart Conditions

Restart this work for one article at a time, only after:

- naming the target article and the exact concept to clarify
- choosing the smallest suitable experience level
- sketching the static fallback and interactive states
- agreeing on component ownership and dependency cost
- defining accessibility, mobile, reduced-motion, and failure behavior
- deciding how effectiveness will be reviewed after implementation

The next conversation should produce a storyboard or interaction specification
for one selected article before code is written.

## Context For A Future Conversation

Read:

- `docs/project/architecture.md`
- `docs/project/components.md`
- `docs/project/interaction.md`
- `docs/project/styling.md`
- `docs/project/modules/blog/overview.md`
- `docs/project/writing-style.md`
- `docs/project/plans/quality-baselines.md`

Inspect:

- representative MDX articles
- existing components under `src/components/blog`
- the target article layout and runtime composition
- the built bundle for the selected article
