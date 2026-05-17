# Currency Swap Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the barebones HTML form in `code-challenge/src/problem2/` with a polished, dark-glassmorphism currency swap form built with Vite + React + TypeScript + Tailwind. Live exchange rates come from `https://interview.switcheo.com/prices.json`; submission is mocked with a 1.5s delay and a success toast.

**Architecture:** Single-page React app. All swap state lives in a `useReducer` inside `<SwapForm>`. Prices are fetched once on app load by a `usePrices()` hook and deduped to the latest entry per token. Pure logic (`convert`, `validate`) is unit-tested with vitest; components are verified manually.

**Tech Stack:** Vite 5 · React 18 · TypeScript 5 · Tailwind CSS 3 · `@headlessui/react` v2 · `framer-motion` 11 · `sonner` 1.x · `vitest` + `@testing-library/react` + `jsdom`

**Spec:** `docs/superpowers/specs/2026-05-17-currency-swap-form-design.md`

**All paths in this plan are relative to the repo root `code-challenge/`.** Run all `npm` and `npx` commands from `src/problem2/` (the new project root) unless otherwise noted. Run `git` commands from anywhere in the repo.

---

## Task 1: Bootstrap Vite + React + TypeScript project

**Files:**
- Delete: `src/problem2/index.html`, `src/problem2/script.js`, `src/problem2/style.css`
- Create: `src/problem2/package.json`, `src/problem2/vite.config.ts`, `src/problem2/tsconfig.json`, `src/problem2/tsconfig.node.json`, `src/problem2/index.html`, `src/problem2/.gitignore`
- Create: `src/problem2/src/main.tsx`, `src/problem2/src/App.tsx`, `src/problem2/src/index.css`
- Create: `src/problem2/public/favicon.svg`

- [ ] **Step 1: Delete the template files**

```bash
rm src/problem2/index.html src/problem2/script.js src/problem2/style.css
```

- [ ] **Step 2: Create `src/problem2/package.json`**

```json
{
  "name": "fancy-swap-form",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 3: Create `src/problem2/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `src/problem2/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create `src/problem2/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create `src/problem2/.gitignore`**

```
node_modules
dist
.DS_Store
.vite
*.local
.env*
coverage
```

- [ ] **Step 7: Create `src/problem2/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fancy Swap</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/problem2/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="0.5" stop-color="#a855f7"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><path d="M10 12 L22 12 L19 9 M22 20 L10 20 L13 23" stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

- [ ] **Step 9: Create placeholder `src/problem2/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 10: Create placeholder `src/problem2/src/App.tsx`**

```tsx
export default function App() {
  return <div className="p-8 text-white">Fancy Swap — bootstrap OK</div>;
}
```

- [ ] **Step 11: Create placeholder `src/problem2/src/index.css`**

```css
body {
  margin: 0;
  background: #0a0b1e;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 12: Install and verify the dev server starts**

```bash
cd src/problem2 && npm install && npm run dev
```

Expected: Vite prints `VITE v5.x.x  ready in ...` and a local URL. Open the URL in a browser — should see "Fancy Swap — bootstrap OK" on a dark background. Stop the server with Ctrl-C.

- [ ] **Step 13: Commit**

```bash
git add src/problem2/.gitignore src/problem2/package.json src/problem2/vite.config.ts src/problem2/tsconfig.json src/problem2/tsconfig.node.json src/problem2/index.html src/problem2/public src/problem2/src
git commit -m "chore(problem2): bootstrap Vite + React + TS project"
```

Do **not** add `node_modules/`. Verify with `git status` — only the files listed above should be staged.

---

## Task 2: Install runtime deps and configure Tailwind theme

**Files:**
- Create: `src/problem2/tailwind.config.ts`, `src/problem2/postcss.config.js`
- Modify: `src/problem2/package.json` (dependencies), `src/problem2/src/index.css` (Tailwind directives + base layer)

- [ ] **Step 1: Install runtime + Tailwind dependencies**

```bash
cd src/problem2 && npm install @headlessui/react@^2.1.0 framer-motion@^11.3.0 sonner@^1.5.0 && npm install -D tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```

Expected: `package.json` updated, no errors.

- [ ] **Step 2: Create `src/problem2/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create `src/problem2/tailwind.config.ts` with the spec's palette**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          card: "rgba(255, 255, 255, 0.04)",
          input: "rgba(255, 255, 255, 0.03)",
          "input-focus": "rgba(255, 255, 255, 0.06)",
        },
        border: {
          card: "rgba(255, 255, 255, 0.08)",
        },
        ink: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        accent: {
          start: "#6366f1",
          mid: "#a855f7",
          end: "#ec4899",
        },
        success: "#10b981",
        error: "#f87171",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
        "page-radial":
          "radial-gradient(ellipse at top left, #1a0b2e 0%, #0a0b1e 60%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Replace `src/problem2/src/index.css` with Tailwind directives + base styles**

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    min-height: 100%;
  }
  body {
    @apply font-sans text-ink-primary bg-page-radial bg-fixed antialiased;
    font-feature-settings: "cv11", "ss01";
  }
  /* Subtle dark scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

@layer utilities {
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
  .focus-ring {
    @apply outline-none focus-visible:ring-2 focus-visible:ring-accent-mid focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b1e];
  }
}
```

- [ ] **Step 5: Update `src/problem2/src/App.tsx` to verify Tailwind works**

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-3xl border border-border-card bg-surface-card backdrop-blur-xl p-6 text-ink-primary">
        Tailwind + dark theme OK
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify visually**

```bash
cd src/problem2 && npm run dev
```

Expected: a glassy translucent card centered on a dark gradient. Stop with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add src/problem2/package.json src/problem2/package-lock.json src/problem2/tailwind.config.ts src/problem2/postcss.config.js src/problem2/src/index.css src/problem2/src/App.tsx
git commit -m "chore(problem2): install runtime deps and configure Tailwind theme"
```

---

## Task 3: Set up vitest + Testing Library

**Files:**
- Modify: `src/problem2/package.json` (devDependencies)
- Modify: `src/problem2/vite.config.ts` (add test config + JSDOM)
- Create: `src/problem2/src/test/setup.ts`
- Create: `src/problem2/src/test/smoke.test.ts` (sanity test, deleted at end of this task)

- [ ] **Step 1: Install test deps**

```bash
cd src/problem2 && npm install -D vitest@^2.0.0 jsdom@^25.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.4.0 @testing-library/user-event@^14.5.0
```

- [ ] **Step 2: Replace `src/problem2/vite.config.ts` with test-enabled config**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

- [ ] **Step 3: Add vitest globals to TypeScript types — edit `src/problem2/tsconfig.json`**

Find `"types": ["vite/client"]` and change it to:

```json
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

- [ ] **Step 4: Create `src/problem2/src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Write a smoke test to verify the runner works — create `src/problem2/src/test/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("vitest smoke", () => {
  it("can run a trivial assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the smoke test**

```bash
cd src/problem2 && npm test
```

Expected: vitest reports `1 passed`. If it fails, fix config before continuing.

- [ ] **Step 7: Delete the smoke test (we keep only meaningful tests)**

```bash
rm src/problem2/src/test/smoke.test.ts
```

- [ ] **Step 8: Commit**

```bash
git add src/problem2/package.json src/problem2/package-lock.json src/problem2/vite.config.ts src/problem2/tsconfig.json src/problem2/src/test
git commit -m "chore(problem2): set up vitest + testing-library + jsdom"
```

---

## Task 4: Define shared types and token helpers

**Files:**
- Create: `src/problem2/src/types.ts`
- Create: `src/problem2/src/lib/tokens.ts`

No tests in this task — these are types and pure deterministic formatters. They will be exercised by tests in later tasks.

- [ ] **Step 1: Create `src/problem2/src/types.ts`**

```ts
export type Token = {
  symbol: string;   // "ETH", "USDC", ...
  price: number;    // USD per 1 token
  iconUrl: string;  // remote SVG URL
};

export type PriceEntry = {
  currency: string;
  date: string;     // ISO 8601
  price: number;
};

export type SwapState = {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  lastEdited: "from" | "to";
  touched: { from: boolean; to: boolean };
  status: "idle" | "submitting";
};

export type ValidationErrors = {
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  pair?: string;
};

export type ValidationResult = {
  errors: ValidationErrors;
  isValid: boolean;
  firstError: string | null;
};
```

- [ ] **Step 2: Create `src/problem2/src/lib/tokens.ts`**

```ts
const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`;
}

/**
 * Format a number for display in the amount input. Strips trailing zeros,
 * caps at 8 decimal places, no thousands separators (so the value can be
 * round-tripped through parseFloat).
 */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "0";
  const fixed = n.toFixed(8);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/** Format a USD value: $3,200.00 */
