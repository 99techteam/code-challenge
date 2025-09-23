import { memo } from 'react';
import { Box, BoxProps } from '@your-ui-lib/core';

// Enums and Constants
enum Blockchain {
  Osmosis = 'Osmosis',
  Ethereum = 'Ethereum',
  Arbitrum = 'Arbitrum',
  Zilliqa = 'Zilliqa',
  Neo = 'Neo'
}

const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
  [Blockchain.Osmosis]: 100,
  [Blockchain.Ethereum]: 50,
  [Blockchain.Arbitrum]: 30,
  [Blockchain.Zilliqa]: 20,
  [Blockchain.Neo]: 20,
};

// Types
interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {
  className?: string;
}

// Helper functions
const getPriority = (blockchain: Blockchain): number => 
  BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;

const formatBalance = (balance: WalletBalance, price: number): FormattedWalletBalance => ({
  ...balance,
  formatted: balance.amount.toFixed(),
  usdValue: price * balance.amount
});

// Memoized Components
const WalletRow = memo<FormattedWalletBalance & { className?: string }>(
  ({ className, amount, usdValue, formatted }) => (
    <Box className={className}>
      <span>{formatted}</span>
      <span>${usdValue.toFixed(2)}</span>
    </Box>
  )
);

WalletRow.displayName = 'WalletRow';

// Main Component
export const WalletPage: React.FC<Props> = ({ className, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedAndFormattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((a: WalletBalance, b: WalletBalance) => {
        const priorityA = getPriority(a.blockchain);
        const priorityB = getPriority(b.blockchain);
        return priorityB - priorityA; // Higher priority first
      })
      .map((balance: WalletBalance) => 
        formatBalance(balance, prices[balance.currency] ?? 0)
      );
  }, [balances, prices]);

  return (
    <Box className={className} {...rest}>
      {sortedAndFormattedBalances.map((balance) => (
        <WalletRow
          key={`${balance.blockchain}-${balance.currency}`}
          {...balance}
          className="wallet-row"
        />
      ))}
    </Box>
  );
};