# 💱 Currency Swap Form

An interactive currency swap form built with **React + TypeScript + Vite**, featuring token search, dropdown selection, live price fetching, and responsive UI design.  
This project demonstrates **clean architecture**, **feature-based folder structure**, and **testable components**.

---

## 📂 Project Structure

```bash

src/
├── features/
│   └── swap/
│       ├── components/
│       │   ├── CustomDropdown.tsx   # Main dropdown UI component
│       │   ├── SwapButton.tsx       # Swap button to swap currency
│       │
│       │
│       │
│       ├── hooks/
│       │   ├── useModal.ts          # Generic hook to open/close modal with auto-focus
│       │   ├── useDropdownLogic.ts  # Handles search term, selected token, and dropdown state
│       │   └── useTokenPrices.ts    # Hook fetch & transform token data
│       │
│       ├── types.ts                 # Centralized TypeScript interfaces & types (Token, Balance, etc.)
│       ├── utils.ts                 # Helper functions (price calculation, filtering, sorting)
│       └── __tests__/               # Unit tests for swap feature
│           ├── CustomDropdown.test.tsx
│           ├── useModal.test.ts
│           └── utils.test.ts
│
├── assets/                          # Static files, token icons, images
├── pages/
│   └── CurrencySwapPage.tsx                 # Page-level container rendering SwapForm
│
├── App.tsx
├── main.tsx
└── index.css
```

## 🚀 Getting Started

1️⃣ Install Dependencies
pnpm install

```bash

pnpm install
# or
yarn install
# or
npm install
```

2️⃣ Start Development Server

```bash

pnpm dev
# or
yarn dev
# or
npm run dev
```

Vite will start a local server (usually at http://localhost:5173).

## 🖼️ Token Icons & Prices

-   Token icons are fetched from:
    [Switcheo Token Icons Repo](https://github.com/Switcheo/token-icons/tree/main/tokens)
-   Live price data:
    https://interview.switcheo.com/prices.json