export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

/** Format a rate / display number with thousands separators, 6 sig figs. */
export function formatDisplayNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 6,
    useGrouping: true,
  }).format(n);
}

/**
 * Sanitize a raw user-typed amount string:
 * - keep only digits and one decimal point
 * - cap to 8 decimal places
 * - collapse leading zeros ("0005" -> "5", "0.5" preserved)
 */
export function sanitizeAmount(raw: string): string {
  // Strip everything except digits and dots
  let s = raw.replace(/[^0-9.]/g, "");
  // Keep only first dot
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  // Cap to 8 decimal places
  const dot = s.indexOf(".");
  if (dot !== -1 && s.length - dot - 1 > 8) {
    s = s.slice(0, dot + 1 + 8);
  }
  // Collapse leading zeros: "0005" -> "5", but keep "0.5" and "0"
  if (s.length > 1 && s[0] === "0" && s[1] !== ".") {
    s = s.replace(/^0+/, "");
    if (s === "" || s.startsWith(".")) s = "0" + s;
  }
  return s;
}
```

- [ ] **Step 3: Commit (no tests yet — sanitize gets tested in Task 6 via TokenAmountField behavior; formatters are obviously correct and used everywhere)**

Actually — `sanitizeAmount` has enough branches to deserve unit tests. Add them now:

Create `src/problem2/src/lib/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sanitizeAmount, formatAmount, formatUsd, formatDisplayNumber } from "./tokens";

describe("sanitizeAmount", () => {
  it("keeps a plain integer", () => {
    expect(sanitizeAmount("123")).toBe("123");
  });
  it("keeps one decimal point", () => {
    expect(sanitizeAmount("1.5")).toBe("1.5");
  });
  it("strips non-numeric characters", () => {
    expect(sanitizeAmount("1a2b3c")).toBe("123");
  });
  it("collapses repeated decimal points", () => {
    expect(sanitizeAmount("1.2.3")).toBe("1.23");
  });
  it("caps at 8 decimal places", () => {
    expect(sanitizeAmount("0.123456789012")).toBe("0.12345678");
  });
  it("strips leading zeros from integers", () => {
    expect(sanitizeAmount("0005")).toBe("5");
  });
  it("preserves 0.5", () => {
    expect(sanitizeAmount("0.5")).toBe("0.5");
  });
  it("preserves a lone 0", () => {
    expect(sanitizeAmount("0")).toBe("0");
  });
  it("rewrites a leading dot to 0.", () => {
    expect(sanitizeAmount(".5")).toBe("0.5");
  });
  it("handles empty input", () => {
    expect(sanitizeAmount("")).toBe("");
  });
});

describe("formatAmount", () => {
  it("returns '0' for zero", () => {
    expect(formatAmount(0)).toBe("0");
  });
  it("returns '0' for NaN", () => {
    expect(formatAmount(NaN)).toBe("0");
  });
  it("strips trailing zeros", () => {
    expect(formatAmount(1.5)).toBe("1.5");
    expect(formatAmount(3200)).toBe("3200");
  });
  it("respects 8 decimal cap", () => {
    expect(formatAmount(0.123456789)).toBe("0.12345679");
  });
});

describe("formatUsd", () => {
  it("formats with $ and two decimals", () => {
    expect(formatUsd(3200)).toBe("$3,200.00");
  });
});

