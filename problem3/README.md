# Currency Swap Form (Problem 3)

This is a production-ready Currency Swap component built with Next.js (App Router), React Hooks, TailwindCSS, Headless UI, and Axios.

## Installation Steps

1. Navigate to the project directory:
   ```bash
   cd problem3
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Spin up the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Explanations

### Architecture & Tech Stack
- **Next.js & App Router**: Clean server/client separation (`layout.tsx`, `page.tsx`).
- **Data Hook (`usePrices`)**: Separates data fetching logic into an isolated custom hook.
- **Components**: Separated into single-responsibility views (`SwapCard` as composer, `TokenSelector` for headless dropdown, `AmountInput` for text logic).
- **Styling**: Tailwind CSS with custom global CSS tokens for dark mode and soft modern glassmorphism UI. Fully responsive.

### 1. How exchange rate is calculated
The exchange rate is computed by dividing the price of the input token by the price of the output token across a common quote currency (USD).
```javascript
rate = price_from / price_to
output_amount = input_amount * rate
```
The value propagates via `React.useMemo` logic to continuously stay updated with precision limits enforced properly.

### 2. How validation works
The submit button evaluates several conditions to become enabled:
- Prices must be fully loaded without network errors.
- Input amount must not be empty or `<= 0`.
- Forms explicitly prohibit swapping between identical tokens (e.g. `ETH` to `ETH`).
- Both `from` and `to` pairs must be selected.
The form leverages debounce techniques inside the `AmountInput` if parent propagation is heavy, but keeps local instant validation regexes (`/^\d*\.?\d*$/`) to gracefully block invalid characters like `e` or `-` at keystroke level. 

### 3. How token filtering works
1. **API Filters**: Retains only tokens that have a strictly positive valid price structure (`price > 0`).
2. **Deduplication**: Since the public API returns duplicates (currencies present on different chains), the hook deduplicates tokens using a JS Map, keeping the first valid instance per symbol.
3. **Selector Search**: The Headless UI Select Combobox uses the user's typed string to natively `.filter()` the available token list in a case-insensitive manner.
4. **Exclusions**: The dropdown filters out the token currently selected in its counterpart, preventing "Same Token" mismatches right at the source dropdown.
