import { usePrices } from './hooks/usePrices';
import { SwapForm } from './components/SwapForm';

export default function App() {
  const { tokens, loading, error } = usePrices();

  return (
    <main className="app">
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />

      <div className="app__inner">
        {loading && (
          <div className="swap-card swap-card--state">
            <div className="spinner spinner--lg" />
            <p>Loading live prices…</p>
          </div>
        )}

        {error && !loading && (
          <div className="swap-card swap-card--state">
            <p className="error-msg">Couldn’t load prices: {error}</p>
          </div>
        )}

        {!loading && !error && <SwapForm tokens={tokens} />}

        <footer className="app__footer">
          Prices &amp; icons by Switcheo · Demo — no real funds move.
        </footer>
      </div>
    </main>
  );
}
