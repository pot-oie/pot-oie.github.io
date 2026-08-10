import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogSeriesSection = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  order: z.number().int().positive(),
});

export const blogSeries = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/blog-series",
  }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1).optional(),
      sections: z.array(blogSeriesSection).optional(),
    })
    .superRefine((value, ctx) => {
      const sectionIds = new Set<string>();
      const sectionOrders = new Set<number>();

      for (const [index, section] of (value.sections ?? []).entries()) {
        if (sectionIds.has(section.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `section id "${section.id}" must be unique`,
            path: ["sections", index, "id"],
          });
        }
        sectionIds.add(section.id);

        if (sectionOrders.has(section.order)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `section order ${section.order} must be unique`,
            path: ["sections", index, "order"],
          });
        }
        sectionOrders.add(section.order);
      }
    }),
});
