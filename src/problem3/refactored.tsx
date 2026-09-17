import { useMemo } from "react";

// External dependencies not shown in the original snippet:
// BoxProps, WalletRow, classes, useWalletBalances, usePrices

// A closed union of the supported chains instead of magic strings / `any`.
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // was missing in the original - caused the `balance.blockchain` type error
}

interface Props extends BoxProps {}

// O(1) lookup table instead of a `switch`. Also lets the compiler catch
// unknown chains, and no longer needs to be re-created on every render.
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNSUPPORTED_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? UNSUPPORTED_PRIORITY;

const WalletPage = (props: Props) => {
  const { ...rest } = props; // `children` removed - it was destructured but never used
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(
    () =>
      balances
        // Keep only supported chains with a positive balance.
        .filter((balance) => {
          const priority = getPriority(balance.blockchain);
          return priority > UNSUPPORTED_PRIORITY && balance.amount > 0;
        })
        // Sort descending by priority; subtraction returns 0 for ties explicitly.
        .sort(
          (lhs, rhs) =>
            getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
        ),
    [balances], // `prices` removed - it was a stale, unused dependency
  );

  // Single map: filter, sort, render in one pass. Removes the unused
  // `formattedBalances` array and the `.formatted` read from a non-existent field.
  const rows = sortedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency} // stable key instead of array index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
