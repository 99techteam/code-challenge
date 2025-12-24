# 🚀 Fancy Form – Token Swap Interface

A fully-featured **Token Swap Interface** built with **React**, **TypeScript**, **TailwindCSS v4**, and **React Hook Form**.

This project demonstrates a modern, production-ready swap UI including real-time token conversion, slippage handling, fees, validation, and user feedback using precise numerical calculations.

---

## 📸 Screenshot

![Swap UI](/images/screenshot.png)

---

## ✨ Features

### 🔁 Token Swapping

- Swap between tokens with accurate pricing using **BigNumber.js**
- Supports tokens with different decimal places
- Real-time output preview with formatted numbers
- Minimum received calculation based on slippage tolerance

---

### 🧠 Smart Calculations

- Conversion rate (`fromToken → toToken`)
- Real-time output amount updates
- USD value estimation
- Slippage tolerance handling
- Minimum received calculation
- Commission & fee (fixed + percentage)
- Automatic decimal trimming and formatting

---

### 🛡️ Form Validation & UX

- Built with **React Hook Form** and **Zod**
- Numeric input validation with decimal limits
- Prevents invalid or negative values
- Submit button disabled when form is invalid
- Custom **toast notifications** for success and error states

---

### ♻️ Reusable Components

- **AmountPanel** — Token selector + amount input + fiat value
- **TokenSelector** — Token dropdown with icon
- **InfoRow** — Key-value swap information display
- **Button** — Reusable styled button
- **Toast** — Custom toast notifications with icons

---

### 🧰 Utility Functions

- `sanitizeNumericInput()` — Ensures valid numeric string input
- `convertToken()` — Core token conversion logic
- `computeMinReceived()` — Slippage calculation
- `limitDecimals()` — Trim decimals for UI display
- `mapPricesToTokens()` — Map API prices to token dictionary
- `resolveDuplicatedToken()` — Prevent selecting the same token in both fields

---

## 🗂️ Project Structure

```plaintext
src/
 ├─ app/
 │   ├─ App.tsx
 │   ├─ main.tsx
 │   └─ queryClient.ts
 ├─ common/
 │   ├─ components/
 │   │   ├─ Button.tsx
 │   │   ├─ Input.tsx
 │   │   ├─ Select.tsx
 │   │   ├─ Label.tsx
 │   │   └─ TokenIcon.tsx
 │   └─ utils/
 │       ├─ number.ts        # numeric sanitization & formatting
 │       └─ cn.ts            # classNames utility
 ├─ features/
 │   └─ swap/
 │       ├─ SwapPage.tsx
 │       ├─ validation/
 │       │   └─ swapSchema.ts
 │       ├─ hooks/
 │       │   ├─ useSwap.ts
 │       │   └─ useTokenPrices.ts
 │       ├─ services/
 │       │   └─ swapToken.service.ts
 │       ├─ components/
 │       │   ├─ AmountPanel.tsx
 │       │   ├─ InfoRow.tsx
 │       │   └─ TokenSelector.tsx
 │       └─ types.ts
 └─ index.css
```

⚙️ Core Logic
Token Conversion

```ts
const convertToken = (amount: string, fromPrice: number, toPrice: number) => {
  return new BigNumber(amount).multipliedBy(fromPrice).dividedBy(toPrice);
};
```

Slippage & Minimum Received

```ts
const computeMinReceived = (amount: BigNumber, slippagePercent: string) => {
  const slippage = new BigNumber(slippagePercent || 0).dividedBy(100);
  return amount.multipliedBy(new BigNumber(1).minus(slippage));
};
```

Fee & Commission

```ts
const COMMISSION_FIXED = new BigNumber(2.48);
const FEE_PERCENT = new BigNumber(0.003);

const feeAmount = output.multipliedBy(FEE_PERCENT);
const totalExpectedAfterFees =
  output
    .multipliedBy(new BigNumber(1).minus(FEE_PERCENT))
    .minus(COMMISSION_FIXED);
Input Sanitization
ts

import { sanitizeNumericInput } from "@/common/utils/number";

const handleInputChange = (val: string) => {
  field.onChange(sanitizeNumericInput(val));
};
```

Form Validation (Zod)

```ts
import { z } from "zod";

const DECIMAL_LIMIT = 18;
const SLIPPAGE_DECIMAL_LIMIT = 2;

export const swapSchema = z.object({
  fromAmount: z
    .string()
    .refine(
      (val) => /^\d*\.?\d*$/.test(val) && Number(val) >= 0,
      "Invalid number"
    )
    .refine(
      (val) =>
        val.includes(".") ? val.split(".")[1].length <= DECIMAL_LIMIT : true,
      `Max ${DECIMAL_LIMIT} decimals allowed`
    ),
  slippage: z
    .string()
    .refine(
      (val) => /^\d*\.?\d*$/.test(val) && Number(val) >= 0,
      "Invalid number"
    )
    .refine(
      (val) =>
        val.includes(".")
          ? val.split(".")[1].length <= SLIPPAGE_DECIMAL_LIMIT
          : true,
      `Max ${SLIPPAGE_DECIMAL_LIMIT} decimals for slippage`
    ),
});
```

## 🔔 Toast Notifications

- Built with **react-hot-toast**
- Custom success & error styling
- Includes icon, message, and dismiss action

```ts
showToast({
  type: "error",
  message: "Amount must be greater than 0",
});

showToast({
  type: "success",
  message: (
    <>
      <b>1.5 ETH</b> → <b>4500 USDT</b>
    </>
  ),
});
```

🚀 Getting Started

### Prerequisites

Make sure your environment meets the following requirements:

- **Node.js** `>= 20.19+`
- **npm** `>= 10.8+`
  You can check your versions with:
  `node -v
npm -v`

---

### Installation

Install project dependencies:
`npm install`

### Development

Start the development server:
`npm run dev`
Open your browser at:
`http://localhost:5173`

## 📝 Notes

- Token prices are fetched once via `useTokenPrices`
- `fromAmount` and `toAmount` are synchronized in real-time using **BigNumber**
- All numeric inputs are sanitized to prevent invalid characters
- Swap confirmation requires schema validation
- Toast notifications provide instant user feedback

## 🛠️ Tech Stack

- **React**
- **TypeScript**
- **TailwindCSS v4**
- **React Hook Form**
- **Zod**
- **BigNumber.js**
- **React Hot Toast**
