# Station Configuration

Station data lives in `lib/stations.ts`.

## Fields

- `id`: stable station identifier.
- `title`: user-facing station name.
- `mood`: short description shown in the player.
- `city`: location/mood anchor for the station.
- `visualMode`: preferred visual treatment: `stage`, `neon`, or `dim`.
- `theme`: station-specific room treatment for label, glow, overlay, and player dock styling.
- `fallbackStationId`: station to try when a configured source is unavailable.
- `source.type`: `youtube`.
- `source.youtubeVideoId`: optional YouTube video ID.
- `source.youtubePlaylistId`: optional YouTube playlist ID.
- `source.originalUrl`: optional source URL opened by the source button.
- `source.health`: `ready`, `unverified`, or `unavailable`.

## Adding Real Music

Do not add copyrighted audio files to the repository. Add YouTube IDs or licensed source URLs to station objects instead. The UI already shows source availability and can open a configured original source link.

The catalog includes exactly these YouTube-backed jukebox stations:

- `Greatest Hits`: `WrMGGouem3c` with playlist `PLsLrXjai8Jf49o9VY_cGDUSj24bf3oFyp`.
- `Christmas Elvis`: `WwdI-gbm5kE` with playlist `PLsLrXjai8Jf57O9kqeKn50nwhOu8J9J5m`.
- `On Tour`: `tR2HOfnPsaI` with playlist `PLsLrXjai8Jf4pGeXmvzmvxjiCA_ax404J`.
- `Elvis 101`: `hI_WiustW0` with playlist `PLsLrXjai8Jf4xP2KMf3SNdo_ABadRGGZS`.
- `Love Songs`: `ttuVUynl5SU` with playlist `PLsLrXjai8Jf7ir4xyacKA-Ioh01Azo-UQ`.

Each station has a matching theme so the background scene, color overlay, and player dock adapt when the jukebox selection changes. This gives the demo actual music sources without bundling audio files in the repository.

The YouTube player is controlled through the IFrame API where embedding is permitted, so the app dock can send play, pause, and volume changes to the selected source.

The player status line can show loading, ready, playing, paused, buffering, ended, or unavailable states for YouTube sources. Demo stations do not depend on the YouTube API.

When a YouTube source reports an unavailable/private/invalid/embed-blocked error through the IFrame API, the app automatically skips to `fallbackStationId` when that station exists and has not already failed in the same auto-skip chain. If the configured fallback is missing or already attempted, the app advances to the next unattempted station. This retry set is bounded to one pass through the station list, so a group of broken YouTube stations cannot loop forever.

Fallback is intentionally conservative. YouTube does not expose every failure mode consistently, so regional blocks, transient network stalls, ad playback states, or normal video endings may only appear as ordinary player status changes.

## Example

```ts
{
  id: "greatest-hits",
  title: "Greatest Hits",
  mood: "gold records / famous choruses / prime time",
  city: "RCA jukebox",
  visualMode: "neon",
  imageSrc: "/images/station-greatest-hits.png",
  theme: stationThemes.hits,
  fallbackStationId: "elvis-101",
  source: {
    type: "youtube",
    health: "unverified",
    youtubeVideoId: "WrMGGouem3c",
    youtubePlaylistId: "PLsLrXjai8Jf49o9VY_cGDUSj24bf3oFyp",
    originalUrl: "https://www.youtube.com/watch?v=WrMGGouem3c&list=PLsLrXjai8Jf49o9VY_cGDUSj24bf3oFyp",
  },
}
```
