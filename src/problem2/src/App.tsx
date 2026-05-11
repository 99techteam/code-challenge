import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, SunCloud01Icon } from "@hugeicons/core-free-icons"

import { SwapForm } from "@/components/swap/SwapForm"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function App() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <BackgroundGlow />
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <span className="text-sm font-bold">S</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Switch Swap</div>
            <div className="text-[10px] text-muted-foreground">
              Trade simulator
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-stretch px-4 pb-16">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Swap tokens instantly
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live exchange rates sourced from Switcheo&apos;s price feed.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/70 p-4 shadow-2xl shadow-black/5 backdrop-blur supports-backdrop-filter:bg-card/60 sm:p-5">
          <SwapForm />
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Prices are mock data for demo purposes. Press{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">
            d
          </kbd>{" "}
          to toggle theme.
        </p>
      </main>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full"
    >
      <HugeiconsIcon icon={isDark ? SunCloud01Icon : Moon02Icon} size={16} />
    </Button>
  )
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute top-[-10%] left-1/2 h-105 w-205 -translate-x-1/2 rounded-full bg-primary/20 opacity-50 blur-3xl dark:bg-primary/30 dark:opacity-40" />
      <div className="absolute bottom-[-25%] left-[-10%] h-95 w-130 rounded-full bg-chart-2/20 opacity-40 blur-3xl dark:opacity-30" />
      <div className="absolute right-[-10%] bottom-[-15%] h-90 w-110 rounded-full bg-chart-3/20 opacity-40 blur-3xl dark:opacity-30" />
    </div>
  )
}

export default App
