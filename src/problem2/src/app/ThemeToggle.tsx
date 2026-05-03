import { MoonIcon, SunIcon } from "@phosphor-icons/react"

import { useTheme } from "./theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <SunIcon aria-hidden size={15} weight="bold" />
      ) : (
        <MoonIcon aria-hidden size={15} weight="bold" />
      )}
    </button>
  )
}
