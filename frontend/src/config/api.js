function getDefaultBaseUrl() {
  // Safe production fallback for APK/demo builds.
  // For local development, override via EXPO_PUBLIC_API_BASE_URL.
  return "https://credit-risk-app-1.onrender.com/api/v1";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultBaseUrl();
