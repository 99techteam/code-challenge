import { Theme } from '@radix-ui/themes'
import { createContext, useCallback, useState } from 'react'

const THEME_KEY = window.location?.host + '-isDarkMode'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const curIsDarkMode = localStorage.getItem(THEME_KEY) === 'true'

    if (curIsDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
    return curIsDarkMode
  })

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newIsDarkMode = !prev
      localStorage.setItem(THEME_KEY, newIsDarkMode.toString())
      if (newIsDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
      }
      return newIsDarkMode
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <Theme appearance={isDarkMode ? 'dark' : 'light'}>{children}</Theme>
    </ThemeContext.Provider>
  )
}

export { ThemeContext, ThemeProvider }
