import { useTokens, useBalances } from './hooks/useTokens';
import { useTheme } from './hooks/useTheme.tsx';
import { SwapCard } from './components/SwapCard';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { tokens, loading, error } = useTokens();
  const { balances } = useBalances();

  if (loading) {
    return (
      <div className="app-shell app-shell--loading">
        <div className="loading-mark">
          <div className="loading-mark__ring loading-mark__ring--outer" />
          <div className="loading-mark__ring loading-mark__ring--inner" />
          <div className="loading-mark__dot" />
        </div>
        <p className="loading-text">Loading tokens...</p>
      </div>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <div className="app-shell">
        <div className="error-card">
          <div className="error-card__icon">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2>Connection failed</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--one" />
      <div className="app-shell__glow app-shell__glow--two" />
      <div className="app-shell__grid" />

      <div className="app-shell__content">
        <header className="topbar">
          <div className="brand">
            <div className="brand__icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="brand__copy">
              <h1>Token Swap</h1>
              <p>Premium digital wallet</p>
            </div>
          </div>

          <div className="topbar__actions">
            <button className="pill-button pill-button--network">
              <span className="status-dot" />
              Ethereum
            </button>
            <button className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="main-stage">
          <SwapCard tokens={tokens} balances={balances} />
        </main>

        <footer className="footer-note">
          <span>Secure</span>
          <span>Powered by Switcheo</span>
          <span>v2.0</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
