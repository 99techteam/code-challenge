# Problem 2: Currency Swap Form

Form đổi token dùng **Vite** + **React**. Logic viết bằng **TypeScript** (services, hooks, utils, types); UI giữ bằng JSX trong `src/components`.

## Chạy

```bash
cd src/problem2
npm install
npm run dev
```

Mở http://localhost:5173

## Nguồn dữ liệu

- **Giá token:** https://interview.switcheo.com/prices.json  
- **Icon token:** https://github.com/Switcheo/token-icons/tree/main/tokens (vd: SWTH.svg)

---

## Cấu trúc (components, logic = TS)

```
src/
├── components/          # UI (JSX)
│   ├── SwapForm.jsx
│   ├── SwapCard.jsx
│   ├── TokenSelect.jsx
│   ├── TokenIcon.jsx
│   └── SwapFormStyles.jsx
├── hooks/               # Logic (TypeScript)
│   ├── useTokensWithPrices.ts
│   └── useSwapForm.ts
├── services/            # API (TypeScript)
│   └── priceService.ts
├── utils/               # Hàm thuần (TypeScript)
│   ├── tokenIcon.ts
│   ├── exchange.ts
│   └── validation.ts
└── types/               # Định nghĩa type (TypeScript)
    └── index.ts
```

- **Logic (TS):** `types`, `services`, `hooks`, `utils` — toàn bộ file `.ts`.
- **UI (JSX):** `components` — file `.jsx`, chỉ render và nhận props, gọi hooks từ container.
