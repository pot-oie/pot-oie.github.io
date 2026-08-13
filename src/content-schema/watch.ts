import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { createWatchRecordSchema } from "./watchRecord";

export { createWatchRecordSchema } from "./watchRecord";
export type {
  MovieRecord,
  OverallSeriesRecord,
  SeasonSeriesRecord,
  SeriesRecord,
  WatchRecord,
  WatchSeason,
} from "./watchRecord";

export const watch = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/watch",
  }),
  schema: ({ image }) => createWatchRecordSchema(image()),
});
