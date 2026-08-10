export const CONTENT_COLLECTION_NAMES = [
  "blog",
  "blogSeries",
  "watch",
  "music",
  "albums",
] as const;

export type ContentCollectionName =
  (typeof CONTENT_COLLECTION_NAMES)[number];
