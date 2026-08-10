import assert from "node:assert/strict";
import test from "node:test";
import type { CollectionEntry } from "astro:content";
import {
  getWatchSlug,
  sortWatchEntries,
  type WatchEntry,
} from "../src/domain/watch";

test("watch sorting keeps pending series first and completed records newest first", () => {
  const entries = [
    watchEntry("older.yaml", "movie", "2025-01-01"),
    watchEntry("newer.yaml", "movie", "2026-01-01"),
    watchEntry("pending.yaml", "series", undefined, [
      { number: 1, rating: 4 },
      { number: 2, rating: "to-watch" },
    ]),
  ];

  assert.deepEqual(
    sortWatchEntries(entries).map((entry) => entry.id),
    ["pending.yaml", "newer.yaml", "older.yaml"],
  );
});

test("watch slugs preserve nested IDs while removing source extensions", () => {
  assert.equal(
    getWatchSlug(watchEntry("series/example.yml", "series", undefined, [
      { number: 1, rating: 4 },
    ])),
    "series/example",
  );
});

function watchEntry(
  id: string,
  mediaType: "movie" | "series",
  finishedDate?: string,
  seasons?: Array<{ number: number; rating: number | "to-watch" }>,
): WatchEntry {
  return {
    id,
    collection: "watch",
    data: {
      title: id,
      mediaType,
      coverImage: { src: "/cover.webp", width: 1, height: 1, format: "webp" },
      shortReview: "",
      rating: mediaType === "movie" ? 4 : undefined,
      finishedDate: finishedDate ? new Date(finishedDate) : undefined,
      seasons,
    },
  } as CollectionEntry<"watch">;
}
