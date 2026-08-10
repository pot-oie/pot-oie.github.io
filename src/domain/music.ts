import type { CollectionEntry } from "astro:content";

export type AlbumEntry = CollectionEntry<"albums">;
export type MusicTrack = CollectionEntry<"music">;

export type ResolvedMusicTrack = Omit<MusicTrack, "data"> & {
  data: Omit<MusicTrack["data"], "coverImage"> & {
    coverImage: NonNullable<MusicTrack["data"]["coverImage"]>;
    album?: AlbumEntry;
  };
};

export function getAlbumMap(
  albums: readonly AlbumEntry[],
): ReadonlyMap<string, AlbumEntry> {
  return new Map(albums.map((album) => [album.id, album]));
}

export function resolveMusicTracks(
  tracks: readonly MusicTrack[],
  albums: readonly AlbumEntry[],
): ResolvedMusicTrack[] {
  const albumMap = getAlbumMap(albums);

  return tracks.map((track) => {
    const album = track.data.albumId
      ? albumMap.get(track.data.albumId)
      : undefined;

    if (track.data.albumId && !album) {
      throw new Error(
        `Music track "${track.id}" references missing album "${track.data.albumId}".`,
      );
    }

    const coverImage = track.data.coverImage ?? album?.data.coverImage;
    if (!coverImage) {
      throw new Error(
        `Music track "${track.id}" has no coverImage and no album cover fallback.`,
      );
    }

    return {
      ...track,
      data: { ...track.data, coverImage, album },
    };
  });
}

export function getStandaloneTracks(
  tracks: readonly ResolvedMusicTrack[],
): ResolvedMusicTrack[] {
  return tracks.filter((track) => !track.data.albumId);
}

export function sortMusicTracksByRecordedAt(
  tracks: readonly ResolvedMusicTrack[],
): ResolvedMusicTrack[] {
  return [...tracks].sort(
    (a, b) => b.data.recordedAt.valueOf() - a.data.recordedAt.valueOf(),
  );
}
