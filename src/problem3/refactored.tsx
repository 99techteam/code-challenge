import { ComponentProps, useMemo } from 'react';

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const LOWEST_PRIORITY = -99;

// Explain: Avoid recreation on every render or wrap by useCallback
const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? LOWEST_PRIORITY;

const formatBalanceAmount = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(amount);

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// Explain: Remove FormattedWalletBalance interface because we can map in the render directly
// interface FormattedWalletBalance {
//     currency: string;
//     amount: number;
//     formatted: string;
// }

interface BoxProps { }

interface Props extends ComponentProps<'div'>, BoxProps {
  children?: React.ReactNode;
}

export const WalletPage = ({ children, ...rest }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // Explain: balancePriority > LOWEST_PRIORITY && balance.amount <= 0 => return true => another case: return false
      return balancePriority > LOWEST_PRIORITY && balance.amount <= 0
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      // Explain: rightPriority > leftPriority => return 1 => rightPriority is at the front
      return rightPriority - leftPriority;
    });
  }, [balances, getPriority]);

  // Explain: Remove it because we can map in the render directly
  // const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  //     return {
  //         ...balance,
  //         formatted: balance.amount.toFixed()
  //     }
  // });

  const rows = useMemo(
    () =>
      sortedBalances.map((balance: WalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        const formattedAmount = formatBalanceAmount(balance.amount);
        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}:${balance.currency}`} // Explain: Remove index key
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formattedAmount}
          />
        );
      }),
    [prices, sortedBalances],
  );

  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
};
