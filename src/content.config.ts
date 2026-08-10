import { blog } from "./content-schema/blog";
import type { ContentCollectionName } from "./content-schema/collectionNames";
import { music } from "./content-schema/music";
import { watch } from "./content-schema/watch";

export const collections = {
  blog,
  watch,
  music,
} satisfies Record<ContentCollectionName, unknown>;
