"use client";

import Image from "next/image";
import React from "react";
import {
  CircleHelp,
  Clock3,
  ExternalLink,
  ListMusic,
  Maximize2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { defaultPreferences, loadPreferences, savePreferences } from "@/lib/preferences";
import { getStationFallbackPlan, getStationSourceUrl, getStationStatus, stations, type Station, type StationSource, type VisualMode } from "@/lib/stations";
import {
  getYouTubeEmbedUrl,
  getYouTubeEmbedVideoId,
  getYouTubePlayerStatusLabel,
  getYouTubePlayerVars,
  mapYouTubePlayerState,
  normalizeYouTubeVolume,
  youtubeIframeApiScriptId,
  youtubeIframeApiSrc,
  type YouTubePlayerStatus,
} from "@/lib/youtube";

const listenerSeed = 37;
const timerDefaultSeconds = 25 * 60;
const visualModes: VisualMode[] = ["stage", "neon", "dim"];
const nonStarterKeys = new Set(["Alt", "CapsLock", "Control", "Escape", "Meta", "Shift", "Tab"]);
let youtubeApiPromise: Promise<YouTubeApi> | undefined;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || target.isContentEditable;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("a[href], button, input, textarea, select, summary, [role='button'], [role='checkbox'], [role='slider']"));
}

function shouldStartFromKey(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey || nonStarterKeys.has(event.key)) {
    return false;
  }

  return true;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])",
    ),
  ).filter((element) => !element.hasAttribute("aria-hidden"));
}

