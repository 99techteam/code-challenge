import React, { useMemo } from 'react';

/* ----- Types ----- */
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

type PricesMap = Record<string, number>;

type Props = React.HTMLAttributes<HTMLDivElement>; // instead of BoxProps

/* ----- Priority map ( no `any`) ----- */
const CHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (chain: Blockchain): number => CHAIN_PRIORITY[chain] ?? -1;

/* ----- Helpers ----- */
const formatAmount = (n: number, maxFrac = 6) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFrac,
  }).format(n);

declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): PricesMap;
declare const WalletRow: React.FC<{
  amount: number;
  usdValue: number;
  formattedAmount: string;
  className?: string;
}>;

/* ----- Component ----- */
const WalletPage: React.FC<Props> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // 1) filter valid, positive balances; 
  // 2) sort by priority desc
  const sortedBalances = useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -1 && b.amount > 0)
      .sort(
        (a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)
      );
  }, [balances]);

  // format once
  const formattedBalances = useMemo<FormattedWalletBalance[]>(
    () =>
      sortedBalances.map((b) => ({
        ...b,
        formatted: formatAmount(b.amount),
      })),
    [sortedBalances]
  );

  // render rows
  const rows = useMemo(
    () =>
      formattedBalances.map((b) => {
        const usd = (prices[b.currency] ?? 0) * b.amount;
        return (
          <WalletRow
            key={`${b.blockchain}:${b.currency}`}
            amount={b.amount}
            usdValue={usd}
            formattedAmount={b.formatted}
          />
        );
      }),
    [formattedBalances, prices]
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;