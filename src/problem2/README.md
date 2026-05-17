# Fancy Swap (Problem 2)

A polished currency swap form built with **Vite + React + TypeScript + Tailwind**.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Other scripts

```bash
npm run build      # type-check + production build
npm run preview    # serve the production build locally
npm test           # run the unit tests once
npm run test:watch # vitest in watch mode
```

## Tech

- **Vite 5** — build & dev server
- **React 18 + TypeScript** — UI
- **Tailwind CSS** — styling
- **@headlessui/react** — accessible combobox + dialog primitives for the token picker
- **framer-motion** — flip button + button micro-interactions
- **sonner** — success toast
- **vitest** + **@testing-library/react** + **jsdom** — unit tests

## Manual smoke test

1. Wait for prices to load (1–2 s; you'll see a skeleton card)
2. ETH → USDC are pre-selected. Type `1` in "You pay" → "You receive" auto-fills with the USDC equivalent
3. Click the round flip button between the two fields → values and tokens swap
4. Tap a token pill → searchable picker opens (try typing "USD")
5. Try to swap the same token both sides → see the inline pair error
6. Try a zero / empty amount → button is muted, hover tooltip explains why
7. Click **Confirm Swap** → spinner ~1.5 s → green toast appears at bottom; amounts reset, tokens kept

## Data sources

- Prices: `https://interview.switcheo.com/prices.json` (fetched once, deduped to the most recent entry per symbol; tokens without prices are dropped)
- Token icons: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/<SYMBOL>.svg` (falls back to a gradient initial chip on load failure)

## Spec & plan

See `../../docs/superpowers/specs/2026-05-17-currency-swap-form-design.md` and `../../docs/superpowers/plans/2026-05-17-currency-swap-form.md`.
