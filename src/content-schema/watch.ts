import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const WATCH_MEDIA_TYPES = z.enum(["movie", "series"]);
const SEASON_RATING = z.union([
  z.number().min(0).max(5),
  z.literal("to-watch"),
]);

export const watch = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/watch",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        originalTitle: z.string().optional(),
        tmdbId: z.number().int().positive().optional(),
        mediaType: WATCH_MEDIA_TYPES,
        releaseDate: z.coerce.date().optional(),
        finishedDate: z.coerce.date().optional(),
        rating: z.number().min(0).max(5).optional(),
        seasons: z
          .array(
            z.object({
              number: z.number().int().nonnegative(),
              rating: SEASON_RATING,
              posterImage: image().optional(),
              shortReview: z.string().optional(),
            }),
          )
          .optional(),
        coverImage: image(),
        shortReview: z.string(),
      })
      .superRefine((value, ctx) => {
        if (value.mediaType === "movie") {
          if (value.rating === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "电影记录必须设置 rating",
              path: ["rating"],
            });
          }
          if (!value.finishedDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "电影记录必须设置 finishedDate",
              path: ["finishedDate"],
            });
          }
          if (value.seasons) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "电影记录不能设置 seasons",
              path: ["seasons"],
            });
          }
          return;
        }

        if (value.rating !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "剧集评分应记录在 seasons 中",
            path: ["rating"],
          });
        }

        if (!value.seasons?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "剧集记录至少需要一个季度",
            path: ["seasons"],
          });
          return;
        }

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
        const pendingSeasons = sortedSeasons.filter(
          (season) => season.rating === "to-watch",
        );
        const ratedSeasons = value.seasons.filter(
          (season) => typeof season.rating === "number",
        );
        if (ratedSeasons.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "剧集记录至少需要一个已完成评分的季度",
            path: ["seasons"],
          });
        }
        const firstPendingIndex = sortedSeasons.findIndex(
          (season) => season.rating === "to-watch",
        );
        const hasRatedSeasonAfterPending =
          firstPendingIndex >= 0 &&
          sortedSeasons
            .slice(firstPendingIndex + 1)
            .some((season) => typeof season.rating === "number");
        if (hasRatedSeasonAfterPending) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "第一个 to-watch 之后的季度也必须全部为 to-watch",
            path: ["seasons"],
          });
        }
        if (pendingSeasons.length > 0 && value.finishedDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "仍有尚未开始的季度时不能设置 finishedDate",
            path: ["finishedDate"],
          });
        }
      }),
});
