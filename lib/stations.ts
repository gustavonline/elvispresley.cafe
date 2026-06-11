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
  imageSrc: string;
  fallbackStationId?: string;
  source: StationSource;
};

export type StationFallbackPlan = {
  station: Station;
  stationIndex: number;
  message: string;
  mode: "configured" | "next";
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
          imageSrc: "/images/elvis-cafe-vegas-jukebox.jpg",
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
    imageSrc: "/images/elvis-cafe-sun-studio.jpg",
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
    imageSrc: "/images/elvis-cafe-vegas-jukebox.jpg",
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
    imageSrc: "/images/elvis-cafe-graceland-lounge.jpg",
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

export function getStationFallbackPlan(allStations: Station[], currentIndex: number, attemptedStationIds: ReadonlySet<string>): StationFallbackPlan | undefined {
  const currentStation = allStations[currentIndex];

  if (!currentStation || allStations.length <= 1) {
    return undefined;
  }

  const attemptedWithCurrent = new Set(attemptedStationIds);
  attemptedWithCurrent.add(currentStation.id);
  const candidateIndexes: number[] = [];
  const fallbackIndex = currentStation.fallbackStationId
    ? allStations.findIndex((station) => station.id === currentStation.fallbackStationId)
    : -1;

  if (fallbackIndex >= 0 && fallbackIndex !== currentIndex) {
    candidateIndexes.push(fallbackIndex);
  }

  for (let offset = 1; offset < allStations.length; offset += 1) {
    const nextIndex = (currentIndex + offset) % allStations.length;

    if (!candidateIndexes.includes(nextIndex)) {
      candidateIndexes.push(nextIndex);
    }
  }

  const stationIndex = candidateIndexes.find((candidateIndex) => !attemptedWithCurrent.has(allStations[candidateIndex].id));

  if (stationIndex === undefined) {
    return undefined;
  }

  const station = allStations[stationIndex];

  return {
    station,
    stationIndex,
    message: `source unavailable - switched to ${station.title}`,
    mode: stationIndex === fallbackIndex ? "configured" : "next",
  };
}

export function getYouTubeEmbedUrl(station: Station, origin?: string) {
  if (station.source.type !== "youtube") {
    return undefined;
  }

  return buildYouTubeEmbedUrl(station.source, origin);
}
