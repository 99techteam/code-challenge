
import React, { useMemo } from "react";
import { BoxProps } from "@mui/material";
import WalletRow from "./WalletRow";
import useWalletBalances from "./hooks/useWalletBalances";
import usePrices from "./hooks/usePrices";
import Spinner from "@/assets/icons/loading/Spinner";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps { }

const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const isLoading = balances.length === 0 || Object.keys(prices).length === 0;

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    if (isLoading) return [];

    return balances
      .filter((b: WalletBalance) => (PRIORITY_MAP[b.blockchain] ?? -99) > -99)
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = PRIORITY_MAP[lhs.blockchain] ?? -99;
        const rightPriority = PRIORITY_MAP[rhs.blockchain] ?? -99;
        return rightPriority - leftPriority;
      })
      .map((b) => ({
        ...b,
        formatted: b.amount.toFixed(),
      }));
  }, [balances, isLoading]);

  const rows = useMemo(() => {
    return formattedBalances.map((b: FormattedWalletBalance, index: number) => {
      const usdValue = (prices[b.currency] ?? 0) * b.amount;
      return (
        <WalletRow
          key={index}
          amount={b.amount}
          usdValue={usdValue}
          formattedAmount={b.formatted}
        />
      );
    });
  }, [formattedBalances, prices]);

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;