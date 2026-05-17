# Currency Swap Form — Design

**Date:** 2026-05-17
**Location:** `code-challenge/src/problem2/`
**Status:** Approved, ready for implementation plan

## Goal

Replace the barebones HTML form template in `code-challenge/src/problem2/` with a polished, "fancy" single-page currency swap form. The form lets a user swap an amount of one token for another, using live USD prices from `https://interview.switcheo.com/prices.json` to compute exchange rates. Token icons come from the Switcheo `token-icons` GitHub repo. Submission is mocked with a loading delay followed by a success toast.

Judging emphasis: usage intuitiveness and visual attractiveness.

## Tech stack

- **Build tool:** Vite (per task instruction)
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Token picker:** `@headlessui/react` Combobox (built-in search, keyboard nav, ARIA)
- **Animation:** `framer-motion` (flip-button rotate, token-picker transitions)
- **Toast:** `sonner` (small, beautiful, accessible)
- **Testing:** `vitest` + `@testing-library/react` for unit-level coverage of pure logic only

No state-management library and no form library — local React state with `useReducer` is sufficient for a form with two inputs.

## Visual design

**Aesthetic:** modern DEX dark glassmorphism (Uniswap/Jupiter family). Dark gradient page background with low-opacity blurred accent blobs, single centered glassy card.

### Palette

| Token | Value |
|---|---|
| `bg-base` | radial gradient `#0a0b1e` → `#1a0b2e` |
| `bg-blob-a` | `#6366f1` @ ~20% opacity, blurred |
| `bg-blob-b` | `#ec4899` @ ~20% opacity, blurred |
| `surface-card` | `rgba(255,255,255,0.04)` with `backdrop-blur-xl` |
| `border-card` | `rgba(255,255,255,0.08)`, 1px |
| `surface-input` | `rgba(255,255,255,0.03)` → `0.06` on focus |
| `text-primary` | `#f8fafc` |
| `text-secondary` | `#94a3b8` |
| `text-muted` | `#64748b` |
| `accent-gradient` | `from-indigo-500 via-purple-500 to-pink-500` |
| `success` | `#10b981` |
| `error` | `#f87171` text, `#ef4444/20` background tint |

### Typography

- Font family: `Inter` (variable) via Google Fonts
- Display weight 600/700 for amounts, 500 for labels, 400 for body text
- Amount inputs are ~2rem (32px), `font-variant-numeric: tabular-nums` so digits don't shift width

### Layout

- Centered card, max-width 480px, padding 24px, `rounded-3xl`
- Two `TokenAmountField` tiles stacked with 8px gap; a circular flip button is absolutely positioned over the gap
- Each field is its own `rounded-2xl` tile with a thin border

### Components

- **Flip button:** 44px circular, dark surface with thin border, rotates 180° on click via framer-motion (0.4s), accent-colored on hover
- **Token picker trigger:** pill-shaped, shows icon + symbol + ▾, hover lifts background opacity
- **Token picker popover:** modal/bottom-sheet on mobile, popover on desktop; sticky search input at top; scrollable list with icon, symbol, and USD price right-aligned; full keyboard nav from Headless UI
- **Submit button:** full-width, 56px tall, accent gradient background (muted when disabled), gentle scale-down on press (0.98), shows spinner + "Swapping…" while submitting
- **Rate summary row:** small monospace text above the submit button, format `1 ETH ≈ 3,200.00 USDC`, with a tiny clock icon + "Updated just now"
- **Toast (sonner):** bottom-center, dark surface, green check, message `Swapped {fromAmount} {fromSymbol} → {toAmount} {toSymbol}`, 4s auto-dismiss

### Responsive

- Mobile (< 480px): card spans full viewport with 16px outer padding; token picker becomes a full-height bottom sheet
- Desktop: card centered, ambient blobs visible behind

### Accessibility

- All interactive elements keyboard-reachable; focus ring is a 2px accent outline with 2px offset (not the default browser ring)
- Color contrast ≥ 4.5:1 for `text-secondary` on `surface-card`
- Token picker uses Headless UI's built-in ARIA combobox roles
- Inline errors associated to inputs via `aria-describedby`
- `prefers-reduced-motion` disables the flip rotate and toast slide

