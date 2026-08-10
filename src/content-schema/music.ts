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
      album: z.string().optional(),
      trackNumber: z.number().optional(),
      coverImage: image(),
      pubDate: z.coerce.date(),
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
