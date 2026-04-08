import { API_BASE_URL } from "../config/api";

const DEFAULT_TIMEOUT_MS = 8000;

function normalizeBaseUrl(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

function normalizePath(path) {
  if (!path) {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

function buildUrl(path) {
  const base = normalizeBaseUrl(API_BASE_URL);
  const normalizedPath = normalizePath(path);

  if (!base) {
    throw new Error("API base URL is not configured");
  }

  if (base.includes("/api/v1") && normalizedPath.startsWith("/api/v1")) {
    return `${base}${normalizedPath.replace("/api/v1", "")}`;
  }

  return `${base}${normalizedPath}`;
}

function parsePayloadError(payload, fallbackMessage) {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail;
  }

  if (payload?.detail && typeof payload.detail === "object") {
    return payload.detail?.message || payload.detail?.detail || fallbackMessage;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  return fallbackMessage;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retry = 1,
  } = options;

  const url = buildUrl(path);
  let attempt = 0;

  while (attempt <= retry) {
    attempt += 1;

    try {
      const response = await fetchWithTimeout(
        url,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: data !== undefined ? JSON.stringify(data) : undefined,
        },
        timeoutMs
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = parsePayloadError(payload, `Request failed (${response.status})`);
        if (attempt <= retry && response.status >= 500) {
          continue;
        }
        throw new Error(message);
      }

      return payload;
    } catch (error) {
      const isAbortError = error?.name === "AbortError";
      const isNetworkError =
        isAbortError ||
        /Network request failed|Failed to fetch|timed out/i.test(error?.message || "");

      if (attempt <= retry && isNetworkError) {
        continue;
      }

      if (isAbortError) {
        throw new Error("Request timed out. Please try again.");
      }

      throw error;
    }
  }

  throw new Error("Unable to complete request");
}
