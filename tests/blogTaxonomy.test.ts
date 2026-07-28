import assert from "node:assert/strict";
import test from "node:test";
import {
  getBlogTagMeta,
  normalizeBlogTag,
} from "../src/utils/blogTaxonomy";

test("normalizes registered aliases and surrounding whitespace", () => {
  assert.equal(normalizeBlogTag(" js "), "JavaScript");
  assert.equal(normalizeBlogTag("deep learning"), "深度学习");
  assert.equal(normalizeBlogTag("Transformer"), "Transformer");
});

test("keeps unknown tags publishable with fallback metadata", () => {
  assert.equal(normalizeBlogTag("新标签"), "新标签");
  assert.deepEqual(getBlogTagMeta("新标签"), {
    label: "新标签",
    icon: "mingcute:tag-2-line",
    styleToken: "default",
  });
});
