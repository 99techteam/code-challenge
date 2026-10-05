# Flux - Fancy Form

A responsive currency swap demo for Problem 2. Built with React, TypeScript,
Vite, plain CSS, Lucide icons and decimal.js.

## Run locally

Requires Node.js 22 LTS and npm.

```sh
cd src/problem2
npm ci
npm run dev
```

Open the local URL printed by Vite. To check the submission:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

## Behavior

- Search tokens by symbol or name; quickly select common tokens.
- Enter an amount, inspect the estimate, reverse the pair and review a demo swap.
- Selecting the same token on both sides shows validation. Neither selection is
  silently changed. Reversing swaps the tokens and preserves the entered amount.
- A lightweight review dialog confirms a simulation only. There is no wallet,
  balance, blockchain transaction, network fee or slippage model.
- Native dialogs support keyboard focus containment, Escape and restoring focus.
- Loading and request failure states are explicit. Failed requests can be retried.
- Missing icons fall back to the token's initials. Fonts are bundled locally.

## Reference data and calculation

Prices come from https://interview.switcheo.com/prices.json. This interview API
contains historical reference data (currently dated August 2023), not a live
market feed. The UI labels prices as reference data and provides source context
in an info tooltip. No polling, automatic retry or simulated realtime updates
are performed: one request on mount, with explicit Retry on failure. Requests
time out after 12 seconds and are aborted when the app unmounts.

Only records with a safe alphanumeric currency symbol, a finite positive numeric
price and a valid date are retained. Tokens with missing, zero or negative prices
never appear in either the main picker or popular tokens. Duplicate symbols use
the newest timestamp; the last record wins when timestamps tie. Symbol casing
is preserved for the token-icon repository.

```text
rate(A -> B) = USD price of A / USD price of B
receive     = entered amount of A * rate(A -> B)
USD value   = entered amount of A * USD price of A
```

decimal.js uses 50-digit working precision and rounds down for display.
Quotes are computed from the API's supplied numeric precision; stablecoins
are not assumed to equal $1. Display rounding is never fed back into a quote.

## Numeric UX

Input is a string and is never reformatted while typing: `0.`, `0.00` and
`1.2300` remain exactly as entered. The accepted decimal separator is a dot;
group separators and exponent notation are rejected. Amounts must be positive,
at most 1 trillion, with at most 18 fractional digits. These are demo input limits,
not inferred on-chain token decimals. Invalid entries show inline feedback and
disable review without removing the user's input.

Calculated values use the following display rules:

| Value                        | Display                                   |
| ---------------------------- | ----------------------------------------- |
| `1`                          | `1`                                       |
| `1.500000`                   | `1.5`                                     |
| `1234.56`                    | `1,234.56`                                |
| `0.123456789`                | `0.123456`                                |
| `0.00000000123`              | `0.00000000123`                           |
| Positive value below `1e-18` | `< 0.000000000000000001`                  |
| Value at or above `1e15`     | Scientific notation, 6 significant digits |

Values at or above 1 use up to 6 fractional digits; smaller values use 6
significant digits. Unnecessary trailing zeros are removed. The review dialog
shows the full unrounded amount being sent. USD values use two decimal places,
with positive sub-cent values shown as `< $0.01`.

## Structure

- `App.tsx`: form state, derived quote and lightweight review flow.
- `components/`: token amount field, picker, icon and native modal.
- `prices.ts`: fetch lifecycle and retry hook.
- `swap.ts`: price normalization, validation, decimal arithmetic and formatting.
- `style.css`: shared design tokens and responsive component styles.
- `tests/`: Vitest calculation/validation tests and React Testing Library
  interaction tests, including exclusion of unpriced tokens from the picker.

No extra nested `src` directory, global state library or backend is required.
Automated tests focus on calculation, validation and core interaction. Visual
review covers desktop/mobile, long numbers, dialogs and keyboard behavior.

Token images: https://github.com/Switcheo/token-icons
