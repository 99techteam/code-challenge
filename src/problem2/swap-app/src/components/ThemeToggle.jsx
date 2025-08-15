import { useLayoutEffect, useState } from "react";

export default function ThemeToggle() {
  const initial = () => {
    const s = localStorage.getItem("theme");
    if (s === "light" || s === "dark") return s;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(initial);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <div className="relative w-[78px] h-9">
        {/* Controller */}
        <input
          id="theme-toggle"
          type="checkbox"
          className="peer sr-only"
          checked={isDark}
          onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
          aria-label="Toggle dark mode"
        />

        {/* Track */}
        <label
          htmlFor="theme-toggle"
          role="switch"
          aria-checked={isDark}
          className="absolute inset-0 rounded-full cursor-pointer
                     border border-[color:var(--border)]
                     [background:var(--switch-track)]
                     shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)]
                     focus:outline-none focus:ring-2 focus:ring-[rgba(124,92,255,0.35)]"
        />

        {/* Knob */}
        <label
          htmlFor="theme-toggle"
          title={isDark ? "Switch to light" : "Switch to dark"}
          className="absolute top-1/2 -translate-y-1/2 left-[6px]
                     w-7 h-7 rounded-full grid place-items-center cursor-pointer
                     [background:var(--knob-bg)] text-[color:var(--knob-fg)]
                     shadow-[0_6px_18px_rgba(0,0,0,0.25)]
                     transition-[left,background,color,box-shadow] duration-200
                     peer-checked:left-[calc(100%-34px)]"
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#A5B4FC]" aria-hidden>
              <path d="M21 12.8A9 9 0 1111.2 3a7.2 7.2 0 109.8 9.8z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#FACC15]" aria-hidden>
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="12" y1="2.5" x2="12" y2="5.2" />
                <line x1="12" y1="18.8" x2="12" y2="21.5" />
                <line x1="2.5" y1="12" x2="5.2" y2="12" />
                <line x1="18.8" y1="12" x2="21.5" y2="12" />
                <line x1="4.4" y1="4.4" x2="6.3" y2="6.3" />
                <line x1="17.7" y1="17.7" x2="19.6" y2="19.6" />
                <line x1="17.7" y1="6.3" x2="19.6" y2="4.4" />
                <line x1="4.4" y1="19.6" x2="6.3" y2="17.7" />
              </g>
            </svg>
          )}
        </label>
      </div>
    </div>
  );
}
