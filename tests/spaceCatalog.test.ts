import assert from "node:assert/strict";
import test from "node:test";

import { resolveSpaceCategory } from "../src/utils/space/categoryLabels";
import {
  extractBlogExcerpt,
  extractBlogPlainText,
} from "../src/utils/space/extractBlogExcerpt";

test("Space excerpts retain prose and discard executable or visual MDX", () => {
  const source = `
import Demo from "../Demo.astro";

# Visible heading

正文保留，**强调文本也保留**。

\`inline code\`

\`\`\`ts
const secret = "discarded";
\`\`\`

<Demo client:load />

![discarded image](./cover.png)

{2 + 2}
`;

  const plainText = extractBlogPlainText(source);
  assert.match(plainText, /Visible heading/);
  assert.match(plainText, /正文保留，强调文本也保留/);
  assert.doesNotMatch(plainText, /Demo|secret|inline code|discarded image|2 \+ 2/);

  const result = extractBlogExcerpt(source, 12);
  assert.ok(result.excerpt.endsWith("…"));
  assert.ok(result.textLength > 12);
});

test("Space category labels remain explicit and reject unknown categories", () => {
  assert.deepEqual(
    resolveSpaceCategory({ category: "learn", techCategory: "ai" }),
    { categoryId: "learn:ai", categoryLabel: "MACHINE_LEARNING" },
  );
  assert.throws(
    () => resolveSpaceCategory({ category: "life", lifeCategory: "unknown" }),
    /Missing \/space category label/,
  );
});
