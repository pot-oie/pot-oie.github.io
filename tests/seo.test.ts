import assert from "node:assert/strict";
import test from "node:test";
import {
  buildArticleStructuredData,
  formatArticleDate,
  resolveSeoImage,
  serializeStructuredData,
} from "../src/utils/seo";

test("resolves the default social image against the configured site", () => {
  assert.deepEqual(
    resolveSeoImage(undefined, new URL("https://passpot.cn")),
    {
      url: "https://passpot.cn/og.png",
      width: 1200,
      height: 630,
      contentType: "image/png",
    },
  );
});

test("formats content dates at midnight in the site timezone", () => {
  assert.equal(
    formatArticleDate(new Date(2026, 2, 24)),
    "2026-03-24T00:00:00+08:00",
  );
});

test("builds one article and breadcrumb graph with absolute URLs", () => {
  const publishedTime = new Date(2026, 2, 24);
  const data = buildArticleStructuredData({
    site: new URL("https://passpot.cn"),
    canonicalURL: new URL("https://passpot.cn/blog/example/"),
    title: "示例文章",
    description: "示例描述",
    imageURL: "https://passpot.cn/og.png",
    article: {
      publishedTime,
      section: "智能",
      tags: ["AI"],
      breadcrumbs: [
        { name: "博客", href: "/blog/" },
        { name: "学习", href: "/blog/learn/" },
      ],
    },
  });
  const graph = data["@graph"] as Array<Record<string, any>>;
  const posting = graph.find((item) => item["@type"] === "BlogPosting");
  const breadcrumb = graph.find(
    (item) => item["@type"] === "BreadcrumbList",
  );

  assert.equal(posting?.datePublished, "2026-03-24T00:00:00+08:00");
  assert.equal(posting?.dateModified, posting?.datePublished);
  assert.deepEqual(posting?.image, ["https://passpot.cn/og.png"]);
  assert.deepEqual(
    breadcrumb?.itemListElement.map(
      (item: Record<string, unknown>) => item.item,
    ),
    [
      "https://passpot.cn/",
      "https://passpot.cn/blog/",
      "https://passpot.cn/blog/learn/",
      "https://passpot.cn/blog/example/",
    ],
  );
});

test("escapes script-closing characters in structured data", () => {
  assert.equal(
    serializeStructuredData({ title: "</script>" }),
    '{"title":"\\u003c/script>"}',
  );
});
