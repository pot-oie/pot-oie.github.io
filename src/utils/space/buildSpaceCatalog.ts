import { getBlogPostHref } from "../blog";
import type {
  BuildSpaceCatalogOptions,
  SpaceContentCatalog,
  SpaceVisualRecord,
} from "./catalog";
import { resolveSpaceCategory } from "./categoryLabels";
import { extractBlogExcerpt } from "./extractBlogExcerpt";

function toDateStamp(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toOptionalDateStamp(value: Date | undefined): string {
  return value ? toDateStamp(value) : "DATE UNRECORDED";
}

function average(values: readonly number[]): number | null {
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export async function buildSpaceCatalog({
  blogs,
  watches,
  music,
  optimizeImage,
}: BuildSpaceCatalogOptions): Promise<SpaceContentCatalog> {
  const blogRecords = blogs
    .filter((entry) => entry.data.draft !== true)
    .map((entry) => {
      const extracted = extractBlogExcerpt(entry.body);
      return {
        id: entry.id,
        title: entry.data.title,
        pubDate: toDateStamp(entry.data.pubDate),
        textLength: extracted.textLength,
        excerpt: extracted.excerpt,
        href: getBlogPostHref(entry),
        ...resolveSpaceCategory(entry.data),
      };
    })
    .filter((entry) => entry.excerpt.length > 0)
    .sort((left, right) => right.pubDate.localeCompare(left.pubDate));

  const sources = new Map<
    string,
    {
      id: string;
      kind: "watch" | "music";
      title: string;
      dateLabel: string;
      ratingLabel: string | null;
      src: (typeof watches)[number]["data"]["coverImage"];
    }
  >();

  for (const entry of watches) {
    const key = `watch:${entry.data.coverImage.src}`;
    if (sources.has(key)) continue;
    const seasonRatings = (entry.data.seasons ?? [])
      .map((season) => season.rating)
      .filter((rating): rating is number => typeof rating === "number");
    const rating = entry.data.rating ?? average(seasonRatings);
    sources.set(key, {
      id: `watch:${entry.id}`,
      kind: "watch",
      title: entry.data.title,
      dateLabel: toOptionalDateStamp(entry.data.finishedDate ?? entry.data.releaseDate),
      ratingLabel: rating === null || rating === undefined ? null : `${rating.toFixed(1)} / 5`,
      src: entry.data.coverImage,
    });
  }

  for (const entry of music) {
    const key = `music:${entry.data.coverImage.src}`;
    if (sources.has(key)) continue;
    sources.set(key, {
      id: `music:${entry.id}`,
      kind: "music",
      title: entry.data.album ?? entry.data.title,
      dateLabel: toDateStamp(entry.data.pubDate),
      ratingLabel: null,
      src: entry.data.coverImage,
    });
  }

  const visuals: SpaceVisualRecord[] = await Promise.all(
    [...sources.values()].map(async (record) => {
      const variant = await optimizeImage(record);
      return { ...record, ...variant };
    }),
  );
  visuals.sort((left, right) => right.dateLabel.localeCompare(left.dateLabel));

  return {
    generatedAt: new Date().toISOString(),
    blogs: blogRecords,
    visuals,
  };
}