describe("formatDisplayNumber", () => {
  it("groups thousands", () => {
    expect(formatDisplayNumber(3200)).toBe("3,200");
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd src/problem2 && npm test
```

Expected: all tests pass (lone-dot test will fail before fix below if `sanitizeAmount` doesn't handle it — that's the TDD signal).

If the `.5` test fails because the implementation produces `.5` instead of `0.5`, fix `sanitizeAmount` so a leading dot gets prefixed with `0`:

After the leading-zero block, add this guard at the top of the function (right after the first dot handling):

```ts
// Rewrite leading "." to "0."
if (s.startsWith(".")) s = "0" + s;
```

Then re-run tests to verify all pass.

- [ ] **Step 5: Commit**

```bash
git add src/problem2/src/types.ts src/problem2/src/lib/tokens.ts src/problem2/src/lib/tokens.test.ts
git commit -m "feat(problem2): add shared types and token helper functions"
```

---

## Task 5: Implement `lib/swap.ts` (TDD)

**Files:**
- Create: `src/problem2/src/lib/swap.ts`
- Create: `src/problem2/src/lib/swap.test.ts`

- [ ] **Step 1: Write the failing test — create `src/problem2/src/lib/swap.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { convert } from "./swap";

describe("convert", () => {
  it("returns 0 for zero amountIn", () => {
    expect(convert(0, 1, 1)).toBe(0);
  });

  it("returns the same amount when prices are identical", () => {
    expect(convert(1.5, 100, 100)).toBe(1.5);
  });

  it("converts 1 ETH at $3200 to 3200 USDC at $1", () => {
    expect(convert(1, 3200, 1)).toBe(3200);
  });

  it("converts 3200 USDC at $1 to 1 ETH at $3200", () => {
    expect(convert(3200, 1, 3200)).toBe(1);
  });

  it("handles fractional prices", () => {
    // 100 BLUR at $0.2 -> USD value 20, target token at $2 -> 10 of target
    expect(convert(100, 0.2, 2)).toBe(10);
  });

  it("returns 0 when toPrice is 0 or invalid (guard)", () => {
    expect(convert(10, 1, 0)).toBe(0);
    expect(convert(10, 1, NaN)).toBe(0);
  });

  it("returns 0 when amountIn or fromPrice is invalid", () => {
    expect(convert(NaN, 1, 1)).toBe(0);
    expect(convert(10, NaN, 1)).toBe(0);
  });

  it("handles very large values without overflow", () => {
    expect(convert(1e10, 3200, 1)).toBe(3.2e13);
  });

  it("handles very small values", () => {
    expect(convert(1e-6, 3200, 1)).toBeCloseTo(3.2e-3, 10);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd src/problem2 && npm test -- swap
```

Expected: tests fail with "Cannot find module './swap'" or similar.

- [ ] **Step 3: Implement `src/problem2/src/lib/swap.ts`**

```ts
/**
 * Convert an amount of one token to its USD-equivalent amount of another token.
 *
 * Both prices are USD per 1 token. The rate is fromPrice / toPrice.
 * Returns 0 for any non-finite or zero-denominator input — callers display "0"
 * in the receive field in that case, which is the right user-facing behavior.
 */
export function convert(
  amountIn: number,
  fromPrice: number,
  toPrice: number,
): number {
  if (
    !Number.isFinite(amountIn) ||
    !Number.isFinite(fromPrice) ||
    !Number.isFinite(toPrice) ||
    toPrice === 0
  ) {
    return 0;
  }
  return amountIn * (fromPrice / toPrice);
}
```

- [ ] **Step 4: Run test, verify all pass**

```bash
cd src/problem2 && npm test -- swap
```

Expected: all 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/problem2/src/lib/swap.ts src/problem2/src/lib/swap.test.ts
git commit -m "feat(problem2): add convert() with USD-bridged exchange math"
```

---

## Task 6: Implement `lib/validation.ts` (TDD)

**Files:**
- Create: `src/problem2/src/lib/validation.ts`
- Create: `src/problem2/src/lib/validation.test.ts`

- [ ] **Step 1: Write the failing test — create `src/problem2/src/lib/validation.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { validate } from "./validation";
import type { SwapState, Token } from "../types";

const ETH: Token = { symbol: "ETH", price: 3200, iconUrl: "" };
const USDC: Token = { symbol: "USDC", price: 1, iconUrl: "" };

function state(overrides: Partial<SwapState> = {}): SwapState {
  return {
    fromToken: ETH,
    toToken: USDC,
    fromAmount: "1",
    toAmount: "3200",
    lastEdited: "from",
    touched: { from: true, to: true },
    status: "idle",
    ...overrides,
  };
}

describe("validate", () => {
  it("returns valid for a well-formed state", () => {
    const r = validate(state());
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual({});
    expect(r.firstError).toBeNull();
  });

  it("flags missing fromToken", () => {
    const r = validate(state({ fromToken: null }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromToken).toMatch(/select a token/i);
  });

  it("flags missing toToken", () => {
    const r = validate(state({ toToken: null }));
    expect(r.isValid).toBe(false);
    expect(r.errors.toToken).toMatch(/select a token/i);
  });

  it("flags identical tokens", () => {
    const r = validate(state({ toToken: ETH }));
    expect(r.isValid).toBe(false);
    expect(r.errors.pair).toMatch(/cannot swap a token for itself/i);
  });

  it("flags empty amount", () => {
    const r = validate(state({ fromAmount: "" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags zero amount", () => {
    const r = validate(state({ fromAmount: "0" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags non-numeric amount", () => {
    const r = validate(state({ fromAmount: "abc" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags absurdly large amount", () => {
    const r = validate(state({ fromAmount: "1e16" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/too large/i);
  });

  it("firstError returns the first non-empty error", () => {
    const r = validate(state({ fromToken: null, fromAmount: "" }));
    expect(r.firstError).toMatch(/select a token/i);
  });

  it("validates the To side when lastEdited is 'to'", () => {
    // When lastEdited is "to", the user is driving from the To side.
    // The "amount" rule applies to the side the user typed in.
    const r = validate(
      state({
        fromAmount: "0",
        toAmount: "0",
        lastEdited: "to",
      }),
    );
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
    // Same rule, same error key — the form still won't submit
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd src/problem2 && npm test -- validation
```

Expected: failure.

- [ ] **Step 3: Implement `src/problem2/src/lib/validation.ts`**

```ts
import type { SwapState, ValidationResult, ValidationErrors } from "../types";

const MAX_AMOUNT = 1e15;

export function validate(state: SwapState): ValidationResult {
  const errors: ValidationErrors = {};

  if (!state.fromToken) {
    errors.fromToken = "Select a token to swap from";
  }
  if (!state.toToken) {
    errors.toToken = "Select a token to receive";
  }
  if (
    state.fromToken &&
    state.toToken &&
    state.fromToken.symbol === state.toToken.symbol
  ) {
    errors.pair = "Cannot swap a token for itself";
  }

  // The "driving" amount is whichever side the user last typed in
  const driverRaw =
    state.lastEdited === "from" ? state.fromAmount : state.toAmount;
  const driverNum = parseFloat(driverRaw);

  if (
    driverRaw.trim() === "" ||
    !Number.isFinite(driverNum) ||
    driverNum <= 0
  ) {
    errors.fromAmount = "Enter an amount greater than 0";
  } else if (driverNum > MAX_AMOUNT) {
    errors.fromAmount = "Amount is too large";
  }

  // firstError follows display priority: pair > tokens > amount
  const order: (keyof ValidationErrors)[] = [
    "pair",
    "fromToken",
    "toToken",
    "fromAmount",
  ];
  const firstKey = order.find((k) => errors[k]);
  const firstError = firstKey ? errors[firstKey]! : null;

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstError,
  };
}
```

- [ ] **Step 4: Run tests, verify all pass**

```bash
cd src/problem2 && npm test -- validation
```

Expected: all 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/problem2/src/lib/validation.ts src/problem2/src/lib/validation.test.ts
git commit -m "feat(problem2): add validate() for swap form state"
```

---

## Task 7: Implement `hooks/usePrices.ts` (TDD with mocked fetch)

**Files:**
- Create: `src/problem2/src/hooks/usePrices.ts`
- Create: `src/problem2/src/hooks/usePrices.test.ts`

- [ ] **Step 1: Write the failing test — create `src/problem2/src/hooks/usePrices.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrices } from "./usePrices";

const SAMPLE = [
  // Duplicate currency: older entry, then newer entry. Newer should win.
  { currency: "BUSD", date: "2023-08-29T07:10:40.000Z", price: 0.999 },
  { currency: "BUSD", date: "2023-08-29T07:11:40.000Z", price: 1.001 },
  // Single entries
  { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.93 },
  { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 1 },
  // No price -> dropped
  { currency: "BROKEN", date: "2023-08-29T07:10:40.000Z", price: 0 },
  { currency: "NULLY", date: "2023-08-29T07:10:40.000Z", price: null },
];

describe("usePrices", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE),
        } as Response),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => usePrices());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.tokens).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("returns deduped tokens sorted by symbol after fetch resolves", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const symbols = result.current.tokens.map((t) => t.symbol);
    expect(symbols).toEqual(["BUSD", "ETH", "USDC"]);

    const busd = result.current.tokens.find((t) => t.symbol === "BUSD")!;
    expect(busd.price).toBe(1.001); // newer entry won
  });

  it("attaches an icon URL to each token", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const eth = result.current.tokens.find((t) => t.symbol === "ETH")!;
    expect(eth.iconUrl).toBe(
      "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg",
    );
  });

  it("filters out tokens with falsy or non-finite prices", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const symbols = result.current.tokens.map((t) => t.symbol);
    expect(symbols).not.toContain("BROKEN");
    expect(symbols).not.toContain("NULLY");
  });

  it("surfaces a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.tokens).toEqual([]);
  });

  it("retry() re-runs the fetch", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        calls += 1;
        if (calls === 1) return Promise.reject(new Error("offline"));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE),
        } as Response);
      }),
    );
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);

    result.current.retry();
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.tokens.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd src/problem2 && npm test -- usePrices
```

Expected: failure (no module yet).

- [ ] **Step 3: Implement `src/problem2/src/hooks/usePrices.ts`**

```ts
import { useCallback, useEffect, useState } from "react";
import type { PriceEntry, Token } from "../types";
import { iconUrlFor } from "../lib/tokens";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

