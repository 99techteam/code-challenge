# Problem 2: Fancy Form

A fully-featured **Token Swap Interface** built with **React**, **TypeScript**, **TailwindCSS v4**, and custom hooks.  
The UI supports token selection, amount entry, real-time pricing, slippage tolerance, price impact calculation, and swap summaries.

---

## Screenshot

![Swap UI](/images/screenshot.png)

---

## Mock Service Worker (MSW) Cold Start Notice

> **Note:** MSW may experience a **cold start** when first used.  
> This happens because the service worker needs to register and initialize.  
> The first request might be slightly slower, but subsequent requests will be handled normally.

---

## Features

### ✓ Token Swapping

- Converts tokens using accurate pricing formula
- Supports different token decimals
- Live output preview
- Min received calculation (slippage)

### ✓ Smart Calculations

- Conversion Rate
- Output Amount
- USD Value Estimations
- Price Impact
- Slippage
- Minimum Received
- Auto-formatted UI decimals

### ✓ Utility Functions

- `convertToken()` — core conversion
- `limitDecimals()` — trims UI decimals
- `computeMinReceived()` — slippage math
- `computePriceImpact()` — % change detection

### ✓ Tech Stack

- React
- TypeScript
- Tailwind CSS v4
- Custom Hooks:
  - `useSwapCalculator`
  - `useSyncState`
  - `useFetchSuspense`

## Folder Structure

```tsx
src/
 ├─ components/
 │   ├─ SwapForm/
 │   │   ├─ SwapForm.tsx
 │   │   ├─ SwapSummary.tsx
 │   │   └─ TokenSelector.tsx
 │   └─ ui/
 │       └─ LoadingButton.tsx
 ├─ utils/
 │   ├─ converter.ts
 │   ├─ constants.ts
 │   ├─ types.ts
 │   └─ cn.ts
 └─ hooks/
     ├─ useSwapCalculator.ts
     ├─ useSyncState.ts
     └─ useFetchSuspense.ts
```

## Core Formula

Convert Token

```tsx
const convertToken = (amt, fromToken, toToken) => {
  const amountInBase = amt * fromToken.price
  return amountInBase / toToken.price
}
```

Slippage

```tsx
const computeMinReceived = (amount, slippage) => amount * (1 - slippage / 100)
```

Price Impact

```tsx
priceImpact = ((marketRate - swapRate) / marketRate) * 100
```

## Install & Run

1. Install Dependencies

```tsx
yarn install
```

2. Start Dev Server

```tsx
yarn dev
```