export function ElvisCafe() {
  const [isStarted, setIsStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stationIndex, setStationIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [volume, setVolume] = useState(defaultPreferences.volume);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(timerDefaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [disabledShortcuts, setDisabledShortcuts] = useState(defaultPreferences.disabledShortcuts);
  const [isLowPower, setIsLowPower] = useState(defaultPreferences.isLowPower);
  const [visualModeOverride, setVisualModeOverride] = useState<VisualMode | undefined>(defaultPreferences.visualMode);
  const [shareStatus, setShareStatus] = useState<string | undefined>();
  const [stationFallbackStatus, setStationFallbackStatus] = useState<string | undefined>();
  const [youtubePlayerStatus, setYoutubePlayerStatus] = useState<YouTubePlayerStatus>("idle");
  const aboutButtonRef = useRef<HTMLButtonElement>(null);
  const catalogButtonRef = useRef<HTMLButtonElement>(null);
  const timerButtonRef = useRef<HTMLButtonElement>(null);
  const catalogDrawerId = useId();
  const autoFallbackAttemptedStationIdsRef = useRef<Set<string>>(new Set());
  const timerPanelId = useId();
  const aboutModalId = useId();

  const activeStation = stations[stationIndex];
  const effectiveVisualMode = visualModeOverride ?? activeStation.visualMode;
  const sourceUrl = getStationSourceUrl(activeStation);
  const stationStatus = getStationStatus(activeStation);
  const youtubeStatusLabel =
    activeStation.source.type === "youtube" ? getYouTubePlayerStatusLabel(youtubePlayerStatus, activeStation.fallbackStationId) : undefined;
  const playerStatus = shareStatus ?? stationFallbackStatus ?? youtubeStatusLabel ?? stationStatus;
  const listeningNow = useMemo(() => listenerSeed + stationIndex * 6 + (isPlaying ? 11 : 0), [isPlaying, stationIndex]);

  const requestFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
      return;
    }

    document.exitFullscreen().catch(() => undefined);
  }, []);

  const start = useCallback(() => {
    setIsStarted(true);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!isStarted) {
      start();
      return;
    }

    setIsPlaying((current) => !current);
  }, [isStarted, start]);

  const goToStation = useCallback(
    (direction: 1 | -1) => {
      setShareStatus(undefined);
      setStationFallbackStatus(undefined);
      autoFallbackAttemptedStationIdsRef.current.clear();
      setStationIndex((current) => {
        if (isShuffled) {
          return (current + 2) % stations.length;
        }

        return (current + direction + stations.length) % stations.length;
      });
    },
    [isShuffled],
  );

  const selectStation = useCallback((stationId: string) => {
    const nextStationIndex = stations.findIndex((station) => station.id === stationId);

    if (nextStationIndex === -1) {
      return;
    }

    setShareStatus(undefined);
    setStationFallbackStatus(undefined);
    autoFallbackAttemptedStationIdsRef.current.clear();
    setStationIndex(nextStationIndex);
    setIsCatalogOpen(false);
  }, []);

  const cycleVisualMode = useCallback(() => {
    setVisualModeOverride((current) => {
      const active = current ?? activeStation.visualMode;
      const next = visualModes[(visualModes.indexOf(active) + 1) % visualModes.length];
      return next;
    });
  }, [activeStation.visualMode]);

  const shareStation = useCallback(async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://elvispresley.cafe";
    const text = `Listening to ${activeStation.title} on elvispresley.cafe`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: activeStation.title,
          text,
          url: shareUrl,
        });
        setShareStatus("shared");
        return;
      }

      await navigator.clipboard.writeText(`${text} - ${shareUrl}`);
      setShareStatus("link copied");
    } catch {
      setShareStatus("share unavailable");
    }
  }, [activeStation.title]);

  useEffect(() => {
    const preferences = loadPreferences();
    setDisabledShortcuts(preferences.disabledShortcuts);
    setIsLowPower(preferences.isLowPower);
    setVisualModeOverride(preferences.visualMode);
    setVolume(preferences.volume);
  }, []);

  useEffect(() => {
    savePreferences({
      disabledShortcuts,
      isLowPower,
      visualMode: visualModeOverride,
      volume,
    });
  }, [disabledShortcuts, isLowPower, visualModeOverride, volume]);

  useEffect(() => {
    setYoutubePlayerStatus("idle");
  }, [activeStation.id]);

  useEffect(() => {
    if (youtubePlayerStatus === "playing" || youtubePlayerStatus === "ready") {
      setStationFallbackStatus(undefined);
    }
  }, [youtubePlayerStatus]);

  useEffect(() => {
    if (!isStarted || activeStation.source.type !== "youtube" || youtubePlayerStatus !== "unavailable") {
      return;
    }

    const attemptedStationIds = autoFallbackAttemptedStationIdsRef.current;

    if (attemptedStationIds.has(activeStation.id)) {
      return;
    }

    const fallbackPlan = getStationFallbackPlan(stations, stationIndex, attemptedStationIds);
    attemptedStationIds.add(activeStation.id);
    setShareStatus(undefined);

    if (!fallbackPlan) {
      setStationFallbackStatus("source unavailable - no fallback left");
      return;
    }

    setStationFallbackStatus(fallbackPlan.message);
    setStationIndex(fallbackPlan.stationIndex);
  }, [activeStation.id, activeStation.source.type, isStarted, stationIndex, youtubePlayerStatus]);

  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          setIsTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isAboutOpen || isCatalogOpen || isTimerOpen) {
          event.preventDefault();
          setIsAboutOpen(false);
          setIsCatalogOpen(false);
          setIsTimerOpen(false);
        }
        return;
      }

      if (isEditableTarget(event.target) || isInteractiveTarget(event.target) || isAboutOpen || isCatalogOpen || isTimerOpen) {
        return;
      }

      if (!isStarted) {
        if (shouldStartFromKey(event)) {
          start();
        }
        return;
      }

      if (disabledShortcuts) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }

      if (event.key === "ArrowLeft") {
        goToStation(-1);
      }

      if (event.key === "ArrowRight") {
        goToStation(1);
      }

      if (event.key.toLowerCase() === "f") {
        requestFullscreen();
      }

      if (event.key.toLowerCase() === "l") {
        setIsLowPower((current) => !current);
      }

      if (event.key.toLowerCase() === "g") {
        cycleVisualMode();
      }

      if (event.key.toLowerCase() === "t") {
        void shareStation();
      }

      if (event.key.toLowerCase() === "v" && sourceUrl) {
        window.open(sourceUrl, "_blank", "noopener,noreferrer");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    cycleVisualMode,
    disabledShortcuts,
    goToStation,
    isAboutOpen,
    isCatalogOpen,
    isStarted,
    isTimerOpen,
    requestFullscreen,
    shareStation,
    sourceUrl,
    start,
    togglePlay,
  ]);

  const visualClass = {
    stage: "brightness-[0.78] saturate-[1.08]",
    neon: "brightness-[0.74] saturate-[1.35] hue-rotate-[8deg]",
    dim: "brightness-[0.55] saturate-[0.82]",
  }[effectiveVisualMode];

  return (
    <main
      className={`relative min-h-dvh overflow-hidden bg-night text-shell ${isLowPower ? "low-power" : ""}`}
      data-testid="elvis-cafe"
    >
      <Image
        src={activeStation.imageSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        data-testid="station-scene"
        className={`object-cover transition duration-700 ${visualClass} ${isStarted && !isLowPower ? "scale-[1.03]" : ""}`}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,242,216,0.08),transparent_34%),linear-gradient(180deg,rgba(9,7,11,0.08),rgba(9,7,11,0.76))]" />
      <div className="crt-overlay absolute inset-0" />
      <div className="noise-overlay absolute inset-0" />
      {isStarted && activeStation.source.type === "youtube" ? (
        <YouTubePlayerHost
          isPlaying={isPlaying}
          source={activeStation.source}
          title={`${activeStation.title} YouTube source`}
          volume={volume}
          onStatusChange={setYoutubePlayerStatus}
        />
      ) : null}

      <section className="relative z-10 flex min-h-dvh flex-col justify-between px-5 py-5 sm:px-8 sm:py-7" aria-hidden={isAboutOpen || isCatalogOpen}>
        <header className="flex items-start justify-between gap-4">
          <div className="font-display text-sm uppercase tracking-normal text-shell drop-shadow-[0_0_8px_rgba(255,242,216,0.8)] sm:text-base">
            listening now {listeningNow}
          </div>

          {isStarted ? (
            <nav className="flex max-w-[14rem] flex-wrap items-center justify-end gap-1 transition sm:max-w-none sm:gap-2" aria-label="Cafe tools">
              <IconButton
                ref={timerButtonRef}
                label="Pomodoro Timer"
                onClick={() => setIsTimerOpen((current) => !current)}
                active={isTimerOpen}
                ariaControls={timerPanelId}
                ariaExpanded={isTimerOpen}
              >
                <Clock3 size={18} />
              </IconButton>
              <IconButton label="Share station" onClick={() => void shareStation()}>
                <Share2 size={18} />
              </IconButton>
              <IconButton
                ref={catalogButtonRef}
                label="Station catalog"
                onClick={() => setIsCatalogOpen(true)}
                active={isCatalogOpen}
                ariaControls={catalogDrawerId}
                ariaExpanded={isCatalogOpen}
              >
                <ListMusic size={18} />
              </IconButton>
              <IconButton label="Low-power mode" onClick={() => setIsLowPower((current) => !current)} active={isLowPower} ariaPressed={isLowPower}>
                <Moon size={18} />
              </IconButton>
              <IconButton label="Change visual mode" onClick={cycleVisualMode}>
                <Sparkles size={18} />
              </IconButton>
              <IconButton label="Fullscreen" onClick={requestFullscreen}>
                <Maximize2 size={18} />
              </IconButton>
              <IconButton
                ref={aboutButtonRef}
                label="About"
                onClick={() => setIsAboutOpen(true)}
                ariaControls={aboutModalId}
                ariaExpanded={isAboutOpen}
              >
                <CircleHelp size={18} />
              </IconButton>
            </nav>
          ) : null}
        </header>

        {isTimerOpen ? (
          <TimerPanel
            id={timerPanelId}
            seconds={timerSeconds}
            isRunning={isTimerRunning}
            onAddFive={() => setTimerSeconds((current) => current + 5 * 60)}
            onReset={() => {
              setTimerSeconds(timerDefaultSeconds);
              setIsTimerRunning(false);
            }}
            onToggle={() => setIsTimerRunning((current) => !current)}
            onClose={() => setIsTimerOpen(false)}
            returnFocusRef={timerButtonRef}
          />
        ) : null}

        <div className="pointer-events-none mx-auto flex w-full max-w-4xl flex-1 items-center justify-center pb-20 pt-12 text-center">
          <div className="select-none">
            <p className="font-display text-[clamp(5rem,18vw,13rem)] uppercase leading-none text-gold/95 drop-shadow-[0_0_22px_rgba(244,196,95,0.7)]">
              Elvis
            </p>
            <p className="-mt-2 font-display text-[clamp(2rem,7vw,5.25rem)] uppercase leading-none text-neon drop-shadow-[0_0_18px_rgba(35,215,255,0.9)]">
              cafe
            </p>
          </div>
        </div>

        {!isStarted ? (
          <button
            type="button"
            onClick={start}
            className="relative mx-auto mb-8 block min-h-12 rounded border border-shell/70 bg-night/35 px-5 py-3 font-display text-base uppercase text-shell shadow-neon backdrop-blur-sm transition hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            press any key to start
          </button>
        ) : (
          <PlayerDock
            isPlaying={isPlaying}
            stationTitle={activeStation.title}
            stationMood={activeStation.mood}
            stationCity={activeStation.city}
            stationStatus={playerStatus}
            isShuffled={isShuffled}
            sourceUrl={sourceUrl}
            volume={volume}
            shareStatus={shareStatus}
            onTogglePlay={togglePlay}
            onPrevious={() => goToStation(-1)}
            onNext={() => goToStation(1)}
            onToggleShuffle={() => setIsShuffled((current) => !current)}
            onVolumeChange={setVolume}
            onOpenSource={() => {
              if (sourceUrl) {
                window.open(sourceUrl, "_blank", "noopener,noreferrer");
              }
            }}
          />
        )}
      </section>

      {isAboutOpen ? (
        <AboutModal
          id={aboutModalId}
          disabledShortcuts={disabledShortcuts}
          onClose={() => setIsAboutOpen(false)}
          onToggleShortcuts={() => setDisabledShortcuts((current) => !current)}
          returnFocusRef={aboutButtonRef}
        />
      ) : null}

      {isCatalogOpen ? (
        <StationCatalogDrawer
          id={catalogDrawerId}
          activeStationId={activeStation.id}
          stations={stations}
          onClose={() => setIsCatalogOpen(false)}
          onSelectStation={selectStation}
          returnFocusRef={catalogButtonRef}
        />
      ) : null}
    </main>
  );
}

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerStateChangeEvent) => void;
        onError?: () => void;
      };
    },
  ) => YouTubePlayer;
};

