import { useTokenPrices } from './hooks/useTokenPrices';
import { SwapForm } from './components/SwapForm';
import './App.css';

function App() {
  const { tokens, loading, error } = useTokenPrices();

  return (
    <div className="app-bg">
      <div className="card">
        {loading && (
          <div className="card-loading">
            <span className="card-spinner" />
            <span>Loading tokens…</span>
          </div>
        )}
        {error && (
          <div className="card-error">
            Failed to load token prices: {error}
          </div>
        )}
        {!loading && !error && <SwapForm tokens={tokens} />}
      </div>
    </div>
  );
}

export default App;
