# Currency Swap

A React + TypeScript + Vite implementation of a token currency swap form. The app lets users choose two currencies, enter an amount, preview the calculated receive amount, review the exchange rate, and submit a simulated swap.

## How To Run

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```bash
http://localhost:5173/
```

Run a production build:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

## Assumptions

- The token prices are static assignment data, not live market data.
- A successful swap is simulated in the browser; no wallet, backend, or blockchain transaction is connected.
- Network fee and settlement values are presented as preview information, not real execution data.
- Token icons are static public assets served from `public/assets/tokens`.
- Duplicate token symbols in the source data are normalized by keeping one entry per currency symbol.
- The UI direction follows `DESIGN.md`: quiet Apple-inspired chrome, light canvas, dark detail band, pill controls, and a single blue primary action color.

## Main Decisions

### Feature-first structure

The swap domain is grouped under `src/features/swap` instead of spreading domain logic across global folders. This keeps the feature easy to expand without making `components`, `hooks`, and `stores` too broad.

```txt
src/features/swap/
  components/
  hooks/
  model/
  services/
  styles/
```

### Components are split by responsibility

The UI is broken into small components:

- `SwapPage` owns page composition.
- `SwapPanel` owns the swap card workflow.
- `SwapForm` wires the pay/receive fields and switch action.
- `TokenAmountField` owns amount input layout.
- `TokenSelector` owns token selection behavior.
- `TokenOption` owns token row rendering.
- `SwapSummary` owns quote metadata.
- `SwapSubmitButton` owns submit button states.

This makes the code easier to test, review, and extend with features like balances, slippage, validation, or a confirmation modal.

### Business logic is outside UI components

Conversion math and token lookup are extracted into services:

- `quoteCalculator.ts` handles amount parsing, receive amount, exchange rate, and notional value.
- `tokenRepository.ts` normalizes and exposes token data.

Formatting helpers are shared in `src/shared/lib/formatters.ts`, so display logic stays consistent.

### State is scoped to the feature

Redux Toolkit is used for the selected tokens and input amount. The slice lives in:

```txt
src/features/swap/model/swapSlice.ts
```

The root store only composes feature reducers:

```txt
src/stores/store.ts
```

### Public assets and typed data are separated

Static files are kept in `public`, while TypeScript data is kept in `src`:

```txt
public/assets/tokens/
src/data/tokens.ts
```

This follows Vite conventions and avoids importing TypeScript modules from the public asset directory.

## Codebase Overview

```txt
src/
  app/
    App.tsx
    app.css
    providers.tsx

  data/
    tokens.ts

  features/swap/
    components/
    hooks/
    model/
    services/
    styles/
    index.ts

  shared/
    assets/
    lib/
    ui/

  stores/
    store.ts
```

## Validation

Before submitting, run:

```bash
npm run lint
npm run build
```

Both commands should complete without errors.
