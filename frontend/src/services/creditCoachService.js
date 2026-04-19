/**
 * Credit Coach API Service
 * Handles calls to the backend credit coach endpoints
 */

import { apiRequest } from "./apiClient";

/**
 * Send a chat message to the AI coach
 */
export async function sendCoachMessage(request) {
  return apiRequest("/credit-coach/chat", {
    method: "POST",
    data: request,
    retry: 1,
  }).then((response) => response?.data || response);
}

/**
 * Simulate a what-if scenario
 */
export async function simulateWhatIf(request) {
  return apiRequest("/credit-coach/what-if", {
    method: "POST",
    data: request,
    retry: 1,
  }).then((response) => response?.data || response);
}
