import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkBlogContent } from "../scripts/lib/blogContentFiles";

test("reports broken published links and missing assets from an isolated fixture", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-integrity-"));
  const blogDirectory = path.join(root, "src/content/blog");
  await mkdir(blogDirectory, { recursive: true });
  await writeFile(
    path.join(blogDirectory, "fixture.mdx"),
    `---
title: Fixture
description: Fixture
pubDate: 2026-01-01
category: learn
techCategory: ai
---

[missing post](/blog/not-published/)

[missing archive](/blog/learn/not-real/)

![missing image](../../assets/missing.png)
`,
  );

  const result = await checkBlogContent(root);
  const errors = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  );

  assert.equal(errors.length, 3);
  assert.ok(errors.some((diagnostic) => diagnostic.message.includes("博客路由")));
  assert.ok(errors.some((diagnostic) => diagnostic.message.includes("文件不存在")));
});

test("accepts generated archive pages and rejects pages beyond the corpus", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-routes-"));
  const blogDirectory = path.join(root, "src/content/blog");
  await mkdir(blogDirectory, { recursive: true });

  await Promise.all(
    Array.from({ length: 13 }, (_, index) =>
      writeFile(
        path.join(blogDirectory, `fixture-${index + 1}.mdx`),
        `---
title: Fixture ${index + 1}
description: Fixture
pubDate: 2026-01-01
category: learn
techCategory: ai
---

${
  index === 0
    ? `[root page two](/blog/page/2/)

[learn page two](/blog/learn/page/2/)

[AI page two](/blog/learn/ai/page/2/)

[missing page three](/blog/page/3/)
`
    : ""
}`,
      ),
    ),
  );

  const result = await checkBlogContent(root);
  const errors = result.diagnostics.filter(
    (diagnostic) => diagnostic.severity === "error",
  );

  assert.equal(errors.length, 1);
  assert.ok(errors[0].message.includes("/blog/page/3/"));
});

test("loads first-class series records and checks draft memberships", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "blog-series-"));
  const blogDirectory = path.join(root, "src/content/blog");
  const seriesDirectory = path.join(root, "src/content/blog-series");
  await mkdir(blogDirectory, { recursive: true });
  await mkdir(seriesDirectory, { recursive: true });
  await writeFile(
    path.join(seriesDirectory, "course.yaml"),
    `title: Course
sections:
  - id: basics
    title: Basics
    order: 1
`,
  );
  await writeFile(
    path.join(blogDirectory, "published.mdx"),
    seriesFixture("basics", 1),
  );
  await writeFile(
    path.join(blogDirectory, "draft.mdx"),
    seriesFixture("basics", 1, true),
  );
  await writeFile(
    path.join(blogDirectory, "missing-section.mdx"),
    seriesFixture("advanced", 1),
  );

  const result = await checkBlogContent(root);
  const fields = result.diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.field);

  assert.equal(result.seriesDefinitions[0].id, "course");
  assert.ok(fields.includes("series.order"));
  assert.ok(fields.includes("series.section"));
});

function seriesFixture(section: string, order: number, draft = false): string {
  return `---
title: Fixture
description: Fixture
pubDate: 2026-01-01
draft: ${draft}
category: learn
techCategory: ai
series:
  id: course
  section: ${section}
  order: ${order}
---
`;
}
