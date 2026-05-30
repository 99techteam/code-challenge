import { useMemo, useState } from 'react';
import { issues, SEVERITY_LABEL, type Severity } from './analysis';
import { WalletPage } from './Refactored';
import originalSource from './original.tsx.txt?raw';
import refactoredSource from './Refactored.tsx?raw';
import './style.css';

type CodeLayout = 'split' | 'stacked';
type SeverityFilter = Severity | 'all';

export function Problem3View() {
  const [layout, setLayout] = useState<CodeLayout>('split');
  const [filter, setFilter] = useState<SeverityFilter>('all');

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? issues
        : issues.filter((i) => i.severity === filter),
    [filter],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = {
      bug: 0,
      perf: 0,
      'anti-pattern': 0,
      style: 0,
    };
    for (const i of issues) c[i.severity]++;
    return c;
  }, []);

  return (
    <div className="p3">
      {/* ---------------- Section 1: Issues ---------------- */}
      <section className="panel p3-issues">
        <header className="p3-section-head">
          <div>
            <h2>Issues found</h2>
            <p className="p3-section-blurb">
              {issues.length} distinct issues across bugs, performance, and
              anti-patterns.
            </p>
          </div>
          <div className="p3-filter">
            {(['all', 'bug', 'perf', 'anti-pattern'] as SeverityFilter[]).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  className={`p3-filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all'
                    ? `All (${issues.length})`
                    : `${SEVERITY_LABEL[f as Severity]} (${counts[f as Severity]})`}
                </button>
              ),
            )}
          </div>
        </header>

        <ol className="p3-issue-list">
          {filtered.map((issue) => (
            <li key={issue.id} className={`p3-issue sev-${issue.severity}`}>
              <div className="p3-issue-head">
                <span className="p3-issue-num">#{issue.id}</span>
                <span className={`p3-sev-badge sev-${issue.severity}`}>
                  {SEVERITY_LABEL[issue.severity]}
                </span>
                <h3 className="p3-issue-title">{issue.title}</h3>
              </div>
              <p className="p3-issue-body">{issue.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Section 2: Side-by-side code ---------------- */}
      <section className="panel">
        <header className="p3-section-head">
          <div>
            <h2>Original vs Refactored</h2>
            <p className="p3-section-blurb">
              Left: the messy code from the prompt. Right: refactored version
              addressing every issue listed above.
            </p>
          </div>
          <div className="p3-layout-toggle">
            <button
              type="button"
              className={`p3-filter-btn ${layout === 'split' ? 'active' : ''}`}
              onClick={() => setLayout('split')}
            >
              Side-by-side
            </button>
            <button
              type="button"
              className={`p3-filter-btn ${layout === 'stacked' ? 'active' : ''}`}
              onClick={() => setLayout('stacked')}
            >
              Stacked
            </button>
          </div>
        </header>

        <div className={`p3-code-grid ${layout}`}>
          <CodeBlock label="Original (with bugs)" source={originalSource} flavour="original" />
          <CodeBlock label="Refactored" source={refactoredSource} flavour="refactored" />
        </div>
      </section>

      {/* ---------------- Section 3: Live demo ---------------- */}
      <section className="panel">
        <header className="p3-section-head">
          <div>
            <h2>Refactored component — live demo</h2>
            <p className="p3-section-blurb">
              Rendered with mocked <code>useWalletBalances</code>,{' '}
              <code>usePrices</code>, <code>WalletRow</code>, and{' '}
              <code>BoxProps</code> so the page actually mounts. Rows below
              are produced by the refactored pipeline, sorted by chain
              priority (Osmosis &gt; Ethereum &gt; Arbitrum &gt; Zilliqa = Neo).
            </p>
          </div>
        </header>

        <div className="p3-demo">
          <WalletPage />
        </div>
      </section>
    </div>
  );
}

function CodeBlock({
  label,
  source,
  flavour,
}: {
  label: string;
  source: string;
  flavour: 'original' | 'refactored';
}) {
  return (
    <div className={`p3-code-block ${flavour}`}>
      <div className="p3-code-label">{label}</div>
      <pre className="p3-code">
        <code>{source}</code>
      </pre>
    </div>
  );
}
