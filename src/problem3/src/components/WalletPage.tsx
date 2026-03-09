import React, { useMemo } from 'react';
import type { WalletPageProps, FormattedWalletBalance } from './types/wallet';
import { useSortedFormattedBalances } from './hooks/useSortedFormattedBalances';

// Assume these hooks are provided elsewhere (e.g. from API layer)
declare function useWalletBalances(): import('./types/wallet').WalletBalance[];
declare function usePrices(): Record<string, number>;

// Placeholder: replace with your actual WalletRow component
interface WalletRowProps {
  className?: string;
  key?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
function WalletRow({ className, amount, usdValue, formattedAmount }: WalletRowProps) {
  return (
    <div className={className}>
      <span>{formattedAmount}</span>
      <span>${usdValue.toFixed(2)}</span>
    </div>
  );
}

export const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useSortedFormattedBalances(balances);

  const rows = useMemo(
    () =>
      formattedBalances.map((balance: FormattedWalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className="row"
            key={balance.currency}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices]
  );

  return <div {...rest}>{rows}</div>;
};
