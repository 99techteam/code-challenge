# Token Swap Application

## Structure

### 1. Types
**Path:** `src/types/token.type.ts`  
Define interface:
- `TokenPrice`
- `Token`
- `SwapFormData`
- `SwapResult`

---

### 2. API Module
**Path:** `src/apis/token.api.ts`  
- Fetch token prices:  
  `https://interview.switcheo.com/prices.json`
- Generate icon URLs from GitHub repository `https://github.com/Switcheo/token-icons/tree/main/tokens`

---

### 3. Custom Hook – `useTokenPrices`
**Path:** `src/hooks/useTokenPrices.ts`  
- Using **TanStack Query** to fetch & cache data
---

### 4. TokenSelect Component
**Path:** `src/components/TokenSelect/`  
- Dropdown select token includes **search**
- Display **icon token** (includes fallback)
- Animation smooth with **Framer Motion**

---

### 5. SwapForm Component
**Path:** `src/components/SwapForm/`  
- Two-way calculation (FROM ↔ TO)
- Validation with **Yup**:
  - Positive numbers
  - Non-empty numbers
  - Valid format
- Mock loading state (**2s**)
- Display exchange rate
- Swap button to change token positions

---

### 6. Swap Page
**Path:** `src/pages/Swap/`  
- Gradient background
- Responsive layout
- Card-based UI

---
**Installation:**
- Install Node version >=20.0.0
- Install yarn version >= 1.22.21 or npm version >= 10.9.4
- Execution: 
  - `npm install` or `yarn install`
  - `npm run dev` or `yarn dev`
  
**App is running:** `http://localhost:3000/`

