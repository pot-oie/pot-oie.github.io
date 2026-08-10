import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const albums = defineCollection({
  loader: glob({
    pattern: "**/*.{yaml,yml,json}",
    base: "./src/content/albums",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().trim().min(1),
      artist: z.string().trim().min(1),
      coverImage: image(),
      releaseDate: z.coerce.date(),
    }),
});
