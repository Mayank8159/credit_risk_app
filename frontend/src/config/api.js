import { Platform } from "react-native";

function getDefaultBaseUrl() {
  if (Platform.OS === "android") {
    return "https://credit-risk-api.onrender.com/api/v1";
  }
  return "http://localhost:8000/api/v1";
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultBaseUrl();
