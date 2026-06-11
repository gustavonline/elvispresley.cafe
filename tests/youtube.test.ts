import { describe, expect, it } from "vitest";
import {
  getYouTubeEmbedUrl,
  getYouTubeEmbedVideoId,
  getYouTubePlayerStatusLabel,
  getYouTubePlayerVars,
  getYouTubeSourceUrl,
  mapYouTubePlayerState,
  normalizeYouTubeVolume,
} from "@/lib/youtube";

describe("YouTube helpers", () => {
  it("builds a watch URL for a configured video", () => {
    expect(getYouTubeSourceUrl({ youtubeVideoId: "abc123" })).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("keeps the playlist context when video and playlist are configured", () => {
    const source = {
      youtubeVideoId: "abc123",
      youtubePlaylistId: "PL123",
    };

    expect(getYouTubeSourceUrl(source)).toBe("https://www.youtube.com/watch?v=abc123&list=PL123");
    expect(getYouTubeEmbedUrl(source)).toContain("https://www.youtube-nocookie.com/embed/abc123?");
    expect(getYouTubeEmbedUrl(source)).toContain("list=PL123");
  });

  it("builds a playlist-only embed through videoseries", () => {
    const source = { youtubePlaylistId: "PL123" };

    expect(getYouTubeSourceUrl(source)).toBe("https://www.youtube.com/playlist?list=PL123");
    expect(getYouTubeEmbedVideoId(source)).toBe("videoseries");
    expect(getYouTubeEmbedUrl(source)).toContain("https://www.youtube-nocookie.com/embed/videoseries?");
  });

  it("sets API-ready player variables", () => {
    expect(getYouTubePlayerVars({ youtubePlaylistId: "PL123" }, "https://elvispresley.cafe")).toEqual({
      autoplay: 1,
      controls: 0,
      enablejsapi: 1,
      list: "PL123",
      modestbranding: 1,
      origin: "https://elvispresley.cafe",
      playsinline: 1,
      rel: 0,
    });
  });

  it("normalizes volume for the YouTube API", () => {
    expect(normalizeYouTubeVolume(-20)).toBe(0);
    expect(normalizeYouTubeVolume(42.6)).toBe(43);
    expect(normalizeYouTubeVolume(120)).toBe(100);
    expect(normalizeYouTubeVolume(Number.NaN)).toBe(0);
  });

  it("maps YouTube player states to local statuses", () => {
    expect(mapYouTubePlayerState(1)).toBe("playing");
    expect(mapYouTubePlayerState(2)).toBe("paused");
    expect(mapYouTubePlayerState(3)).toBe("buffering");
    expect(mapYouTubePlayerState(5)).toBe("ready");
    expect(mapYouTubePlayerState(-1)).toBe("idle");
  });

  it("exposes a fallback-friendly unavailable label", () => {
    expect(getYouTubePlayerStatusLabel("unavailable", "sun-studio-after-dark")).toBe(
      "YouTube source unavailable - fallback station available",
    );
  });
});
