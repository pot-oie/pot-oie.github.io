import assert from "node:assert/strict";
import test from "node:test";
import type { CollectionEntry } from "astro:content";
import {
  getBlogArchivePageHref,
  getPaginatedBlogArchive,
  getBlogSeriesForPost,
  sortBlogPostsByPublicationDate,
  sortBlogPostsForArchive,
  type BlogPost,
} from "../src/domain/blog";

test("archive ordering prefers updatedDate while publication ordering ignores it", () => {
  const olderButUpdated = post("updated", "2026-01-01", {
    updatedDate: new Date("2026-03-01"),
  });
  const newerPublication = post("published", "2026-02-01");

  assert.deepEqual(
    sortBlogPostsForArchive([newerPublication, olderButUpdated]).map(
      (item) => item.id,
    ),
    ["updated", "published"],
  );
  assert.deepEqual(
    sortBlogPostsByPublicationDate([olderButUpdated, newerPublication]).map(
      (item) => item.id,
    ),
    ["published", "updated"],
  );
});

test("series assembly orders sections and items and marks the current post", () => {
  const current = post("foundations-2", "2026-01-02", {
    series: series("Course", "Foundations", 1, 2),
  });
  const entries = [
    post("advanced-1", "2026-01-03", {
      series: series("Course", "Advanced", 2, 1),
    }),
    current,
    post("foundations-1", "2026-01-01", {
      series: series("Course", "Foundations", 1, 1),
    }),
  ];

  const result = getBlogSeriesForPost(entries, current);

  assert.ok(result);
  assert.deepEqual(
    result.items.map((item) => item.href),
    [
      "/blog/foundations-1/",
      "/blog/foundations-2/",
      "/blog/advanced-1/",
    ],
  );
  assert.deepEqual(
    result.sections.map((section) => ({
      title: section.title,
      items: section.items.map((item) => item.order),
    })),
    [
      { title: "Foundations", items: [1, 2] },
      { title: "Advanced", items: [1] },
    ],
  );
  assert.equal(result.items.filter((item) => item.current).length, 1);
  assert.equal(result.items[1].current, true);
});

test("archive pagination keeps page one canonical and links middle pages", () => {
  const archive = {
    posts: Array.from({ length: 25 }, (_, index) =>
      post(`post-${index + 1}`, "2026-01-01"),
    ),
    filters: [],
  };

  const first = getPaginatedBlogArchive(archive, 1, "/blog", 10);
  const middle = getPaginatedBlogArchive(archive, 2, "/blog/", 10);
  const last = getPaginatedBlogArchive(archive, 3, "/blog/", 10);

  assert.ok(first);
  assert.equal(first.posts.length, 10);
  assert.equal(first.pagination.totalItems, 25);
  assert.equal(first.pagination.previousHref, undefined);
  assert.equal(first.pagination.nextHref, "/blog/page/2/");
  assert.equal(first.pagination.pages[0].href, "/blog/");

  assert.ok(middle);
  assert.equal(middle.posts[0].id, "post-11");
  assert.equal(middle.pagination.previousHref, "/blog/");
  assert.equal(middle.pagination.nextHref, "/blog/page/3/");

  assert.ok(last);
  assert.equal(last.posts.length, 5);
  assert.equal(last.pagination.previousHref, "/blog/page/2/");
  assert.equal(last.pagination.nextHref, undefined);
});

test("archive pagination keeps an empty first page and rejects invalid pages", () => {
  const emptyArchive = { posts: [], filters: [] };

  const empty = getPaginatedBlogArchive(emptyArchive, 1, "/blog/life/", 10);

  assert.ok(empty);
  assert.equal(empty.pagination.totalPages, 1);
  assert.deepEqual(empty.posts, []);
  assert.equal(
    getPaginatedBlogArchive(emptyArchive, 2, "/blog/life/", 10),
    undefined,
  );
  assert.equal(
    getPaginatedBlogArchive(emptyArchive, 0, "/blog/life/", 10),
    undefined,
  );
  assert.equal(
    getPaginatedBlogArchive(emptyArchive, 1.5, "/blog/life/", 10),
    undefined,
  );
  assert.equal(getBlogArchivePageHref("/blog/life", 1), "/blog/life/");
  assert.equal(
    getBlogArchivePageHref("/blog/life", 2),
    "/blog/life/page/2/",
  );
});

function post(
  id: string,
  pubDate: string,
  data: Partial<BlogPost["data"]> = {},
): BlogPost {
  return {
    id,
    collection: "blog",
    data: {
      title: id,
      description: id,
      pubDate: new Date(pubDate),
      category: "learn",
      techCategory: "ai",
      ...data,
    },
  } as CollectionEntry<"blog">;
}

function series(
  title: string,
  sectionTitle: string,
  sectionOrder: number,
  order: number,
): NonNullable<BlogPost["data"]["series"]> {
  return {
    key: "course",
    title,
    section: {
      title: sectionTitle,
      order: sectionOrder,
    },
    subtitle: `${sectionTitle} ${order}`,
    order,
  };
}
