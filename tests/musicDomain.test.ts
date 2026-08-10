import assert from "node:assert/strict";
import test from "node:test";
import {
  getStandaloneTracks,
  resolveMusicTracks,
  sortMusicTracksByRecordedAt,
} from "../src/domain/music";
import { validateMusicIntegrity } from "../src/utils/musicIntegrity";

const cover = { src: "/cover.jpg", width: 1000, height: 1000, format: "jpg" };

test("resolves album cover fallback without changing nested track IDs", () => {
  const resolved = resolveMusicTracks(
    [{ id: "album/01-track", data: { title: "Track", artist: "Artist", albumId: "album", trackNumber: 1, recordedAt: new Date("2026-03-30") } }] as never,
    [{ id: "album", data: { title: "Album", artist: "Artist", releaseDate: new Date("2026-03-26"), coverImage: cover } }] as never,
  );

  assert.equal(resolved[0].id, "album/01-track");
  assert.equal(resolved[0].data.coverImage, cover);
  assert.equal(resolved[0].data.album?.id, "album");
  assert.deepEqual(getStandaloneTracks(resolved), []);
});

test("keeps standalone ordering on recordedAt", () => {
  const tracks = resolveMusicTracks(
    [
      { id: "old", data: { title: "Old", artist: "A", recordedAt: new Date("2026-01-01"), coverImage: cover } },
      { id: "new", data: { title: "New", artist: "B", recordedAt: new Date("2026-02-01"), coverImage: cover } },
    ] as never,
    [],
  );
  assert.deepEqual(sortMusicTracksByRecordedAt(tracks).map((track) => track.id), ["new", "old"]);
});

test("reports missing albums and duplicate album track numbers", () => {
  const diagnostics = validateMusicIntegrity(
    [
      { id: "one", albumId: "known", trackNumber: 1 },
      { id: "two", albumId: "known", trackNumber: 1 },
      { id: "three", albumId: "missing", trackNumber: 2 },
    ],
    [{ id: "known" }],
    [{ id: "review", isAlbumReview: true, albumId: "missing" }],
  );

  assert.deepEqual(diagnostics.map((item) => `${item.entryId}:${item.field}`), [
    "review:albumId",
    "three:albumId",
    "two:trackNumber",
  ]);
});
