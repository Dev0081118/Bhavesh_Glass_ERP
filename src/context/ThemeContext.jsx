import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSystemSettings } from "../lib/api";

const THEME_STORAGE_KEY = "erp-theme";
const VALID_THEMES = ["light", "dark"];

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : "light";
  } catch {
    return "light";
  }
};

const applyThemeToDocument = (theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  syncTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  /* 1) Immediate localStorage value avoids any flash of wrong theme. */
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  /*
   * 2) After auth, fetch the global settings and sync the MongoDB
   * theme into the context + localStorage.
   *
   * Failures are silent: without a token (pre-login) or while the
   * backend is unreachable the localStorage theme simply stays active.
   */
  const syncTheme = useCallback(async (token) => {
    if (!token) return;

    try {
      const settings = await getSystemSettings(token);
      const serverTheme = settings?.data?.theme;

      if (VALID_THEMES.includes(serverTheme)) {
        setThemeState(serverTheme);
        try {
          localStorage.setItem(THEME_STORAGE_KEY, serverTheme);
        } catch {
          /* storage unavailable — ignore */
        }
      }
    } catch {
      /* Unauthorized / offline — keep the localStorage theme. */
    }
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (!VALID_THEMES.includes(nextTheme)) return;
    setThemeState(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      /* storage unavailable — ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, syncTheme }),
    [theme, setTheme, toggleTheme, syncTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;