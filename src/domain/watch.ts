import type { CollectionEntry } from "astro:content";

// Stable Watch transformations and route identity belong to the domain layer.

export type WatchEntry = CollectionEntry<"watch">;
export type WatchData = WatchEntry["data"];

export function getWatchSlug(entry: WatchEntry): string {
  return entry.id.replace(/\.(yaml|yml|json)$/i, "");
}

export function getSeriesAverage(data: WatchData): number | null {
  if (data.mediaType !== "series" || !data.seasons) return null;

  const ratings = data.seasons
    .map((season) => season.rating)
    .filter((rating): rating is number => typeof rating === "number");

  if (ratings.length === 0) return null;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

export function getWatchScore(data: WatchData): number | null {
  return data.mediaType === "movie"
    ? (data.rating ?? null)
    : getSeriesAverage(data);
}

export function hasPendingSeason(data: WatchData): boolean {
  return (
    data.mediaType === "series" &&
    Boolean(
      data.seasons?.some((season) => season.rating === "to-watch"),
    )
  );
}

export function getLatestSeasonNumber(data: WatchData): number | null {
  if (data.mediaType !== "series" || !data.seasons?.length) return null;
  return Math.max(...data.seasons.map((season) => season.number));
}

export function getWatchSortTime(data: WatchData): number {
  return data.finishedDate
    ? data.finishedDate.valueOf()
    : (data.releaseDate?.valueOf() ?? 0);
}

export function getEarliestWatchFinishedDate(
  entries: WatchEntry[],
  mediaType: WatchData["mediaType"],
): Date | null {
  const timestamps = entries
    .filter(
      (entry) =>
        entry.data.mediaType === mediaType && entry.data.finishedDate,
    )
    .map((entry) => entry.data.finishedDate!.valueOf());

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
