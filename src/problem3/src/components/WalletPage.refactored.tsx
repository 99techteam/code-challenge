import React, { FC } from "react";
import { SimpleBoxProps } from "../types/wallet";
import { useWalletBalances, usePrices } from "../hooks/useMockData";
import { useEnrichedWalletBalances } from "../hooks/useEnrichedWalletBalances";
import { WalletRow } from "./WalletRow";

type Props = SimpleBoxProps;

const WalletPage: FC<Props> = (props: Props) => {
  const { classes, ...rest } = props;

  // Fetch data from hooks
  const balances = useWalletBalances();
  const prices = usePrices();

  // Process balances using custom hook
  const enrichedBalances = useEnrichedWalletBalances(balances, prices);

  // Render rows
  const rows = enrichedBalances.map((balance) => (
    <WalletRow
      className={classes.row}
      key={balance.currency}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return (
    <div {...rest} className="p-4 md:p-6 bg-gray-50 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Sorted Wallet Balances
      </h2>
      {rows}
    </div>
  );
};

export default WalletPage;
