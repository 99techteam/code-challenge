# Problem 3 — Wallet balance refactor

This document describes the issues in the original wallet code and how the refactor fixes them.

---

## 1. Filter logic bug

The filter uses a variable `lhsPriority` that is never defined, so the code crashes at runtime. The condition also keeps balances with amount <= 0, which is wrong for a wallet (we only want positive balances).

**Fix:** Use the correct priority variable and filter with `balancePriority > -99 && balance.amount > 0`.

---

## 2. Type safety

`getPriority` takes `blockchain: any`, so TypeScript does not check the value. Invalid blockchains can slip through and you lose autocomplete and safety.

**Fix:** Define a union type, e.g. `type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'`, and use it instead of `any`.

---

## 3. Repeated priority calculation

`getPriority` is called many times in filter and sort even though the result does not change. That wastes work and gets slower with more items.

**Fix:** Use a constant map like `PRIORITY_MAP: Record<Blockchain, number>` and look up the priority from it.

---

## 4. useMemo dependencies

The useMemo dependency array includes `prices` even when the memo does not use it (in the original). That causes unnecessary recalculations and is misleading.

**Fix:** Only list dependencies that the memo actually uses. Add `prices` only when the computation needs it.

---

## 5. Mutating the array with sort

`Array.prototype.sort` changes the array in place. If `balances` comes from props or a hook, you are mutating shared data, which can cause bugs elsewhere and breaks React’s expectation of immutability.

**Fix:** Sort a copy: `balances.slice().sort(...)` so the original array is not changed.

---

## 6. Unused formattedBalances

`formattedBalances` is computed but never used. It adds noise and extra work.

**Fix:** Remove it, or move the formatting into the same pipeline where the data is actually used (e.g. inside the same useMemo that produces the list you render).

---

## 7. Wrong type assertion

`sortedBalances` is asserted as `FormattedWalletBalance` before formatting is done. TypeScript then assumes fields like `formatted` exist when they might not, which can cause runtime errors.

**Fix:** Use `FormattedWalletBalance` (or an extended type) only after the step that adds `formatted` and any other derived fields.

---

## 8. Using index as React key

Using the array index as `key` is problematic when the list can be reordered or items removed. React can update the wrong DOM nodes and you get subtle bugs.

**Fix:** Use a stable unique value, e.g. `key={balance.currency}`.

---

## 9. Business logic in render

USD value is computed inside the render loop, so it runs on every render and mixes business logic with presentation.

**Fix:** Do all calculations (filter, sort, format, USD value) inside useMemo and keep the component’s render only for displaying the result.

---

## Refactored code

```ts
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface EnhancedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

const PRIORITY_MAP: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

interface Props {}

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo<EnhancedWalletBalance[]>(() => {
    return balances
      .filter((b: WalletBalance) => {
        const priority = PRIORITY_MAP[b.blockchain as Blockchain] ?? -99;
        return priority > -99 && b.amount > 0;
      })
      .slice()
      .sort((a: WalletBalance, b: WalletBalance) => {
        const pa = PRIORITY_MAP[a.blockchain as Blockchain] ?? -99;
        const pb = PRIORITY_MAP[b.blockchain as Blockchain] ?? -99;
        return pb - pa;
      })
      .map((b: WalletBalance) => ({
        ...b,
        formatted: b.amount.toFixed(2),
        usdValue: (prices[b.currency] ?? 0) * b.amount,
      }));
  }, [balances, prices]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance) => (
        <WalletRow
          key={balance.currency}
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
