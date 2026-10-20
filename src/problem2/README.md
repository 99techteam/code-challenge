# SwitcheoSwap — Currency Swap Interface (Problem 2)

An intuitive, visually stunning cryptocurrency and token swap interface built with **Vite**, **React 18**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features & Highlights

### 1. Real-Time Price Integration & Deduplication
- Fetches live token prices from `https://interview.switcheo.com/prices.json`.
- Automatically deduplicates token entries by currency symbol, resolving to the most recent timestamp.
- Gracefully filters out tokens without valid pricing data.
- **Offline / CORS Fallback**: Includes a snapshot database (`src/data/defaultPrices.ts`) ensuring the application runs flawlessly even if offline or behind strict network firewalls.

### 2. Rich Token Icons & Fallbacks
- Automatically pulls official vector SVGs from `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/`.
- Built-in fallback system (`TokenIcon.tsx`) rendering stylized gradient badges with initials if an SVG icon is unavailable or fails to load.

### 3. Smart Swap & Bi-directional Calculations
- Live exchange rate calculation: `Rate = Price(From) / Price(To)`.
- Interactive Rate Inversion: Toggle between `1 FROM = X TO` and `1 TO = Y FROM`.
- Live USD conversion indicators displayed below input fields.
- 180° animated token flip button to switch "Pay" and "Receive" tokens smoothly.

### 4. Interactive Validation & UX Feedback
- **Input Sanitization**: Prevents invalid characters, multiple decimal points, or negative numbers.
- **Empty State**: Clear prompt when no amount is specified ("Enter an amount").
- **Balance Validation**: Real-time balance checks against the user's wallet. If the entered amount exceeds balance, the button alerts `Insufficient [TOKEN] balance` and is disabled.
- **Shortcut Percentages**: Quick fill buttons (`25%`, `50%`, `MAX`) based on available wallet balance.
- **Same Token Guard**: Prevents selecting identical tokens for swap.

### 5. Mock Backend & Transaction Simulation
- **Review Modal**: Comprehensive breakdown including guaranteed minimum received, estimated gas fee, and order routing.
- **Multi-stage Progress**: Realistically simulates Web3 transaction lifecycle:
  1. *Approving token allowance...*
  2. *Broadcasting transaction to blockchain...*
  3. *Waiting for block confirmation...*
- **Live Balance Updating**: After a successful swap, the mock wallet balance is updated in real-time (deducting the paid token and adding the received token).
- **Receipt & Explorer Simulation**: Generates a pseudo-random transaction hash (`0x...`) with one-click copy and block explorer link.
- **Error Simulation**: Settings modal includes a toggle to simulate transaction reverts, verifying robust error recovery and retry flows.

### 6. Design & Customization
- **Cyberpunk / Fintech Dark Aesthetic**: Glassmorphism, radiant gradients, ambient glows, and clean typography.
- **Theme Switcher**: Seamless toggle between Dark and Light themes.
- **Settings Modal**: Customize slippage tolerance (`0.1%`, `0.5%`, `1.0%`, or custom %) and transaction deadline.
- **Toast Notifications**: Non-blocking toast alerts for transaction status and price refreshes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
```bash
# Navigate to problem2 directory
cd src/problem2

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:3000` (or the port shown in terminal).

### Production Build
```bash
# Typecheck and build optimized bundle
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Architecture

```
src/problem2/
├── index.html               # Entry HTML
├── package.json             # Scripts & dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS theme & tokens
├── postcss.config.js        # PostCSS configuration
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Application state & layout
│   ├── index.css            # Tailwind directives & keyframe animations
│   ├── types/
│   │   └── swap.ts          # Core TypeScript interfaces
│   ├── data/
│   │   ├── defaultPrices.ts # Fallback token prices snapshot
│   │   └── mockWallet.ts    # Initial mock wallet balance
│   ├── services/
│   │   └── priceService.ts  # Token fetching, deduplication & quotes
│   └── components/
│       ├── Header.tsx           # Branding, wallet info, theme toggle
│       ├── SwapCard.tsx         # Core swap form & flip button
│       ├── TokenInput.tsx       # Numeric input with balance & shortcuts
│       ├── TokenSelectModal.tsx # Searchable token selection modal
│       ├── SwapDetails.tsx      # Exchange rate & slippage breakdown
│       ├── SettingsModal.tsx    # Slippage & test failure settings
│       ├── ConfirmModal.tsx     # Review swap & async progress loader
│       ├── SuccessModal.tsx     # Receipt & transaction hash
│       ├── TokenIcon.tsx        # Token logo with dynamic fallback
│       └── Toast.tsx            # Toast notification container
```

