import { SwapForm } from './SwapForm';

export function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Current home">
          <span className="brand-mark" aria-hidden="true">≈</span> current<span className="brand-dot">.</span>
        </a>
        <span className="demo-badge"><span aria-hidden="true">●</span> Demo environment</span>
      </header>
      <main>
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">LESS FRICTION. MORE FLOW.</p>
          <h1 id="page-title">A simpler way<br /> to <em>swap.</em></h1>
          <p className="intro-copy">Your assets, a new direction. Preview a token exchange in just a few clicks.</p>
          <div className="intro-note">
            <span aria-hidden="true">↗</span>
            <p>No wallet connection.<br /><strong>Just a little room to explore.</strong></p>
          </div>
        </section>
        <SwapForm />
      </main>
      <footer>
        <span>BUILT TO KEEP THINGS MOVING.</span>
        <span>99Tech frontend challenge · 01—03</span>
      </footer>
    </>
  );
}