type UsePricesResult = {
  tokens: Token[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
};

function dedupe(entries: PriceEntry[]): Token[] {
  const latest = new Map<string, PriceEntry>();
  for (const e of entries) {
    if (!e || !e.currency) continue;
    if (typeof e.price !== "number" || !Number.isFinite(e.price) || e.price <= 0) continue;
    const existing = latest.get(e.currency);
    if (!existing || new Date(e.date).getTime() > new Date(existing.date).getTime()) {
      latest.set(e.currency, e);
    }
  }
  return Array.from(latest.values())
    .sort((a, b) => a.currency.localeCompare(b.currency))
    .map<Token>((e) => ({
      symbol: e.currency,
      price: e.price,
      iconUrl: iconUrlFor(e.currency),
    }));
}

export function usePrices(): UsePricesResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(PRICES_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PriceEntry[]) => {
        if (cancelled) return;
        setTokens(dedupe(data));
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setTokens([]);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { tokens, isLoading, error, retry };
}
```

- [ ] **Step 4: Run tests, verify all pass**

```bash
cd src/problem2 && npm test -- usePrices
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/problem2/src/hooks/usePrices.ts src/problem2/src/hooks/usePrices.test.ts
git commit -m "feat(problem2): add usePrices hook with dedupe and retry"
```

---

## Task 8: Implement `hooks/useSwapReducer.ts` (TDD)

**Files:**
- Create: `src/problem2/src/hooks/useSwapReducer.ts`
- Create: `src/problem2/src/hooks/useSwapReducer.test.ts`

This is the trickiest piece of pure logic. Tests come first.

- [ ] **Step 1: Write the failing test — create `src/problem2/src/hooks/useSwapReducer.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { swapReducer, initialSwapState } from "./useSwapReducer";
import type { Token } from "../types";

const ETH: Token = { symbol: "ETH", price: 3200, iconUrl: "" };
const USDC: Token = { symbol: "USDC", price: 1, iconUrl: "" };
const BTC: Token = { symbol: "BTC", price: 60000, iconUrl: "" };

const start = initialSwapState(ETH, USDC);

describe("swapReducer", () => {
  describe("initialSwapState", () => {
    it("pre-fills tokens when both provided", () => {
      expect(start.fromToken).toBe(ETH);
      expect(start.toToken).toBe(USDC);
      expect(start.fromAmount).toBe("");
      expect(start.toAmount).toBe("");
      expect(start.lastEdited).toBe("from");
      expect(start.status).toBe("idle");
      expect(start.touched).toEqual({ from: false, to: false });
    });

    it("handles missing default tokens", () => {
      const s = initialSwapState(null, null);
      expect(s.fromToken).toBeNull();
      expect(s.toToken).toBeNull();
    });
  });

  describe("SET_FROM_AMOUNT", () => {
    it("sets fromAmount and recomputes toAmount", () => {
      const s = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      expect(s.fromAmount).toBe("1");
      expect(s.toAmount).toBe("3200");
      expect(s.lastEdited).toBe("from");
    });

    it("clears toAmount when fromAmount is empty", () => {
      const s = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "" });
      expect(s.fromAmount).toBe("");
      expect(s.toAmount).toBe("");
    });
  });

  describe("SET_TO_AMOUNT", () => {
    it("sets toAmount and recomputes fromAmount, flips lastEdited", () => {
      const s = swapReducer(start, { type: "SET_TO_AMOUNT", value: "3200" });
      expect(s.toAmount).toBe("3200");
      expect(s.fromAmount).toBe("1");
      expect(s.lastEdited).toBe("to");
    });
  });

  describe("SET_FROM_TOKEN", () => {
    it("changes fromToken and re-derives the non-driven side", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      // seeded: 1 ETH -> 3200 USDC, lastEdited = "from"
      const s = swapReducer(seeded, { type: "SET_FROM_TOKEN", token: BTC });
      // Now driving 1 BTC -> ? USDC
      expect(s.fromToken).toBe(BTC);
      expect(s.fromAmount).toBe("1");
      expect(s.toAmount).toBe("60000");
    });

    it("when lastEdited='to', re-derives fromAmount instead", () => {
      const seeded = swapReducer(start, { type: "SET_TO_AMOUNT", value: "60000" });
      // seeded: 18.75 ETH -> 60000 USDC, lastEdited = "to"
      const s = swapReducer(seeded, { type: "SET_FROM_TOKEN", token: BTC });
      // Driving 60000 USDC -> 1 BTC
      expect(s.toAmount).toBe("60000");
      expect(s.fromAmount).toBe("1");
    });
  });

  describe("FLIP", () => {
    it("swaps tokens, amounts, and lastEdited", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      const s = swapReducer(seeded, { type: "FLIP" });
      expect(s.fromToken).toBe(USDC);
      expect(s.toToken).toBe(ETH);
      expect(s.fromAmount).toBe("3200");
      expect(s.toAmount).toBe("1");
      expect(s.lastEdited).toBe("to");
    });
  });

  describe("BLUR_FROM / BLUR_TO", () => {
    it("marks touched.from on BLUR_FROM", () => {
      const s = swapReducer(start, { type: "BLUR_FROM" });
      expect(s.touched.from).toBe(true);
      expect(s.touched.to).toBe(false);
    });
    it("marks touched.to on BLUR_TO", () => {
      const s = swapReducer(start, { type: "BLUR_TO" });
      expect(s.touched.to).toBe(true);
    });
  });

  describe("SUBMIT_START / RESET", () => {
    it("SUBMIT_START sets status to submitting", () => {
      const s = swapReducer(start, { type: "SUBMIT_START" });
      expect(s.status).toBe("submitting");
    });

    it("RESET clears amounts but keeps token selections", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      const submitted = swapReducer(seeded, { type: "SUBMIT_START" });
      const s = swapReducer(submitted, { type: "RESET" });
      expect(s.fromAmount).toBe("");
      expect(s.toAmount).toBe("");
      expect(s.fromToken).toBe(ETH);
      expect(s.toToken).toBe(USDC);
      expect(s.status).toBe("idle");
      expect(s.touched).toEqual({ from: false, to: false });
    });
  });

  describe("SET_TO_TOKEN when one token is null", () => {
    it("derives nothing if other side is missing", () => {
      const empty = initialSwapState(null, null);
      const s1 = swapReducer(empty, { type: "SET_FROM_AMOUNT", value: "1" });
      expect(s1.fromAmount).toBe("1");
      expect(s1.toAmount).toBe("");
      const s2 = swapReducer(s1, { type: "SET_FROM_TOKEN", token: ETH });
      // Still no toToken, so toAmount stays ""
      expect(s2.toAmount).toBe("");
    });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd src/problem2 && npm test -- useSwapReducer
```

Expected: failure (no module).

- [ ] **Step 3: Implement `src/problem2/src/hooks/useSwapReducer.ts`**

```ts
import { useReducer } from "react";
import type { SwapState, Token } from "../types";
import { convert } from "../lib/swap";
import { formatAmount, sanitizeAmount } from "../lib/tokens";

export type SwapAction =
  | { type: "SET_FROM_TOKEN"; token: Token }
  | { type: "SET_TO_TOKEN"; token: Token }
  | { type: "SET_FROM_AMOUNT"; value: string }
  | { type: "SET_TO_AMOUNT"; value: string }
  | { type: "BLUR_FROM" }
  | { type: "BLUR_TO" }
  | { type: "FLIP" }
  | { type: "SUBMIT_START" }
  | { type: "RESET" };

export function initialSwapState(
  fromToken: Token | null,
  toToken: Token | null,
): SwapState {
  return {
    fromToken,
    toToken,
    fromAmount: "",
    toAmount: "",
    lastEdited: "from",
    touched: { from: false, to: false },
    status: "idle",
  };
}

/**
 * Re-derive the non-driven side from the driving side.
 * Returns the next { fromAmount, toAmount } pair.
 */
function rederive(s: SwapState): { fromAmount: string; toAmount: string } {
  const { fromToken, toToken, fromAmount, toAmount, lastEdited } = s;

  if (lastEdited === "from") {
    if (!fromToken || !toToken || fromAmount === "") {
      return { fromAmount, toAmount: "" };
    }
    const n = parseFloat(fromAmount);
    if (!Number.isFinite(n) || n === 0) {
      return { fromAmount, toAmount: "0" };
    }
    const out = convert(n, fromToken.price, toToken.price);
    return { fromAmount, toAmount: formatAmount(out) };
  } else {
    if (!fromToken || !toToken || toAmount === "") {
      return { fromAmount: "", toAmount };
    }
    const n = parseFloat(toAmount);
    if (!Number.isFinite(n) || n === 0) {
      return { fromAmount: "0", toAmount };
    }
    const out = convert(n, toToken.price, fromToken.price);
    return { fromAmount: formatAmount(out), toAmount };
  }
}

export function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case "SET_FROM_AMOUNT": {
      const value = sanitizeAmount(action.value);
      const next: SwapState = {
        ...state,
        fromAmount: value,
        lastEdited: "from",
      };
      const { toAmount } = rederive(next);
      return { ...next, toAmount };
    }
    case "SET_TO_AMOUNT": {
      const value = sanitizeAmount(action.value);
      const next: SwapState = {
        ...state,
        toAmount: value,
        lastEdited: "to",
      };
      const { fromAmount } = rederive(next);
      return { ...next, fromAmount };
    }
    case "SET_FROM_TOKEN": {
      const next: SwapState = { ...state, fromToken: action.token };
      const { fromAmount, toAmount } = rederive(next);
      return { ...next, fromAmount, toAmount };
    }
    case "SET_TO_TOKEN": {
      const next: SwapState = { ...state, toToken: action.token };
      const { fromAmount, toAmount } = rederive(next);
      return { ...next, fromAmount, toAmount };
    }
    case "FLIP": {
      return {
        ...state,
        fromToken: state.toToken,
        toToken: state.fromToken,
        fromAmount: state.toAmount,
        toAmount: state.fromAmount,
        lastEdited: state.lastEdited === "from" ? "to" : "from",
      };
    }
    case "BLUR_FROM":
      return { ...state, touched: { ...state.touched, from: true } };
    case "BLUR_TO":
      return { ...state, touched: { ...state.touched, to: true } };
    case "SUBMIT_START":
      return { ...state, status: "submitting" };
    case "RESET":
      return {
        ...state,
        fromAmount: "",
        toAmount: "",
        touched: { from: false, to: false },
        status: "idle",
      };
    default:
      return state;
  }
}

