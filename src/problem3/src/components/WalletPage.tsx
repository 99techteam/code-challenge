import { useWalletBalances } from '../hooks/useWalletBalances';
import { useSortedBalances } from '../hooks/useSortedBalances';
import { WalletRow } from './WalletRow';
import { LoadingSpinner } from './LoadingSpinner';

export const WalletPage = () => {
  const { balances, isLoading, error } = useWalletBalances();
  const sortedBalances = useSortedBalances(balances);

  if (error) {
    throw error; // This will be caught by ErrorBoundary
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="wallet-page">
      <h1>Your Wallet</h1>
      <div className="wallet-list">
        {sortedBalances.length === 0 ? (
          <div className="empty-state">No tokens found in your wallet</div>
        ) : (
          sortedBalances.map((balance, index) => (
            <WalletRow key={`${balance.token.symbol}-${index}`} balance={balance} />
          ))
        )}
      </div>
    </div>
  );
};