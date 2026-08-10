import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchAlbumTracks,
  generateMusicSlug,
  metadataScore,
  searchItunes,
  storefrontsFor,
} from "../scripts/lib/musicMetadata.mjs";

test("music storefront order follows the query script", () => {
  assert.equal(storefrontsFor("アイドル YOASOBI")[0].country, "JP");
  assert.equal(storefrontsFor("봄날 BTS")[0].country, "KR");
  assert.equal(storefrontsFor("富士山下 陈奕迅")[0].country, "CN");
});

test("album lookup falls back to a collection-scoped song search", async () => {
  const selected = {
    collectionId: 1,
    collectionName: "Boomerang",
    artistName: "孙盛希",
    storefront: "CN",
    storefronts: ["CN", "HK"],
  };
  const attempted = [] as string[];
  const fetchJson = async (url: string) => {
    attempted.push(url);
    const parsed = new URL(url);
    return parsed.pathname.endsWith("/search")
      ? { results: [{ wrapperType: "track", collectionId: 1, trackNumber: 1, collectionName: "Boomerang", artistName: "孙盛希", trackName: "Track" }] }
      : { results: [{ wrapperType: "collection" }] };
  };
  const resolved = await fetchAlbumTracks(fetchJson, selected, [selected]);
  assert.equal(resolved.album.collectionId, 1);
  assert.equal(resolved.storefront, "CN");
  assert.equal(resolved.tracks.length, 1);
  assert.deepEqual(attempted.map((url) => new URL(url).pathname), ["/lookup", "/search"]);
});

test("music slugs handle Latin, kana, Hangul, and stable fallbacks", () => {
  assert.equal(generateMusicSlug("Ditto", 1, "US"), "ditto");
  assert.equal(generateMusicSlug("アイドル", 2, "JP"), "a-i-do-ru");
  assert.equal(generateMusicSlug("봄날", 3, "KR"), "bom-nal");
  assert.equal(generateMusicSlug("東京", 4, "JP"), "track-4");
});

test("preview matching rewards both title and artist", () => {
  const exact = metadataScore({ trackName: "Ditto", artistName: "NewJeans" }, "Ditto", "NewJeans");
  const wrongArtist = metadataScore({ trackName: "Ditto", artistName: "Someone Else" }, "Ditto", "NewJeans");
  assert.ok(exact > wrongArtist);
  assert.equal(exact, 10);
});

test("iTunes search merges storefronts and deduplicates track IDs", async () => {
  const fetchJson = async (url: string) => {
    const country = new URL(url).searchParams.get("country");
    return { results: [{ trackId: 1, trackName: "Same" }, { trackId: country === "JP" ? 2 : 1, trackName: country }] };
  };
  const results = await searchItunes(fetchJson, { query: "アイドル", entity: "song", limit: 5 });
  assert.deepEqual(results.map((item) => item.trackId), [1, 2]);
  assert.equal(results[0].storefront, "JP");
  assert.deepEqual(results[0].storefronts, ["JP", "CN", "HK", "TW", "KR", "US"]);
});
