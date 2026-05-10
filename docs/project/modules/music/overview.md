# Music Module

The music module records tracks and albums in YAML files and renders recent listening and calendar views.

## Source Areas

- Content: `src/content/music`
- Assets: `src/assets/music`
- Routes: `src/pages/music/index.astro`, `src/pages/music/[month].astro`
- Components: `src/components/RecentMusic.astro`, `src/components/MusicCalendar.astro`, `src/components/MusicCalendarView.astro`, `src/components/MusicCard.astro`, `src/components/TrackControl.astro`, `src/components/AlbumSidebar.astro`
- Utilities: `src/utils/calendar.ts`
- Scripts: `scripts/update-music.mjs`, `scripts/fetch-album.mjs`, `scripts/new.mjs`

## Content Rules

Music entries are YAML, YML, or JSON files loaded recursively from `src/content/music`.

Important fields:

- `title`
- `artist`
- `album`
- `trackNumber`
- `coverImage`
- `pubDate`
- `audioPreview`
- `links`
- `appLinks`

Nested album directories are supported, such as `src/content/music/t-h-e-p-r-o-t-e-g-e`.

## Playback

Global playback is coordinated through the audio element in `BaseLayout.astro`. Track controls communicate through custom browser events such as `pot:play-request`, `pot:audio-state`, and `pot:audio-progress`.

## Maintenance Notes

- If changing music fields, update `src/content.config.ts` and `docs/project/content-model.md`.
- If changing calendar grouping, update this document and review `src/utils/calendar.ts`.
