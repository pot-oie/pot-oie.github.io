import { albums } from "./content-schema/albums";
import { blog } from "./content-schema/blog";
import { blogSeries } from "./content-schema/blogSeries";
import type { ContentCollectionName } from "./content-schema/collectionNames";
import { music } from "./content-schema/music";
import { watch } from "./content-schema/watch";

export const collections = {
  blog,
  blogSeries,
  watch,
  music,
  albums,
} satisfies Record<ContentCollectionName, unknown>;
