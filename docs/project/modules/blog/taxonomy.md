# Blog Taxonomy

Blog taxonomy is defined in `src/utils/blogTaxonomy.ts` and enforced by `src/content.config.ts`.

## Technical Categories

- `frontend`: Frontend / 前端
- `backend`: Backend / 后端
- `ai`: AI / 智能
- `leetcode`: Algorithms / 题解
- `classroom`: Knowledge / 课堂

## Life Categories

- `daily`: Daily / 日常
- `album`: Albums / 专辑
- `movie`: Cinema / 影评

Archive-facing labels and descriptions live with the category metadata in
`src/utils/blogTaxonomy.ts`. Keep them concise because the shared archive
header displays them at every category level.

## Tag Registry

Tags support:

- icon rendering
- visual style tokens
- alias-based normalization
- fallback rendering for unknown tags

Source of truth:

- Registry and aliases: `src/utils/blogTaxonomy.ts`
- Rendering usage: `src/layouts/TechPost.astro`
- Content schema transform: `src/content.config.ts`

Tags currently describe and decorate individual technical articles. They do not
generate archive filters or standalone routes. A future Tags module is expected
to be an independent topic map or knowledge index, but its entry point, URL
policy, grouping model, and thin-topic policy remain intentionally undefined.

## Tag Rules

1. Keep tags concise and stable.
2. Prefer Chinese labels for UX consistency unless the term is naturally English, such as JavaScript, CSS, SQL, or ARM.
3. Add aliases for likely variants, such as `js -> JavaScript`.
4. Unknown tags should not block publishing. They use fallback rendering first and can be registered later.
5. Reuse an existing `styleToken` before adding a new one.
6. AI architecture abbreviations and model names such as `CNN`, `GNN`, `RNN`, `LSTM`, `GRU`, `ResNet`, `U-Net`, `Transformer`, `ViT`, `GPT`, `BERT`, `LoRA`, `Diffusion`, and `DiT` can stay in English, while article-specific mechanisms should prefer concise Chinese tags such as `卷积`, `消息传递`, `聚合函数`, or `解码策略`.

`npm run check:content` reports three tag conditions:

- aliases or surrounding whitespace that change during normalization: warning
- unknown normalized tags: warning, with publishing still allowed
- two raw tags that normalize to the same value in one entry: error

This keeps fallback tags compatible while making silent normalization and
deduplication visible to the author.

## Current Style Tokens

- `interaction`: interaction and behavior design
- `design`: UI and UX aesthetics
- `ai`: AI, machine learning, deep learning, and model concepts
- `frontend`: browser and framework engineering
- `backend`: protocol and server-side topics
- `algorithm`: data structure and algorithm topics
- `study`: notes, materials, and review-oriented tags
- `system`: embedded, OS, architecture topics
- `database`: SQL and data persistence topics
- `default`: fallback bucket

## Add A New Tag

1. Add a registry item in `TAG_REGISTRY`.
2. Add alias mappings in `TAG_ALIASES` if needed.
3. Reuse an existing `styleToken` when possible.
4. Run `npm run check:content` and resolve or consciously retain its warning.
5. Check article rendering in light and dark mode if the style changes.

Example:

```ts
"性能优化": {
  label: "性能优化",
  icon: "mingcute:flash-line",
  styleToken: "frontend",
}
```
