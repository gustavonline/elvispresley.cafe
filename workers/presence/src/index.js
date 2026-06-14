import { DurableObject } from "cloudflare:workers";

const sessionTtlMs = 90 * 1000;
const defaultAllowedOrigins = ["https://gustavonline.github.io", "https://elvispresley.cafe"];

function getAllowedOrigin(request, env) {
  const requestOrigin = request.headers.get("Origin");
  const configuredOrigins = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;

  if (!requestOrigin) {
    return allowedOrigins[0] || "*";
  }

  if (allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] || "*";
}

function getCorsHeaders(request, env) {
  return {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": getAllowedOrigin(request, env),
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(getCorsHeaders(request, env))) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function isValidSessionId(sessionId) {
  return typeof sessionId === "string" && /^[a-zA-Z0-9._:-]{8,96}$/.test(sessionId);
}

function normalizeStationId(stationId) {
  if (typeof stationId !== "string") {
    return "unknown";
  }

  return /^[a-z0-9-]{2,64}$/.test(stationId) ? stationId : "unknown";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: getCorsHeaders(request, env),
        status: 204,
      });
    }

    if (url.pathname === "/health") {
      return withCors(json({ ok: true }), request, env);
    }

    if (url.pathname !== "/presence") {
      return withCors(json({ error: "not found" }, { status: 404 }), request, env);
    }

    const id = env.PRESENCE_ROOM.idFromName("global");
    const room = env.PRESENCE_ROOM.get(id);
    const response = await room.fetch(request);

    return withCors(response, request, env);
  },
};

export class PresenceRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.sessions = new Map();
    this.isLoaded = false;
  }

  async fetch(request) {
    if (request.method === "GET") {
      return json(await this.getSnapshot());
    }

    if (request.method !== "POST") {
      return json({ error: "method not allowed" }, { status: 405 });
    }

    let payload;

    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, { status: 400 });
    }

    if (!isValidSessionId(payload.sessionId)) {
      return json({ error: "invalid session id" }, { status: 400 });
    }

    return json(await this.updatePresence(payload));
  }

  async alarm() {
    await this.load();
    await this.persist(this.sweep());
  }

  async load() {
    if (this.isLoaded) {
      return;
    }

    const storedSessions = await this.ctx.storage.get("sessions");
    this.sessions = new Map(Array.isArray(storedSessions) ? storedSessions : []);
    this.isLoaded = true;
  }

  sweep() {
    const now = Date.now();
    let removed = false;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
        removed = true;
      }
    }

    return removed;
  }

  async persist(shouldWrite = true) {
    if (!shouldWrite) {
      return;
    }

    await this.ctx.storage.put("sessions", [...this.sessions.entries()]);

    if (this.sessions.size > 0) {
      await this.ctx.storage.setAlarm(Date.now() + sessionTtlMs);
    }
  }

  getSnapshotFromLoadedSessions() {
    const stationCounts = {};

    for (const session of this.sessions.values()) {
      stationCounts[session.stationId] = (stationCounts[session.stationId] || 0) + 1;
    }

    return {
      count: this.sessions.size,
      stationCounts,
      updatedAt: new Date().toISOString(),
    };
  }

  async getSnapshot() {
    await this.load();
    const removed = this.sweep();
    await this.persist(removed);
    return this.getSnapshotFromLoadedSessions();
  }

  async updatePresence(payload) {
    await this.load();
    this.sweep();

    if (payload.isListening === false) {
      this.sessions.delete(payload.sessionId);
    } else {
      this.sessions.set(payload.sessionId, {
        expiresAt: Date.now() + sessionTtlMs,
        stationId: normalizeStationId(payload.stationId),
      });
    }

    await this.persist();
    return this.getSnapshotFromLoadedSessions();
  }
}
