import { WalletRow } from "@/components";
import { usePrices, useWalletBalances } from "@/hooks";
import { FormattedWalletBalance, WalletBalance } from "@/interfaces";
import { getPriority } from "@/mocks";
import { randomKey } from "@/utils";
import { useMemo } from "react";

interface IProps {
  children?: React.ReactNode;
}

//---------------- I have explained it all in the readme.md ----------------

export default function WalletLayout({ children, ...rest }: IProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (balancePriority > -99 && balance.amount <= 0) return true;
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) return -1;
        if (rightPriority > leftPriority) return 1;
        return 0;
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map(
    (balance: WalletBalance): FormattedWalletBalance => {
      return {
        ...balance,
        formatted: balance.amount.toFixed(),
      };
    }
  );

  return (
    <div {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          key={randomKey()}
          amount={balance.amount}
          usdValue={prices[balance.currency] * balance.amount}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
}
