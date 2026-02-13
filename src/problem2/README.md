# Currency Swap Form

A React + Vite currency swap form that allows users to convert between tokens using real-time price data.

## Tech Stack

- **React 18** + **TypeScript** – UI components
- **Vite 5** – Build tool & dev server
- **Vanilla CSS** – Styling (no Tailwind/CSS-in-JS)

## Features

- **Token selection**: Custom dropdown with search, token icons, and selected state
- **Real-time conversion**: Estimated output amount updates as you type
- **Exchange rate**: Displays "1 FROM ≈ X TO" below the form
- **Max button**: One-click to fill a demo max amount
- **Validation**: Amount must be positive; From and To tokens must differ
- **Swap direction**: One-click button to swap From and To tokens
- **Result modal**: Success/error with swap summary (from/to amounts, rate)
- **Loading**: Skeleton UI while fetching prices
- **Error handling**: Retry button when price fetch fails
- **Last updated**: Relative time since prices were loaded
- **Footer**: Disclaimer and link to price source
- **Responsive**: Mobile-friendly layout
- **Accessibility**: ARIA attributes, keyboard support, screen reader friendly

## Project Structure

```
problem2/
├── index.html           # Vite entry
├── vite.config.ts       # Vite config
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx         # React entry
│   ├── App.tsx
│   ├── index.css        # Global styles
│   ├── types/
│   │   └── index.ts     # Shared types
│   ├── components/
│   │   ├── SwapForm.tsx
│   │   ├── TokenSelector.tsx
│   │   ├── TokenIcon.tsx
│   │   └── ResultModal.tsx
│   ├── hooks/
│   │   └── useTokenPrices.ts
│   └── utils/
│       ├── api.ts
│       ├── validation.ts
│       └── format.ts
└── README.md
```

## How to Run

```bash
npm install
npm run dev
```

Then open http://localhost:5173

**Build for production:**
```bash
npm run build
npm run preview
```

## Data Sources

| Resource | URL |
|----------|-----|
| Token prices | `https://interview.switcheo.com/prices.json` |
| Token icons | `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg` |

- Prices are deduplicated by currency (latest date wins)
- Tokens without valid price data are excluded
- Icons fall back to first letter of symbol if load fails

## Validation Rules

- **Amount**: Must be a positive number
- **Tokens**: From and To must be different
- **When**: Validation messages show only after user input or submit (not on initial load or token change)

## Conversion Formula

```
outputAmount = (inputAmount × fromPrice) / toPrice
```

Prices are in USD; conversion uses them as intermediaries.

## UI Components

- **Token selector**: Custom dropdown with icon, symbol, selected state (checkmark), and custom scrollbar
- **Amount input**: Decimal input with real-time conversion
- **Swap button**: Rotates on hover, swaps From/To tokens
- **Confirm Swap**: Disabled when invalid; shows loading state on submit
- **Modal**: Success/error message; closes via OK, overlay click, or Escape

## Browser Support

Modern browsers with ES6+ and CSS custom properties support (Chrome, Firefox, Safari, Edge).

---

## Screenshots – Các phần đã hoàn thành

> Chụp ảnh màn hình cho từng mục dưới đây để minh họa các tính năng đã implement.

| # | Mục | Mô tả | Screenshot |
|---|-----|-------|------------|
| 1 | Form chính | Giao diện swap form khi load xong, đã chọn token | ![](./screenshots/01-form-main.png) |
| 2 | Token dropdown | Dropdown mở, hiển thị danh sách token với icon | ![](./screenshots/02-token-dropdown.png) |
| 3 | Option đang chọn | Option được chọn có checkmark và highlight | ![](./screenshots/03-selected-option.png) |
| 4 | Real-time conversion | Nhập amount, hiển thị số tiền quy đổi | ![](./screenshots/04-conversion.png) |
| 5 | Nút Swap | Trước/sau khi bấm swap From ↔ To | ![](./screenshots/05-swap-button.png) |
| 6 | Validation | Thông báo lỗi khi amount invalid hoặc trùng token | ![](./screenshots/06-validation.png) |
| 7 | Loading state | Nút Confirm Swap khi đang xử lý | ![](./screenshots/07-loading.png) |
| 8 | Modal thành công | Modal hiển thị sau khi swap thành công | ![](./screenshots/08-modal-success.png) |
| 9 | Responsive | Giao diện trên mobile | ![](./screenshots/09-responsive.png) |

**Cách thêm ảnh:**
1. Tạo thư mục `screenshots/` trong `problem2/`
2. Chụp màn hình và lưu với tên tương ứng (vd: `01-form-main.png`)
3. Ảnh sẽ tự hiển thị trong bảng trên
