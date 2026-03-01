# 99Tech Code Challenge

A set of three code challenges: algorithms, React/TypeScript form, and code review & refactor.

## Overview

| Problem | Description | Folder |
|---------|-------------|--------|
| **Problem 1** | Three implementations of `sum_to_n` (loop, Gauss formula, recursion) | [src/problem1](./src/problem1) |
| **Problem 2** | Currency swap form (React 19 + TypeScript + Vite + Ant Design), with i18n and Netlify deploy. [Live demo](https://stunning-cascaron-dfac87.netlify.app/) | [src/problem2](./src/problem2) |
| **Problem 3** | Code review & refactor: 13 issues analyzed, clean refactored version | [src/problem3](./src/problem3) |

## Quick start

- **Problem 1**: See [README](./src/problem1/README.md) and [sum.js](./src/problem1/sum.js).
- **Problem 2**:
  ```bash
  cd src/problem2
  npm install
  npm run dev
  ```
  **Live demo:** [https://stunning-cascaron-dfac87.netlify.app/](https://stunning-cascaron-dfac87.netlify.app/) — Details: [README.md](./src/problem2/README.md).
- **Problem 3**: See [README](./src/problem3/README.md), [ANALYSIS.md](./src/problem3/ANALYSIS.md), and [WalletPage.refactored.tsx](./src/problem3/WalletPage.refactored.tsx).

## Repository structure

```
code-challenge/
├── readme.md          # This file — overview & quick start
├── netlify.toml       # Netlify deploy config (base: src/problem2)
└── src/
    ├── problem1/       # Sum to N — 3 implementations
    ├── problem2/       # Fancy Form — Currency Swap (React + Vite)
    └── problem3/       # Messy React — Analysis & refactor
```

---

*See each problem's README for requirements and how to run. For Netlify deploy from repo root, use **Base directory**: `src/problem2` and **Publish directory**: `dist`.*
