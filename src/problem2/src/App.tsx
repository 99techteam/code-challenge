import { SwapForm } from "./components/SwapForm";
import { usePrices } from "./hooks/usePrices";
import "./App.css";

export default function App() {
  const { loading, tokens, error } = usePrices();

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo">⟡ Switcheo</span>
      </header>

      <main className="app__main">
        {loading && (
          <div className="app__status">
            <span className="spinner spinner--lg" aria-hidden />
            <p>Loading tokens…</p>
          </div>
        )}

        {error && (
          <div className="app__status app__status--error">
            <p>Could not load token prices.</p>
            <p className="app__error-detail">Please refresh the page.</p>
          </div>
        )}

        {!loading && !error && <SwapForm tokens={tokens} />}
      </main>
    </div>
  );
}
