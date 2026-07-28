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
