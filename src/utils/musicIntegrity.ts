export type MusicIntegrityDiagnostic = {
  severity: "error";
  entryId: string;
  field: string;
  message: string;
};

export type MusicIntegrityTrack = {
  id: string;
  albumId?: string;
  trackNumber?: number;
  coverImage?: string;
};

export type MusicIntegrityAlbum = { id: string };

export type MusicIntegrityReview = {
  id: string;
  isAlbumReview: boolean;
  albumId?: string;
};

export function validateMusicIntegrity(
  tracks: readonly MusicIntegrityTrack[],
  albums: readonly MusicIntegrityAlbum[],
  reviews: readonly MusicIntegrityReview[],
): MusicIntegrityDiagnostic[] {
  const diagnostics: MusicIntegrityDiagnostic[] = [];
  const albumIds = new Set(albums.map((album) => album.id));
  const positions = new Map<string, MusicIntegrityTrack>();

  for (const track of tracks) {
    if (track.albumId && !albumIds.has(track.albumId)) {
      diagnostics.push(missingAlbum(track.id, track.albumId));
    }
    if (!track.coverImage && !track.albumId) {
      diagnostics.push({
        severity: "error",
        entryId: track.id,
        field: "coverImage",
        message: "独立单曲必须设置 coverImage。",
      });
    }
    if (track.albumId && track.trackNumber !== undefined) {
      const position = `${track.albumId}:${track.trackNumber}`;
      const existing = positions.get(position);
      if (existing) {
        diagnostics.push({
          severity: "error",
          entryId: track.id,
          field: "trackNumber",
          message: `专辑 "${track.albumId}" 的曲序 ${track.trackNumber} 已被 ${existing.id} 使用。`,
        });
      } else {
        positions.set(position, track);
      }
    }
  }

  for (const review of reviews) {
    if (review.isAlbumReview && review.albumId && !albumIds.has(review.albumId)) {
      diagnostics.push(missingAlbum(review.id, review.albumId));
    }
  }

  return diagnostics.sort(
    (a, b) =>
      a.entryId.localeCompare(b.entryId) || a.field.localeCompare(b.field),
  );
}

function missingAlbum(
  entryId: string,
  albumId: string,
): MusicIntegrityDiagnostic {
  return {
    severity: "error",
    entryId,
    field: "albumId",
    message: `引用的专辑 "${albumId}" 不存在。`,
  };
}
