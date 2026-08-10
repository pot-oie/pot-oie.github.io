import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  getCurrentSpaceEdition,
  SPACE_EDITIONS,
  type SpaceEditionSummary,
} from "../src/utils/space/editions";
import { shouldIncludeInSitemap } from "../astro.config.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

test("Space registry has unique annual routes and exactly one current edition", () => {
  const years = SPACE_EDITIONS.map((edition) => edition.year);
  const hrefs = SPACE_EDITIONS.map((edition) => edition.href);

  assert.equal(new Set(years).size, years.length);
  assert.equal(new Set(hrefs).size, hrefs.length);
  assert.equal(getCurrentSpaceEdition().href, "/space/2026");
  assert.ok(SPACE_EDITIONS.every((edition) => edition.href === `/space/${edition.year}`));
});

test("Space registry rejects missing or ambiguous current editions", () => {
  const base: SpaceEditionSummary = {
    year: 2026,
    title: "Space 2026",
    period: "2025.08—2026.08",
    description: "Edition",
    href: "/space/2026",
    current: false,
  };

  assert.throws(() => getCurrentSpaceEdition([base]), /exactly one current edition/);
  assert.throws(
    () => getCurrentSpaceEdition([{ ...base, current: true }, { ...base, year: 2027, href: "/space/2027", current: true }]),
    /exactly one current edition/,
  );
});

test("Space index and every registered annual route have Astro entry points", () => {
  assert.ok(existsSync(`${projectRoot}/src/pages/space/index.astro`));
  for (const edition of SPACE_EDITIONS) {
    assert.ok(existsSync(`${projectRoot}/src/pages${edition.href}.astro`));
  }
});

test("Space route boundaries keep the index searchable and the edition isolated", () => {
  const homepage = readFileSync(`${projectRoot}/src/pages/index.astro`, "utf8");
  const index = readFileSync(`${projectRoot}/src/pages/space/index.astro`, "utf8");
  const edition = readFileSync(`${projectRoot}/src/pages/space/2026.astro`, "utf8");
  const shell = readFileSync(`${projectRoot}/src/components/space/2026/SpaceEdition.astro`, "utf8");
  const layout = readFileSync(`${projectRoot}/src/layouts/space/Space2026Layout.astro`, "utf8");

  assert.match(homepage, /getCurrentSpaceEdition/);
  assert.match(homepage, /href=\{currentSpaceEdition\.href\}/);
  assert.match(homepage, /data-astro-reload/);
  assert.match(index, /BaseLayout/);
  assert.match(index, /ArchiveHeader/);
  assert.match(index, /data-astro-reload/);
  assert.doesNotMatch(edition, /BaseLayout/);
  assert.match(shell, /href="\/" data-astro-reload>← HOME/);
  assert.match(shell, /href="\/space" data-astro-reload>← SPACE INDEX/);
  assert.match(shell, /data-pagefind-ignore/);
  assert.match(layout, /name="robots" content="index, follow"/);
});

test("sitemap includes the Space index and omits the projected 2026 document", () => {
  assert.equal(shouldIncludeInSitemap("https://passpot.cn/space/"), true);
  assert.equal(shouldIncludeInSitemap("https://passpot.cn/space/2026/"), false);
  assert.equal(shouldIncludeInSitemap("https://passpot.cn/dashboard/"), false);
});
