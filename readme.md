# 99Tech Code Challenge #1

Note that if you fork this repository, your responses may be publicly linked to this repo.  
Please submit your application along with the solutions attached or linked.

It is important that you minimally attempt the problems, even if you do not arrive at a working solution.

## Submission

You can either provide a link to an online repository, attach the solution in your application, or whichever method you prefer.
We're cool as long as we can view your solution without any pain.

## Problem Descriptions

### Problem 1
In `src/problem1/index.js` you’ll find three implementations of the same algorithm – summing the first `n` natural numbers:

- **`sum_to_n_a`**: straightforward iterative loop accumulating the sum.
- **`sum_to_n_b`**: recursive version that adds `n` to the result of `sum_to_n_b(n-1)` (note the stack‑overflow warning for large `n`).
- **`sum_to_n_c`**: constant‑time formula using `n * (n + 1) / 2`.

Each variant demonstrates a different approach to solving the same mathematical problem and could be used to discuss performance and edge cases.

### Problem 2
This directory contains a working Vite‑powered React + TypeScript project, not just a boilerplate.  Key points:

- **Configuration**: `tsconfig.json`, `tsconfig.node.json`, `.eslintrc.cjs`, and `vite.config.ts` are already set up for linting, type checking, and hot‑module reloading.
- **Dependencies** include `react`, `react-dom`, `axios`, `styled-components` along with TypeScript and ESLint tooling.
- **Structure**: under `src/` you’ll find a small swap‑UI application:
  - Reusable components (`Button`, `Loading`, `TokenImage`, `SwapSection`, `SelectTokensModal`, `ConfirmSwapModal`)
  - Pages (`SwapPage`) and styling helpers (`Flex.styled.ts`)
  - Shared `constants`, `enums`, `types`, and utility scripts (e.g. `generateImportImages.js`)
  - Asset management under `assets/img` with an importer script
- **Scripts**: `npm run dev` starts the dev server, `npm run build` compiles TypeScript and bundles via Vite, and there’s a helper `generateImageObject` script.

The application demonstrates a typical modern React stack with styled‑components and structured folder layout.

### Problem 3
Two versions of a wallet balance page are provided:

- **`Example.tsx`** – an initial implementation sketching out the component, priority logic, and a placeholder `Datasource` class.
- **`RefactorVersion.tsx`** – a refactored, more polished variant that adds type definitions, `makeStyles` for styling, and detailed comments about performance considerations.

Both versions use a custom hook `useWalletBalances` (imported but not shown) to retrieve balances, then fetch price data from `https://interview.switcheo.com/prices.json` via the `Datasource` class. Balances are filtered and sorted by blockchain priority and converted to `WalletRow` elements with formatted amounts and USD values. The refactor includes notes about memoization, avoiding redundant calculations, and key generation for list items.

This problem exercises React hooks, async data fetching, and basic optimization/documentation practices.
