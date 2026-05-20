## Project Overview

This is a **Svelte 5 + TypeScript + Vite** project for a currency swap UI. It fetches live token prices from an external API, displays them in a swap form with exchange rate calculations, and simulates swap transactions. The UI uses Tailwind CSS v4 with a custom gradient background and smooth animations.

## 🚀 Getting Started

### Application

- Running on: [https://taisugar.github.io/code-challenge/](https://taisugar.github.io/code-challenge/)

### Prerequisites

- bun (v1.2.21)

## Build & Development Commands

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev       # Start dev server with HMR
```

```bash
bun run build     # Production build with Brotli compression
bun run preview   # Preview production build locally
bun run check     # Type check (svelte-check + tsc)
```

## Project Structure

```
src/
├── main.ts              # Entry point, mounts App.svelte to #app
├── App.svelte           # Root: fetches tokens, manages loading/error states
├── types.ts             # Token DTO and TypeToken type definitions
├── index.css            # Global styles (gradient background with grain texture, animations)
├── lib/
│   ├── FancyForm.svelte       # Swap form (pay/receive amounts, token selection, calculations)
│   ├── InputTokenAmount.svelte # Pay/receive input with token selector button
│   ├── TokenDropdown.svelte    # Token selection dropdown
│   ├── Spinner.svelte          # Loading spinner
│   ├── IntroOverlay.svelte     # Intro splash screen animation
│   └── LazyImage.svelte        # Image lazy-loading wrapper
└── assets/
    └── styles.css              # Tailwind CSS v4 import

index.html                # Entry point with #app div and background gradient container
vite.config.ts           # Vite config with Svelte, Tailwind, and Brotli plugins
```

## 🔧 API Integration

- **Price Data**: Fetches from `https://interview.switcheo.com/prices.json`
- **Token Icons**: Loads from `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/`

## Data Flow & Architecture

**Token Fetching (App.svelte):**

- On mount, fetches prices from `https://interview.switcheo.com/prices.json`
- Deduplicates by currency, filters out zero prices, renames specific tokens (STEVMOS → stEVMOS, etc.)
- Maps to `TypeToken[]` and sorts alphabetically by currency

**Production Build:**

- Vite builds to `dist/` with Brotli compression (`.br` files)
- Output includes CSS, JS, and asset minification
