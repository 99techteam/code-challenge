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
