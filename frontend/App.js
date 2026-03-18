import { useEffect, useState } from "react";

import DemoDashboardScreen from "./src/screens/DemoDashboardScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { fetchDemoUsers, loginDemoUser } from "./src/services/authService";

export default function App() {
  const [demoUsers, setDemoUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDemoUsers() {
      try {
        setLoadingUsers(true);
        const payload = await fetchDemoUsers();
        if (mounted) {
          setDemoUsers(payload.users || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load users");
        }
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    }

    loadDemoUsers();

    return () => {
      mounted = false;
    };
  }, []);

  async function onLogin(credentials) {
    try {
      setError("");
      setAuthLoading(true);
      const response = await loginDemoUser(credentials);
      setSession(response);
    } catch (err) {
      setSession(null);
      setError(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function onQuickSwitch(username) {
    const selectedUser = demoUsers.find((item) => item.username === username);
    if (!selectedUser) {
      return;
    }

    await onLogin({
      username: selectedUser.username,
      password: selectedUser.password || "demo123",
    });
  }

  function onLogout() {
    setSession(null);
    setError("");
  }

  if (!session) {
    return (
      <LoginScreen
        demoUsers={demoUsers}
        loadingUsers={loadingUsers}
        authLoading={authLoading}
        error={error}
        onLogin={onLogin}
      />
    );
  }

  return (
    <DemoDashboardScreen
      session={session}
      demoUsers={demoUsers}
      switchLoading={authLoading}
      onQuickSwitch={onQuickSwitch}
      onLogout={onLogout}
    />
  );
}
