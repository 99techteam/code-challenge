# Fancy Form — Currency Swap

A currency swap form built with **React + TypeScript + Vite**.

## Run it

```bash
npm install
npm run dev
```

## What it does

- Fetches live prices from `https://interview.switcheo.com/prices.json` on load.
  The feed has duplicate/stale rows per currency, so only the latest,
  positive-price entry per currency is kept. A bundled snapshot
  (`src/prices.json`) is used as a fallback if the live fetch fails.
- Token icons come from [Switcheo/token-icons](https://github.com/Switcheo/token-icons),
  copied into `public/tokens/`. Any currency without a matching icon falls
  back to a circular badge with its initials (see `TokenIcon.tsx`).
- Amount to receive is derived automatically from the live exchange rate —
  no separate "calculate" step.
- Input validation: the send amount must be a positive number, and the two
  sides can't both be the same token (enforced by disabling that option in
  the token picker).
- A ⇅ button reverses the swap direction, carrying over the current output
  amount as the new input.
- Submitting simulates a backend call (`setTimeout`) so the loading spinner
  on the submit button is visible, then shows a success message — there's no
  real backend for this challenge.
- Token pickers are searchable dropdowns (type to filter by symbol).

## Structure

```
src/
  components/
    SwapForm.tsx        - presentational: renders the hook's state
    TokenSelect.tsx      - searchable token dropdown
    TokenIcon.tsx        - token icon with initials fallback
  hooks/useSwapForm.ts  - all form state, validation, and submit logic
  utils/
    loadPrices.ts        - fetch + dedupe the price feed
    format.ts            - number formatting
  data/fallbackPrices.ts
  prices.json            - bundled fallback snapshot
```
