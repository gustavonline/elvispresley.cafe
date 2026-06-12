import React from "react";
import {
  Clock3,
  ExternalLink,
  Heart,
  ListMusic,
  Maximize2,
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
import {
  getStationFallbackPlan,
  getStationSourceUrl,
  getStationStatus,
  stations,
  type Station,
  type StationSource,
  type StationTheme,
} from "@/lib/stations";
import {
  getYouTubeEmbedUrl,
  getYouTubeEmbedVideoId,
  getYouTubePlayerVars,
  mapYouTubePlayerState,
  normalizeYouTubeVolume,
  youtubeIframeApiScriptId,
  youtubeIframeApiSrc,
  type YouTubePlayerStatus,
} from "@/lib/youtube";

const listenerSeed = 37;
const timerDefaultSeconds = 25 * 60;
const nonStarterKeys = new Set(["Alt", "CapsLock", "Control", "Escape", "Meta", "Shift", "Tab"]);
let youtubeApiPromise: Promise<YouTubeApi> | undefined;

type CafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
};

function CafeImage({ className, fill, priority, ...props }: CafeImageProps) {
  return (
    <img
      {...props}
      className={`${fill ? "absolute inset-0 h-full w-full " : ""}${className ?? ""}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

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
  const [isMotionEnabled, setIsMotionEnabled] = useState(defaultPreferences.isMotionEnabled);
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
  const sourceUrl = getStationSourceUrl(activeStation);
  const stationStatus = getStationStatus(activeStation);
  const playerStatus = shareStatus ?? stationFallbackStatus;
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
      setYoutubePlayerStatus("idle");
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
    setYoutubePlayerStatus("idle");
    autoFallbackAttemptedStationIdsRef.current.clear();
    setStationIndex(nextStationIndex);
    setIsCatalogOpen(false);
  }, []);

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
    setIsMotionEnabled(preferences.isMotionEnabled);
    setVolume(preferences.volume);
  }, []);

  useEffect(() => {
    savePreferences({
      disabledShortcuts,
      isMotionEnabled,
      volume,
    });
  }, [disabledShortcuts, isMotionEnabled, volume]);

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
    setYoutubePlayerStatus("idle");
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

      if (event.key.toLowerCase() === "m") {
        setIsMotionEnabled((current) => !current);
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

  const visualClass = "brightness-[0.74] saturate-[1.14]";

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-night text-shell"
      data-testid="elvis-cafe"
    >
      <CafeImage
        src={activeStation.imageSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        data-testid="station-scene"
        className={`object-cover transition duration-700 ${visualClass} ${isMotionEnabled ? "station-scene-motion" : ""}`}
      />

      <div className={`absolute inset-0 ${activeStation.theme.overlayClass} opacity-30`} />
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
          <div className="font-display text-sm uppercase tracking-normal text-shell drop-shadow-[0_0_8px_rgba(212,188,156,0.8)] sm:text-base">
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
              <IconButton label="Motion" onClick={() => setIsMotionEnabled((current) => !current)} active={isMotionEnabled} ariaPressed={isMotionEnabled}>
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
                <Heart size={18} />
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

        <div className="pointer-events-none flex-1" />

        {!isStarted ? (
          <button
            type="button"
            onClick={start}
            className="relative mx-auto mb-8 block min-h-12 rounded bg-night/80 px-5 py-3 font-display text-base uppercase text-shell shadow-[0_0_28px_rgba(244,196,26,0.28)] backdrop-blur-sm transition hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
          >
            press any key to start
          </button>
        ) : (
          <PlayerDock
            isPlaying={isPlaying}
            stationTitle={activeStation.title}
            stationCity={activeStation.city}
            stationStatus={playerStatus ?? stationStatus}
            stationTheme={activeStation.theme}
            isShuffled={isShuffled}
            sourceUrl={sourceUrl}
            volume={volume}
            shareStatus={shareStatus}
            stationCatalogRef={catalogButtonRef}
            onTogglePlay={togglePlay}
            onPrevious={() => goToStation(-1)}
            onNext={() => goToStation(1)}
            onOpenStationCatalog={() => setIsCatalogOpen(true)}
            onShareStation={() => void shareStation()}
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
        <StationCatalogModal
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
  stationCity: string;
  stationStatus: string;
  stationTheme: StationTheme;
  isShuffled: boolean;
  sourceUrl?: string;
  volume: number;
  shareStatus?: string;
  stationCatalogRef: React.RefObject<HTMLButtonElement | null>;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenStationCatalog: () => void;
  onShareStation: () => void;
  onToggleShuffle: () => void;
  onVolumeChange: (value: number) => void;
  onOpenSource: () => void;
};

function PlayerDock({
  isPlaying,
  stationTitle,
  stationCity,
  stationStatus,
  stationTheme,
  isShuffled,
  sourceUrl,
  volume,
  shareStatus,
  stationCatalogRef,
  onTogglePlay,
  onPrevious,
  onNext,
  onOpenStationCatalog,
  onShareStation,
  onToggleShuffle,
  onVolumeChange,
  onOpenSource,
}: PlayerDockProps) {
  return (
    <div className={`player-dock mx-auto mb-2 grid w-full max-w-5xl gap-3 rounded-md p-3 backdrop-blur-md sm:grid-cols-[auto_minmax(10rem,1fr)_auto] sm:items-center sm:p-4 ${stationTheme.dockClass}`}>
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
        <IconButton
          ref={stationCatalogRef}
          label="Station catalog"
          onClick={onOpenStationCatalog}
        >
          <ListMusic size={18} />
        </IconButton>
      </div>

      <div className="min-w-0 text-center" aria-live="polite" aria-atomic="true">
        <p className="font-display text-lg uppercase leading-tight text-gold sm:text-xl" data-testid="station-title">
          {stationTitle}
        </p>
        <p className="text-xs uppercase text-neon/85">{stationCity}</p>
        {shareStatus || stationStatus.startsWith("source unavailable") ? (
          <p className="mt-1 text-xs uppercase text-shell/60" data-testid="station-status">
            {shareStatus ?? stationStatus}
          </p>
        ) : (
          <p className="sr-only" data-testid="station-status">
            {stationStatus}
          </p>
        )}
      </div>

      <div className="flex min-h-10 items-center justify-center gap-2 text-shell/90 sm:justify-end">
        <label className="flex items-center gap-2">
          <Volume2 size={18} />
          <span className="sr-only">Volume</span>
          <input
            aria-label="Volume"
            className="w-28 accent-gold sm:w-32"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>
        <IconButton label="Share station" onClick={onShareStation}>
          <Share2 size={18} />
        </IconButton>
        <IconButton label={sourceUrl ? "Open original source" : "No source configured"} onClick={onOpenSource} disabled={!sourceUrl}>
          <ExternalLink size={18} />
        </IconButton>
      </div>
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
        emphasis ? "border-gold bg-gold text-night shadow-neon" : "border-shell/35 bg-night/78 text-shell hover:border-gold hover:text-gold"
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

function StationCatalogModal({
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
  const modalRef = useRef<HTMLDivElement>(null);
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
      className="fixed inset-0 z-30 grid place-items-start bg-[rgba(19,13,16,0.92)] px-4 py-8 backdrop-blur-md sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={onDialogKeyDown}
    >
      <div className="mx-auto w-full max-w-6xl rounded-md bg-[rgba(19,13,16,0.96)] text-shell shadow-[0_0_70px_rgba(0,0,0,0.92)]">
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
          <div>
            <h2 id={titleId} className="font-display text-2xl uppercase text-gold">
              jukebox
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close station catalog"
            onClick={onClose}
            className="grid size-10 place-items-center rounded bg-night/70 text-shell shadow-[0_0_18px_rgba(244,196,26,0.18)] transition hover:text-gold focus:outline-none focus-visible:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto p-3 sm:p-4">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {stations.map((station) => {
              const isActive = station.id === activeStationId;

              return (
                <li key={station.id}>
                  <button
                    type="button"
                    onClick={() => onSelectStation(station.id)}
                    aria-label={station.title}
                    aria-current={isActive ? "true" : undefined}
                    className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-md text-left transition focus:outline-none focus:ring-2 focus:ring-gold ${
                      isActive
                        ? "shadow-[0_0_28px_rgba(244,100,138,0.58)]"
                        : "shadow-[0_0_24px_rgba(0,0,0,0.55)] hover:shadow-[0_0_28px_rgba(244,196,26,0.28)]"
                    }`}
                  >
                    <CafeImage
                      src={station.imageSrc}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover brightness-100 saturate-[1.12] transition duration-300 group-hover:scale-[1.04]"
                    />
                    <span className={`absolute inset-0 ${station.theme.overlayClass} opacity-25`} />
                    <span className="absolute inset-0 bg-gradient-to-t from-night/92 via-night/26 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 block p-4">
                      <span className="block font-display text-xl uppercase leading-tight text-gold">{station.title}</span>
                      <span className="mt-1 block text-xs uppercase text-neon/90">{station.city}</span>
                    </span>
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
    ["M", "background motion"],
    ["T", "share station"],
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
      className="fixed inset-0 z-30 grid place-items-center bg-night/88 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      aria-describedby={descriptionId}
      onKeyDown={onDialogKeyDown}
    >
      <div className="w-full max-w-md rounded-md border border-gold/70 bg-night p-5 text-shell shadow-[0_0_42px_rgba(0,0,0,0.78)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="about-title" className="font-display text-2xl uppercase text-gold">
            elvispresley.cafe
          </h2>
          <IconButton ref={closeButtonRef} label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <p id={descriptionId} className="text-sm leading-6 text-shell/86">
          A small retro music room for Elvis-inspired stations. The room uses curated playlist stations and original visual scenes
          without bundling copyrighted audio.
        </p>
        <p className="mt-3 text-xs uppercase leading-5 text-shell/62">
          Visuals: original generated scenes. Music: YouTube playlist embeds and source links.
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
