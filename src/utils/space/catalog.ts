import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

export interface SpaceBlogRecord {
  id: string;
  title: string;
  pubDate: string;
  textLength: number;
  excerpt: string;
  href: string;
  categoryId: string;
  categoryLabel: string;
}

export type SpaceVisualKind = "watch" | "music";

export interface SpaceVisualRecord {
  id: string;
  kind: SpaceVisualKind;
  title: string;
  dateLabel: string;
  ratingLabel: string | null;
  src: string;
  width: number;
  height: number;
}

export interface SpaceContentCatalog {
  generatedAt: string;
  blogs: SpaceBlogRecord[];
  visuals: SpaceVisualRecord[];
}

export interface SpaceImageRequest {
  id: string;
  kind: SpaceVisualKind;
  src: ImageMetadata;
}

export interface SpaceImageVariant {
  src: string;
  width: number;
  height: number;
}

export interface BuildSpaceCatalogOptions {
  blogs: CollectionEntry<"blog">[];
  watches: CollectionEntry<"watch">[];
  music: CollectionEntry<"music">[];
  optimizeImage: (request: SpaceImageRequest) => Promise<SpaceImageVariant>;
}
