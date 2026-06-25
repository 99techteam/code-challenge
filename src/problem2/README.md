# Problem 2 — Fancy Form

A currency swap form built with **Vite + React + TypeScript**.

## Getting started

```bash
cd src/problem2
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## What it does

- Fetches live token prices from `https://interview.switcheo.com/prices.json` on load.
  Tokens without a price entry are omitted.
- Pulls token icons from the Switcheo token-icon CDN (`*.svg`); broken images are
  hidden gracefully with an `onError` handler.
- Computes the receive amount in real time: `receiveAmount = sendAmount × (fromPrice / toPrice)`.
- Validates the form inline: positive amount, both tokens selected, tokens must differ.
- The **Confirm Swap** button simulates a backend call with a 1.5-second loading spinner,
  then shows a success confirmation before resetting the form.

## Project layout

```
src/
├── types.ts              Token and PriceRecord shapes
├── lib/
│   ├── prices.ts         Fetch + deduplicate prices; derive icon URLs
│   └── format.ts         Exchange-rate math and number formatting
├── hooks/
│   └── usePrices.ts      Data-loading hook (loading / error / data)
├── components/
│   ├── TokenSelect.tsx   Searchable dropdown with icon + symbol
│   └── SwapForm.tsx      Core form logic and layout
├── App.tsx               Root component; wires usePrices → SwapForm
├── App.css               Component-level styles
├── index.css             Global reset and design tokens
└── main.tsx              Vite entry point
```
