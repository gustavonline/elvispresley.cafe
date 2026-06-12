import { getYouTubeEmbedUrl as buildYouTubeEmbedUrl, getYouTubeSourceUrl } from "./youtube";

export type VisualMode = "stage" | "neon" | "dim";
export type StationTheme = {
  label: string;
  glowClass: string;
  overlayClass: string;
  dockClass: string;
};

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
  theme: StationTheme;
  fallbackStationId?: string;
  source: StationSource;
};

export type StationFallbackPlan = {
  station: Station;
  stationIndex: number;
  message: string;
  mode: "configured" | "next";
};

const stationThemes = {
  christmas: {
    label: "holiday lights",
    glowClass: "text-shell drop-shadow-[0_0_24px_rgba(212,188,156,0.88)]",
    overlayClass: "bg-[radial-gradient(circle_at_18%_24%,rgba(212,188,156,0.2),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(101,84,20,0.18),transparent_31%),linear-gradient(180deg,rgba(170,76,100,0.08),rgba(94,48,60,0.8))]",
    dockClass: "border-shell/45 bg-night/84 shadow-[0_0_34px_rgba(212,188,156,0.24)]",
  },
  hits: {
    label: "gold records",
    glowClass: "text-gold drop-shadow-[0_0_24px_rgba(244,196,26,0.82)]",
    overlayClass: "bg-[radial-gradient(circle_at_50%_34%,rgba(244,196,26,0.16),transparent_34%),linear-gradient(180deg,rgba(94,48,60,0.05),rgba(94,48,60,0.76))]",
    dockClass: "border-gold/50 bg-night/86 shadow-[0_0_36px_rgba(244,196,26,0.22)]",
  },
  tour: {
    label: "stage tour",
    glowClass: "text-neon drop-shadow-[0_0_24px_rgba(244,100,138,0.82)]",
    overlayClass: "bg-[radial-gradient(circle_at_28%_30%,rgba(244,100,138,0.18),transparent_30%),radial-gradient(circle_at_68%_24%,rgba(244,196,26,0.14),transparent_28%),linear-gradient(180deg,rgba(94,48,60,0.08),rgba(94,48,60,0.78))]",
    dockClass: "border-neon/45 bg-night/86 shadow-neon",
  },
  deepCuts: {
    label: "deep cuts",
    glowClass: "text-shell drop-shadow-[0_0_20px_rgba(170,76,100,0.72)]",
    overlayClass: "bg-[radial-gradient(circle_at_52%_38%,rgba(170,76,100,0.2),transparent_36%),linear-gradient(180deg,rgba(94,48,60,0.12),rgba(94,48,60,0.84))]",
    dockClass: "border-velvet/60 bg-night/86 shadow-[0_0_34px_rgba(170,76,100,0.34)]",
  },
  love: {
    label: "velvet love songs",
    glowClass: "text-gold drop-shadow-[0_0_26px_rgba(244,100,138,0.74)]",
    overlayClass: "bg-[radial-gradient(circle_at_62%_32%,rgba(244,100,138,0.18),transparent_32%),radial-gradient(circle_at_28%_26%,rgba(244,196,26,0.12),transparent_28%),linear-gradient(180deg,rgba(94,48,60,0.06),rgba(94,48,60,0.78))]",
    dockClass: "border-gold/45 bg-night/84 shadow-[0_0_36px_rgba(244,100,138,0.22)]",
  },
  demo: {
    label: "demo room",
    glowClass: "text-gold drop-shadow-[0_0_22px_rgba(244,196,26,0.7)]",
    overlayClass: "bg-[radial-gradient(circle_at_50%_42%,rgba(212,188,156,0.08),transparent_34%),linear-gradient(180deg,rgba(94,48,60,0.08),rgba(94,48,60,0.76))]",
    dockClass: "border-shell/35 bg-night/86 shadow-[0_0_36px_rgba(0,0,0,0.45)]",
  },
} satisfies Record<string, StationTheme>;

