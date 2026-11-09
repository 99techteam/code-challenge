import { useMemo, type ComponentPropsWithoutRef } from 'react';
import { getUsdValue, sortBalances, type Prices, type WalletBalance } from './balances';

export interface WalletPageProps extends ComponentPropsWithoutRef<'div'> {
  balances: readonly WalletBalance[];
  prices: Prices;
}

const amountFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 });
const usdFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function WalletRow({ balance, usdValue }: { balance: WalletBalance; usdValue: number | null }) {
  return (
    <div className="wallet-row" role="listitem">
      <span>{balance.currency} · {balance.blockchain}</span>
      <span>{amountFormatter.format(balance.amount)}</span>
      <span>{usdValue === null ? 'Price unavailable' : usdFormatter.format(usdValue)}</span>
    </div>
  );
}

export function WalletPage({ balances, prices, children, ...rest }: WalletPageProps) {
  const sortedBalances = useMemo(() => sortBalances(balances), [balances]);

  return (
    <div {...rest}>
      <div role="list" aria-label="Wallet balances">
        {sortedBalances.map(balance => (
          <WalletRow key={balance.id} balance={balance} usdValue={getUsdValue(balance, prices)} />
        ))}
      </div>
      {sortedBalances.length === 0 && <p>No supported balances.</p>}
      {children}
    </div>
  );
}
