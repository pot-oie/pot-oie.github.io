import assert from "node:assert/strict";
import test from "node:test";

import { SPACE_EDITION } from "../src/utils/space/2026/edition";
import { selectDiverseRandom, shuffle } from "../src/utils/space/randomSelection";
import { resolveSpaceEdition } from "../src/utils/space/2026/resolveSpaceEdition";

const blog = (id: string, draft = false) => ({ id, body: "", data: { title: id, pubDate: new Date("2026-01-01"), category: "learn", techCategory: "ai", draft } });
const film = (id: string) => ({ id, data: { title: id, mediaType: "movie", rating: 4, finishedDate: new Date("2026-01-10"), coverImage: { src: `/${id}.webp`, width: 600, height: 900, format: "webp" } } });
const track = (id: string, audioPreview = `https://example.com/${id}.m4a`, artist = "Artist", day = 4, albumId?: string) => ({ id, data: { title: id, artist, recordedAt: new Date(`2026-03-${String(day).padStart(2, "0")}`), audioPreview, albumId } });

function sources() {
  return {
    blogs: SPACE_EDITION.articles.map((item) => blog(item.sourceId)),
    watches: Array.from({ length: 10 }, (_, index) => film(`film-${index}`)),
    tracks: Array.from({ length: 10 }, (_, index) => track(`track-${index}`, undefined, `Artist ${index % 5}`, 1 + (index % 5))),
  };
}

async function resolve(overrides: Partial<ReturnType<typeof sources>> = {}) {
  const values = { ...sources(), ...overrides };
  return resolveSpaceEdition({
    config: SPACE_EDITION,
    blogs: values.blogs as never,
    watches: values.watches as never,
    tracks: values.tracks as never,
    optimizePoster: async () => ({ src: "/poster.webp", srcset: "/poster.webp 900w", width: 900, height: 1350 }),
  });
}

test("Space edition resolves complete random-refresh candidate pools", async () => {
  const edition = await resolve();
  assert.equal(edition.period, "2025.08—2026.08");
  assert.equal(edition.chapters.length, 5);
  assert.equal(edition.articles.length, 6);
  assert.equal(edition.randomSelection.filmCount, 6);
  assert.equal(edition.randomSelection.trackCount, 6);
  assert.equal(edition.films.length, 10);
  assert.equal(edition.tracks.length, 10);
  assert.equal(edition.projects.length, 5);
  assert.equal(edition.direction.length, 5);
  assert.equal(edition.articles[0].href, "/blog/ml-01-introduction/");
  assert.equal(edition.films[0].rating, "4.0 / 5");
});

test("Space media selection shuffles slots and constrains Music diversity", () => {
  const values = ["a", "b", "c", "d"];
  assert.notDeepEqual(shuffle(values, () => 0), shuffle(values, () => 0.999));

  const candidates = [
    { id: "a1", artist: "a", date: "01" },
    { id: "a2", artist: "a", date: "02" },
    { id: "a3", artist: "a", date: "03" },
    { id: "b1", artist: "b", date: "01" },
    { id: "b2", artist: "b", date: "02" },
    { id: "c1", artist: "c", date: "03" },
  ];
  const selected = selectDiverseRandom(candidates, 5, [
    { key: (item) => item.artist, max: 2 },
    { key: (item) => item.date, max: 2 },
  ], () => 0.7);
  assert.equal(selected.length, 5);
  const artistCounts = new Map<string, number>();
  const dateCounts = new Map<string, number>();
  selected.forEach((item) => {
    artistCounts.set(item.artist, (artistCounts.get(item.artist) ?? 0) + 1);
    dateCounts.set(item.date, (dateCounts.get(item.date) ?? 0) + 1);
  });
  assert.ok([...artistCounts.values()].every((count) => count <= 2));
  assert.ok([...dateCounts.values()].every((count) => count <= 2));
});

test("Space edition excludes album tracks from the Music candidate pool", async () => {
  const tracks = [
    ...sources().tracks,
    track("album-track", undefined, "Album Artist", 6, "album-id"),
  ];
  const edition = await resolve({ tracks });
  assert.equal(edition.tracks.length, 10);
  assert.ok(!edition.tracks.some((item) => item.id === "album-track"));
});

test("Space edition rejects missing or draft article references", async () => {
  await assert.rejects(() => resolve({ blogs: sources().blogs.slice(1) }), /Missing Space article/);
  const blogs = sources().blogs;
  blogs[0] = blog(SPACE_EDITION.articles[0].sourceId, true);
  await assert.rejects(() => resolve({ blogs }), /is a draft/);
});

test("Space edition rejects malformed film and music references", async () => {
  const watches = sources().watches.slice(0, 6);
  watches[0] = { ...watches[0], data: { ...watches[0].data, rating: undefined as never } };
  await assert.rejects(() => resolve({ watches }), /at least 6 eligible films/);

  const tracks = sources().tracks.slice(0, 6);
  tracks[0] = track("track-0", "");
  await assert.rejects(() => resolve({ tracks }), /at least 6 eligible tracks/);
});
