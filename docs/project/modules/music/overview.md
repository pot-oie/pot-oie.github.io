# Music Module

The music module records tracks and albums in YAML files and renders recent listening and calendar views.

## Source Areas

- Track content: `src/content/music`
- Album content: `src/content/albums`
- Assets: `src/assets/music`
- Schemas: `src/content-schema/music.ts`, `src/content-schema/albums.ts`
- Domain resolution: `src/domain/music.ts`
- Routes: `src/pages/music/index.astro`, `src/pages/music/[month].astro`
- Components: `src/components/RecentMusic.astro`, `src/components/MusicCalendar.astro`, `src/components/MusicCalendarView.astro`, `src/components/MusicCard.astro`, `src/components/TrackControl.astro`, `src/components/AlbumSidebar.astro`
- Utilities: `src/utils/calendar.ts`
- Scripts: `scripts/update-music.mjs`, `scripts/fetch-album.mjs`, `scripts/new.mjs`

## Content Rules

Music entries are YAML, YML, or JSON files loaded recursively from `src/content/music`.

Important fields:

- `title`
- `artist`
- `albumId`
- `trackNumber`
- `coverImage`
- `recordedAt`
- `audioPreview`
- `links`
- `appLinks`

Nested album directories are supported, such as `src/content/music/t-h-e-p-r-o-t-e-g-e`.
The nested path remains part of the stable track ID. Album metadata is not
repeated in those tracks: `albumId` points to the matching record in
`src/content/albums`, and `trackNumber` is unique within that album.

`recordedAt` is the listening-record date used by calendar grouping, recent
ordering, RSS, and annual Space selection. Album `releaseDate` has separate
release semantics.

Standalone tracks carry `coverImage`. An album track may provide a cover
override; otherwise `resolveMusicTracks` supplies the referenced album cover.
Routes resolve tracks once and pass the resulting models to Music components,
so components do not implement independent fallback rules.

Music route and homepage entry points load the collection before passing it to
the domain resolver and then to calendar and recent-listening components.
`TrackControl.astro` is the one
intentional component-level read: MDX authors supply a stable `trackId`, and
the component resolves that isolated record without requiring every article
layout to preload the full Music collection.

## Playback

Global playback is coordinated through the audio element in `BaseLayout.astro`. Track controls communicate through custom browser events such as `pot:play-request`, `pot:audio-state`, and `pot:audio-progress`.

## Maintenance Notes

- If changing music fields, update `src/content-schema/music.ts` and
  `docs/project/content-model.md`.
- If changing album fields or relationships, update `src/content-schema/albums.ts`,
  `src/domain/music.ts`, and the offline integrity checks.
- If changing calendar grouping, update this document and review `src/utils/calendar.ts`.
