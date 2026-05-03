import {
  useLayoutEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

import {
  ThemeContext,
  type Theme,
  type ThemeContextValue,
} from "./theme-context"

const storageKey = "currency-swap-theme"

const getSystemTheme = (): Theme => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }

  return "light"
}

const getInitialTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(storageKey)
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme
  }

  return getSystemTheme()
}

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useLayoutEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(storageKey, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark",
        ),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
