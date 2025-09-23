import type { FormattedWalletBalance } from '../types';

interface WalletRowProps {
  balance: FormattedWalletBalance;
}

export const WalletRow = ({ balance }: WalletRowProps) => {
  return (
    <div className="wallet-row">
      <div className="token-info">
        <span className="token-name">{balance.token.name}</span>
        <span className="token-blockchain">{balance.token.blockchain}</span>
      </div>
      <div className="balance-info">
        <span className="token-amount">
          {balance.formatted} {balance.token.symbol}
        </span>
        <span className="usd-value">
          ${balance.usdValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>
    </div>
  );
};