import { getYouTubeEmbedUrl as buildYouTubeEmbedUrl, getYouTubeSourceUrl } from "./youtube";

export type VisualMode = "stage" | "neon" | "dim";

export type StationSource =
  | {
      type: "demo";
      health: "ready";
    }
  | {
      type: "youtube";
      health: "ready" | "unverified" | "unavailable";
      youtubeVideoId?: string;
      youtubePlaylistId?: string;
      originalUrl?: string;
    };

export type Station = {
  id: string;
  title: string;
  mood: string;
  city: string;
  visualMode: VisualMode;
  fallbackStationId?: string;
  source: StationSource;
};

const configuredYoutubeVideoId = process.env.NEXT_PUBLIC_ELVIS_YOUTUBE_VIDEO_ID;
const configuredYoutubePlaylistId = process.env.NEXT_PUBLIC_ELVIS_YOUTUBE_PLAYLIST_ID;

const configuredStations: Station[] =
  configuredYoutubeVideoId || configuredYoutubePlaylistId
    ? [
        {
          id: "configured-youtube-station",
          title: "Configured Elvis Radio",
          mood: "YouTube source / custom station / live room",
          city: "elvispresley.cafe",
          visualMode: "neon",
          fallbackStationId: "sun-studio-after-dark",
          source: {
            type: "youtube",
            health: "unverified",
            youtubeVideoId: configuredYoutubeVideoId,
            youtubePlaylistId: configuredYoutubePlaylistId,
          },
        },
      ]
    : [];

export const stations: Station[] = [
  ...configuredStations,
  {
    id: "sun-studio-after-dark",
    title: "Sun Studio After Dark",
    mood: "early rock / warm tape / slow sway",
    city: "Memphis, Tennessee",
    visualMode: "stage",
    fallbackStationId: "vegas-midnight-jukebox",
    source: {
      type: "demo",
      health: "ready",
    },
  },
  {
    id: "vegas-midnight-jukebox",
    title: "Vegas Midnight Jukebox",
    mood: "neon ballads / velvet room / late set",
    city: "Las Vegas, Nevada",
    visualMode: "neon",
    fallbackStationId: "graceland-gold-hour",
    source: {
      type: "demo",
      health: "ready",
    },
  },
  {
    id: "graceland-gold-hour",
    title: "Graceland Gold Hour",
    mood: "gospel glow / brass hits / soft spotlight",
    city: "Memphis, Tennessee",
    visualMode: "dim",
    fallbackStationId: "sun-studio-after-dark",
    source: {
      type: "demo",
      health: "ready",
    },
  },
];

export function getStationSourceUrl(station: Station) {
  if (station.source.type !== "youtube") {
    return undefined;
  }

  if (station.source.originalUrl) {
    return station.source.originalUrl;
  }

  return getYouTubeSourceUrl(station.source);
}

export function getStationStatus(station: Station) {
  if (station.source.type === "demo") {
    return "demo station - ready for YouTube source";
  }

  if (station.source.health === "unavailable") {
    return "source unavailable - skipping recommended";
  }

  if (station.source.health === "unverified") {
    return "YouTube source configured - unverified";
  }

  return "YouTube source ready";
}

export function getYouTubeEmbedUrl(station: Station, origin?: string) {
  if (station.source.type !== "youtube") {
    return undefined;
  }

  return buildYouTubeEmbedUrl(station.source, origin);
}
