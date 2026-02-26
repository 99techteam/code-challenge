# Fancy Form — Token Swap UI

A production-grade token swap interface built with React, TypeScript, and shadcn/ui. The project fetches live token prices from the Switcheo API and allows users to swap between any two tokens with real-time rate calculation.

---

## Live Demo

> Run locally — see [Getting Started](#getting-started) below.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict, `erasableSyntaxOnly`) |
| UI Components | shadcn/ui + Tailwind CSS |
| Unit & Integration Tests | Vitest + @testing-library/react |
| E2E Tests | Playwright |

---

## Architecture

The codebase follows **Domain-Driven Design (DDD)** with a strict 4-layer separation. Each layer has a single responsibility and dependencies only flow inward — UI depends on Application, Application depends on Domain, Infrastructure implements Domain interfaces.

```
src/
├── domain/                         # Pure business logic — no framework dependencies
│   └── token/
│       ├── entities/Token.ts       # Token entity and isSameToken()
│       ├── value-objects/
│       │   └── TokenAmount.ts      # Immutable VO: conversion, validation, USD value
│       └── repositories/
│           └── ITokenRepository.ts # Port (interface) — domain declares what it needs
│
├── application/                    # Use-case orchestration — no UI imports
│   └── swap/
│       ├── SwapService.ts          # validate, computeToAmount, rateLabel, execute
│       └── dtos/SwapDto.ts         # Input/output contracts between layers
│
├── infrastructure/                 # Adapters — implements domain ports
│   └── token/
│       └── SwitcheoTokenRepository.ts  # Fetches prices from Switcheo public API
│
├── presentation/                   # React UI — delegates all logic to hooks/services
│   └── swap/
│       ├── hooks/useSwap.ts        # Bridges SwapService ↔ React state
│       └── components/
│           ├── SwapForm.tsx        # Pure UI shell
│           ├── TokenSelector.tsx   # Searchable token dropdown
│           └── TokenIcon.tsx       # Token icon with fallback avatar
│
└── App.tsx                         # Thin shell: layout + loading screen only
```

### Why DDD for a UI project?

A flat component file works fine for small projects, but becomes hard to test and maintain as complexity grows. Separating concerns this way means:

- **Domain logic is framework-agnostic** — `TokenAmount` and `SwapService` can be tested with plain Vitest, no React needed.
- **Infrastructure is swappable** — to change the price API, only `SwitcheoTokenRepository` needs to change. Nothing else knows the URL exists.
- **UI is a thin layer** — `SwapForm` contains zero business logic. It renders state and fires actions from `useSwap`.
- **Each layer is independently testable** — unit, integration, and E2E tests each target the appropriate layer.

---

## Key Design Decisions

### `TokenAmount` as a Functional Value Object

Instead of a class with `private constructor`, `TokenAmount` uses the **declaration merging** pattern — an `interface` and a `const` object sharing the same name. This avoids TypeScript's parameter property syntax which is disallowed under `erasableSyntaxOnly`:

```ts
export interface TokenAmount { readonly raw: string; readonly token: Token; }

export const TokenAmount = {
  of:        (raw, token) => ({ raw, token }),
  numeric:   (ta) => parseFloat(ta.raw) || 0,
  isValid:   (ta) => !!ta.raw && !isNaN(Number(ta.raw)) && parseFloat(ta.raw) > 0,
  usdValue:  (ta) => ta.token.price ? TokenAmount.numeric(ta) * ta.token.price : null,
  convertTo: (ta, target) => /* price ratio conversion */ ...,
};
```

### Repository Pattern (Dependency Inversion)

The domain declares `ITokenRepository` as an interface. The infrastructure layer provides `SwitcheoTokenRepository` which implements it. In tests, the repository is mocked via `vi.spyOn` without touching any component or hook internals.

### Singleton Services

`swapService` and `tokenRepository` are exported as singletons. In tests they are spied on directly — no dependency injection container needed at this scale.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Testing

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage
```

Test coverage by layer:

| File | Type | What is tested |
|---|---|---|
| `domain/token/entities/Token.test.ts` | Unit | `isSameToken` — equality, case sensitivity |
| `domain/token/value-objects/TokenAmount.test.ts` | Unit | `of`, `numeric`, `isValid`, `usdValue`, `convertTo` |
| `application/swap/SwapService.test.ts` | Unit | `validate`, `computeToAmount`, `computeFromAmount`, `rateLabel`, `execute` |
| `infrastructure/token/SwitcheoTokenRepository.test.ts` | Unit | `fetchAll` with mocked `fetch` — dedup, sort, error handling |
| `presentation/swap/hooks/useSwap.test.ts` | Integration | Full hook lifecycle — init, amount changes, token selection, flip, submit, rate |

### E2E Tests (Playwright)

```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

E2E tests cover the full user journey in Chromium and Firefox: page load, default token display, amount auto-fill, token search and selection, flip tokens, validation errors, and successful swap confirmation.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Vitest (unit + integration)
npm run test:coverage # Run Vitest with v8 coverage report
npm run test:e2e     # Run Playwright E2E tests
```

---

## Project Structure at a Glance

```
problem-2/fancy-form/
├── src/
│   ├── domain/           # Framework-free business logic
│   ├── application/      # Use-case services and DTOs
│   ├── infrastructure/   # API adapters
│   ├── presentation/     # React components and hooks
│   ├── components/ui/    # shadcn/ui primitives
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   └── App.tsx
├── vitest.config.ts
├── playwright.config.ts
└── vite.config.ts
```