type YouTubePlayer = {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
};

type YouTubePlayerStateChangeEvent = {
  data: number;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser window."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const existingScript = document.getElementById(youtubeIframeApiScriptId);
    const previousReadyCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReadyCallback?.();

      if (window.YT?.Player) {
        resolve(window.YT);
        return;
      }

      reject(new Error("YouTube API loaded without Player support."));
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.id = youtubeIframeApiScriptId;
    script.src = youtubeIframeApiSrc;
    script.async = true;
    script.onerror = () => reject(new Error("YouTube API failed to load."));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

type YouTubePlayerHostProps = {
  isPlaying: boolean;
  source: Extract<StationSource, { type: "youtube" }>;
  title: string;
  volume: number;
  onStatusChange: (status: YouTubePlayerStatus) => void;
};

function YouTubePlayerHost({ isPlaying, source, title, volume, onStatusChange }: YouTubePlayerHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const volumeRef = useRef(volume);
  const embedUrl = getYouTubeEmbedUrl(source);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    let isCancelled = false;
    const videoId = getYouTubeEmbedVideoId(source);

    if (!videoId) {
      onStatusChange("unavailable");
      return undefined;
    }

    onStatusChange("loading");

    void loadYouTubeIframeApi()
      .then((youtubeApi) => {
        if (isCancelled || !iframeRef.current) {
          return;
        }

        const player = new youtubeApi.Player(iframeRef.current, {
          videoId,
          playerVars: getYouTubePlayerVars(source, window.location.origin),
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              event.target.setVolume(normalizeYouTubeVolume(volumeRef.current));

              if (isPlayingRef.current) {
                event.target.playVideo();
              } else {
                event.target.pauseVideo();
              }

              onStatusChange("ready");
            },
            onStateChange: (event) => onStatusChange(mapYouTubePlayerState(event.data)),
            onError: () => onStatusChange("unavailable"),
          },
        });

        playerRef.current = player;
      })
      .catch(() => onStatusChange("unavailable"));

    return () => {
      isCancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [onStatusChange, source, source.youtubePlaylistId, source.youtubeVideoId]);

  useEffect(() => {
    playerRef.current?.setVolume(normalizeYouTubeVolume(volume));
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (isPlaying) {
      playerRef.current.playVideo();
      return;
    }

    playerRef.current.pauseVideo();
  }, [isPlaying]);

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 size-px overflow-hidden opacity-0" aria-hidden="true">
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          title={title}
          src={embedUrl}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="size-px"
        />
      ) : null}
    </div>
  );
}

