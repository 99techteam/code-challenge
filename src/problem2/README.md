# Problem 2 — Intent-Driven Fancy Form

A differentiated currency-swap experience built with **Vite + TypeScript**.

Instead of presenting only two inputs and one rate, the form asks the user for an
execution **intent**, compares three simulated routes, explains the recommendation,
and lets the user stress-test the quote against market movement.

## Creative differentiators

- **Intent engine:** Max return, Balanced, or Protect
- **Competing route quotes:** Direct Market, Smart Split, and Stable Shield
- **Adaptive recommendation:** route changes according to the selected objective
- **Manual route override:** the user remains in control
- **Execution-confidence ring:** quick visual signal for route reliability
- **Split-route allocation:** shows exactly how an order is distributed
- **What-if simulator:** previews output when destination price moves from -3% to +3%
- **Quote freshness clock:** refreshes the simulated quote every 15 seconds
- **Keyboard shortcuts:** `R` reverses the pair, `M` fills the maximum amount
- **Transparent explanation:** every route shows output, latency, confidence, and risk

## Highlights

- Live token prices from the provided Switcheo interview endpoint
- Resilient fallback prices when the endpoint is unavailable
- Token icons from `Switcheo/token-icons`
- Searchable, keyboard-accessible token picker
- Exact exchange-rate calculation from USD token prices
- Amount validation, decimal validation, and balance validation
- Reverse direction, MAX amount, rate inversion, and slippage controls
- Service fee, minimum received, price impact, and route preview
- Simulated asynchronous swap with loading and success receipt
- Dark/light themes persisted in `localStorage`
- Responsive mobile and desktop layout
- Native semantic elements, focus states, live regions, dialogs, and reduced-motion support

## Project structure

```text
src/problem2/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── src/
    ├── domain.ts
    ├── main.ts
    └── style.css
```

## Run locally

From `D:\99\code-challenge\src\problem2`:

```bat
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## Production build

```bat
npm run build
npm run preview
```

## Calculation

The API returns token prices denominated in USD.

```text
exchangeRate = fromToken.price / toToken.price
grossOutput  = inputAmount × exchangeRate
serviceFee   = grossOutput × 0.001
netOutput    = grossOutput - serviceFee
minimum      = netOutput × (1 - slippage / 100)
```

## Resilience

The remote price request is validated and normalized:

- invalid rows are ignored;
- currencies without a positive finite price are omitted;
- duplicate currencies keep the latest dated price;
- fewer than two valid assets triggers fallback data;
- failed token images fall back to a generated symbol avatar.

The fallback values are clearly labeled in the interface and exist only to keep the assessment usable when the interview endpoint is offline.
