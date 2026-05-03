import "./app.css"

import { SwapPage } from "@/features/swap"
import { ThemeToggle } from "./ThemeToggle"

function App() {
  return (
    <main className="swap-app">
      <header className="global-nav" aria-label="Application header">
        <span className="global-nav__brand">Currency Swap</span>
        <nav className="global-nav__links" aria-label="Product navigation">
          <a href="#swap">Swap</a>
          <a href="#details">Details</a>
          <ThemeToggle />
        </nav>
      </header>

      <SwapPage />
    </main>
  )
}

export default App
