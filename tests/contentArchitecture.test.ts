import assert from "node:assert/strict";
import test from "node:test";
import { CONTENT_COLLECTION_NAMES } from "../src/content-schema/collectionNames";
import * as blogDomain from "../src/domain/blog";
import * as legacyBlogDomain from "../src/utils/blog";
import * as watchDomain from "../src/domain/watch";
import * as legacyWatchDomain from "../src/utils/watch";

test("keeps domain collection names and registers first-class series and albums", () => {
  assert.deepEqual(CONTENT_COLLECTION_NAMES, [
    "blog",
    "blogSeries",
    "watch",
    "music",
    "albums",
  ]);
});

test("keeps compatibility exports for moved domain modules", () => {
  assert.equal(legacyBlogDomain.getBlogPostHref, blogDomain.getBlogPostHref);
  assert.equal(
    legacyBlogDomain.getBlogSeriesForPost,
    blogDomain.getBlogSeriesForPost,
  );
  assert.equal(legacyWatchDomain.sortWatchEntries, watchDomain.sortWatchEntries);
  assert.equal(legacyWatchDomain.getWatchSlug, watchDomain.getWatchSlug);
});
