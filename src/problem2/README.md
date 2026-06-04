# Problem 2: Currency Swap UI

This folder contains a quote-driven currency swap interface built with Vite, React, and TypeScript.

## Tech Stack

- Vite
- React 18 + TypeScript
- Tailwind CSS
- TanStack Query
- shadcn/base-ui generated primitives

## Features

- Fetches and normalizes latest prices from:
  - `https://interview.switcheo.com/prices.json`
- Fetches token icons from Switcheo token icon repository
- Two-way quote calculation:
  - editing `pay` recalculates `receive`
  - editing `receive` recalculates `pay`
- Input validation:
  - numeric only
  - decimal precision limit
  - max input cap
- Debounced quote refresh on amount changes
- Fresh price fetch before each quote recalculation
- Re-quote after swap direction changes using the newly active edited side
- Loading skeletons for:
  - initial prices load
  - icon load
  - quote refresh
- Searchable currency dropdown
- Light theme with semantic Tailwind color tokens
- Responsive input layout:
  - mobile: currency row and amount row are stacked on 2 lines
  - desktop: currency and amount are shown side by side
- Middle switch button for currency direction
- Bottom `Swap` action:
  - enabled only when a valid quote is present
  - resets the form inputs
- Error state with retry if prices API fails

## Project Structure

- `src/modules/swap-form/index.tsx`: Main swap UI container and rendering
- `src/modules/swap-form/hook/useSwapQuote.ts`: Quote orchestration, debounce, abort cleanup, swap behavior
- `src/modules/swap-form/api/queries.ts`: React Query hooks
- `src/components/common/CurrencyInput.tsx`: Reusable amount/currency input row
- `src/api/currency.ts`: Price and icon API helpers
- `src/modules/swap-form/lib/utils.ts`: Input validation and quote/notional helpers
- `src/index.css`: Tailwind + global theme/base styles
- `tailwind.config.js`: Semantic color tokens used by the light theme

## Run Locally

From this folder:

```bash
# pnpm
pnpm install
pnpm dev

# npm
npm install
npm run dev
```

## Build and Checks

```bash
# pnpm
pnpm build
pnpm lint
pnpm format:check

# npm
npm run build
npm run lint
npm run format:check
```

## Architecture Decisions and Trade-offs

- Data fetching with TanStack Query
  - `useFetchPrices` and `useFetchIcons` manage loading, retry, and icon caching.
  - Quote recalculation itself is still orchestrated in `useSwapQuote` because it needs debounce and cancellation behavior tied to local form state.
- Quote orchestration in a dedicated hook
  - `useSwapQuote` owns amount state, selected currencies, `AbortController`, debounce timer, and swap-direction behavior.
  - This keeps `SwapForm` focused on rendering and derived display values.
- Price normalization before UI usage
  - The raw upstream payload is filtered to remove invalid entries and collapsed to the latest valid price per currency.
  - This avoids surfacing stale or malformed rows directly in the UI.
- Semantic theming
  - Swap UI colors are defined in `tailwind.config.js` instead of hardcoded class literals in JSX.
  - This makes the current light theme easier to maintain and evolve.

## Notes

- The bottom `Swap` button is currently a reset action, not a real swap execution request.
- There is no automated test runner configured in this folder yet; current verification is via `build`, `lint`, and formatting checks.
