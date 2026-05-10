# Problem 2 — Fancy Form (Currency Swap)

A polished, single-page **token swap** UI built as a front-end demo. Pick two assets, type an amount, and see the converted output computed from live USD prices. Submission is simulated with a short delay — there is no real backend or wallet.

Live data comes from the public Switcheo interview feed:

- Prices: <https://interview.switcheo.com/prices.json>
- Icons: <https://github.com/Switcheo/token-icons>

## Stack

| Piece | Role |
| ----- | ---- |
| [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | UI + types |
| [Vite 5](https://vitejs.dev/) | Dev server / bundler |
| [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Accessible primitives (Select, Label, Slot, …) |
| [framer-motion](https://www.framer.com/motion/) | Micro-interactions and transitions |
| [lucide-react](https://lucide.dev/) | Icon set |
| [`@fontsource-variable/geist`](https://fontsource.org/fonts/geist) | Variable font |

## Requirements

- Node.js 20+ (LTS recommended)
- npm

## Install and run

```bash
cd src/problem2
npm install
```

**Development** (Vite dev server with HMR):

```bash
npm run dev
```

Then open the printed URL (typically <http://localhost:5173>).

**Production build**:

```bash
npm run build
npm run preview
```

`preview` serves the built bundle locally so you can sanity-check the production output.

## How the prices feed is wired

To avoid CORS issues during local development, Vite proxies the prices request:

```ts
// vite.config.ts
server: {
  proxy: {
    "/prices.json": {
      target: "https://interview.switcheo.com",
      changeOrigin: true,
      secure: true,
    },
  },
}
```

In **dev** the app fetches `/prices.json` (proxied). In **production** it fetches `https://interview.switcheo.com/prices.json` directly. See `src/lib/prices.ts`.

The feed contains multiple rows per currency on different dates; only the **most recent** row per currency is kept (see `dedupeLatestByCurrency`).

## What the form does

- **Token pickers** with searchable Radix-powered select, showing icon, symbol and current USD price for each token.
- **Amount input** with a permissive parser (`src/lib/amountInput.ts`) that:
  - strips thousands separators,
  - rejects negatives, multiple decimal points, and non-numeric input,
  - caps fractional digits (12 by default) and reports a helpful error message.
- **Live conversion** using `convertAmount(amount, fromPriceUsd, toPriceUsd)` — `(amount × fromPrice) / toPrice`.
- **Reverse button** swaps the two tokens and carries the receive-side amount back into the send field.
- **Mock balances** (`src/lib/mockBalance.ts`) per currency so the form can validate "exceeds balance" without a real wallet.
- **Validation surfaces inline**: same token on both sides, invalid number, or amount above the demo balance — all rendered under the input and reflected in `aria-invalid` and the disabled state of the submit button.
- **Submit** is a simulated async action: a 1.8 s delay, then a success toast-style banner with the executed pair and amounts. Nothing is sent anywhere.
- **Loading and error states** handle the price-fetch lifecycle, including a Retry button if the feed fails or returns fewer than two priced tokens.
- **Smart defaults**: prefers `ETH → USDC` when both exist; otherwise falls back to the first two priced tokens.

## Accessibility and UX touches

- Radix primitives provide keyboard navigation and focus management out of the box.
- Inputs are paired with `<Label>` / `htmlFor`; the receive field uses a real `<output for>` element.
- Validation errors are announced via `aria-describedby` and `aria-invalid`.
- Submitting state uses `aria-busy` and a spinner.
- A subtle animated background (grid + radial blur) and motion-driven transitions keep things lively without being noisy.
- Tokens with missing icons gracefully fall back to a circular initials badge (`TokenIcon.tsx`).

## Project layout

| Path | Purpose |
| ---- | ------- |
| `index.html` | Vite entry; sets dark theme on `<html>` |
| `src/main.tsx` | React root |
| `src/App.tsx` | Page shell, background, footer credits |
| `src/components/SwapForm.tsx` | The swap form (the bulk of the UI) |
| `src/components/TokenIcon.tsx` | Token icon with initials fallback |
| `src/components/ui/*` | shadcn/ui primitives (Button, Card, Input, Label, Select) |
| `src/lib/prices.ts` | Fetch + dedupe prices, format amounts, conversion math |
| `src/lib/amountInput.ts` | Tolerant amount parser + formatter |
| `src/lib/mockBalance.ts` | Deterministic per-token mock balances and default pair |
| `src/lib/utils.ts` | `cn` class merge helper |
| `src/index.css` | Tailwind v4 entry + theme tokens |
| `vite.config.ts` | Vite, Tailwind plugin, alias `@ → ./src`, prices proxy |
| `tsconfig.json` | TS config (path alias `@/*`) |
| `components.json` | shadcn registry config |

The `@` alias resolves to `./src`, so imports look like `@/components/ui/button` and `@/lib/prices`.

## npm scripts

| Script | Command |
| ------ | ------- |
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |

## Notes and caveats

- This is **front-end only**. There is no wallet integration, no order routing, and the "balance" is a deterministic hash of the currency symbol — purely for UX demonstration.
- Price freshness is whatever the public feed provides; the UI does not auto-refresh.
- The dark theme is hard-coded via `class="dark"` on `<html>`; there is no theme toggle.
