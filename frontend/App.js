import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import AppTabs from "./src/navigation/AppTabs";
import LoginScreen from "./src/screens/LoginScreen";
import { fetchDemoUsers, loginDemoUser } from "./src/services/authService";
import { ThemeProvider, useAppTheme } from "./src/theme/ThemeContext";

function RootApp() {
  const [demoUsers, setDemoUsers] = useState([]);
  const [session, setSession] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme } = useAppTheme();

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
      <NavigationContainer
        theme={{
          dark: theme.mode === "dark",
          colors: {
            primary: theme.colors.accent,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.textPrimary,
            border: theme.colors.border,
            notification: theme.colors.accentSecondary,
          },
          fonts: {
            regular: { fontFamily: "System", fontWeight: "400" },
            medium: { fontFamily: "System", fontWeight: "500" },
            bold: { fontFamily: "System", fontWeight: "700" },
            heavy: { fontFamily: "System", fontWeight: "800" },
          },
        }}
      >
        <LoginScreen
          demoUsers={demoUsers}
          loadingUsers={loadingUsers}
          authLoading={authLoading}
          error={error}
          onLogin={onLogin}
        />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === "dark",
        colors: {
          primary: theme.colors.accent,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.accentSecondary,
        },
        fonts: {
          regular: { fontFamily: "System", fontWeight: "400" },
          medium: { fontFamily: "System", fontWeight: "500" },
          bold: { fontFamily: "System", fontWeight: "700" },
          heavy: { fontFamily: "System", fontWeight: "800" },
        },
      }}
    >
      <AppTabs
        session={session}
        demoUsers={demoUsers}
        switchLoading={authLoading}
        onQuickSwitch={onQuickSwitch}
        onLogout={onLogout}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  );
}
