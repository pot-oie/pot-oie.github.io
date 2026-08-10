import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const music = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/music",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      artist: z.string(),
      albumId: z.string().trim().min(1).optional(),
      trackNumber: z.number().int().positive().optional(),
      coverImage: image().optional(),
      recordedAt: z.coerce.date(),
      audioPreview: z.string().optional(),
      links: z
        .object({
          spotify: z.string().nullable().optional(),
          netease: z.string().nullable().optional(),
          qqMusic: z.string().nullable().optional(),
        })
        .optional(),
      appLinks: z
        .object({
          netease: z.string().nullable().optional(),
          qqMusic: z.string().nullable().optional(),
        })
        .optional(),
    }),
});