type PlayerDockProps = {
  isPlaying: boolean;
  stationTitle: string;
  stationMood: string;
  stationCity: string;
  stationStatus: string;
  isShuffled: boolean;
  sourceUrl?: string;
  volume: number;
  shareStatus?: string;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onVolumeChange: (value: number) => void;
  onOpenSource: () => void;
};

function PlayerDock({
  isPlaying,
  stationTitle,
  stationMood,
  stationCity,
  stationStatus,
  isShuffled,
  sourceUrl,
  volume,
  shareStatus,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onVolumeChange,
  onOpenSource,
}: PlayerDockProps) {
  return (
    <div className="mx-auto mb-2 grid w-full max-w-5xl gap-3 rounded-md border border-shell/35 bg-night/55 p-3 shadow-[0_0_36px_rgba(0,0,0,0.45)] backdrop-blur-md sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-4">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <IconButton label="Previous station" onClick={onPrevious}>
          <SkipBack size={19} />
        </IconButton>
        <IconButton label={isPlaying ? "Pause" : "Play"} onClick={onTogglePlay} emphasis>
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </IconButton>
        <IconButton label="Next station" onClick={onNext}>
          <SkipForward size={19} />
        </IconButton>
        <IconButton label="Shuffle" onClick={onToggleShuffle} active={isShuffled} ariaPressed={isShuffled}>
          <Shuffle size={18} />
        </IconButton>
        <IconButton label={sourceUrl ? "Open original source" : "No source configured"} onClick={onOpenSource} disabled={!sourceUrl}>
          <ExternalLink size={18} />
        </IconButton>
      </div>

      <div className="min-w-0 text-center sm:text-left" aria-live="polite" aria-atomic="true">
        <p className="font-display text-lg uppercase leading-tight text-gold sm:text-xl" data-testid="station-title">
          {stationTitle}
        </p>
        <p className="truncate text-sm text-shell/86">{stationMood}</p>
        <p className="text-xs uppercase text-neon/85">{stationCity}</p>
        <p className="mt-1 text-xs uppercase text-shell/60" data-testid="station-status">
          {shareStatus ?? stationStatus}
        </p>
      </div>

      <label className="flex min-h-10 items-center justify-center gap-2 text-shell/90 sm:justify-end">
        <Volume2 size={18} />
        <span className="sr-only">Volume</span>
        <input
          aria-label="Volume"
          className="accent-gold"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

type IconButtonProps = {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  emphasis?: boolean;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, onClick, active, disabled, emphasis, ariaControls, ariaExpanded, ariaPressed },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded border transition focus:outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-45 ${
        emphasis ? "border-gold bg-gold text-night shadow-neon" : "border-shell/35 bg-night/55 text-shell hover:border-gold hover:text-gold"
      } ${active ? "border-neon text-neon shadow-neon" : ""}`}
    >
      {children}
    </button>
  );
});

function TimerPanel({
  id,
  seconds,
  isRunning,
  onAddFive,
  onClose,
  onReset,
  onToggle,
  returnFocusRef,
}: {
  id: string;
  seconds: number;
  isRunning: boolean;
  onAddFive: () => void;
  onClose: () => void;
  onReset: () => void;
  onToggle: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  useEffect(() => {
    const trigger = returnFocusRef.current;
    startButtonRef.current?.focus();

    return () => {
      trigger?.focus();
    };
  }, [returnFocusRef]);

  return (
    <aside
      id={id}
      className="absolute right-5 top-20 z-20 w-[min(18rem,calc(100vw-2.5rem))] rounded-md border border-gold/50 bg-night/75 p-4 text-center shadow-neon backdrop-blur-md sm:right-8"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex items-start justify-between gap-3">
        <p id={titleId} className="sr-only">
          Pomodoro Timer
        </p>
        <p className="flex-1 font-display text-4xl text-gold" aria-live="polite">
          {minutes}:{remainingSeconds}
        </p>
        <button className="rounded border border-shell/35 p-2 hover:border-gold" type="button" onClick={onClose} aria-label="Close timer">
          <X size={14} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button ref={startButtonRef} className="rounded border border-shell/35 px-3 py-2 text-sm uppercase hover:border-gold" type="button" onClick={onToggle}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="rounded border border-shell/35 px-3 py-2 text-sm uppercase hover:border-gold" type="button" onClick={onAddFive}>
          +5:00
        </button>
        <button className="grid place-items-center rounded border border-shell/35 px-3 py-2 hover:border-gold" type="button" onClick={onReset} aria-label="Reset timer">
          <RotateCcw size={16} />
        </button>
      </div>
    </aside>
  );
}

function StationCatalogDrawer({
  id,
  activeStationId,
  stations,
  onClose,
  onSelectStation,
  returnFocusRef,
}: {
  id: string;
  activeStationId: string;
  stations: Station[];
  onClose: () => void;
  onSelectStation: (stationId: string) => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const trigger = returnFocusRef.current;
    closeButtonRef.current?.focus();

    return () => {
      trigger?.focus();
    };
  }, [returnFocusRef]);

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }

    const focusable = getFocusableElements(drawerRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      id={id}
      ref={drawerRef}
      className="fixed inset-0 z-30 flex justify-end bg-night/68 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onDialogKeyDown}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-gold/45 bg-night/92 text-shell shadow-[0_0_44px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4 border-b border-shell/15 p-5">
          <div>
            <h2 id={titleId} className="font-display text-2xl uppercase text-gold">
              stations
            </h2>
          </div>
          <IconButton ref={closeButtonRef} label="Close station catalog" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <ol className="grid gap-2">
            {stations.map((station) => {
              const isActive = station.id === activeStationId;
              const sourceLabel = station.source.type === "demo" ? "demo" : `youtube / ${station.source.health}`;

              return (
                <li key={station.id}>
                  <button
                    type="button"
                    onClick={() => onSelectStation(station.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`w-full rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-gold ${
                      isActive
                        ? "border-gold bg-gold/12 shadow-neon"
                        : "border-shell/20 bg-night/48 hover:border-gold/75 hover:bg-shell/5"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-display text-xl uppercase leading-tight text-gold">{station.title}</span>
                        <span className="mt-1 block text-xs uppercase text-neon/85">{station.city}</span>
                      </span>
                      <span className="shrink-0 rounded border border-shell/25 px-2 py-1 text-[0.68rem] uppercase text-shell/78">{sourceLabel}</span>
                    </span>
                    <span className="mt-3 block text-sm leading-5 text-shell/84">{station.mood}</span>
                    <span className="mt-2 block text-xs uppercase text-shell/56">{getStationStatus(station)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function AboutModal({
  id,
  disabledShortcuts,
  onClose,
  onToggleShortcuts,
  returnFocusRef,
}: {
  id: string;
  disabledShortcuts: boolean;
  onClose: () => void;
  onToggleShortcuts: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();
  const shortcuts = [
    ["Space", "play / pause"],
    ["Arrows", "change station"],
    ["T", "share station"],
    ["G", "change visual mode"],
    ["L", "low-power mode"],
    ["V", "open original source"],
    ["F", "fullscreen"],
    ["ESC", "close panels"],
  ];

  useEffect(() => {
    const trigger = returnFocusRef.current;
    closeButtonRef.current?.focus();

    return () => {
      trigger?.focus();
    };
  }, [returnFocusRef]);

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !modalRef.current) {
      return;
    }

    const focusable = getFocusableElements(modalRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      id={id}
      ref={modalRef}
      className="fixed inset-0 z-30 grid place-items-center bg-night/78 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      aria-describedby={descriptionId}
      onKeyDown={onDialogKeyDown}
    >
      <div className="w-full max-w-md rounded-md border border-gold/60 bg-night/92 p-5 text-shell shadow-neon">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="about-title" className="font-display text-2xl uppercase text-gold">
            elvispresley.cafe
          </h2>
          <IconButton ref={closeButtonRef} label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <p id={descriptionId} className="text-sm leading-6 text-shell/86">
          A small retro music room for Elvis-inspired stations. The demo uses local station data now; YouTube sources can be
          configured per station without bundling copyrighted audio.
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {shortcuts.map(([key, label]) => (
            <div key={key} className="contents">
              <dt className="font-display uppercase text-neon">{key}</dt>
              <dd className="text-shell/82">{label}</dd>
            </div>
          ))}
        </dl>
        <label className="mt-5 flex items-center justify-between gap-4 border-t border-shell/15 pt-4 text-sm text-shell/86">
          Disable keyboard shortcuts
          <input type="checkbox" checked={disabledShortcuts} onChange={onToggleShortcuts} className="size-4 accent-gold" />
        </label>
      </div>
    </div>
  );
}
