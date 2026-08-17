import React, { createContext, useContext, useEffect, useState } from "react";

export const light = {
  ink: "#101B26",
  ink2: "#182634",
  inkBorder: "#26384A",
  canvas: "#EFEEE6",
  panel: "#FFFFFF",
  border: "#DEDBCF",
  text: "#16212B",
  textSoft: "#5B6672",
  textFaint: "#8B9098",
  amber: "#E5A339",
  amberDeep: "#8A5A14",
  amberFill: "#FBEBD1",
  green: "#2F8F5B",
  greenFill: "#E1F3E9",
  red: "#C6453B",
  redFill: "#FBE7E5",
  blue: "#3E7CB1",
  blueFill: "#E5EFF6",
  gray: "#8B9098",
  grayFill: "#EEEDE7",
  hover: "#F5F4F0",
};

export const dark = {
  ink: "#141820",
  ink2: "#2D333B",
  inkBorder: "#22272E",
  canvas: "#1C2128",
  panel: "#22272E",
  border: "#373D48",
  text: "#F0F6FC",
  textSoft: "#ADBAC7",
  textFaint: "#768390",
  amber: "#E5A339",
  amberDeep: "#b79880",
  amberFill: "#b64a553c",
  green: "#3FB950",
  greenFill: "rgba(63, 185, 80, 0.15)",
  red: "#F85149",
  redFill: "rgba(248, 81, 73, 0.15)",
  blue: "#58A6FF",
  blueFill: "rgba(88, 166, 255, 0.15)",
  gray: "#768390",
  grayFill: "#2D333B",
  hover: "#2D333B",
};

const toCssVar = (key: string) => `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;

const cssVars: Record<string, string> = {};
Object.keys(light).forEach((key) => {
  cssVars[key] = `var(${toCssVar(key)})`;
});

export const T = cssVars;

export const fontStack = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
  .stc-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
  .stc-body { font-family: 'IBM Plex Sans', sans-serif; }
  .stc-mono { font-family: 'IBM Plex Mono', monospace; }
  .stc-scroll::-webkit-scrollbar { width: 2px; }
  .stc-scroll::-webkit-scrollbar-thumb { border-radius: 4px; }
  .stc-row:hover { background: var(--hover); }
  .stc-navitem { position: relative; }
  .stc-navitem.active::before {
    content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px;
    background: var(--amber); border-radius: 0;
  }
  .stc-table-scroll::-webkit-scrollbar { display: none; }
  .stc-table-scroll { scrollbar-width: none; -ms-overflow-style: none; }
`;

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ mode: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const colors = mode === "dark" ? dark : light;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(toCssVar(key), value);
    });
    root.setAttribute("data-theme", mode);
    try { localStorage.setItem("theme", mode); } catch {}
  }, [mode]);

  const toggle = () => setMode((m) => (m === "light" ? "dark" : "light"));

  return React.createElement(
    ThemeContext.Provider,
    { value: { mode, toggle } },
    children
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
