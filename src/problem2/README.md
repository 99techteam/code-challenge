# Fancy Form

Built with React, TypeScript and Vite, using Bun for development, tests and builds.
The form remains a simulated token swap; there is no wallet SDK or on-chain execution.

Run `bun install --frozen-lockfile --ignore-scripts`, then `bun run dev` from the
repository root. Open the URL printed by Vite. `bun run build` creates `dist/`;
`bun run preview` serves that build.

The form supports priced tokens from the supplied Switcheo dataset, instant quotes,
direction reversal, native keyboard-accessible selectors, input validation, loading,
retry on feed failure, and a pending/success state for a simulated swap. Choosing
the opposite token exchanges the pair rather than leaving two identical tokens.
Controls are locked during submission to keep the preview consistent.

## Structure

- `main.tsx` mounts the app in React Strict Mode.
- `App.tsx` contains the page layout; `SwapForm.tsx` owns controlled form state.
- `TokenPicker.tsx` provides the shared selector and per-token icon fallback.
- `usePrices.ts` owns loading/retry state and cancels requests on cleanup.
- `quote.ts` validates unknown API data and computes quotes without React dependencies.

Both pending price requests and the simulated submission timer are cleaned up on
unmount. Changing a pair or amount clears the previous preview; quote amounts are
derived from the current input and prices rather than duplicated in component state.

## Assumptions and limits

- Prices are USD-denominated: `received = sent × fromPrice / toPrice`.
- The supplied feed is historical, not live market data. Its date is shown explicitly.
- Duplicate symbols use the newest valid timestamp. Timestamp ties use the last
  valid record in source order; the feed provides no venue information to resolve them.
- Invalid or missing prices are omitted. Fewer than two usable tokens is an error.
- Inputs accept positive decimal notation, not exponents, commas or hexadecimal.
- Eight significant digits are displayed; calculations use JavaScript numbers.
  Real execution would need token decimals, fixed-point amounts, fees, slippage,
  a fresh executable quote, wallet authorization, and a transaction backend.
- Submit waits briefly and reports a **preview**, never a real trade. No wallet,
  signing, private key, account balance or backend is involved.

External requests are limited to the provided price URL, token icons rendered as
images from `raw.githubusercontent.com/Switcheo/token-icons`, and Google Fonts.
Missing icons hide without blocking the form; fonts have system fallbacks. Remote
feed content is validated and rendered as text/options, not injected HTML or code.
The price request has a 10-second timeout. No analytics, credentials or local storage.

Run `bun test src/problem2` for feed validation, deduplication, cancellation,
conversion and initial React rendering tests. `bun run typecheck` covers the form,
API boundary, components and tests under strict TypeScript checking.
