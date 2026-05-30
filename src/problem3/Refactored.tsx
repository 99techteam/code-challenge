import { useMemo } from 'react';
import {
  type BoxProps,
  type Blockchain,
  type FormattedWalletBalance,
  type WalletBalance,
  WalletRow,
  classes,
  usePrices,
  useWalletBalances,
} from './mocks';

// --- pure, dependency-free helpers hoisted out of the component ---

const PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
  PRIORITY[blockchain] ?? -99;

const AMOUNT_DECIMALS = 4;

// `Props` adds nothing of its own, so use `BoxProps` directly. `children`
// was destructured and never used in the original; leaving it on `...rest`
// keeps the component a transparent wrapper if a parent passes it.
export function WalletPage(props: BoxProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Single memo: filter + sort + format + compute usdValue. Schwartzian
  // transform means getPriority/price lookup runs once per row, not once
  // per sort comparison. Depends on both `balances` and `prices` because
  // both feed the final output.
  const rows = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter(
        (b: WalletBalance) =>
          b.amount > 0 && getPriority(b.blockchain) > -99,
      )
      .map((b) => ({
        balance: b,
        priority: getPriority(b.blockchain),
        price: prices[b.currency] ?? 0,
      }))
      .sort((a, b) => b.priority - a.priority)
      .map(({ balance, price }) => ({
        ...balance,
        formatted: balance.amount.toFixed(AMOUNT_DECIMALS),
        usdValue: price * balance.amount,
      }));
  }, [balances, prices]);

  return (
    <div {...props}>
      {rows.map((row) => (
        <WalletRow
          key={row.currency}
          className={classes.row}
          currency={row.currency}
          blockchain={row.blockchain}
          amount={row.amount}
          usdValue={row.usdValue}
          formattedAmount={row.formatted}
        />
      ))}
    </div>
  );
}
