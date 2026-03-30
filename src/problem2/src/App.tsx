import { usePrices } from './hooks/usePrices';
import { useSwapForm } from './hooks/useSwapForm';
import SwapCard from './components/SwapCard';
import TransactionHistory from './components/TransactionHistory';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const { tokens, loading, error } = usePrices();
  const swap = useSwapForm(tokens);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <SwapCard swap={swap} tokens={tokens} />
            <TransactionHistory transactions={swap.transactions} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
