import assert from "node:assert/strict";
import test from "node:test";
import { z } from "astro/zod";
import { createWatchRecordSchema } from "../src/content-schema/watchRecord";

const schema = createWatchRecordSchema(z.string());

const shared = {
  title: "Example",
  coverImage: "../../assets/watch/example.webp",
  shortReview: "",
};

test("watch schema parses explicit movie and series variants", () => {
  const movie = schema.parse({
    ...shared,
    mediaType: "movie",
    finishedDate: "2026-08-10",
    rating: 4.5,
  });
  const series = schema.parse({
    ...shared,
    mediaType: "series",
    seasons: [
      { number: 1, rating: 4 },
      { number: 2, rating: "to-watch" },
    ],
  });

  assert.equal(movie.mediaType, "movie");
  assert.equal(movie.rating, 4.5);
  assert.equal(series.mediaType, "series");
  assert.equal(series.seasons.length, 2);
});

test("movie records require rating and finishedDate and reject series fields", () => {
  assert.equal(
    schema.safeParse({ ...shared, mediaType: "movie", rating: 4 }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "movie",
      finishedDate: "2026-08-10",
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "movie",
      finishedDate: "2026-08-10",
      rating: 4,
      seasons: [{ number: 1, rating: 4 }],
    }).success,
    false,
  );
});

test("watch ratings and season numbers retain their numeric bounds", () => {
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "movie",
      finishedDate: "2026-08-10",
      rating: 5.5,
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      seasons: [{ number: -1, rating: 4 }],
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      seasons: [{ number: 0, rating: 0 }],
    }).success,
    true,
  );
});

test("series records reject movie rating and duplicate season numbers", () => {
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      rating: 4,
      seasons: [{ number: 1, rating: 4 }],
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      seasons: [
        { number: 1, rating: 4 },
        { number: 1, rating: 3 },
      ],
    }).success,
    false,
  );
});

test("series records require a numeric season followed only by pending seasons", () => {
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      seasons: [
        { number: 1, rating: "to-watch" },
        { number: 2, rating: "to-watch" },
      ],
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...shared,
      mediaType: "series",
      seasons: [
        { number: 1, rating: "to-watch" },
        { number: 2, rating: 4 },
      ],
    }).success,
    false,
  );
});

test("series records cannot be finished while a pending season exists", () => {
  const result = schema.safeParse({
    ...shared,
    mediaType: "series",
    finishedDate: "2026-08-10",
    seasons: [
      { number: 1, rating: 4 },
      { number: 2, rating: "to-watch" },
    ],
  });

  assert.equal(result.success, false);
});
