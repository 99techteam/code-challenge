import { lazy, Suspense } from 'react';
import { useTheme } from './hooks/useTheme';
import { useInView } from './hooks/useInView';

const SwapForm = lazy(() => import('./components/SwapForm').then((m) => ({ default: m.SwapForm })));

function SwapFormSkeleton() {
  return (
    <div className="swap-form swap-form--skeleton" aria-busy="true">
      <div className="skeleton-row" />
      <div className="skeleton-swap-btn" />
      <div className="skeleton-row" />
      <div className="skeleton-btn" />
      <p className="status-message" role="status">
        Loading…
      </p>
    </div>
  );
}

const features = [
  {
    title: 'Real-time rates',
    description: 'Live prices from multiple sources. See your quote before you swap.',
    icon: '📊',
  },
  {
    title: 'Simple & fast',
    description: 'Select tokens, enter amount, confirm. No sign-up required to get started.',
    icon: '⚡',
  },
  {
    title: 'Transparent',
    description: 'Clear exchange rate and estimated output. No hidden fees.',
    icon: '🔍',
  },
];

function App() {
  const { theme, toggleTheme } = useTheme();
  const [swapRef, swapInView] = useInView();
  const [featuresRef, featuresInView] = useInView();

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden="true">
        <span className="landing-bg-blob landing-bg-blob--1" />
        <span className="landing-bg-blob landing-bg-blob--2" />
        <span className="landing-bg-blob landing-bg-blob--3" />
        <span className="landing-bg-blob landing-bg-blob--4" />
        <span className="landing-bg-blob landing-bg-blob--5" />
        <div className="landing-bg-grid" />
      </div>
      <header className="landing-header">
        <div className="landing-header-inner">
          <a href="/" className="logo">
            <span className="logo-icon">⇄</span>
            <span className="logo-text">Swap</span>
          </a>
          <nav className="landing-nav" aria-label="Main">
            <a href="#swap">Swap</a>
            <a href="#features">Features</a>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <span className="theme-toggle-icon" aria-hidden="true">☀️</span>
              ) : (
                <span className="theme-toggle-icon" aria-hidden="true">🌙</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1 className="landing-hero-title">
            Swap tokens at <span className="landing-hero-accent">best rates</span>
          </h1>
          <p className="landing-hero-subtitle">
            Convert between tokens in seconds. Live prices, no sign-up needed.
          </p>
          <a href="#swap" className="landing-hero-cta">
            Try it now
          </a>
        </div>
      </section>

      <section id="swap" ref={swapRef as React.RefObject<HTMLElement>} className={`landing-swap${swapInView ? ' in-view' : ''}`}>
        <div className="landing-swap-inner">
          <div className="swap-card">
            <h2 className="swap-title">Swap</h2>
            <Suspense fallback={<SwapFormSkeleton />}>
              <SwapForm />
            </Suspense>
            <footer className="swap-card-footer">
              <p className="swap-disclaimer">
                Prices are indicative. Actual execution may vary. This is a demo interface.
              </p>
              <p className="swap-source">
                Prices from{' '}
                <a
                  href="https://interview.switcheo.com/prices.json"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Switcheo
                </a>
              </p>
            </footer>
          </div>
        </div>
      </section>

      <section id="features" ref={featuresRef as React.RefObject<HTMLElement>} className={`landing-features${featuresInView ? ' in-view' : ''}`}>
        <div className="landing-features-inner">
          <h2 className="landing-features-title">Why swap with us</h2>
          <div className="landing-features-grid">
            {features.map((f) => (
              <article key={f.title} className="feature-card">
                <span className="feature-card-icon" aria-hidden="true">
                  {f.icon}
                </span>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <p className="landing-footer-copy">
            © {new Date().getFullYear()} Swap. Demo project. Prices from Switcheo.
          </p>
          <a
            href="https://interview.switcheo.com/prices.json"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer-link"
          >
            API
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
