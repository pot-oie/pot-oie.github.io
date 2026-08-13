import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeriesAverage,
  getWatchHref,
  getWatchSlug,
  resolveWatchArchive,
  resolveWatchCard,
  resolveWatchDetail,
  sortWatchEntries,
  type MovieWatchEntry,
  type SeriesWatchEntry,
  type WatchEntry,
} from "../src/domain/watch";

test("watch sorting keeps pending series first and completed records newest first", () => {
  const entries = [
    movieEntry("older.yaml", "2025-01-01"),
    movieEntry("newer.yaml", "2026-01-01"),
    seriesEntry("pending.yaml", undefined, [
      { number: 1, rating: 4 },
      { number: 2, rating: "to-watch" },
    ]),
  ];

  assert.deepEqual(
    sortWatchEntries(entries).map((entry) => entry.id),
    ["pending.yaml", "newer.yaml", "older.yaml"],
  );
});

test("watch hrefs preserve nested IDs and public route behavior", () => {
  const series = seriesEntry("nested/example.yml", undefined, [
    { number: 1, rating: 4 },
  ]);

  assert.equal(getWatchSlug(series), "nested/example");
  assert.equal(getWatchHref(series), "/watch/series/nested/example/");
  assert.equal(
    getWatchHref(overallSeriesEntry("sitcom.yaml", "2026-01-02")),
    "/watch/series/",
  );
  assert.equal(
    getWatchHref(movieEntry("film.json", "2026-01-01")),
    "/watch/movie/",
  );
});

test("overall-rated series stay in the series archive without a detail link", () => {
  const series = overallSeriesEntry("sitcom.yaml", "2026-01-02");
  assert.deepEqual(resolveWatchCard(series), {
    entry: series,
    data: series.data,
    slug: "sitcom",
    href: null,
    score: 4.5,
    pending: false,
    latestSeason: null,
    isSeries: true,
  });
});

test("card and detail projections resolve scores, pending state, and seasons", () => {
  const series = seriesEntry("show.yaml", undefined, [
    { number: 3, rating: "to-watch" },
    { number: 1, rating: 4 },
    { number: 2, rating: 5 },
  ]);

  assert.equal(getSeriesAverage(series.data), 4.5);
  assert.deepEqual(resolveWatchCard(series), {
    entry: series,
    data: series.data,
    slug: "show",
    href: "/watch/series/show/",
    score: 4.5,
    pending: true,
    latestSeason: 3,
    isSeries: true,
  });

  const detail = resolveWatchDetail(series);
  assert.equal(detail.score, 4.5);
  assert.equal(detail.pending, true);
  assert.deepEqual(
    detail.sortedSeasons.map((season) => season.number),
    [1, 2, 3],
  );
});

test("archive projection filters, orders, counts, and derives date boundaries", () => {
  const entries: WatchEntry[] = [
    movieEntry("old.yaml", "2025-01-15"),
    movieEntry("new.yaml", "2026-02-01"),
    seriesEntry("done.yaml", "2025-04-20", [{ number: 1, rating: 4 }]),
    seriesEntry("pending.yaml", undefined, [
      { number: 1, rating: 4 },
      { number: 2, rating: "to-watch" },
    ]),
  ];

  const archive = resolveWatchArchive(entries, "series");
  assert.deepEqual(archive.counts, { all: 4, movie: 2, series: 2 });
  assert.deepEqual(
    archive.cards.map((card) => card.entry.id),
    ["pending.yaml", "done.yaml"],
  );
  assert.equal(
    archive.sinceDates.movie?.toISOString(),
    "2025-01-15T00:00:00.000Z",
  );
  assert.equal(
    archive.sinceDates.series?.toISOString(),
    "2025-04-20T00:00:00.000Z",
  );
});

function movieEntry(id: string, finishedDate: string): MovieWatchEntry {
  return {
    id,
    collection: "watch",
    data: {
      title: id,
      mediaType: "movie",
      coverImage: image,
      shortReview: "",
      rating: 4,
      finishedDate: new Date(finishedDate),
    },
  } as MovieWatchEntry;
}

function seriesEntry(
  id: string,
  finishedDate: string | undefined,
  seasons: Array<{ number: number; rating: number | "to-watch" }>,
): SeriesWatchEntry {
  return {
    id,
    collection: "watch",
    data: {
      title: id,
      mediaType: "series",
      coverImage: image,
      shortReview: "",
      finishedDate: finishedDate ? new Date(finishedDate) : undefined,
      seasons,
    },
  } as SeriesWatchEntry;
}

function overallSeriesEntry(
  id: string,
  finishedDate: string | undefined,
): SeriesWatchEntry {
  return {
    id,
    collection: "watch",
    data: {
      title: id,
      mediaType: "series",
      coverImage: image,
      shortReview: "",
      finishedDate: finishedDate ? new Date(finishedDate) : undefined,
      rating: 4.5,
    },
  } as SeriesWatchEntry;
}

const image = { src: "/cover.webp", width: 1, height: 1, format: "webp" } as const;
