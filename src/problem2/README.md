# Fancy Swap — Currency Swap Form

A polished currency swap interface built with **Vite + React + TypeScript**.

![stack](https://img.shields.io/badge/Vite-React-TypeScript-7c6cff)

## Run it

```bash
cd src/problem2
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (tsc -b) + production build to dist/
npm run preview  # serve the production build
npm test         # run the Vitest suite in watch mode
npm run test:run # run the suite once (CI)
```

> On Windows PowerShell, chain commands with `;` (and `if ($?)`) rather than
> `&&`, e.g. `cd src/problem2; if ($?) { npm run dev }`.

## What it does

- **Live prices & rates** — fetches the [Switcheo price feed](https://interview.switcheo.com/prices.json),
  de-duplicates it (keeping the most recent record per currency), and computes the
  exchange rate as `priceFrom / priceTo`. Tokens without a price are omitted.
- **Token picker** — searchable modal listing every priced token with its icon
  (from the [Switcheo token-icons repo](https://github.com/Switcheo/token-icons/tree/main/tokens))
  and USD price. Icons that don't exist fall back to a coloured monogram.
- **Two-way form** — type into "You pay" to compute "You receive"; the flip
  button swaps direction and carries the amount over.
- **Validation** — rejects non-numeric/negative input and flags
  *insufficient balance* against a mock per-token wallet ("Max" fills the field).
- **Simulated backend** — "Confirm swap" shows a loading spinner for ~1.6s,
  then a success state (no real funds move).

## Structure

```
src/
  components/
    SwapForm.tsx     # form state, validation, submit simulation
    TokenSelect.tsx  # searchable token-picker modal
    TokenIcon.tsx    # SVG icon with monogram fallback
  hooks/
    usePrices.ts     # fetches the feed -> derived token list
  lib/
    tokens.ts        # price parsing, icon URLs, number formatting
  types.ts           # shared types
  App.tsx            # loading / error / form states
  index.css          # design system + component styles
```

## Tests

[Vitest](https://vitest.dev) + React Testing Library (chosen over Jest because it
reuses the Vite pipeline — native TS/ESM, no separate transform config). 21 specs:

- `lib/tokens.test.ts` — price de-duplication (latest-by-date, the timestamp-tie
  rule, dropping non-positive/malformed records, sorting) and number formatting.
- `hooks/usePrices.test.ts` — loading → tokens / error transitions with a mocked `fetch`.
- `components/SwapForm.test.tsx` — rate calculation, input guarding, the
  insufficient-balance error, the flip button, and the simulated swap lifecycle.

```bash
npm run test:run
```

## Notes

- Wallet balances are mocked (deterministic per symbol) since there is no
  real account — enough to make the balance/Max/insufficient checks meaningful.
- No UI framework was used; the design system lives in `index.css` so the visual
  style is fully hand-authored.
