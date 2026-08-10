export const CONTENT_COLLECTION_NAMES = ["blog", "watch", "music"] as const;

export type ContentCollectionName =
  (typeof CONTENT_COLLECTION_NAMES)[number];
