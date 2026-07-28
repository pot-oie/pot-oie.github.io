import assert from "node:assert/strict";
import test from "node:test";
import {
  getSearchOutcomeEvent,
  normalizeAnalyticsEvent,
  normalizeMetricPath,
  normalizeSearchQuery,
  shouldTrackPageView,
} from "../src/scripts/runtime/analytics";

const context = {
  path: "/blog/example/",
  session: "12345678-1234-4123-8123-123456789abc",
};

test("accepts only the analytics event whitelist", () => {
  assert.equal(
    normalizeAnalyticsEvent({ event: "page_view" }, context)?.event,
    "page_view",
  );
  assert.equal(
    normalizeAnalyticsEvent({ event: "delete_everything" }, context),
    null,
  );
});

test("normalizes paths, no-result queries, and bounded numeric fields", () => {
  assert.equal(
    normalizeMetricPath("/blog/example/?source=test#top"),
    "/blog/example",
  );
  assert.equal(normalizeMetricPath("https://passpot.cn/music/"), "/music");
  assert.equal(
    normalizeSearchQuery("  graph   neural\nnetwork  "),
    "graph neural network",
  );
  assert.equal(normalizeSearchQuery("x".repeat(80))?.length, 64);

  assert.deepEqual(
    normalizeAnalyticsEvent(
      {
        event: "search_no_results",
        query: "  graph   neural\nnetwork  ",
        durationMs: "325",
        resultCount: 9,
      },
      context,
    ),
    {
      event: "search_no_results",
      path: "/blog/example",
      session: context.session,
      query: "graph neural network",
      durationMs: 325,
      resultCount: 0,
    },
  );

  const success = normalizeAnalyticsEvent(
    {
      event: "search_success",
      query: "must not leave the browser",
      durationMs: 120_001,
      resultCount: 4,
    },
    context,
  );
  assert.equal(success?.query, undefined);
  assert.equal(success?.durationMs, undefined);
  assert.equal(success?.resultCount, 4);
});

test("rejects invalid required fields and dashboard traffic", () => {
  assert.equal(
    normalizeAnalyticsEvent({ event: "article_read", depth: 33 }, context),
    null,
  );
  assert.equal(
    normalizeAnalyticsEvent(
      { event: "search_no_results", query: "   " },
      context,
    ),
    null,
  );
  assert.equal(
    normalizeAnalyticsEvent(
      { event: "page_view" },
      { ...context, path: "/dashboard/" },
    ),
    null,
  );
});

test("maps each completed search to exactly one final outcome", () => {
  assert.equal(getSearchOutcomeEvent(7), "search_success");
  assert.equal(getSearchOutcomeEvent(0), "search_no_results");
});

test("deduplicates consecutive Astro page-load delivery but tracks navigation", () => {
  let lastPath: string | null = null;
  const visits: string[] = [];

  for (const path of [
    "/blog/one",
    "/blog/one",
    "/music",
    "/music",
    "/blog/one",
  ]) {
    if (!shouldTrackPageView(lastPath, path)) continue;
    visits.push(path);
    lastPath = path;
  }

  assert.deepEqual(visits, ["/blog/one", "/music", "/blog/one"]);
});
