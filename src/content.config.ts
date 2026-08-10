import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TECH_CATEGORIES, normalizeBlogTag } from "./utils/blogTaxonomy";
import { validateBlogEntryRelations } from "./utils/blogIntegrity";

// 博客内容分类枚举
const BLOG_CATEGORIES = z.enum([
  "learn", // 学习笔记
  "life", // 生活记录
]);

// 生活记录的大类枚举
const LIFE_CATEGORIES = z.enum([
  "daily", // 日常随笔
  "album", // 专辑鉴赏
  "movie", // 电影长评
]);

const TECH_CATEGORY_ENUM = z.enum(TECH_CATEGORIES);

const blog = defineCollection({
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1),
        // 为了优化主页展示，生活记录要加短标题
        shortTitle: z.string().trim().min(1).optional(),
        description: z.string().trim().min(1),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        // 文章头图
        heroImage: image().optional(),
        // 展示图
        coverImage: image().optional(),
        // 草稿过滤
        draft: z.boolean().optional(),
        // 分类
        category: BLOG_CATEGORIES,
        // 生活记录的大类
        lifeCategory: LIFE_CATEGORIES.optional(),
        // 技术文章的大类
        techCategory: TECH_CATEGORY_ENUM.optional(),
        // 专辑鉴赏文章
        albumTitle: z.string().trim().min(1).optional(),
        albumArtist: z.string().trim().min(1).optional(),
        // 二级标签（会按注册表做样式映射）
        tags: z
          .array(z.string().trim().min(1))
          .optional()
          .transform((value) => {
            if (!value) return value;
            return [...new Set(value.map((tag) => normalizeBlogTag(tag)))];
          }),
        // 成套学习笔记导航
        series: z
          .object({
            key: z.string().trim().min(1),
            title: z.string().trim().min(1),
            section: z
              .object({
                title: z.string().trim().min(1),
                order: z.number().int().positive(),
              })
              .optional(),
            subtitle: z.string().trim().min(1).optional(),
            order: z.number().int().positive(),
          })
          .optional(),
      })
      // 添加跨字段验证
      .superRefine((value, ctx) => {
        for (const issue of validateBlogEntryRelations(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: [issue.field],
          });
        }
      }),
});

const WATCH_MEDIA_TYPES = z.enum(["movie", "series"]);
const SEASON_RATING = z.union([
  z.number().min(0).max(5),
  z.literal("to-watch"),
]);

// 观影集合：电影使用整体评分，剧集使用季度评分
const watch = defineCollection({
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
        // 电影上映时间或剧集首播时间
        releaseDate: z.coerce.date().optional(),
        // 电影看完日期；剧集仅在最终季看完后填写
        finishedDate: z.coerce.date().optional(),
        // 电影整体评分
        rating: z.number().min(0).max(5).optional(),
        // 剧集季度记录；尚未开始的季度使用 to-watch
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

// 音乐集合
const music = defineCollection({
  // 使用 glob loader 加载 src/content/music 下的所有 yaml/json 文件
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/music",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      artist: z.string(),
      // 专辑
      album: z.string().optional(),
      trackNumber: z.number().optional(),
      // 封面图
      coverImage: image(),
      // 记录时间
      pubDate: z.coerce.date(),
      // 试听链接
      audioPreview: z.string().optional(),
      // 外部链接
      links: z
        .object({
          spotify: z.string().nullable().optional(),
          netease: z.string().nullable().optional(),
          qqMusic: z.string().nullable().optional(),
        })
        .optional(),
      // 应用内链接
      appLinks: z
        .object({
          netease: z.string().nullable().optional(),
          qqMusic: z.string().nullable().optional(),
        })
        .optional(),
    }),
});

export const collections = {
  blog,
  watch,
  music,
};
