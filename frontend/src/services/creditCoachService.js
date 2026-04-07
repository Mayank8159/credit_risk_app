/**
 * Credit Coach API Service
 * Handles calls to the backend credit coach endpoints
 */

import { API_BASE_URL } from "../config/api";

function normalizeBaseUrl(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

function getEndpointCandidates(path) {
  const base = normalizeBaseUrl(API_BASE_URL);
  if (!base) {
    return [];
  }

  const direct = `${base}${path}`;
  const withApiV1 = `${base}/api/v1${path}`;

  if (base.includes("/api/v1")) {
    return [direct];
  }

  return [direct, withApiV1];
}

async function parseErrorResponse(response) {
  const payload = await response.json().catch(() => ({}));
  const detail = payload?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (detail && typeof detail === "object") {
    return detail.message || detail.detail || JSON.stringify(detail);
  }
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  return `Request failed (${response.status})`;
}

async function postWithFallback(path, request) {
  const candidates = getEndpointCandidates(path);
  let lastError = null;

  for (const url of candidates) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      return response.json();
    }

    const message = await parseErrorResponse(response);
    lastError = new Error(message);

    // Retry next candidate only for 404 (prefix mismatch); fail fast otherwise.
    if (response.status !== 404) {
      throw lastError;
    }
  }

  throw lastError || new Error("Unable to reach backend endpoint");
}

/**
 * Send a chat message to the AI coach
 */
export async function sendCoachMessage(request) {
  return postWithFallback("/credit-coach/chat", request);
}

/**
 * Simulate a what-if scenario
 */
export async function simulateWhatIf(request) {
  return postWithFallback("/credit-coach/what-if", request);
}
