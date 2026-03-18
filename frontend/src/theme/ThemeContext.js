import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { darkTheme, lightTheme } from "./tokens";

const ThemeContext = createContext({
  theme: darkTheme,
  isDark: true,
  isThemeReady: false,
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "credit-risk-theme-mode";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadThemePreference() {
      try {
        const savedValue = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) {
          return;
        }
        if (savedValue === "light") {
          setIsDark(false);
        } else if (savedValue === "dark") {
          setIsDark(true);
        }
      } catch {
        // Use default theme when storage read fails.
      } finally {
        if (mounted) {
          setIsThemeReady(true);
        }
      }
    }

    loadThemePreference();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isThemeReady) {
      return;
    }

    AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light").catch(() => {
      // Best-effort persistence.
    });
  }, [isDark, isThemeReady]);

  const value = useMemo(
    () => ({
      isDark,
      isThemeReady,
      theme: isDark ? darkTheme : lightTheme,
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark, isThemeReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
