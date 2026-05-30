import { useEffect, useState } from 'react';
import { Problem1View } from './problem1/view';
import { Problem2View } from './problem2/view';
import { Problem3View } from './problem3/view';

type TabId = 'problem1' | 'problem2' | 'problem3';

const TABS: { id: TabId; label: string; blurb: string }[] = [
  {
    id: 'problem1',
    label: 'Problem 1 — Sum to N',
    blurb: 'Four implementations: iterative, formula, functional, big-number.',
  },
  {
    id: 'problem2',
    label: 'Problem 2 — Fancy Swap',
    blurb: 'Currency swap form with live Switcheo prices.',
  },
  {
    id: 'problem3',
    label: 'Problem 3 — Messy React',
    blurb: 'Issue analysis + refactored WalletPage live demo.',
  },
];

const parseHash = (): TabId => {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (raw === 'problem2' || raw === 'problem3') return raw;
  return 'problem1';
};

export function App() {
  const [tab, setTab] = useState<TabId>(parseHash);

  useEffect(() => {
    const onHashChange = () => setTab(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-title-tag">99Tech</span>
          <h1>Code Challenge #1</h1>
        </div>
        <nav className="app-tabs" role="tablist">
          {TABS.map((t) => (
            <a
              key={t.id}
              role="tab"
              aria-selected={t.id === tab}
              href={`#/${t.id}`}
              className={`app-tab ${t.id === tab ? 'active' : ''}`}
            >
              {t.label}
            </a>
          ))}
        </nav>
        <p className="app-subtitle">{activeTab.blurb}</p>
      </header>

      <main className="app-main">
        {tab === 'problem1' && <Problem1View />}
        {tab === 'problem2' && <Problem2View />}
        {tab === 'problem3' && <Problem3View />}
      </main>

      <footer className="app-footer">
        <span>
          Source on GitHub · Run with <code>npm run dev</code> · Tests with{' '}
          <code>npm test</code>
        </span>
      </footer>
    </div>
  );
}