export function useSwapReducer(
  fromToken: Token | null,
  toToken: Token | null,
) {
  return useReducer(swapReducer, initialSwapState(fromToken, toToken));
}
```

- [ ] **Step 4: Run tests, verify all pass**

```bash
cd src/problem2 && npm test -- useSwapReducer
```

Expected: all tests pass. If the FLIP test fails because `lastEdited` doesn't flip correctly, re-check the case — it should be `state.lastEdited === "from" ? "to" : "from"`.

- [ ] **Step 5: Run the full test suite**

```bash
cd src/problem2 && npm test
```

Expected: all suites pass (tokens, swap, validation, usePrices, useSwapReducer).

- [ ] **Step 6: Commit**

```bash
git add src/problem2/src/hooks/useSwapReducer.ts src/problem2/src/hooks/useSwapReducer.test.ts
git commit -m "feat(problem2): add useSwapReducer with two-way binding"
```

---

## Task 9: Build `TokenIcon` and `FlipButton` components

**Files:**
- Create: `src/problem2/src/components/TokenIcon.tsx`
- Create: `src/problem2/src/components/FlipButton.tsx`

No unit tests — these are display components verified visually in Task 14.

- [ ] **Step 1: Create `src/problem2/src/components/TokenIcon.tsx`**

```tsx
import { useState } from "react";

