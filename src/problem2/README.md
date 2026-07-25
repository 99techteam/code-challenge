# Problem 2 — Currency Swap Form

A polished, interactive currency swap form. A user picks a token to pay with, a
token to receive, enters an amount, and the form computes the exchange in real
time from live token prices. Submitting runs a mocked backend round-trip with a
loading state and a success toast.

## Features

- **Live exchange rates** derived from real token prices, with a `1 X = n Y`
  rate line and USD value hints on both sides.
- **Searchable token picker** — a modal dialog listing every priced token with
  its icon, USD price, and (mocked) wallet balance; filter by ticker.
- **Swap-direction button** that flips the two tokens and carries the amount
  over for a seamless reverse quote.
- **MAX button** to fill the full wallet balance.
- **Inline validation** covering empty / non-numeric / zero / negative amounts,
  identical from/to tokens, and amounts exceeding the mocked wallet balance.
  The submit button is disabled while the form is invalid.
- **Mocked submit** — `CONFIRM SWAP` shows a spinner for ~1.5s, then a success
  toast summarizing the trade. No real transaction is made.
- **Graceful token icons** — remote SVGs with a generated monogram fallback
  when an icon is missing.
- **Resilient data loading** — if the live prices endpoint is unreachable the
  app falls back to a bundled snapshot, so it always renders (offline / CI safe).
- Responsive layout, dark theme, subtle animations, and keyboard-accessible
  controls (focus rings, `Esc` to close the picker, focus-on-open search).

## Tech stack

- **Vite** (bonus points) + **React 18** + **TypeScript**
- **Tailwind CSS v3** for styling
- No component library — all UI is hand-built and self-contained.

## Getting started

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

Requires Node 18+ (developed on Node 20).

## Data sources

- **Prices:** `https://interview.switcheo.com/prices.json` — an array of
  `{ currency, date, price }`. On load the app dedupes by currency (keeping the
  latest `date`) and keeps only tokens that have a positive price.
- **Icons:** `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`.

## Notes on mocking

- **Wallet balances** are mocked deterministically from each token's symbol and
  price (roughly \$500–\$10,000 of holdings per token) so validation against a
  balance is demonstrable.
- **The swap submission** is mocked with a `setTimeout` delay — there is no
  backend and no on-chain activity.
- A **bundled fallback price list** (`src/data/fallbackPrices.ts`) is a snapshot
  of the live endpoint, used only when the network request fails.

## Project structure

```
src/
  components/
    SwapForm.tsx          # form state, validation, submit flow
    TokenField.tsx        # one "pay"/"receive" row (amount + token trigger)
    TokenSelectModal.tsx  # searchable token picker dialog
    TokenIcon.tsx         # remote icon with monogram fallback
    Toast.tsx             # success toast
  hooks/
    usePrices.ts          # fetch + fallback, returns tradable tokens
  utils/
    swap.ts               # token building, rate math, conversion
    format.ts             # number / currency formatting
  data/
    fallbackPrices.ts     # offline snapshot of prices.json
  types.ts                # shared types
  App.tsx                 # layout, loading skeleton, toast wiring
```
