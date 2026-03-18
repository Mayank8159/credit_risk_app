import { API_BASE_URL } from "../config/api";

export async function fetchDemoUsers() {
  const response = await fetch(`${API_BASE_URL}/auth/demo-users`);
  if (!response.ok) {
    throw new Error("Unable to load demo users");
  }
  return response.json();
}

export async function loginDemoUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.detail || "Demo login failed";
    throw new Error(message);
  }

  return response.json();
}
