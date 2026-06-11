export type ElvisCafePreferences = {
  disabledShortcuts: boolean;
  isLowPower: boolean;
  visualMode?: "stage" | "neon" | "dim";
  volume: number;
};

export const defaultPreferences: ElvisCafePreferences = {
  disabledShortcuts: false,
  isLowPower: false,
  volume: 68,
};

const storageKey = "elvis-cafe-preferences";

export function loadPreferences(): ElvisCafePreferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(raw) as Partial<ElvisCafePreferences>;
    return {
      disabledShortcuts: Boolean(parsed.disabledShortcuts),
      isLowPower: Boolean(parsed.isLowPower),
      visualMode: parsed.visualMode,
      volume: typeof parsed.volume === "number" ? Math.min(100, Math.max(0, parsed.volume)) : defaultPreferences.volume,
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: ElvisCafePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}
