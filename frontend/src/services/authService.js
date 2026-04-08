import { apiRequest } from "./apiClient";

export async function fetchDemoUsers() {
  return apiRequest("/auth/demo-users", { retry: 1 }).then((payload) => ({
    users: payload?.data?.users || payload?.users || [],
  }));
}

export async function loginDemoUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    data: credentials,
    retry: 1,
  }).then((payload) => payload?.data || payload);
}
