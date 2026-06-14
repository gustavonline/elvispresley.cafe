export type PresenceSnapshot = {
  count: number;
  stationCounts?: Record<string, number>;
  updatedAt?: string;
};

export type PresenceHeartbeatPayload = {
  isListening: boolean;
  sessionId: string;
  stationId: string;
};

const sessionStorageKey = "elvis-cafe-presence-session-id";

function getConfiguredPresenceEndpoint() {
  return import.meta.env.VITE_PRESENCE_ENDPOINT?.trim() || undefined;
}

export function getPresenceEndpoint() {
  const endpoint = getConfiguredPresenceEndpoint();

  if (!endpoint) {
    return undefined;
  }

  return endpoint.endsWith("/presence") ? endpoint : `${endpoint.replace(/\/$/, "")}/presence`;
}

export function getPresenceSessionId() {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const existingSessionId = window.localStorage.getItem(sessionStorageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(sessionStorageKey, sessionId);
  return sessionId;
}

function parsePresenceSnapshot(value: unknown): PresenceSnapshot {
  if (!value || typeof value !== "object" || !("count" in value)) {
    throw new Error("Presence response missing count.");
  }

  const count = Number((value as { count: unknown }).count);

  if (!Number.isFinite(count) || count < 0) {
    throw new Error("Presence response count is invalid.");
  }

  return {
    ...(value as PresenceSnapshot),
    count,
  };
}

export async function fetchPresenceSnapshot(endpoint: string, signal?: AbortSignal) {
  const response = await fetch(endpoint, {
    credentials: "omit",
    headers: {
      accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Presence request failed with ${response.status}.`);
  }

  return parsePresenceSnapshot(await response.json());
}

export async function sendPresenceHeartbeat(endpoint: string, payload: PresenceHeartbeatPayload, signal?: AbortSignal) {
  const response = await fetch(endpoint, {
    body: JSON.stringify(payload),
    credentials: "omit",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    method: "POST",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Presence heartbeat failed with ${response.status}.`);
  }

  return parsePresenceSnapshot(await response.json());
}

export function sendPresenceDeparture(endpoint: string, sessionId: string, stationId: string) {
  const body = JSON.stringify({
    isListening: false,
    sessionId,
    stationId,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(endpoint, {
    body,
    credentials: "omit",
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
    method: "POST",
  });
}
