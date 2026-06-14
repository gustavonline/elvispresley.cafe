import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElvisCafe } from "@/components/elvis-cafe";
import { stations, type Station } from "@/lib/stations";

const originalStations = [...stations];

describe("ElvisCafe", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    stations.splice(0, stations.length, ...originalStations);
    delete window.YT;
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("starts the player and changes stations", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");
    expect(screen.getByTestId("station-scene")).toHaveAttribute("src", "/images/station-greatest-hits.png");

    fireEvent.click(screen.getByRole("button", { name: /next station/i }));

    expect(screen.getByTestId("station-title")).toHaveTextContent("Christmas Elvis");
    expect(screen.getByTestId("station-scene")).toHaveAttribute("src", "/images/station-christmas-elvis.png");
  });

  it("starts the player when the scene is clicked", () => {
    render(<ElvisCafe />);

    fireEvent.pointerDown(screen.getByTestId("elvis-cafe"), { button: 0 });

    expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");
  });

  it("shows unavailable listeners when no presence endpoint is configured", () => {
    render(<ElvisCafe />);

    expect(screen.getByText(/listening now live listeners unavailable/i)).toBeInTheDocument();
  });

  it("renders a real listener count from the presence endpoint", async () => {
    vi.stubEnv("VITE_PRESENCE_ENDPOINT", "https://presence.example");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
      const count = init?.method === "POST" ? 8 : 7;

      return new Response(JSON.stringify({ count, stationCounts: { "greatest-hits": count } }), {
        headers: {
          "content-type": "application/json",
        },
      });
    });

    render(<ElvisCafe />);

    await waitFor(() => {
      expect(screen.getByText(/listening now 7 listeners/i)).toBeInTheDocument();
    });

    fireEvent.pointerDown(screen.getByTestId("elvis-cafe"), { button: 0 });

    await waitFor(() => {
      expect(screen.getByText(/listening now 8 listeners/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith("https://presence.example/presence", expect.objectContaining({ method: "POST" }));
  });

  it("keeps hidden tool controls out of the pre-start keyboard path", () => {
    render(<ElvisCafe />);

    expect(screen.queryByRole("navigation", { name: /cafe tools/i })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Tab" });

    expect(screen.getByRole("button", { name: /press any key to start/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "a", code: "KeyA" });

    expect(screen.getByRole("navigation", { name: /cafe tools/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("does not run global shortcuts while focus is inside an interactive control", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    const volume = screen.getByRole("slider", { name: /volume/i });
    volume.focus();
    fireEvent.keyDown(volume, { key: "ArrowRight" });

    expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");
  });

  it("manages About dialog semantics, focus trap, shortcut blocking, and Escape close", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));
    fireEvent.click(screen.getByRole("button", { name: /about/i }));

    const dialog = screen.getByRole("dialog", { name: /elvispresley\.cafe/i });
    const closeButton = screen.getByRole("button", { name: /^close$/i });
    const disableShortcuts = screen.getByRole("checkbox", { name: /disable keyboard shortcuts/i });

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");

    disableShortcuts.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /elvispresley\.cafe/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /about/i })).toHaveFocus();
  });

  it("opens and closes the station catalog drawer with focus restored", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    const catalogButton = screen.getByRole("button", { name: /station catalog/i });
    fireEvent.click(catalogButton);

    const drawer = screen.getByRole("dialog", { name: /jukebox/i });
    expect(drawer).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: /close station catalog/i })).toHaveFocus();
    expect(screen.getByRole("button", { name: /greatest hits/i })).toHaveAttribute("aria-current", "true");

    fireEvent.keyDown(drawer, { key: "ArrowRight" });
    expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");

    fireEvent.keyDown(drawer, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: /jukebox/i })).not.toBeInTheDocument();
    expect(catalogButton).toHaveFocus();
  });

  it("selects a station directly from the catalog drawer", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));
    fireEvent.click(screen.getByRole("button", { name: /station catalog/i }));
    fireEvent.click(screen.getByRole("button", { name: /^love songs/i }));

    expect(screen.queryByRole("dialog", { name: /jukebox/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("station-title")).toHaveTextContent("Love Songs");
    expect(screen.getByTestId("station-scene")).toHaveAttribute("src", "/images/station-love-songs.png");
  });

  it("labels the timer panel and restores focus when it closes", () => {
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    const timerButton = screen.getByRole("button", { name: /pomodoro timer/i });
    fireEvent.click(timerButton);

    expect(timerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: /pomodoro timer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^start$/i })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: /close timer/i }));

    expect(screen.queryByRole("region", { name: /pomodoro timer/i })).not.toBeInTheDocument();
    expect(timerButton).toHaveFocus();
  });

  it("runs a focus segment into a break segment", () => {
    vi.useFakeTimers();
    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));
    fireEvent.click(screen.getByRole("button", { name: /pomodoro timer/i }));
    fireEvent.change(screen.getByLabelText(/focus min/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/break min/i), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /^start$/i }));

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByRole("button", { name: /^break$/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/completed focus sessions: 1/i)).toBeInTheDocument();
  });

  it("auto-skips a YouTube station when the iframe API reports it unavailable", async () => {
    const brokenStation: Station = {
      id: "broken-youtube",
      title: "Broken YouTube",
      mood: "test source",
      city: "test city",
      visualMode: "neon",
      imageSrc: "/images/elvis-cafe-vegas-jukebox.jpg",
      theme: stations[0].theme,
      fallbackStationId: "greatest-hits",
      source: {
        type: "youtube",
        health: "unverified",
        youtubeVideoId: "broken123",
      },
    };
    type FakeYouTubePlayerOptions = {
      events?: {
        onError?: (event: { data: number }) => void;
      };
    };
    const player = {
      destroy: vi.fn(),
      pauseVideo: vi.fn(),
      playVideo: vi.fn(),
      setVolume: vi.fn(),
    };
    let shouldError = true;
    const Player = vi.fn(function (_element: HTMLElement, options: FakeYouTubePlayerOptions) {
      if (shouldError) {
        shouldError = false;
        options.events?.onError?.({ data: 100 });
      }

      return player;
    });

    stations.unshift(brokenStation);
    window.YT = { Player };

    render(<ElvisCafe />);

    fireEvent.click(screen.getByRole("button", { name: /press any key to start/i }));

    await waitFor(() => {
      expect(screen.getByTestId("station-title")).toHaveTextContent("Greatest Hits");
    });
    expect(screen.getByTestId("station-status")).toHaveTextContent("source unavailable - switched to Greatest Hits");
    await waitFor(() => {
      expect(Player).toHaveBeenCalledTimes(2);
    });
  });
});
