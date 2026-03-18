import { API_BASE_URL } from "../config/api";

export async function analyzeRisk(payload) {
  const response = await fetch(`${API_BASE_URL}/risk/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Risk analysis failed");
  }

  return response.json();
}
