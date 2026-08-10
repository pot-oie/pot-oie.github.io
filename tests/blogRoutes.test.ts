import assert from "node:assert/strict";
import test from "node:test";
import {
  getPublishedBlogArchiveRoutePaths,
  isBlogArchiveRoutePath,
  normalizeBlogRoutePath,
} from "../src/domain/blogRoutes";

test("recognizes every generated blog archive route shape", () => {
  const archivePaths = [
    "/blog/",
    "/blog/page/2/",
    "/blog/learn/",
    "/blog/learn/page/10/",
    "/blog/life/",
    "/blog/life/daily/",
    "/blog/life/daily/page/2/",
    "/blog/learn/ai/",
    "/blog/learn/ai/page/3/",
  ];

  for (const path of archivePaths) {
    assert.equal(isBlogArchiveRoutePath(path), true, path);
  }

  const nonArchivePaths = [
    "/blog/page/1/",
    "/blog/learn/not-real/",
    "/blog/life/not-real/page/2/",
    "/blog/example-post/",
  ];

  for (const path of nonArchivePaths) {
    assert.equal(isBlogArchiveRoutePath(path), false, path);
  }
});

test("builds the exact published archive route set from content counts", () => {
  const entries = [
    ...Array.from({ length: 13 }, () => ({
      category: "learn",
      techCategory: "ai",
    })),
    {
      draft: true,
      category: "life",
      lifeCategory: "daily",
    },
  ];
  const routes = getPublishedBlogArchiveRoutePaths(entries);

  assert.equal(routes.has("/blog"), true);
  assert.equal(routes.has("/blog/page/2"), true);
  assert.equal(routes.has("/blog/page/3"), false);
  assert.equal(routes.has("/blog/learn/page/2"), true);
  assert.equal(routes.has("/blog/learn/ai/page/2"), true);
  assert.equal(routes.has("/blog/life/daily"), true);
  assert.equal(routes.has("/blog/life/daily/page/2"), false);
  assert.equal(routes.has("/blog/learn/not-real"), false);
  assert.equal(normalizeBlogRoutePath("/blog/page/2/?from=test#result"), "/blog/page/2");
});
