# Problem 2: Orbit Token Swap

Orbit is a responsive, two-page token swap demo built with Vite and TypeScript. The swap page calculates indicative quotes from the supplied token price feed. A balances page shows the demo holdings and estimated values.

## Run locally

From this directory (`src/problem2`), install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The main swap page is `/`; the balances page is `/balances/`.

Check TypeScript with `npm run typecheck`.

Create and preview a production build with:

```sh
npm run build
npm run preview
```

## Pages and interactions

### Swap (`/`)

- Choose a token to pay and a token to receive with the searchable token picker.
- Enter an amount, swap the token direction, or use **MAX** to fill the available demo balance.
- Review the estimated receive amount, USD value, and exchange rate.
- Invalid amounts, identical token pairs, unavailable prices, and amounts above the demo balance are rejected with inline feedback.
- Confirming a swap shows a brief loading state and success summary.

### Balances (`/balances/`)

- Lists the demo tokens with their amounts, per-token price, and estimated USD value when available.
- Filter the holdings list by token symbol.
- Shows an estimated portfolio total for tokens with available prices.
- Links back to the swap page.

## Prices, balances, and limitations

- Prices are loaded from [Switcheo's price feed](https://interview.switcheo.com/prices.json). The feed can contain multiple records for one currency; the app uses the record with the latest date.
- The price snapshot may be stale or unavailable. Quotes and portfolio values are indicative only.
- Token icons are loaded from [Switcheo's token-icons repository](https://github.com/Switcheo/token-icons/tree/main/tokens), using the token symbol as the SVG filename. The app remains usable if an icon is missing.
- Initial demo balances are defined in `src/shared/balance.service.ts`. Simulated swaps update them in browser local storage under `orbit-demo-balances-v1`; no wallet is connected and no assets move.
- To reset the demo balances, clear the `orbit-demo-balances-v1` entry from local storage for this site. The initial balances will be restored on reload.

## Code layout

- `index.html` and `style.css`: swap page markup and shared styling.
- `src/features/swap/`: swap page route, controller, price/swap services, token picker, and swap validation.
- `src/features/balances/`: balances page markup, route, and controller. Vite maps this page to `/balances/`.
- `src/shared/`: DOM, formatting, token icons, and demo balance persistence used by both features.
- `src/errors/`: user-facing errors and toast handling.
- `src/types/`: shared TypeScript declarations for prices, balances, selections, and quotes.
- `vite.config.js`: Vite multi-page build configuration.

## Flow Chart
![Execution flow](./flowchart.png)
