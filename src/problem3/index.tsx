/**
 * Problem 3: Messy React
 *
 * Below is the original code followed by a detailed analysis of every
 * computational inefficiency and anti-pattern, then a fully refactored version.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL CODE (do not modify — kept for reference)
// ─────────────────────────────────────────────────────────────────────────────

/*
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':  return 100
      case 'Ethereum': return 50
      case 'Arbitrum': return 30
      case 'Zilliqa':  return 20
      case 'Neo':      return 20
      default:         return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (lhsPriority > -99) {           // BUG 1: lhsPriority is undefined
        if (balance.amount <= 0) {       // BUG 2: filter logic is inverted
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority  = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // BUG 3: missing return 0 for equal priorities — sort is non-deterministic
    });
  }, [balances, prices]);               // BUG 4: prices in deps but not used inside

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // BUG 5: uses sortedBalances (WalletBalance[]) not formattedBalances,
    //        so balance.formatted is always undefined at runtime
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}                      // BUG 6: index as key — unstable on reorder
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// ISSUES FOUND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Issue 1 — Undefined variable `lhsPriority`
 *   Location: filter callback, `if (lhsPriority > -99)`
 *   Problem:  `lhsPriority` is never declared. The computed value is stored in
 *             `balancePriority` but never used. This is a runtime ReferenceError
 *             (or silently `undefined` in non-strict mode, making the condition
 *             always false and the filter returning an empty array).
 *   Fix:      Replace `lhsPriority` with `balancePriority`.
 *
 * Issue 2 — Inverted filter logic
 *   Location: filter callback, `if (balance.amount <= 0) { return true; }`
 *   Problem:  The intent is to keep balances that have a positive amount AND a
 *             known blockchain priority. The current code keeps balances with
 *             amount ≤ 0 (zero or negative), which is the opposite of what is
 *             wanted.
 *   Fix:      Change `balance.amount <= 0` to `balance.amount > 0`.
 *
 * Issue 3 — Missing `return 0` in sort comparator
 *   Location: sort comparator, after both `if` branches
 *   Problem:  When `leftPriority === rightPriority` the comparator returns
 *             `undefined`. The ECMAScript spec requires a comparator to return
 *             a Number; returning `undefined` leads to non-deterministic sort
 *             order across JS engines.
 *   Fix:      Add `return 0;` at the end of the comparator.
 *
 * Issue 4 — `prices` in `useMemo` dependency array but not used inside
 *   Location: `useMemo(() => { ... }, [balances, prices])`
 *   Problem:  `prices` is listed as a dependency but is not referenced anywhere
 *             inside the memo callback. This causes unnecessary recomputation of
 *             `sortedBalances` every time `prices` changes, which defeats the
 *             purpose of memoisation.
 *   Fix:      Remove `prices` from the dependency array.
 *
 * Issue 5 — `formattedBalances` computed but never used in `rows`
 *   Location: `rows` maps over `sortedBalances` (typed as `FormattedWalletBalance`)
 *   Problem:  `formattedBalances` is computed but `rows` iterates `sortedBalances`
 *             instead. Because `sortedBalances` items are `WalletBalance` (no
 *             `formatted` field), `balance.formatted` is always `undefined`,
 *             so `formattedAmount` prop is always `undefined`.
 *   Fix:      Map `rows` over `formattedBalances`, or merge the two maps into one.
 *
 * Issue 6 — `key={index}` anti-pattern
 *   Location: `<WalletRow key={index} ...>`
 *   Problem:  Using array index as React key causes incorrect reconciliation when
 *             the list is reordered or filtered — React reuses DOM nodes for the
 *             wrong items, leading to stale state and visual glitches.
 *   Fix:      Use a stable, unique identifier such as `balance.currency`.
 *
 * Issue 7 — `getPriority` defined inside the component
 *   Location: `const getPriority = (blockchain: any): number => { ... }`
 *   Problem:  The function is recreated on every render. It has no dependency on
 *             props or state, so it should be defined outside the component (or
 *             wrapped in `useCallback` if it must stay inside).
 *   Fix:      Move `getPriority` outside the component.
 *
 * Issue 8 — `blockchain` typed as `any`
 *   Location: `getPriority(blockchain: any)`
 *   Problem:  Using `any` disables TypeScript type-checking for that parameter,
 *             hiding potential bugs. `WalletBalance` should include a `blockchain`
 *             field typed as a union of known strings.
 *   Fix:      Add `blockchain` to `WalletBalance` and type `getPriority`
 *             accordingly.
 *
 * Issue 9 — `children` destructured but never rendered
 *   Location: `const { children, ...rest } = props;`
 *   Problem:  `children` is extracted from props but not used in the JSX, so any
 *             child elements passed to `WalletPage` are silently dropped.
 *   Fix:      Either render `{children}` inside the returned `<div>`, or remove
 *             the destructuring if children are intentionally unsupported.
 *
 * Issue 10 — Two separate `.map()` passes where one suffices
 *   Location: `formattedBalances` + `rows` both iterate `sortedBalances`
 *   Problem:  Two O(n) iterations when a single pass can produce the final rows.
 *   Fix:      Combine formatting and row creation into a single `.map()`.
 */

// ─────────────────────────────────────────────────────────────────────────────
// REFACTORED VERSION
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';

// -- types --------------------------------------------------------------------

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // FIX Issue 8: added typed field
}

interface Props {
  // removed BoxProps dependency for clarity; add back if BoxProps is available
  className?: string;
  children?: React.ReactNode;
}

// -- helpers (outside component) ----------------------------------------------

// FIX Issue 7: moved outside component so it is never recreated
// FIX Issue 8: typed parameter instead of `any`
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis:  100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa:  20,
  Neo:      20,
};

function getPriority(blockchain: Blockchain): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}

// -- component ----------------------------------------------------------------

// stubs for hooks/components that would be provided by the real app
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}): React.ReactElement;
declare const classes: { row: string };

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices   = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance) => {
        const priority = getPriority(balance.blockchain);
        // FIX Issue 1: use the correct variable
        // FIX Issue 2: keep balances with a known blockchain AND positive amount
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => {
        const diff = getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
        // FIX Issue 3: always return a number (0 for equal priorities)
        return diff; // negative → lhs first, positive → rhs first, 0 → stable
      });
    // FIX Issue 4: removed `prices` from deps — it is not used here
  }, [balances]);

  // FIX Issue 5 + 10: single pass — format and build rows together
  const rows = sortedBalances.map((balance) => {
    const formatted = balance.amount.toFixed(2);
    const usdValue  = (prices[balance.currency] ?? 0) * balance.amount;

    return (
      <WalletRow
        className={classes.row}
        // FIX Issue 6: stable, unique key
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formatted}
      />
    );
  });

  return (
    // FIX Issue 9: render children so they are not silently dropped
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
};

export default WalletPage;
