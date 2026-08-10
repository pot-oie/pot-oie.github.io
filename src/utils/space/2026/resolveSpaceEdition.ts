import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { getBlogPostHref } from "../../../domain/blog";
import type { ResolvedSpaceEdition, SpaceEditionConfig, SpacePosterVariant } from "./edition";

export interface ResolveSpaceEditionOptions {
  config: SpaceEditionConfig;
  blogs: CollectionEntry<"blog">[];
  watches: CollectionEntry<"watch">[];
  tracks: CollectionEntry<"music">[];
  optimizePoster: (source: ImageMetadata) => Promise<SpacePosterVariant>;
}

function sourceId(id: string): string {
  return id.replace(/\.mdx?$/, "").toLocaleLowerCase("en-US");
}

function unique(values: readonly string[], section: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`Space edition contains duplicate ${section} references.`);
  }
}

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

const EDITION_START = new Date("2025-08-01T00:00:00Z");
const EDITION_END = new Date("2026-09-01T00:00:00Z");

function isInEditionPeriod(date: Date | undefined): date is Date {
  return Boolean(date && date >= EDITION_START && date < EDITION_END);
}

export async function resolveSpaceEdition({
  config,
  blogs,
  watches,
  tracks,
  optimizePoster,
}: ResolveSpaceEditionOptions): Promise<ResolvedSpaceEdition> {
  if (config.period !== "2025.08—2026.08") {
    throw new Error(`Invalid Space edition period: ${config.period}`);
  }
  if (config.chapters.length !== 5 || config.chapters.some((chapter, index) => chapter.number !== `0${index + 1}`)) {
    throw new Error("Space edition requires all five ordered chapters and details.");
  }

  unique(config.articles.map((item) => item.sourceId), "article");
  unique(config.projects.map((item) => item.id), "project");
  unique(config.direction.map((item) => item.id), "direction");

  const blogMap = new Map(blogs.map((entry) => [sourceId(entry.id), entry]));
  const articles = config.articles.map((item) => {
    const entry = required(blogMap.get(sourceId(item.sourceId)), `Missing Space article: ${item.sourceId}`);
    if (entry.data.draft === true) throw new Error(`Space article is a draft: ${item.sourceId}`);
    return { id: item.sourceId, title: item.title, summary: item.summary, href: getBlogPostHref(entry) };
  });

  const filmPool = watches
    .filter((entry) => entry.data.mediaType === "movie" && typeof entry.data.rating === "number" && entry.data.coverImage && isInEditionPeriod(entry.data.finishedDate))
    .sort((a, b) => sourceId(a.id).localeCompare(sourceId(b.id), "en-US"));
  if (filmPool.length < config.randomSelection.filmCount) {
    throw new Error(`Space edition requires at least ${config.randomSelection.filmCount} eligible films.`);
  }
  const cropOverrides: Readonly<Record<string, string>> = config.filmCropOverrides;
  const films = await Promise.all(filmPool.map(async (entry) => {
    const id = sourceId(entry.id);
    return {
      id,
      title: entry.data.title,
      rating: `${entry.data.rating!.toFixed(1)} / 5`,
      poster: await optimizePoster(entry.data.coverImage),
      objectPosition: cropOverrides[id],
    };
  }));

  const trackPool = tracks
    .filter((entry) => !entry.data.albumId && Boolean(entry.data.audioPreview?.trim()) && isInEditionPeriod(entry.data.recordedAt))
    .sort((a, b) => sourceId(a.id).localeCompare(sourceId(b.id), "en-US"));
  if (trackPool.length < config.randomSelection.trackCount) {
    throw new Error(`Space edition requires at least ${config.randomSelection.trackCount} eligible tracks.`);
  }
  const resolvedTracks = trackPool.map((entry) => {
    return {
      id: sourceId(entry.id),
      title: entry.data.title,
      artist: entry.data.artist,
      date: entry.data.recordedAt.toISOString().slice(0, 10).replaceAll("-", "."),
      audioPreview: entry.data.audioPreview!,
    };
  });

  for (const project of config.projects) {
    if (!project.url.trim()) throw new Error(`Space project has no URL: ${project.id}`);
  }

  return {
    id: config.id,
    period: config.period,
    identity: config.identity,
    chapters: config.chapters,
    randomSelection: config.randomSelection,
    articles,
    films,
    tracks: resolvedTracks,
    projects: config.projects,
    direction: config.direction,
  };
}
