import type { CollectionEntry } from "astro:content";

// Stable Watch transformations, projections, and route identity live here.

export type WatchEntry = CollectionEntry<"watch">;
export type WatchData = WatchEntry["data"];
export type WatchMediaType = WatchData["mediaType"];
export type MovieWatchData = Extract<WatchData, { mediaType: "movie" }>;
export type SeriesWatchData = Extract<WatchData, { mediaType: "series" }>;
export type MovieWatchEntry = WatchEntry & { data: MovieWatchData };
export type SeriesWatchEntry = WatchEntry & { data: SeriesWatchData };
export type WatchArchiveType = "all" | WatchMediaType;

export interface WatchCardModel {
  entry: WatchEntry;
  data: WatchData;
  slug: string;
  href: string | null;
  score: number;
  pending: boolean;
  latestSeason: number | null;
  isSeries: boolean;
}

export interface WatchDetailModel {
  entry: SeriesWatchEntry;
  data: SeriesWatchData;
  slug: string;
  href: string;
  score: number;
  pending: boolean;
  latestSeason: number;
  sortedSeasons: SeriesWatchData["seasons"];
}

export interface WatchArchiveModel {
  cards: WatchCardModel[];
  counts: Record<WatchArchiveType, number>;
  sinceDates: Record<WatchMediaType, Date | null>;
}

export function isMovieWatchEntry(entry: WatchEntry): entry is MovieWatchEntry {
  return entry.data.mediaType === "movie";
}

export function isSeriesWatchEntry(
  entry: WatchEntry,
): entry is SeriesWatchEntry {
  return entry.data.mediaType === "series";
}

export function getWatchSlug(entry: WatchEntry): string {
  return entry.id.replace(/\.(yaml|yml|json)$/i, "");
}

export function getWatchHref(entry: WatchEntry): string {
  return isSeriesWatchEntry(entry)
    ? `/watch/series/${getWatchSlug(entry)}/`
    : "/watch/movie/";
}

export function getSeriesAverage(data: SeriesWatchData): number {
  const ratings = data.seasons
    .map((season) => season.rating)
    .filter((rating): rating is number => typeof rating === "number");

  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function getWatchScore(data: WatchData): number {
  return data.mediaType === "movie" ? data.rating : getSeriesAverage(data);
}

export function hasPendingSeason(data: WatchData): boolean {
  return (
    data.mediaType === "series" &&
    data.seasons.some((season) => season.rating === "to-watch")
  );
}

export function getLatestSeasonNumber(data: SeriesWatchData): number;
export function getLatestSeasonNumber(data: MovieWatchData): null;
export function getLatestSeasonNumber(data: WatchData): number | null;
export function getLatestSeasonNumber(data: WatchData): number | null {
  return data.mediaType === "series"
    ? Math.max(...data.seasons.map((season) => season.number))
    : null;
}

export function getWatchSortTime(data: WatchData): number {
  return data.finishedDate
    ? data.finishedDate.valueOf()
    : (data.releaseDate?.valueOf() ?? 0);
}

export function getEarliestWatchFinishedDate(
  entries: WatchEntry[],
  mediaType: WatchMediaType,
): Date | null {
  const timestamps = entries.flatMap((entry) =>
    entry.data.mediaType === mediaType && entry.data.finishedDate
      ? [entry.data.finishedDate.valueOf()]
      : [],
  );

  return timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
}

export function formatWatchSince(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}

export function sortWatchEntries(entries: WatchEntry[]): WatchEntry[] {
  return [...entries].sort((a, b) => {
    const pendingDifference =
      Number(hasPendingSeason(b.data)) - Number(hasPendingSeason(a.data));
    if (pendingDifference !== 0) return pendingDifference;
    return getWatchSortTime(b.data) - getWatchSortTime(a.data);
  });
}

export function resolveWatchCard(entry: WatchEntry): WatchCardModel {
  const isSeries = isSeriesWatchEntry(entry);
  return {
    entry,
    data: entry.data,
    slug: getWatchSlug(entry),
    href: isSeries ? getWatchHref(entry) : null,
    score: getWatchScore(entry.data),
    pending: hasPendingSeason(entry.data),
    latestSeason: getLatestSeasonNumber(entry.data),
    isSeries,
  };
}

export function resolveWatchCards(entries: WatchEntry[]): WatchCardModel[] {
  return entries.map(resolveWatchCard);
}

export function resolveWatchDetail(
  entry: SeriesWatchEntry,
): WatchDetailModel {
  return {
    entry,
    data: entry.data,
    slug: getWatchSlug(entry),
    href: getWatchHref(entry),
    score: getSeriesAverage(entry.data),
    pending: hasPendingSeason(entry.data),
    latestSeason: getLatestSeasonNumber(entry.data),
    sortedSeasons: [...entry.data.seasons].sort((a, b) => a.number - b.number),
  };
}

export function resolveWatchArchive(
  entries: WatchEntry[],
  activeType: WatchArchiveType,
): WatchArchiveModel {
  const visibleEntries =
    activeType === "all"
      ? entries
      : entries.filter((entry) => entry.data.mediaType === activeType);

  return {
    cards: resolveWatchCards(sortWatchEntries(visibleEntries)),
    counts: {
      all: entries.length,
      movie: entries.filter(isMovieWatchEntry).length,
      series: entries.filter(isSeriesWatchEntry).length,
    },
    sinceDates: {
      movie: getEarliestWatchFinishedDate(entries, "movie"),
      series: getEarliestWatchFinishedDate(entries, "series"),
    },
  };
}
