/*
There are some issues or Enhancements that I found in the code:
  - Missed field 'blockchain' in the WalletBalance interface.
  - The FormattedWalletBalance should extend the WalletBalance to avoid duplicates
  - We use Props to extend the BoxProps, but without any extension. We should use BoxProps in this case.
  - Do not create an enum for the blockchain
  - The priority of Neo blockchain is 20, and it's the same as Zilliqa => I assume that the priority of Neo blockchain should be 10
  - Not defined the constant for priority value -99 => I named it as MIN_PRIORITY
  - When filtering the balances, use the wrong variable "lhsPriority" instead of "balancePriority". And the condition should filter the balances with amount greater than 0.
  - We do not return 0 when leftPriority is equal to rightPriority
  - In sortedBalances useMemo, the prices is not a dependency, we should remove it
  - We should use formattedBalances instead of sortedBalances when rendering the list of Wallet. We can combine it into the useMemo that we calculate the sortedBalance
  - When rendering WalletRow, we use index as a key, but this is not recommendation. In this case, we can use the blockchain and currency as the key.
  - We get the children from the props but we don't render it
*/

// Starting of declaring types to reduce errors :((( while we don't import the correct libs or use the functions from the air
declare namespace React {
  interface FC<P = {}> {
    (props: P): any;
  }
}
declare namespace classes {
  interface row {}
}
declare type BoxProps = {
  children: any
};
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function useMemo(callback: VoidFunction, dependencies: any[]): any;
// End of declaring types

enum Blockchain {
  Osmosis = 'Osmosis',
  Ethereum = 'Ethereum',
  Arbitrum = 'Arbitrum',
  Zilliqa = 'Zilliqa',
  Neo = 'Neo',
  Unknown = 'Unknown',
}

const MIN_PRIORITY = -99;

const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 10, // I assume that the Blockchain Neo is 10, because the blockchain priority is decrease 
  [Blockchain.Unknown]: MIN_PRIORITY,
};

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// It should be a util function, and is outside of the React Component
const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain];
}

const formatBalance = (balance: number, fractionDigits = 2) => {
  return balance.toFixed(fractionDigits);
}

const WalletPage: React.FC<BoxProps> = ({
  children,
  ...restProps
}: BoxProps) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances: FormattedWalletBalance[] = useMemo(() => {
    const validBalances = balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);

      return balancePriority > MIN_PRIORITY && balance.amount > 0;
    });

    const sortedBalances = validBalances.sort(function balanceAscSort(lhs: WalletBalance, rhs: WalletBalance) {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);

      return rightPriority - leftPriority;
    })

    return sortedBalances.map((balance) => ({
      ...balance,
      formatted: formatBalance(balance.amount),
    } as FormattedWalletBalance))
  }, [balances]);

  return (
    <div {...restProps}>
      {
        sortedBalances.map((balance: FormattedWalletBalance) => {
          const usdValue = prices[balance.currency] * balance.amount;

          return (
            <WalletRow 
              key={`${balance.blockchain}-${balance.currency}`}
              className={classes.row}
              amount={balance.amount}
              usdValue={usdValue}
              formattedAmount={balance.formatted}
            />
          )
        })
      }

      {children} // I assume that we should render the children here
    </div>
  )
}