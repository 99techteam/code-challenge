# 99Tech Code Challenge — Frontend

Problems 1–3 in one pnpm workspace (Node 22+, pnpm 11).

**Live demo of problem 2:** <https://facet-converter.vercel.app>

| Problem | What                                              | Docs                                                           |
| ------- | ------------------------------------------------- | -------------------------------------------------------------- |
| 1       | Three ways to sum to `n`                          | [`src/problem1/NOTES.md`](./src/problem1/NOTES.md)             |
| 2       | Fancy Form — **Facet**, a crypto converter        | [`src/problem2/README.md`](./src/problem2/README.md)           |
| 3       | Messy React — refactor of the provided WalletPage | [`src/problem3/REFACTORING.md`](./src/problem3/REFACTORING.md) |

## Commands

Run from the repository root.

```bash
pnpm install                    # one install for all three problems
pnpm p2                         # problem 2 dev server on http://localhost:5172
pnpm test                       # all tests; add --project problem-2 for one problem
pnpm verify                     # format check, lint, typecheck and tests, as CI runs them
pnpm format                     # fix formatting
pnpm build                      # build problems 1 and 2 (problem 3 only type-checks)
```

## Architecture

Problems 1–3 are packages under `src/`; TypeScript, ESLint, Prettier and Vitest are
configured once at the root and shared.

Problem 2 keeps the domain free of React and the components free of the feed:

```text
prices.json → lib/ (axios + zod) → usePrices → SwapCard → useSwapForm → amount fields
```

| Folder        | Role                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `lib/`        | Plain TypeScript, no React: HTTP client, feed parsing, zod schemas, formatting, asset search.         |
| `hooks/`      | `usePrices` loads the feed; `useSwapForm` holds one amount and derives the other; `useSwapAnimation`. |
| `components/` | `SwapCard` wires the feed and the form to the view; the rest only render. `ui/` is shadcn/ui.         |

## Libraries

Problem 1 has no dependencies and problem 3 uses only React. The last two rows are
tooling all three share.

| Library                                                   | Used for                                                  |
| --------------------------------------------------------- | --------------------------------------------------------- |
| React 19, Vite 8                                          | The app, its dev server and build                         |
| Tailwind CSS v4, shadcn/ui (Radix, cmdk), lucide-react    | Styling, the popover and searchable asset menu, icons     |
| TanStack Query 5, axios                                   | Fetching, caching, retrying and refreshing the price feed |
| zod 4                                                     | Parsing the feed and validating the swap request          |
| react-hook-form 7, @hookform/resolvers                    | Form state, validated through the zod schema              |
| use-debounce                                              | The asset search                                          |
| TypeScript 6.0, ESLint 10 (typescript-eslint), Prettier 3 | Types, type-aware linting, formatting                     |
| Vitest 5, Testing Library, jsdom                          | Tests                                                     |
