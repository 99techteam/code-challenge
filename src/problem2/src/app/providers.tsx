import { Provider } from "react-redux"
import type { ReactNode } from "react"

import { store } from "@/stores/store"
import { ThemeProvider } from "./theme"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <Provider store={store}>{children}</Provider>
    </ThemeProvider>
  )
}
