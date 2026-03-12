import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  usdValue: number;
}

type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo"
  | string;

type Props = {
  children?: React.ReactNode;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  //   Assume that useWalletBalances is a hook that returns an array of wallet balances and usePrices is a hook that returns an object with the current prices of the currencies
  const balances = useWalletBalances();
  //    Assume that usePrices is a hook that returns an object with the current prices of the currencies
  const prices = usePrices();

  /* My refactor code for sorting wallet balances by priority */
  const arrPriority: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          // i dont know if the required is check balance.amount is > 0 or <= 0 but i think it not right to get balance prioty with balance is <= 0 so i fixed to > 0
          // and i see the problem is about performane that code has through many step to only get the balances priority infor, so i just refactor this code to easy read and maintain, and optimized performance for get balances
          !!arrPriority?.[balance.blockchain] && balance.amount > 0,
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          arrPriority[lhs.blockchain] - arrPriority[rhs.blockchain],
      );
  }, [balances]);
  /*  */

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
      usdValue: prices[balance.currency] * balance.amount,
    };
  });

  return (
    <div {...rest}>
      {formattedBalances.map(
        (balance: FormattedWalletBalance, index: number) => (
          //    Assume of i have a component WalletRow that takes the balance and display it in a row
          <WalletRow
            // I comment this line because in formattedBalances i dont see any property classes
            // className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={balance.usdValue}
            formattedAmount={balance.formatted}
          />
        ),
      )}
    </div>
  );
};
