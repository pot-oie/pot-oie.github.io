import assert from "node:assert/strict";
import test from "node:test";
import {
  validateBlogEntryRelations,
  validateBlogIntegrity,
  type BlogIntegrityEntry,
} from "../src/utils/blogIntegrity";

test("reports mutually exclusive categories and album requirements", () => {
  assert.deepEqual(
    validateBlogEntryRelations({
      category: "learn",
      lifeCategory: "daily",
    }).map((issue) => issue.field),
    ["techCategory", "lifeCategory"],
  );

  assert.deepEqual(
    validateBlogEntryRelations({
      category: "life",
      lifeCategory: "album",
      techCategory: "ai",
      series: {
        key: "course",
        title: "Course",
        order: 1,
      },
    }).map((issue) => issue.field),
    ["techCategory", "series", "albumTitle", "albumArtist"],
  );

  assert.deepEqual(
    validateBlogEntryRelations({
      category: "life",
      lifeCategory: "daily",
      albumTitle: "Wrong field",
    }).map((issue) => issue.field),
    ["albumTitle"],
  );
});

test("accepts consistent series metadata", () => {
  const diagnostics = validateBlogIntegrity([
    entry("one", {
      key: "course",
      title: "Course",
      section: { title: "Basics", order: 1 },
      order: 1,
    }),
    entry("two", {
      key: "course",
      title: "Course",
      section: { title: "Basics", order: 1 },
      order: 2,
    }),
  ]);

  assert.equal(
    diagnostics.filter((diagnostic) => diagnostic.severity === "error").length,
    0,
  );
});

test("reports title, section, and duplicate position conflicts", () => {
  const diagnostics = validateBlogIntegrity([
    entry("one", {
      key: "course",
      title: "Course",
      section: { title: "Basics", order: 1 },
      order: 1,
    }),
    entry("two", {
      key: "course",
      title: "Different title",
      section: { title: "Advanced", order: 1 },
      order: 1,
    }),
    entry("three", {
      key: "course",
      title: "Course",
      section: { title: "Basics", order: 2 },
      order: 1,
    }),
  ]);

  const fields = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.field);

  assert.ok(fields.includes("series.title"));
  assert.ok(fields.includes("series.section.title"));
  assert.ok(fields.includes("series.section.order"));
  assert.ok(fields.includes("series.order"));
});

test("diagnoses normalization and duplicates without blocking unknown tags", () => {
  const diagnostics = validateBlogIntegrity([
    {
      id: "tags",
      data: {
        tags: ["js", "JavaScript", "未注册标签"],
      },
    },
  ]);

  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.severity === "warning" &&
        diagnostic.message.includes("规范化"),
    ),
  );
  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.severity === "error" &&
        diagnostic.message.includes("重复标签"),
    ),
  );
  assert.ok(
    diagnostics.some(
      (diagnostic) =>
        diagnostic.severity === "warning" &&
        diagnostic.message.includes("继续发布"),
    ),
  );
});

function entry(
  id: string,
  series: NonNullable<BlogIntegrityEntry["data"]["series"]>,
): BlogIntegrityEntry {
  return {
    id,
    data: { series },
  };
}
