# Task

List out the computational inefficiencies and anti-patterns found in the code block below.

1. This code block uses
    1. ReactJS with TypeScript.
    2. Functional components.
    3. React Hooks
2. You should also provide a refactored version of the code, but more points are awarded to accurately stating the issues and explaining correctly how to improve them.

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
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
```

---

# Solution

## Issues found

### Correctness bugs (these break at runtime or produce wrong output)

1. **`lhsPriority` is undefined inside `filter`.** The variable computed is `balancePriority`, but the condition checks `lhsPriority`. `lhsPriority` doesn't exist in that scope, so this throws a `ReferenceError` (or, if it ever resolved, silently misbehaves). It should reference `balancePriority`.

2. **The filter logic is inverted.** The intent is clearly to keep balances that belong to a known chain *and* have a positive amount. The code instead keeps balances where `amount <= 0` and drops everything else. The condition should be `balancePriority > -99 && balance.amount > 0`.

3. **`balance.blockchain` does not exist on `WalletBalance`.** The interface declares only `currency` and `amount`, yet the code reads `balance.blockchain`. This is a type error; `blockchain` must be added to the interface (and the lookup keyed off it, or off `currency`, consistently).

4. **`sort` comparator has no return for the equal case.** When `leftPriority === rightPriority` the function falls through and returns `undefined`. A comparator must return a number; `undefined` yields implementation-defined/unstable ordering. Add a `return 0`.

5. **`rows` maps over `sortedBalances` but is typed as `FormattedWalletBalance` and reads `balance.formatted`.** `sortedBalances` items are `WalletBalance` (no `formatted` field), so `formattedAmount={balance.formatted}` is always `undefined`. It should map over `formattedBalances` instead.

### Computational inefficiencies / anti-patterns

6. **`prices` is an unnecessary `useMemo` dependency.** The memoized computation only uses `balances` and `getPriority`. Listing `prices` causes the entire filter+sort to re-run whenever prices tick (which is often, for a wallet), wasting work. Dependency array should be `[balances]`.

7. **`formattedBalances` is computed but never used.** It maps the full list on every render and the result is discarded (`rows` uses `sortedBalances`). Either wire it into `rows` (the correct fix) or remove it — but it must not be dead work.

8. **`getPriority` is re-created on every render.** It's a pure function with no dependency on props/state, so it's reallocated each render and can't be a stable `useMemo`/`useCallback` dependency. Move it to module scope (outside the component).

9. **`getPriority(blockchain: any)`** — `any` defeats type checking. Use a `Blockchain` union type so invalid chains are caught at compile time.

10. **`getPriority` is called repeatedly per element.** It runs once per item in `filter` and twice per comparison in `sort` (O(n log n) calls). Computing each balance's priority once up front avoids redundant `switch` evaluations.

11. **`key={index}` anti-pattern.** Index keys break React's reconciliation when the list is filtered/sorted/reordered (which this list is). Use a stable, unique key such as `balance.currency`.

12. **`prices[balance.currency]` can be `undefined`**, making `usdValue` `NaN`. Guard with a fallback (`?? 0`).

13. **Minor:** `balance.amount.toFixed()` defaults to 0 decimals — likely unintended for currency; specify a precision. `children` is destructured but never rendered. The empty `interface Props extends BoxProps {}` adds nothing over `BoxProps` directly. `rows` could be memoized.

## Refactored version

```tsx
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // (1)(3) field the logic actually depends on
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// (8) Pure, no component state — define once at module scope.
// (9) Typed parameter instead of `any`.
const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

type Props = BoxProps; // (13) empty interface extension removed

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // (6) depends only on `balances`. (10) priority computed once per item.
  const sortedBalances = useMemo(() => {
    return balances
      .map((balance: WalletBalance) => ({
        balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(({ balance, priority }) => priority > -99 && balance.amount > 0) // (2)
      .sort((lhs, rhs) => rhs.priority - lhs.priority) // (4) total order, incl. equality
      .map(({ balance }) => balance);
  }, [balances]);

  // (5)(7) actually used, and memoized so it isn't recomputed needlessly.
  const formattedBalances: FormattedWalletBalance[] = useMemo(
    () =>
      sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2), // (13) explicit precision
      })),
    [sortedBalances],
  );

  const rows = useMemo(
    () =>
      formattedBalances.map((balance: FormattedWalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount; // (12)
        return (
          <WalletRow
            className={classes.row}
            key={balance.currency} // (11) stable key instead of index
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices],
  );

  return <div {...rest}>{rows}</div>;
};
```

### Notes on the refactor

- `filter → sort → map` over a single `{ balance, priority }` intermediate computes each priority exactly once instead of on every comparison.
- The sort is reduced to `rhs.priority - lhs.priority`, which is a correct total order (descending) and handles the equal case implicitly by returning `0`.
- Splitting the three memos (`sortedBalances`, `formattedBalances`, `rows`) keeps each one keyed to its real inputs, so a price tick only re-renders `rows`, not the sort.
- If `WalletBalance` can legitimately carry chains beyond the five above, widen `Blockchain` to `Blockchain | (string & {})` (or keep `string`) so the `default` branch stays meaningful.
