export type YouTubeSourceConfig = {
  youtubeVideoId?: string;
  youtubePlaylistId?: string;
};

export type YouTubePlayerStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "buffering" | "ended" | "unavailable";

export const youtubeIframeApiScriptId = "youtube-iframe-api";
export const youtubeIframeApiSrc = "https://www.youtube.com/iframe_api";

export function getYouTubeSourceUrl(source: YouTubeSourceConfig) {
  if (source.youtubeVideoId) {
    const params = new URLSearchParams({ v: source.youtubeVideoId });

    if (source.youtubePlaylistId) {
      params.set("list", source.youtubePlaylistId);
    }

    return `https://www.youtube.com/watch?${params.toString()}`;
  }

  if (source.youtubePlaylistId) {
    return `https://www.youtube.com/playlist?list=${source.youtubePlaylistId}`;
  }

  return undefined;
}

export function getYouTubeEmbedVideoId(source: YouTubeSourceConfig) {
  if (source.youtubeVideoId) {
    return source.youtubeVideoId;
  }

  if (source.youtubePlaylistId) {
    return "videoseries";
  }

  return undefined;
}

export function getYouTubePlayerVars(source: YouTubeSourceConfig, origin?: string) {
  const playerVars: Record<string, string | number> = {
    autoplay: 1,
    controls: 0,
    enablejsapi: 1,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
  };

  if (origin) {
    playerVars.origin = origin;
  }

  if (source.youtubePlaylistId) {
    playerVars.list = source.youtubePlaylistId;
  }

  return playerVars;
}

export function getYouTubeEmbedUrl(source: YouTubeSourceConfig, origin?: string) {
  const videoId = getYouTubeEmbedVideoId(source);

  if (!videoId) {
    return undefined;
  }

  const params = new URLSearchParams();
  const playerVars = getYouTubePlayerVars(source, origin);

  Object.entries(playerVars).forEach(([key, value]) => {
    params.set(key, String(value));
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function normalizeYouTubeVolume(volume: number) {
  if (!Number.isFinite(volume)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(volume)));
}

export function mapYouTubePlayerState(playerState: number): YouTubePlayerStatus {
  if (playerState === 0) {
    return "ended";
  }

  if (playerState === 1) {
    return "playing";
  }

  if (playerState === 2) {
    return "paused";
  }

  if (playerState === 3) {
    return "buffering";
  }

  if (playerState === 5) {
    return "ready";
  }

  return "idle";
}

export function getYouTubePlayerStatusLabel(status: YouTubePlayerStatus, fallbackStationId?: string) {
  if (status === "loading") {
    return "YouTube player loading";
  }

  if (status === "ready") {
    return "YouTube player ready";
  }

  if (status === "playing") {
    return "YouTube player playing";
  }

  if (status === "paused") {
    return "YouTube player paused";
  }

  if (status === "buffering") {
    return "YouTube player buffering";
  }

  if (status === "ended") {
    return "YouTube player ended";
  }

  if (status === "unavailable") {
    return fallbackStationId ? "YouTube source unavailable - fallback station available" : "YouTube source unavailable";
  }

  return undefined;
}
