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
        id: "course",
        order: 1,
      },
    }).map((issue) => issue.field),
    ["techCategory", "series", "albumId"],
  );

  assert.deepEqual(
    validateBlogEntryRelations({
      category: "life",
      lifeCategory: "daily",
      albumId: "wrong-album",
    }).map((issue) => issue.field),
    ["albumId"],
  );
});

test("accepts consistent series metadata", () => {
  const diagnostics = validateBlogIntegrity([
    entry("one", {
      id: "course",
      section: "basics",
      order: 1,
    }),
    entry("two", {
      id: "course",
      section: "basics",
      order: 2,
    }),
  ], [definition()]);

  assert.equal(
    diagnostics.filter((diagnostic) => diagnostic.severity === "error").length,
    0,
  );
});

test("reports missing series, missing sections, and duplicate positions including drafts", () => {
  const diagnostics = validateBlogIntegrity([
    entry("one", {
      id: "course",
      section: "basics",
      order: 1,
    }),
    entry("two", {
      id: "course",
      section: "basics",
      order: 1,
    }, true),
    entry("three", {
      id: "course",
      section: "missing",
      order: 1,
    }),
    entry("four", { id: "missing", order: 1 }),
  ], [definition()]);

  const fields = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.field);

  assert.ok(fields.includes("series.id"));
  assert.ok(fields.includes("series.section"));
  assert.ok(fields.includes("series.order"));
});

test("rejects non-positive series and section order", () => {
  const diagnostics = validateBlogIntegrity(
    [entry("invalid-order", { id: "course", section: "basics", order: 0 })],
    [
      {
        id: "course",
        title: "Course",
        sections: [{ id: "basics", title: "Basics", order: -1 }],
      },
    ],
  );

  assert.equal(
    diagnostics.filter(
      (diagnostic) =>
        diagnostic.severity === "error" &&
        diagnostic.field.includes("order"),
    ).length,
    2,
  );
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
  draft = false,
): BlogIntegrityEntry {
  return {
    id,
    data: { draft, series },
  };
}

function definition() {
  return {
    id: "course",
    title: "Course",
    sections: [{ id: "basics", title: "Basics", order: 1 }],
  };
}