type Props = {
  symbol: string;
  src: string;
  size?: number;
  className?: string;
};

export function TokenIcon({ symbol, src, size = 28, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = symbol.slice(0, 1).toUpperCase();

  if (failed) {
    return (
      <span
        aria-label={symbol}
        className={`inline-flex items-center justify-center rounded-full bg-accent-gradient text-[10px] font-semibold text-white ${className}`}
        style={{ width: size, height: size }}
      >
        {initial}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full bg-white/5 ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
```

- [ ] **Step 2: Create `src/problem2/src/components/FlipButton.tsx`**

```tsx
import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function FlipButton({ onClick, disabled }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Swap direction"
      whileTap={{ scale: 0.92 }}
      whileHover={{ rotate: 180 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="
        focus-ring grid h-11 w-11 place-items-center rounded-2xl
        border border-border-card bg-[#15172e] text-ink-secondary
        shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)]
        hover:text-ink-primary hover:border-accent-mid/60
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-colors
      "
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
        <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
      </svg>
    </motion.button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/problem2/src/components/TokenIcon.tsx src/problem2/src/components/FlipButton.tsx
git commit -m "feat(problem2): add TokenIcon and FlipButton components"
```

---

## Task 10: Build `TokenPicker` component

**Files:**
- Create: `src/problem2/src/components/TokenPicker.tsx`

Uses Headless UI's `Dialog` + `Combobox` so the picker is keyboard-accessible and the panel is full-screen-friendly on mobile.

- [ ] **Step 1: Create `src/problem2/src/components/TokenPicker.tsx`**

```tsx
import { Fragment, useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { Token } from "../types";
import { TokenIcon } from "./TokenIcon";
import { formatUsd } from "../lib/tokens";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selected: Token | null;
  exclude?: Token | null;
  onSelect: (token: Token) => void;
};

export function TokenPicker({
  isOpen,
  onClose,
  tokens,
  selected,
  exclude,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = tokens
    .filter((t) => !exclude || t.symbol !== exclude.symbol)
    .filter((t) => t.symbol.toLowerCase().includes(query.toLowerCase()));

  function handleClose() {
    setQuery("");
    onClose();
  }

  function handleSelect(t: Token | null) {
    if (!t) return;
    onSelect(t);
    handleClose();
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="transition duration-200"
            enterFrom="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transition duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-6 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className="
                w-full sm:max-w-md max-h-[85vh] sm:max-h-[70vh]
                flex flex-col overflow-hidden
                rounded-t-3xl sm:rounded-3xl
                border border-border-card bg-[#0f1124]
                shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]
              "
            >
              <Combobox value={selected} onChange={handleSelect}>
                <div className="px-4 pt-5 pb-3 border-b border-border-card">
                  <h2 className="text-base font-semibold mb-3">Select a token</h2>
                  <ComboboxInput
                    autoFocus
                    placeholder="Search symbol"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={() => query}
                    className="
                      focus-ring w-full rounded-2xl border border-border-card
                      bg-surface-input px-4 py-3 text-ink-primary
                      placeholder:text-ink-muted
                    "
                  />
                </div>
                <ComboboxOptions
                  static
                  className="flex-1 overflow-y-auto py-2"
                >
                  {filtered.length === 0 && (
                    <div className="px-4 py-8 text-center text-ink-muted">
                      No tokens match "{query}"
                    </div>
                  )}
                  {filtered.map((token) => (
                    <ComboboxOption
                      key={token.symbol}
                      value={token}
                      className="cursor-pointer"
                    >
                      {({ focus, selected: isSelected }) => (
                        <div
                          className={`
                            flex items-center justify-between gap-3 px-4 py-3
                            ${focus ? "bg-white/5" : ""}
                          `}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <TokenIcon symbol={token.symbol} src={token.iconUrl} />
                            <div className="min-w-0">
                              <div className="text-ink-primary font-medium truncate">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {formatUsd(token.price)}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-success text-sm">✓</span>
                          )}
                        </div>
                      )}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/problem2/src/components/TokenPicker.tsx
git commit -m "feat(problem2): add TokenPicker dialog with searchable combobox"
```

---

## Task 11: Build `TokenAmountField` component

**Files:**
- Create: `src/problem2/src/components/TokenAmountField.tsx`

- [ ] **Step 1: Create `src/problem2/src/components/TokenAmountField.tsx`**

```tsx
import { forwardRef, useId, useState } from "react";
import type { Token } from "../types";
import { formatUsd, sanitizeAmount } from "../lib/tokens";
import { TokenIcon } from "./TokenIcon";
import { TokenPicker } from "./TokenPicker";

type Props = {
  label: string;
  amount: string;
  token: Token | null;
  tokens: Token[];
  otherToken: Token | null;
  onAmountChange: (value: string) => void;
  onTokenChange: (token: Token) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

export const TokenAmountField = forwardRef<HTMLInputElement, Props>(
  function TokenAmountField(
    {
      label,
      amount,
      token,
      tokens,
      otherToken,
      onAmountChange,
      onTokenChange,
      onBlur,
      error,
      disabled,
      placeholder = "0.0",
    },
    ref,
  ) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const inputId = useId();
    const errorId = useId();

    const numericAmount = parseFloat(amount);
    const usdValue =
      token && Number.isFinite(numericAmount) ? numericAmount * token.price : 0;

    return (
      <div
        className={`
          rounded-2xl border bg-surface-input p-4
          transition-colors
          ${error ? "border-error/60" : "border-border-card focus-within:border-accent-mid/50"}
          ${disabled ? "opacity-60" : ""}
        `}
      >
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-ink-muted mb-2"
        >
          {label}
        </label>

        <div className="flex items-center gap-3">
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={amount}
            disabled={disabled}
            onChange={(e) => onAmountChange(sanitizeAmount(e.target.value))}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="
              focus-ring min-w-0 flex-1 bg-transparent text-2xl font-semibold
              text-ink-primary tabular-nums placeholder:text-ink-muted/60
              outline-none
            "
          />

          <button
            type="button"
            disabled={disabled}
            onClick={() => setPickerOpen(true)}
            className="
              focus-ring flex items-center gap-2 rounded-2xl border border-border-card
              bg-white/5 px-3 py-2 text-sm font-semibold text-ink-primary
              hover:bg-white/10 transition-colors
              disabled:cursor-not-allowed
            "
          >
            {token ? (
              <>
                <TokenIcon symbol={token.symbol} src={token.iconUrl} size={24} />
                <span>{token.symbol}</span>
              </>
            ) : (
              <span className="text-ink-secondary">Select</span>
            )}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-ink-muted tabular-nums">
            {token && usdValue > 0 ? `≈ ${formatUsd(usdValue)}` : " "}
          </span>
          {error && (
            <span id={errorId} className="text-error font-medium">
              {error}
            </span>
          )}
        </div>

        <TokenPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          tokens={tokens}
          selected={token}
          exclude={otherToken}
          onSelect={onTokenChange}
        />
      </div>
    );
  },
);
```

- [ ] **Step 2: Commit**

```bash
git add src/problem2/src/components/TokenAmountField.tsx
git commit -m "feat(problem2): add TokenAmountField with token picker integration"
```

---

## Task 12: Build `RateSummary` and `SubmitButton` components

**Files:**
- Create: `src/problem2/src/components/RateSummary.tsx`
- Create: `src/problem2/src/components/SubmitButton.tsx`

- [ ] **Step 1: Create `src/problem2/src/components/RateSummary.tsx`**

```tsx
import type { Token } from "../types";
import { formatDisplayNumber } from "../lib/tokens";

type Props = {
  fromToken: Token | null;
  toToken: Token | null;
};

export function RateSummary({ fromToken, toToken }: Props) {
  if (!fromToken || !toToken || fromToken.symbol === toToken.symbol) {
    return null;
  }
  const rate = fromToken.price / toToken.price;
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-ink-secondary">
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ink-muted">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 3.5 V6 L7.5 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        Updated just now
      </span>
      <span className="tabular-nums text-ink-primary font-medium">
        1 {fromToken.symbol} ≈ {formatDisplayNumber(rate)} {toToken.symbol}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/problem2/src/components/SubmitButton.tsx`**

```tsx
import { motion } from "framer-motion";

type Props = {
  isSubmitting: boolean;
  disabled: boolean;
  disabledReason?: string | null;
};

export function SubmitButton({ isSubmitting, disabled, disabledReason }: Props) {
  const label = isSubmitting ? "Swapping…" : "Confirm Swap";
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      title={disabled && !isSubmitting ? disabledReason ?? undefined : undefined}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`
        focus-ring relative w-full h-14 rounded-2xl font-semibold text-white
        transition-all overflow-hidden
        ${
          disabled
            ? "bg-white/5 text-ink-muted cursor-not-allowed"
            : "bg-accent-gradient shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:shadow-[0_14px_36px_-10px_rgba(168,85,247,0.9)]"
        }
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {isSubmitting && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3"/>
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        )}
        {label}
      </span>
    </motion.button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/problem2/src/components/RateSummary.tsx src/problem2/src/components/SubmitButton.tsx
git commit -m "feat(problem2): add RateSummary and SubmitButton components"
```

---

## Task 13: Assemble `SwapForm` with submit flow + toast

**Files:**
- Create: `src/problem2/src/components/SwapForm.tsx`

- [ ] **Step 1: Create `src/problem2/src/components/SwapForm.tsx`**

```tsx
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Token } from "../types";
import { useSwapReducer } from "../hooks/useSwapReducer";
import { validate } from "../lib/validation";
import { formatDisplayNumber } from "../lib/tokens";
import { TokenAmountField } from "./TokenAmountField";
import { FlipButton } from "./FlipButton";
import { RateSummary } from "./RateSummary";
import { SubmitButton } from "./SubmitButton";

type Props = {
  tokens: Token[];
};

const PREFERRED_FROM = "ETH";
const PREFERRED_TO = "USDC";

function pickDefaults(tokens: Token[]): {
  from: Token | null;
  to: Token | null;
} {
  if (tokens.length === 0) return { from: null, to: null };
  const from =
    tokens.find((t) => t.symbol === PREFERRED_FROM) ?? tokens[0] ?? null;
  const to =
    tokens.find((t) => t.symbol === PREFERRED_TO && t.symbol !== from?.symbol) ??
    tokens.find((t) => t.symbol !== from?.symbol) ??
    null;
  return { from, to };
}

export function SwapForm({ tokens }: Props) {
  const defaults = useMemo(() => pickDefaults(tokens), [tokens]);
  const [state, dispatch] = useSwapReducer(defaults.from, defaults.to);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => validate(state), [state]);

  // Touch-aware errors: only show after blur OR after submit attempt
  const showFromAmountError =
    (state.touched.from || state.touched.to || submitAttempted) &&
    !!validation.errors.fromAmount;
  const showTokenErrors = submitAttempted;
  const showPairError = !!validation.errors.pair;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!validation.isValid || state.status === "submitting") return;

    // Capture for the toast before reset clears the state
    const summary = {
      fromAmount: formatDisplayNumber(parseFloat(state.fromAmount)),
      fromSymbol: state.fromToken!.symbol,
      toAmount: formatDisplayNumber(parseFloat(state.toAmount)),
      toSymbol: state.toToken!.symbol,
    };

    dispatch({ type: "SUBMIT_START" });
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Swap complete", {
      description: `Swapped ${summary.fromAmount} ${summary.fromSymbol} → ${summary.toAmount} ${summary.toSymbol}`,
    });
    dispatch({ type: "RESET" });
    setSubmitAttempted(false);
    fromInputRef.current?.focus();
  }

  const isSubmitting = state.status === "submitting";
  const submitDisabled = !validation.isValid || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="
        w-full max-w-[480px]
        rounded-3xl border border-border-card bg-surface-card backdrop-blur-xl
        p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]
      "
    >
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold tracking-tight">Swap</h1>
      </div>

      <div className="relative space-y-2">
        <TokenAmountField
          ref={fromInputRef}
          label="You pay"
          amount={state.fromAmount}
          token={state.fromToken}
          tokens={tokens}
          otherToken={state.toToken}
          onAmountChange={(v) => dispatch({ type: "SET_FROM_AMOUNT", value: v })}
          onTokenChange={(t) => dispatch({ type: "SET_FROM_TOKEN", token: t })}
          onBlur={() => dispatch({ type: "BLUR_FROM" })}
          error={
            state.lastEdited === "from" && showFromAmountError
              ? validation.errors.fromAmount
              : showTokenErrors
                ? validation.errors.fromToken
                : undefined
          }
          disabled={isSubmitting}
        />

        <div className="relative h-0">
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <FlipButton
              onClick={() => dispatch({ type: "FLIP" })}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <TokenAmountField
          label="You receive"
          amount={state.toAmount}
          token={state.toToken}
          tokens={tokens}
          otherToken={state.fromToken}
          onAmountChange={(v) => dispatch({ type: "SET_TO_AMOUNT", value: v })}
          onTokenChange={(t) => dispatch({ type: "SET_TO_TOKEN", token: t })}
          onBlur={() => dispatch({ type: "BLUR_TO" })}
          error={
            state.lastEdited === "to" && showFromAmountError
              ? validation.errors.fromAmount
              : showTokenErrors
                ? validation.errors.toToken
                : undefined
          }
          disabled={isSubmitting}
        />
      </div>

      {showPairError && (
        <div className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-xs text-error font-medium text-center">
          {validation.errors.pair}
        </div>
      )}

      <div className="mt-4">
        <RateSummary fromToken={state.fromToken} toToken={state.toToken} />
      </div>

      <div className="mt-3">
        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={submitDisabled}
          disabledReason={validation.firstError}
        />
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/problem2/src/components/SwapForm.tsx
git commit -m "feat(problem2): assemble SwapForm with submit flow"
```

---

## Task 14: Build App shell, wire up sonner toast, add error and loading states, write README

**Files:**
- Modify: `src/problem2/src/App.tsx`
- Modify: `src/problem2/src/main.tsx`
- Create: `src/problem2/README.md`

- [ ] **Step 1: Replace `src/problem2/src/App.tsx`**

```tsx
import { usePrices } from "./hooks/usePrices";
import { SwapForm } from "./components/SwapForm";

function LoadingCard() {
  return (
    <div className="w-full max-w-[480px] rounded-3xl border border-border-card bg-surface-card backdrop-blur-xl p-6 animate-pulse">
      <div className="h-5 w-20 rounded bg-white/10 mb-5" />
      <div className="space-y-2">
        <div className="h-28 rounded-2xl bg-white/5" />
        <div className="h-28 rounded-2xl bg-white/5" />
      </div>
      <div className="h-14 rounded-2xl bg-white/10 mt-4" />
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-[480px] rounded-3xl border border-error/30 bg-surface-card backdrop-blur-xl p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-error/10 text-error">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-1">Couldn't load prices</h2>
      <p className="text-sm text-ink-secondary mb-5">{message}</p>
      <button
        onClick={onRetry}
        className="focus-ring rounded-2xl bg-accent-gradient px-6 py-2.5 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-accent-start/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-accent-end/20 blur-3xl" />
    </div>
  );
}

export default function App() {
  const { tokens, isLoading, error, retry } = usePrices();

  return (
    <>
      <BackgroundBlobs />
      <main className="relative min-h-screen flex items-center justify-center p-4">
        {isLoading && <LoadingCard />}
        {!isLoading && error && (
          <ErrorCard message={error.message} onRetry={retry} />
        )}
        {!isLoading && !error && tokens.length > 0 && <SwapForm tokens={tokens} />}
        {!isLoading && !error && tokens.length === 0 && (
          <ErrorCard message="No tradable tokens were returned." onRetry={retry} />
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 2: Replace `src/problem2/src/main.tsx` to add `<Toaster />`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      theme="dark"
      toastOptions={{
        style: {
          background: "#15172e",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#f8fafc",
        },
      }}
    />
  </React.StrictMode>,
);
```

- [ ] **Step 3: Create `src/problem2/README.md`**

```markdown
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
```

- [ ] **Step 4: Build + typecheck**

```bash
cd src/problem2 && npm run build
```

Expected: a clean build, no TypeScript errors, output written to `dist/`. If there are unused-variable errors (e.g. an unused `useEffect` import or `submitAttempted` warning), remove the dead code rather than disabling the lint rule.

- [ ] **Step 5: Run all tests one final time**

```bash
cd src/problem2 && npm test
```

Expected: all tests pass across `tokens`, `swap`, `validation`, `usePrices`, `useSwapReducer`.

- [ ] **Step 6: Manual visual verification**

```bash
cd src/problem2 && npm run dev
```

Walk through the manual smoke test in the README. Check on a narrow viewport (≤ 480 px wide) — the token picker should slide up from the bottom, the card should fit, no horizontal scroll.

If anything is visually off, fix inline before committing.

- [ ] **Step 7: Commit**

```bash
git add src/problem2/src/App.tsx src/problem2/src/main.tsx src/problem2/README.md
git commit -m "feat(problem2): wire up App shell, toast, error and loading states + README"
```

- [ ] **Step 8: Final repo-state check**

```bash
git status
git log --oneline -15
```

Expected: working tree clean (aside from anything you intentionally left unstaged from other problems). The last ~14 commits should narrate the build cleanly from bootstrap to working app.

---

## Spec coverage check

Every section of the design spec is implemented by the tasks above:

| Spec section | Task(s) |
|---|---|
| Tech stack | 1, 2, 3 |
| Palette / typography / layout / accessibility | 2, 9–14 |
| File structure | every task |
| `Token` type | 4 |
| `usePrices()` hook + dedupe + retry + loading + error | 7, 14 |
| `SwapState` + actions | 4, 8 |
| Two-way binding rule (`lastEdited`) | 8 |
| Default selection (ETH → USDC fallback) | 13 |
| `lib/swap.ts` convert math | 5 |
| `lib/validation.ts` rules 1–6 | 4 (input-level guards via `sanitizeAmount`), 6 (rules 1–5) |
| Submit button disabled-with-tooltip | 12, 13 |
| Inline + on-blur error display | 11, 13 |
| Mock submit flow with capture-before-reset | 13 |
| Toast content | 13, 14 |
| Mid-submit input disabling | 11, 13 |
| Loading skeleton + error retry UI | 14 |
| Unit tests for swap, validation, usePrices | 5, 6, 7 (and reducer in 8) |
| README with manual smoke test | 14 |

No gaps.
