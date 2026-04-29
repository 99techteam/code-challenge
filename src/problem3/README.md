# Problem 3: Messy React

## Issues found

1. `WalletBalance` is missing the `blockchain` field.

   The code calls `balance.blockchain`, but the interface only defines `currency` and `amount`. This breaks TypeScript correctness and hides a real data-shape problem.

2. `getPriority` uses `any`.

   `blockchain: any` removes type safety. It should be typed as a known blockchain string union or at least `string`.

3. `getPriority` is recreated on every render.

   The function is declared inside the component. This is not a major issue by itself, but it is unnecessary because the priority mapping is static. Moving it outside the component is cleaner and avoids repeated allocation.

4. The filter logic references an undefined variable.

   `lhsPriority` does not exist inside the filter callback. The intended variable is probably `balancePriority`.

5. The filter condition is logically wrong.

   The current code returns `true` when `balance.amount <= 0`, meaning it keeps zero or negative balances and removes positive balances. For a wallet list, the expected behavior is usually to keep balances with `amount > 0`.

6. The filter is harder to read than necessary.

   Nested `if` statements can be replaced with a direct boolean expression:

   ```ts
   getPriority(balance.blockchain) > -99 && balance.amount > 0
   ```

7. `sort` comparator can return `undefined`.

   If two priorities are equal, the comparator returns nothing. A comparator should always return a number. This can lead to unstable or inconsistent sorting behavior.

8. `prices` is included in the `useMemo` dependency array unnecessarily.

   `sortedBalances` does not use `prices`, so adding `prices` causes the filtering and sorting work to rerun whenever prices change.

9. `formattedBalances` is calculated but not used.

   The code creates `formattedBalances`, but then maps over `sortedBalances` when rendering rows. Because of this, `balance.formatted` is unavailable in `rows`.

10. The `rows` map uses the wrong type.

    `sortedBalances` contains `WalletBalance`, but the callback types `balance` as `FormattedWalletBalance`. That is incorrect unless the formatted data is actually used.

11. Using array index as React key is an anti-pattern.

    `key={index}` can cause incorrect row reuse when the list order changes. A stable key such as `currency` or `blockchain-currency` should be used.

12. `children` is destructured but never rendered.

    The component removes `children` from `props`, but does not render it. This can surprise callers and makes `Props extends BoxProps` less useful.

13. `Props` is empty.

    `interface Props extends BoxProps {}` adds no new information. A type alias would be simpler unless extra props are expected later.

14. Formatting work is not memoized.

    Formatting balances and building rows happen on every render. For small lists this is fine, but since the task asks about computational inefficiencies, the derived wallet row data should be memoized.

15. The formatted amount uses default `toFixed()`.

    `toFixed()` defaults to zero decimal places. That may be fine for whole-number tokens, but most token balances need a defined precision such as `toFixed(2)` or a formatter.

16. There is no fallback for missing prices.

    `prices[balance.currency] * balance.amount` becomes `NaN` if a token price is missing. It should default to `0` or handle unavailable prices explicitly.

17. `classes.row` is used but not defined in the snippet.

    This may be defined outside the snippet, but as shown, it is an undeclared dependency.

18. The indentation and formatting are inconsistent.

    Mixed tabs/spaces and missing semicolons make the code harder to review and maintain.

## Refactored version

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

type Prices = Record<string, number>;
type Props = BoxProps;

// Assumes BoxProps, WalletRow, useWalletBalances, usePrices, and classes are provided by the app.
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices: Prices = usePrices();

  const sortedBalances = useMemo<WalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        return getPriority(balance.blockchain) > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]);

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const price = prices[balance.currency] ?? 0;

      return {
        ...balance,
        formatted: balance.amount.toFixed(2),
        usdValue: price * balance.amount
      };
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};
```

## Why this version is better

- TypeScript now matches the data actually used by the component.
- Filtering/sorting and price formatting are memoized separately, so price changes do not repeat unnecessary sorting work.
- The sort comparator always returns a number.
- Positive balances are kept and unsupported chains are filtered out.
- Missing prices no longer produce `NaN`.
- React keys are stable across reorders.
- Unused variables and incorrect types are removed.
- Static priority data is outside the component, so it is not recreated on every render.
