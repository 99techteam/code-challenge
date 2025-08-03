//refactor add proper import
import React, { useMemo } from 'react';

enum Blockchain {
  OSMOSIS = 'Osmosis',
  ETHEREUM = 'Ethereum',
  ARBITRUM = 'Arbitrum',
  ZILLIQA = 'Zilliqa',
  NEO = 'Neo'
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // refactor: add property blockchain to stored name of blockchain
}
// refactor : we can use extends here for inheritance
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// refactor : declare new interface for WalletRow
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

interface Props {
  children?: React.ReactNode;
  [key: string]: any;
}

// refactor Mock hooks - replace with actual implementations
const useWalletBalances = (): WalletBalance[] => {
  return [];
};

// refactor: Mock hooks - replace with actual implementations
const usePrices = (): Record<string, number> => {
  return {};
};

// Define blockchain priorities as a constant object for better maintainability
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  [Blockchain.OSMOSIS]: 100,
  [Blockchain.ETHEREUM]: 50,
  [Blockchain.ARBITRUM]: 30,
  [Blockchain.ZILLIQA]: 20,
  [Blockchain.NEO]: 20,
} as const;

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99; // Use nullish coalescing for cleaner code
};


//refactor: create component WalletRow
const WalletRow: React.FC<WalletRowProps> = ({ className, amount, usdValue, formattedAmount }) => {
  return (
    <div className={className}>
      <span>Amount: {formattedAmount}</span>
      <span>USD Value: ${usdValue.toFixed(2)}</span>
    </div>
  );
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        //refactor: fix logic to filter positive amount and valid priority
        //refactor: change name lhsPriority to balancePriority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // refactor: equal priority
      });
  }, [balances]); //refactor: we just working on balances's data so don't need to add prices as dependency here.

  //refactor : declare type formattedBalances + add toFixed(2) to show 2 digits after decimal point
  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(2)
    }
  });

  //refactor: use data already formatted, here is formattedBalances
  const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
    //refactor: check null for prices
    const usdValue = (prices[balance.currency] || 0) * balance.amount;
    return (
      // refactor : key should be an unique id rather than just index
      // refactor : remove className use for all rows so we don't need to passing here as prop
      <WalletRow
        key={`${balance.blockchain}-${balance.currency}-${index}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
      {/* refactor: add children here, because original already destructuring but haven't used yet */}
      {children}
    </div>
  );
};

export default WalletPage;