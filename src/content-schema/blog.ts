import { defineCollection, z } from "astro:content";
import { TECH_CATEGORIES, normalizeBlogTag } from "../utils/blogTaxonomy";
import { validateBlogEntryRelations } from "./blogRelations";

const BLOG_CATEGORIES = z.enum([
  "learn",
  "life",
]);

const LIFE_CATEGORIES = z.enum([
  "daily",
  "album",
  "movie",
]);

const TECH_CATEGORY_ENUM = z.enum(TECH_CATEGORIES);

export const blog = defineCollection({
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1),
        shortTitle: z.string().trim().min(1).optional(),
        description: z.string().trim().min(1),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
        coverImage: image().optional(),
        draft: z.boolean().optional(),
        category: BLOG_CATEGORIES,
        lifeCategory: LIFE_CATEGORIES.optional(),
        techCategory: TECH_CATEGORY_ENUM.optional(),
        albumId: z.string().trim().min(1).optional(),
        tags: z
          .array(z.string().trim().min(1))
          .optional()
          .transform((value) => {
            if (!value) return value;
            return [...new Set(value.map((tag) => normalizeBlogTag(tag)))];
          }),
        series: z
          .object({
            id: z.string().trim().min(1),
            section: z.string().trim().min(1).optional(),
            subtitle: z.string().trim().min(1).optional(),
            order: z.number().int().positive(),
          })
          .optional(),
      })
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
