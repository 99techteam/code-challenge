# Problem 3 — Wallet page code review

## Computational inefficiencies and anti-patterns

1. **Runtime bug: undefined identifier** — Inside `filter`, the code uses `lhsPriority`, which does not exist in that scope. It should use `balancePriority` (from `getPriority(balance.blockchain)`). As written, this throws at runtime or behaves unpredictably depending on outer scope.

2. **Logic bug: filter condition** — Even after fixing the variable name, the condition pairs `priority > -99` with `amount <= 0` returning `true`, which is an odd rule for a wallet (usually you show **positive** balances). Clarify product rules; likely `amount > 0` was intended.

3. **`useMemo` depends on `prices` but does not use it** — `sortedBalances` never reads `prices`. Including `prices` in the dependency array forces unnecessary recomputation whenever prices change, while the sorted list is unchanged.

4. **`getPriority` recreated every render** — The function is defined inside the component, so a new function reference is allocated each render. For a pure mapping from blockchain name to number, define it **outside** the component (or use a static lookup object) so it is stable and cheap.

5. **`formattedBalances` is dead work** — You compute `formattedBalances` from `sortedBalances`, then iterate `sortedBalances` again for `rows`. Rows treat `balance` as `FormattedWalletBalance` and read `balance.formatted`, but `sortedBalances` items do not have `formatted`, so **`formatted` is always `undefined`** at runtime. Either map over `formattedBalances` or merge formatting into one pipeline.

6. **Unstable / wrong list keys** — `key={index}` causes unnecessary remounts when order changes and is fragile if the list is reordered or filtered. Prefer a stable key such as `${balance.blockchain}-${balance.currency}` (or a real id from the API).

7. **`.sort` mutates the filtered array** — `[...].filter(...).sort(...)` mutates the array returned by `filter` in place. That is often acceptable because it is a new array from `filter`, but it is easy to misuse if the same array reference is reused elsewhere. Prefer `[...filtered].sort(...)` for clarity and safety.

8. **Incomplete `sort` comparator** — When `leftPriority === rightPriority`, the comparator returns `undefined` (implicit). Sort comparators should return **0** in that case for predictable, spec-compliant ordering.

9. **`any` on blockchain** — `getPriority(blockchain: any)` hides typos and invalid chains. Model `blockchain` as a string union (or enum) aligned with the `switch` cases.

10. **`useMemo` for sorting only** — Sorting/filtering on every `balances` change is appropriate to memoize, but splitting “formatted” into a separate non-memoized `.map` causes extra allocations every render. Combine into one memoized derivation or memoize the formatted list when it is derived from sorted data.

11. **`React.FC` / redundant typing** — `React.FC<Props> = (props: Props)` duplicates the generic. Either use `FC<Props>` without repeating `Props` on the parameter, or type the function directly and avoid `FC` if you want explicit `children` typing.

12. **Missing / implicit dependencies** — `getPriority` inside `useMemo` is recreated each render; ESLint `react-hooks/exhaustive-deps` would want it in the dependency array or lifted out. Lifting `getPriority` out fixes this cleanly.

13. **`classes.row` without definition** — The snippet references `classes` that is not defined in scope (likely copy-paste from a `makeStyles` setup). Row styling should come from props, a CSS module, or a design-system `className`.

14. **`Props extends BoxProps` with an empty body** — An empty interface extending another is redundant unless you plan to add props; you can use `BoxProps` directly or document why it exists.

---

## Refactored version

Assumptions: show balances on a **known** chain (`getPriority > -99`) with **positive** `amount`; sort by priority descending; USD uses `prices[currency] * amount`. Adjust filter rules if product spec differs.

```tsx
import React, { useMemo } from 'react';

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface Props extends BoxProps {}

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

const WalletPage = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo(() => {
    const filtered = balances.filter((balance) => {
      const priority = getPriority(balance.blockchain);
      return priority > -99 && balance.amount > 0;
    });

    const sorted = [...filtered].sort((lhs, rhs) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) return -1;
      if (leftPriority < rightPriority) return 1;
      return 0;
    });

    return sorted.map((balance) => {
      const formatted: FormattedWalletBalance = {
        ...balance,
        formatted: balance.amount.toFixed(),
      };
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      const rowKey = `${balance.blockchain}-${balance.currency}`;

      return (
        <WalletRow
          key={rowKey}
          amount={formatted.amount}
          usdValue={usdValue}
          formattedAmount={formatted.formatted}
        />
      );
    });
  }, [balances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;

// Stubs — replace with real hooks / row component.
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: {
  amount: number;
  usdValue: number;
  formattedAmount: string;
}): React.ReactElement;
```

This version removes the unused `prices` dependency from sorting, fixes the filter variable and data flow for `formatted`, uses stable keys, completes the comparator, replaces `any` with a typed lookup, and uses a single `useMemo` for the expensive list pipeline so work is not duplicated on unrelated renders.
