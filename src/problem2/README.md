# Problem 2 — Currency Swap

A single-page currency swap form built with **Vite** and vanilla JavaScript.

## Features

- Swap any two of the 32 priced currencies (rates from `interview.switcheo.com/prices.json`).
- Live output amount and exchange-rate readout as you type or change tokens.
- Token icons from the Switcheo token-icons repo, with an initial-letter fallback
  for tokens that have no icon.
- Input validation with inline error messages (empty, invalid, zero, same-token).
- Simulated backend swap with a loading spinner and a success toast.
- Token picker modal with search, keyboard-closeable (Esc).
- Responsive, dark theme.

## Run it

```bash
npm install
npm run dev       # start dev server
npm run build     # production build to dist/
npm run preview   # serve the production build
npm test          # run unit tests (node:test)
```

The app fetches prices and token icons from the network at runtime, and falls
back to a bundled price snapshot if the live API is unreachable.

> **Note:** open the app through the Vite dev/preview server, not by
> double-clicking `index.html` — the ES modules need a server to load.
