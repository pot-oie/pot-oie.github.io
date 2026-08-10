import { z } from "astro/zod";

const seasonRatingSchema = z.union([
  z.number().min(0).max(5),
  z.literal("to-watch"),
]);

export function createWatchRecordSchema<TImage extends z.ZodTypeAny>(
  imageSchema: TImage,
) {
  const sharedFields = {
    title: z.string(),
    originalTitle: z.string().optional(),
    tmdbId: z.number().int().positive().optional(),
    releaseDate: z.coerce.date().optional(),
    coverImage: imageSchema,
    shortReview: z.string(),
  };

  const seasonSchema = z
    .object({
      number: z.number().int().nonnegative(),
      rating: seasonRatingSchema,
      posterImage: imageSchema.optional(),
      shortReview: z.string().optional(),
    })
    .strict();

  const movieSchema = z
    .object({
      ...sharedFields,
      mediaType: z.literal("movie"),
      finishedDate: z.coerce.date(),
      rating: z.number().min(0).max(5),
      seasons: z.never().optional(),
    })
    .strict();

  const seriesSchema = z
    .object({
      ...sharedFields,
      mediaType: z.literal("series"),
      finishedDate: z.coerce.date().optional(),
      rating: z.never().optional(),
      seasons: z.array(seasonSchema).min(1),
    })
    .strict();

  return z
    .discriminatedUnion("mediaType", [movieSchema, seriesSchema])
    .superRefine((value, ctx) => {
      if (value.mediaType !== "series" || !value.seasons) return;

      const seasonNumbers = value.seasons.map((season) => season.number);
      if (new Set(seasonNumbers).size !== seasonNumbers.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "季度编号不能重复",
          path: ["seasons"],
        });
      }

      const sortedSeasons = [...value.seasons].sort(
        (a, b) => a.number - b.number,
      );
      if (!sortedSeasons.some((season) => typeof season.rating === "number")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "剧集记录至少需要一个已完成评分的季度",
          path: ["seasons"],
        });
      }

      const firstPendingIndex = sortedSeasons.findIndex(
        (season) => season.rating === "to-watch",
      );
      if (
        firstPendingIndex >= 0 &&
        sortedSeasons
          .slice(firstPendingIndex + 1)
          .some((season) => typeof season.rating === "number")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "第一个 to-watch 之后的季度也必须全部为 to-watch",
          path: ["seasons"],
        });
      }

      if (firstPendingIndex >= 0 && value.finishedDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "仍有尚未开始的季度时不能设置 finishedDate",
          path: ["finishedDate"],
        });
      }
    });
}

type TestableWatchRecord = z.output<
  ReturnType<typeof createWatchRecordSchema<z.ZodUnknown>>
>;

export type WatchRecord = TestableWatchRecord;
export type MovieRecord = Extract<WatchRecord, { mediaType: "movie" }>;
export type SeriesRecord = Extract<WatchRecord, { mediaType: "series" }>;
export type WatchSeason = SeriesRecord["seasons"][number];