## Architecture

### File structure

```
code-challenge/src/problem2/
├── index.html              # Vite entry, mounts #root
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── README.md               # how to run (npm i && npm run dev)
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx            # React root + <Toaster /> mount
    ├── App.tsx             # page shell, background, mounts <SwapForm />
    ├── index.css           # Tailwind directives + base layer (fonts, scrollbar)
    ├── components/
    │   ├── SwapForm.tsx         # the main card + reducer
    │   ├── TokenAmountField.tsx # one row: label + amount input + token picker + USD value
    │   ├── TokenPicker.tsx      # Headless UI Combobox in a modal/popover
    │   ├── TokenIcon.tsx        # <img> with fallback for missing svg
    │   ├── FlipButton.tsx       # round button between fields, rotate animation
    │   ├── RateSummary.tsx      # "1 ETH ≈ 3,200 USDC" + price freshness
    │   └── SubmitButton.tsx     # gradient button with loading + disabled states
    ├── hooks/
    │   ├── usePrices.ts         # fetch prices.json, dedupe, return Token[]
    │   └── useSwapReducer.ts    # the swap state machine
    ├── lib/
    │   ├── tokens.ts            # Token type, icon URL helper, formatters
    │   ├── swap.ts              # pure conversion math: amountIn → amountOut
    │   └── validation.ts        # validate(state) → { errors, isValid }
    └── types.ts                 # shared TS types
```

### Existing template files

`index.html`, `script.js`, and `style.css` from the original template are removed. The original `index.html` becomes the Vite entry (replaced wholesale, not edited).

## Data layer

### `Token` type

```ts
type Token = {
  symbol: string;   // "ETH", "USDC", ...
  price: number;    // USD per 1 token, from latest entry
  iconUrl: string;  // https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/<SYMBOL>.svg
};
```

### `usePrices()` hook

On mount:

1. `fetch("https://interview.switcheo.com/prices.json")`
2. Group entries by `currency`, keep the one with the latest `date`
3. Drop any entry with a falsy `price`
4. Sort by `symbol` alphabetically
5. Returns `{ tokens: Token[], isLoading: boolean, error: Error | null, retry: () => void }`

If the fetch fails, the form renders a centered error state with a "Retry" button instead of the swap UI. Without prices the form cannot function — no partial UI.

## State machine

### `SwapState`

```ts
type SwapState = {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;     // raw string from input, "" when empty
  toAmount: string;       // computed from fromAmount OR user-typed
  lastEdited: "from" | "to"; // which side drives the conversion
  touched: { from: boolean; to: boolean }; // for on-blur error display
  status: "idle" | "submitting";
};
```

### Actions

```ts
type Action =
  | { type: "SET_FROM_TOKEN"; token: Token }
  | { type: "SET_TO_TOKEN"; token: Token }
  | { type: "SET_FROM_AMOUNT"; value: string }
  | { type: "SET_TO_AMOUNT"; value: string }
  | { type: "BLUR_FROM" }
  | { type: "BLUR_TO" }
  | { type: "FLIP" }
  | { type: "SUBMIT_START" }
  | { type: "RESET" };
```

The toast is a side effect of the submit handler, not a reducer state — there is no dedicated "success" status because no UI references it.

### Two-way binding rule

`lastEdited` tracks which input the user is driving. The *other* input is re-derived on any change to amount or either token.

- User types in From → `lastEdited = "from"`, To auto-fills from `convert(fromAmount, fromPrice, toPrice)`
- User picks a new From token → keep `lastEdited = "from"`, recompute To
- User clicks in To and types → `lastEdited = "to"`, From auto-fills going forward
- `FLIP` swaps `fromToken ↔ toToken` AND swaps `fromAmount ↔ toAmount`. `lastEdited` flips too (`"from" ↔ "to"`)

### Default selection on first load

Pre-select two well-known tokens (try ETH → USDC; fall back to the first two tokens in alphabetical order if either is missing from the price list). The form is never empty.

## Conversion math (`lib/swap.ts`)

