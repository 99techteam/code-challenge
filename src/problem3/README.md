# Problem 3: Messy React

## Issues in the supplied snippet

1. **The data types do not match the code.** `WalletBalance` has `currency`, but the code reads `blockchain`; that property should be explicitly typed. `FormattedWalletBalance` is declared separately even though a formatted row is a wallet balance plus one derived string.
2. **There is an undeclared identifier.** The filter computes `balancePriority`, then checks `lhsPriority`. This is a compile-time error and also signals that the filter condition was copied from the sort comparator.
3. **The filter condition is inverted and incomplete.** If the identifier typo is corrected to `balancePriority`, it retains zero/negative balances on recognized chains and rejects positive balances on recognized chains. Unknown chains are filtered out by the final `false`. Express the rule directly: a row is visible only when its chain is recognized and its amount is positive.
4. **Formatted balances are computed but discarded.** `formattedBalances` is created, then `rows` maps over `sortedBalances`. As a result, `balance.formatted` is undefined in every row.
5. **The priority lookup runs repeatedly.** Sorting calls `getPriority` twice per comparator invocation. Decorate each row once with its rank.
6. **Equal-priority ordering is implicit.** The comparator returns `undefined` for a tie; return zero or add a stable ID tie-breaker.
7. **The sort mutates its receiver.** Sorting a freshly filtered array happens to be safe today, but makes that guarantee implicit. Sort a copied array.
8. **The memo dependencies are wrong.** `prices` is listed although the sort calculation does not use it. This causes needless sorting when prices change. Derived USD values do depend on prices and must update when prices change.
9. **Formatting is incomplete.** `toFixed()` defaults to zero fractional digits, which drops useful token precision. Currency metadata should define display precision.
10. **The row key is an array index.** Reordering makes React reuse the wrong row state. Use a stable chain/currency identifier.
11. **Money is not validated.** An unknown price can produce `NaN`, and negative or non-finite balances can reach the UI.
12. **The component drops its children.** It destructures `children` but never renders it.
13. **The component is hard to maintain.** Priority rules, filtering, sorting, price calculation, formatting, and rendering are all embedded in one component. `getPriority` is recreated every render and uses `any`.

## Refactored example

This version keeps selection/sorting separate from price formatting. It assumes the surrounding app supplies typed balances, prices, and a `WalletRow` component.

```tsx
import { useMemo, type ComponentType, type HTMLAttributes } from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';
interface WalletBalance {
  id: string;
  blockchain: Blockchain;
  currency: string;
  amount: number;
}
interface WalletRowProps {
  balance: WalletBalance;
  usdValue: number | undefined;
  formattedAmount: string;
}
interface Props extends HTMLAttributes<HTMLDivElement> {
  balances: WalletBalance[];
  prices: Record<string, number | undefined>;
  WalletRow: ComponentType<WalletRowProps>;
}

const chainRank: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

export function WalletPage({ balances, prices, WalletRow, children, ...rest }: Props) {
  const sortedBalances = useMemo(() => balances
    .filter(({ blockchain, amount }) =>
      Object.prototype.hasOwnProperty.call(chainRank, blockchain)
      && Number.isFinite(amount)
      && amount > 0,
    )
    .map((balance) => ({ balance, rank: chainRank[balance.blockchain] }))
    .sort((left, right) => right.rank - left.rank || left.balance.id.localeCompare(right.balance.id))
    .map(({ balance }) => balance), [balances]);

  const rows = useMemo(() => sortedBalances.map((balance) => {
      const price = prices[balance.currency];
      const usdValue = typeof price === 'number' && Number.isFinite(price) && price >= 0
        ? price * balance.amount
        : undefined;
      return {
        balance,
        usdValue,
        formattedAmount: new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 6,
        }).format(balance.amount),
      };
    }), [sortedBalances, prices]);

  return (
    <div {...rest}>
      {children}
      {rows.map(({ balance, usdValue, formattedAmount }) => (
        <WalletRow
          key={balance.id}
          balance={balance}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      ))}
    </div>
  );
}
```

Unknown blockchain values should be rejected at the API boundary (or represented as an explicit `Unknown` variant with a deliberate display policy). Unknown prices produce an unavailable value here; the row should render a clear unavailable-price state so it is not mistaken for a real zero quote. Keeping both inputs in the memo dependencies is intentional because this refactor computes price-derived row values inside the memo.