export const stations: Station[] = [
  {
    id: "greatest-hits",
    title: "Greatest Hits",
    mood: "gold records / famous choruses / prime time",
    city: "RCA jukebox",
    visualMode: "neon",
    imageSrc: "/images/elvis-cafe-vegas-jukebox.jpg",
    theme: stationThemes.hits,
    fallbackStationId: "elvis-101",
    source: {
      type: "youtube",
      health: "unverified",
      youtubeVideoId: "WrMGGouem3c",
      youtubePlaylistId: "PLsLrXjai8Jf49o9VY_cGDUSj24bf3oFyp",
      originalUrl: "https://www.youtube.com/watch?v=WrMGGouem3c&list=PLsLrXjai8Jf49o9VY_cGDUSj24bf3oFyp",
    },
  },
  {
    id: "christmas-elvis",
    title: "Christmas Elvis",
    mood: "holiday records / warm lamps / midnight snow",
    city: "Christmas jukebox",
    visualMode: "dim",
    imageSrc: "/images/elvis-cafe-graceland-lounge.jpg",
    theme: stationThemes.christmas,
    fallbackStationId: "greatest-hits",
    source: {
      type: "youtube",
      health: "unverified",
      youtubeVideoId: "WwdI-gbm5kE",
      youtubePlaylistId: "PLsLrXjai8Jf57O9kqeKn50nwhOu8J9J5m",
      originalUrl: "https://www.youtube.com/watch?v=WwdI-gbm5kE&list=PLsLrXjai8Jf57O9kqeKn50nwhOu8J9J5m",
    },
  },
  {
    id: "on-tour",
    title: "On Tour",
    mood: "live band / stage lights / road energy",
    city: "Tour bus radio",
    visualMode: "stage",
    imageSrc: "/images/elvis-cafe-sun-studio.jpg",
    theme: stationThemes.tour,
    fallbackStationId: "greatest-hits",
    source: {
      type: "youtube",
      health: "unverified",
      youtubeVideoId: "tR2HOfnPsaI",
      youtubePlaylistId: "PLsLrXjai8Jf4pGeXmvzmvxjiCA_ax404J",
      originalUrl: "https://www.youtube.com/watch?v=tR2HOfnPsaI&list=PLsLrXjai8Jf4pGeXmvzmvxjiCA_ax404J",
    },
  },
  {
    id: "elvis-101",
    title: "Elvis 101",
    mood: "starter stack / essentials / all eras",
    city: "Record shelf",
    visualMode: "stage",
    imageSrc: "/images/elvis-cafe-stage.png",
    theme: stationThemes.deepCuts,
    fallbackStationId: "greatest-hits",
    source: {
      type: "youtube",
      health: "unverified",
      youtubeVideoId: "hI_WiustW0",
      youtubePlaylistId: "PLsLrXjai8Jf4xP2KMf3SNdo_ABadRGGZS",
      originalUrl: "https://www.youtube.com/watch?v=hI_WiustW0&list=PLsLrXjai8Jf4xP2KMf3SNdo_ABadRGGZS",
    },
  },
  {
    id: "love-songs",
    title: "Love Songs",
    mood: "slow dance / velvet booth / last call",
    city: "Blue moon lounge",
    visualMode: "dim",
    imageSrc: "/images/elvis-cafe-graceland-lounge.jpg",
    theme: stationThemes.love,
    fallbackStationId: "greatest-hits",
    source: {
      type: "youtube",
      health: "unverified",
      youtubeVideoId: "ttuVUynl5SU",
      youtubePlaylistId: "PLsLrXjai8Jf7ir4xyacKA-Ioh01Azo-UQ",
      originalUrl: "https://www.youtube.com/watch?v=ttuVUynl5SU&list=PLsLrXjai8Jf7ir4xyacKA-Ioh01Azo-UQ&pp=0gcJCfMCOCosWNin",
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
    return "source unavailable";
  }

  if (station.source.health === "unverified") {
    return "ready";
  }

  return "ready";
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