```ts
// USD-bridged: amountOut = amountIn * (priceFrom / priceTo)
function convert(amountIn: number, fromPrice: number, toPrice: number): number;
```

Pure, fully unit-tested. Both prices are USD per token, so the rate is `fromPrice / toPrice`.

## Validation (`lib/validation.ts`)

Pure function: `validate(state: SwapState): { errors: Errors; isValid: boolean }`.

| # | Rule | Error message | When shown |
|---|---|---|---|
| 1 | `fromToken` must be set | "Select a token to swap from" | on submit attempt only |
| 2 | `toToken` must be set | "Select a token to receive" | on submit attempt only |
| 3 | `fromToken !== toToken` | "Cannot swap a token for itself" | immediately after picking |
| 4 | `fromAmount` parses to a finite positive number | "Enter an amount greater than 0" | after blur or submit |
| 5 | `fromAmount` ≤ a sensible cap (e.g. 1e15) | "Amount is too large" | after blur |
| 6 | `fromAmount` decimal places ≤ 8 | "Up to 8 decimal places" | live (blocked at input level) |

### Input-level guards (in `TokenAmountField.onChange` before dispatch)

- Strip anything that isn't `[0-9.]`
- Allow only one `.`
- Hard-cap decimals at 8 (slice the string)
- Collapse leading zeros (`0005` → `5`, but `0.5` preserved)

### Submit button enablement

- Disabled when `!isValid` OR `status === "submitting"`
- Disabled state shows a `title` tooltip with the first error (e.g. "Select a token to receive")
- Visually muted (lower opacity, no gradient) when disabled

### Error display

- Inline error in a small red row directly under the offending field
- Token-mismatch (rule 3) shows as a banner below the flip button (relates to both fields)
- Errors clear automatically as the user fixes them — no need to re-blur

## Mock submit flow

The submit handler is an async function on the form:

1. Capture the swap summary `{ fromAmount, fromSymbol, toAmount, toSymbol }` from current state (before reset clears it)
2. Dispatch `SUBMIT_START` → `status = "submitting"`, button shows spinner + "Swapping…", all inputs and pickers disabled
3. `await new Promise(r => setTimeout(r, 1500))`
4. Call `toast.success(...)` with the summary captured in step 1
5. Dispatch `RESET` → clear `fromAmount` / `toAmount`, keep token selections (user is likely to swap more of the same pair), set `status` back to `"idle"`, re-enable inputs
6. Focus returns to the From amount input

**No artificial failures** — happy path only, per design decision.

### Toast content

- Green check icon
- Title: "Swap complete"
- Body: `Swapped {fromAmount} {fromSymbol} → {toAmount} {toSymbol}`, amounts formatted to 6 significant figures
- 4s auto-dismiss, dismissible by click

### Mid-submit edge cases

- If user navigates away mid-submit, no cleanup needed (setTimeout completes locally; nothing to abort)
- Inputs and pickers are disabled while submitting, so the state cannot change underneath

## Testing strategy

Pure logic only; UI is verified manually.

### Unit tests (`vitest`)

- **`lib/swap.ts` — `convert()`**: zero amount, identical prices, fractional prices, very large amounts, very small prices
- **`lib/validation.ts`**: each rule above gets one positive and one negative case
- **`hooks/usePrices.ts`**: given a mocked response with duplicate entries, returns one deduped Token per symbol with the latest price; filters out tokens missing price; surfaces `error` on fetch rejection

### Manual smoke test (documented in README)

1. `npm install` then `npm run dev`
2. Pick ETH in From and USDC in To
3. Type `1` in From → see To populate with the equivalent USDC amount
4. Click flip → fields swap and `lastEdited` flips
5. Click Confirm Swap → spinner for ~1.5s, then green toast, then form resets
6. Try invalid states: same token both sides, zero amount, no tokens selected — confirm errors and disabled button

No component tests and no e2e — disproportionate for a single form.

## Out of scope

Explicitly NOT included (to keep the task focused):

- Wallet connection or balances (no MAX button)
- Slippage tolerance settings
- Price impact warnings
- Swap history
- Multi-hop routing or any real backend
- Price polling / auto-refresh
- Internationalization (English only)
- Theming (dark only)
