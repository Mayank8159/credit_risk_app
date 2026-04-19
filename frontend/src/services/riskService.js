import { apiRequest } from "./apiClient";

export async function analyzeRisk(payload) {
  return apiRequest("/risk/analyze", {
    method: "POST",
    data: payload,
    retry: 1,
  }).then((response) => response?.data || response);
}
