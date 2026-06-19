# Blog Taxonomy

Blog taxonomy is defined in `src/utils/blogTaxonomy.ts` and enforced by `src/content.config.ts`.

## Technical Categories

- `frontend`: 前端学习
- `backend`: 后端学习
- `ai`: AI相关
- `leetcode`: leetcode题解
- `classroom`: 知识学习

## Life Categories

- `daily`: 日常随笔
- `album`: 专辑鉴赏
- `movie`: 电影长评

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

## Tag Rules

1. Keep tags concise and stable.
2. Prefer Chinese labels for UX consistency unless the term is naturally English, such as JavaScript, CSS, SQL, or ARM.
3. Add aliases for likely variants, such as `js -> JavaScript`.
4. Unknown tags should not block publishing. They use fallback rendering first and can be registered later.
5. Reuse an existing `styleToken` before adding a new one.
6. AI architecture abbreviations and model names such as `CNN`, `GNN`, `RNN`, `LSTM`, `GRU`, `ResNet`, `U-Net`, `Transformer`, `GPT`, `BERT`, `LoRA`, `Diffusion`, and `DiT` can stay in English, while article-specific mechanisms should prefer concise Chinese tags such as `卷积`, `消息传递`, or `聚合函数`.

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
4. Check article rendering in light and dark mode if the style changes.

Example:

```ts
"性能优化": {
  label: "性能优化",
  icon: "mingcute:flash-line",
  styleToken: "frontend",
}
```
