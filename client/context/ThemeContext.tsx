import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("theme") as Theme) || getSystemTheme();
    } catch {
      return getSystemTheme();
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    (html.style as any).colorScheme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      if (!localStorage.getItem("theme")) {
        setThemeState(getSystemTheme());
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "light" ? "dark" : "light"));

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}
