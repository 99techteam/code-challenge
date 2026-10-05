import { useMemo, type ComponentPropsWithoutRef } from 'react';
import {
  formatAmount,
  formatUsd,
  getUsdValue,
  selectBalances,
  type Prices,
  type WalletBalance,
} from './balances';

export interface WalletPageProps extends ComponentPropsWithoutRef<'div'> {
  balances: readonly WalletBalance[];
  prices: Prices;
}

interface WalletRowProps {
  currency: string;
  blockchain: string;
  formattedAmount: string;
  usdValue: number | null;
}

// Minimal semantic markup replaces the unspecified WalletRow from the prompt.
function WalletRow({
  currency,
  blockchain,
  formattedAmount,
  usdValue,
}: WalletRowProps) {
  return (
    <li>
      <span>
        {currency} ({blockchain})
      </span>{' '}
      <span>{formattedAmount}</span>{' '}
      <span>
        {usdValue === null ? 'Price unavailable' : formatUsd(usdValue)}
      </span>
    </li>
  );
}

export function WalletPage({
  balances,
  prices,
  children,
  ...divProps
}: WalletPageProps) {
  const sortedBalances = useMemo(() => selectBalances(balances), [balances]);

  return (
    <div {...divProps}>
      {sortedBalances.length === 0 ? (
        <p>No supported positive balances.</p>
      ) : (
        <ul aria-label="Wallet balances">
          {sortedBalances.map((balance) => (
            <WalletRow
              key={balance.id}
              currency={balance.currency}
              blockchain={balance.blockchain}
              formattedAmount={formatAmount(balance.amount)}
              usdValue={getUsdValue(balance.amount, prices[balance.currency])}
            />
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
