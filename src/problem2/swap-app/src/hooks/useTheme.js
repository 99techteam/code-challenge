import { useLayoutEffect, useState } from "react";

export function useTheme() {
  const initial = () => {
    const s = localStorage.getItem("theme");
    if (s === "light" || s === "dark") return s;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(initial);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme, isDark: theme === "dark" };
}
