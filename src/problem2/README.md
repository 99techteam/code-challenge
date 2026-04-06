# Problem 2 – Token Swap UI

Token Swap UI built with React, TypeScript, Vite, and Tailwind CSS.

## What was implemented

- Centered swap card with "You Pay" / "You Receive" sections and summary info
- Live token prices from Switcheo prices API via a custom `usePrices` hook
- Token selection dropdowns with search and token icons loaded from GitHub
- Swap logic via `useSwapLogic` (amount calculation, exchange rate, basic validation)
- Form validation using Zod including numeric, positive, and simple balance checks
- Fake submit flow with simulated delay, success and error messages
- Swap history stored with Zustand and displayed in a modal

## Tech used

- React 18, TypeScript, Vite
- Tailwind CSS (default utility classes only)
- TanStack React Query for price fetching and caching
- Zustand for swap history state
- Zod for form validation

## Limitations / improvements

- Balances shown in the UI are static demo values and not fetched from a real wallet.
- USD equivalents displayed in the card are static examples and can be wired to live price data.
- Swap flow is fully simulated; there is no wallet connection or on-chain transaction submission.
- Slippage tolerance, fee percentage, and network fee values are hard-coded and not derived from live quotes or network conditions.
- Validation uses a fixed example balance (2.14 ETH) and does not handle per-token balances or real portfolio data.
- Swap history is stored only in in-memory Zustand state and is lost on page reload; it can be persisted to local storage or a backend.
- Token icons are fetched directly from GitHub at runtime; in production these could be cached or served from a dedicated asset CDN.

## Setup and usage

From `src/problem2`:

```bash
npm install (Node 22)

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs by default at http://localhost:5173.
