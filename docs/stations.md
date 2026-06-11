# Station Configuration

Station data lives in `lib/stations.ts`.

## Fields

- `id`: stable station identifier.
- `title`: user-facing station name.
- `mood`: short description shown in the player.
- `city`: location/mood anchor for the station.
- `visualMode`: preferred visual treatment: `stage`, `neon`, or `dim`.
- `fallbackStationId`: station to try when a configured source is unavailable.
- `source.type`: `demo` or `youtube`.
- `source.youtubeVideoId`: optional YouTube video ID.
- `source.youtubePlaylistId`: optional YouTube playlist ID.
- `source.originalUrl`: optional source URL opened by the source button.
- `source.health`: `ready`, `unverified`, or `unavailable`.

## Adding Real Music

Do not add copyrighted audio files to the repository. Add YouTube IDs or licensed source URLs to station objects instead. The UI already shows source availability and can open a configured original source link.

For local configuration without editing UI code, set either of these public environment variables:

```bash
NEXT_PUBLIC_ELVIS_YOUTUBE_VIDEO_ID=VIDEO_ID
NEXT_PUBLIC_ELVIS_YOUTUBE_PLAYLIST_ID=PLAYLIST_ID
```

When present, the app prepends a configured YouTube station and embeds it after the user starts the app.

## Example

```ts
{
  id: "memphis-radio",
  title: "Memphis Radio",
  mood: "gold records / soft stage lights",
  city: "Memphis, Tennessee",
  visualMode: "stage",
  fallbackStationId: "vegas-midnight-jukebox",
  source: {
    type: "youtube",
    health: "unverified",
    youtubePlaylistId: "PLAYLIST_ID",
    originalUrl: "https://www.youtube.com/playlist?list=PLAYLIST_ID",
  },
}
```
