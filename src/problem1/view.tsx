import { useMemo, useState } from 'react';
import {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
  sum_to_n_d,
} from './lib/sumToN';
import { solutions, type SolutionId } from './solutions';
import './style.css';

const fns: Record<SolutionId, (n: never) => number | string> = {
  a: sum_to_n_a as (n: never) => number,
  b: sum_to_n_b as (n: never) => number,
  c: sum_to_n_c as (n: never) => number,
  d: sum_to_n_d as (n: never) => string,
};

interface ComputeResult {
  value?: string;
  time?: number;
  error?: string;
  warning?: string;
}

interface TestRow {
  pass: boolean;
  label: string;
  expected: string;
  actual: string;
}

const SMALL_CASES: Array<{ n: number; expected: number }> = [
  { n: 0, expected: 0 },
  { n: 1, expected: 1 },
  { n: 5, expected: 15 },
  { n: 10, expected: 55 },
  { n: 100, expected: 5050 },
  { n: 1000, expected: 500500 },
  { n: -1, expected: -1 },
  { n: -5, expected: -15 },
  { n: -100, expected: -5050 },
];

const BIG_CASES: Array<{ n: string; expected: string }> = [
  { n: '1000000', expected: '500000500000' },
  { n: '100000000000', expected: '5000000000050000000000' },
  {
    n: '123456789012345678901234567890',
    expected:
      '7620789614188397919306039269735013345025385542661216720495',
  },
  { n: '-100000000000', expected: '-5000000000050000000000' },
];

// Largest |n| for which n*(n+1)/2 still fits in Number.MAX_SAFE_INTEGER.
// Derived from n*(n+1) <= 2 * MAX_SAFE_INTEGER (= 2^54 - 2):
//   floor((sqrt(1 + 8 * MAX_SAFE_INTEGER) - 1) / 2) === 134_217_727.
// At n = 134_217_727 the sum is 9_007_199_187_632_128, still inside the
// safe range. At n = 134_217_728 it overflows.
const MAX_SAFE_N = 134_217_727;

// Per-solution practical input ceiling. a/b are bounded only by the
// overflow constraint above. c additionally allocates an array of length
// |n|, so we cap it well below the engine's array-length limit to avoid
// "Invalid array length" / out-of-memory. a is also slow at the upper
// end (~1.5s loop), so we mark long runs with a warning in the result.
const PER_SOLUTION_MAX: Record<'a' | 'b' | 'c', number> = {
  a: MAX_SAFE_N,
  b: MAX_SAFE_N,
  c: 1_000_000,
};

const SLOW_THRESHOLD = 5_000_000;

export function Problem1View() {
  const [selected, setSelected] = useState<SolutionId>('a');
  const [rawInput, setRawInput] = useState('100');
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [tests, setTests] = useState<TestRow[] | null>(null);

  const sol = solutions[selected];

  const onSelect = (id: SolutionId) => {
    setSelected(id);
    setResult(null);
    setTests(null);
  };

  const onCompute = () => {
    const raw = rawInput.trim();
    if (!raw) {
      setResult({ error: 'Please enter a value for n.' });
      return;
    }

    try {
      let arg: number | string;
      let slowWarning: string | undefined;
      if (selected === 'd') {
        arg = raw;
      } else {
        const num = Number(raw);
        if (!Number.isFinite(num) || !Number.isInteger(num)) {
          setResult({
            error: `n must be an integer for sum_to_n_${selected}. Switch to sum_to_n_d for arbitrarily large input.`,
          });
          return;
        }
        const limit = PER_SOLUTION_MAX[selected];
        if (Math.abs(num) > limit) {
          const reason =
            selected === 'c'
              ? `sum_to_n_c allocates an array of length |n|, so the practical ceiling is ${limit.toLocaleString()}.`
              : `Result would exceed Number.MAX_SAFE_INTEGER. The largest |n| keeping n·(n+1)/2 inside the safe range is ${limit.toLocaleString()}.`;
          setResult({
            error: `${reason} Switch to sum_to_n_d for arbitrarily large input.`,
          });
          return;
        }
        if (selected === 'a' && Math.abs(num) > SLOW_THRESHOLD) {
          slowWarning = `Heads up: sum_to_n_a loops |n| = ${Math.abs(num).toLocaleString()} times — the UI may freeze briefly.`;
        }
        arg = num;
      }

      const t0 = performance.now();
      const value = (fns[selected] as (n: number | string) => number | string)(
        arg,
      );
      const t1 = performance.now();
      setResult({
        value: String(value),
        time: t1 - t0,
        warning: slowWarning,
      });
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    }
  };

  const onRunTests = () => {
    const fn = fns[selected] as (n: number | string) => number | string;
    const cases =
      selected === 'd'
        ? [
            ...SMALL_CASES.map(({ n, expected }) => ({
              n: String(n),
              expected: String(expected),
            })),
            ...BIG_CASES,
          ]
        : SMALL_CASES.map(({ n, expected }) => ({
            n: n as number | string,
            expected: expected as number | string,
          }));

    const rows: TestRow[] = cases.map(({ n, expected }) => {
      try {
        const actual = fn(n as never);
        return {
          pass: actual === expected,
          label: `sum_to_n_${selected}(${n})`,
          expected: String(expected),
          actual: String(actual),
        };
      } catch (err) {
        return {
          pass: false,
          label: `sum_to_n_${selected}(${n})`,
          expected: String(expected),
          actual: `threw: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    });

    setTests(rows);
  };

  const testSummary = useMemo(() => {
    if (!tests) return null;
    const passed = tests.filter((r) => r.pass).length;
    return { passed, total: tests.length };
  }, [tests]);

  return (
    <div className="p1 layout-split">
      {/* ---------------- LEFT: solution picker + detail ---------------- */}
      <section className="panel">
        <h2>Solutions</h2>
        <div className="p1-sol-nav">
          {(Object.keys(solutions) as SolutionId[]).map((id) => (
            <button
              type="button"
              key={id}
              className={`p1-sol-btn ${id === selected ? 'active' : ''}`}
              onClick={() => onSelect(id)}
            >
              <span className="p1-sol-btn-id mono">sum_to_n_{id}</span>
              <span className="p1-sol-btn-tag mono">
                {solutions[id].time}
              </span>
            </button>
          ))}
        </div>

        <article className="p1-sol-detail">
          <h3>{sol.name}</h3>
          <div className="p1-sol-meta">
            <span className="meta-pill">
              Time <strong>{sol.time}</strong>
            </span>
            <span className="meta-pill">
              Space <strong>{sol.space}</strong>
            </span>
          </div>

          <h2>Explanation</h2>
          <p className="p1-sol-explanation">{sol.explanation}</p>

          <h2>Code</h2>
          <pre className="p1-sol-code">
            <code>{sol.code}</code>
          </pre>
        </article>
      </section>

      {/* ---------------- RIGHT: compute + tests ---------------- */}
      <section className="panel">
        <h2>Try it</h2>
        <div className="p1-input-row">
          <input
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCompute();
            }}
            placeholder="Enter n (e.g. 100, -50, or 123456789012345678901234567890)"
            autoComplete="off"
            className="p1-input mono"
          />
        </div>
        <div className="p1-input-hint">
          {selected === 'd' ? (
            <>
              <code>sum_to_n_d</code> accepts arbitrarily long decimal
              strings. No upper bound.
            </>
          ) : (
            <>
              Max |n| for <code>sum_to_n_{selected}</code>:{' '}
              <strong className="mono">
                {PER_SOLUTION_MAX[selected].toLocaleString()}
              </strong>
              {selected === 'c'
                ? ' (bounded by array memory).'
                : ' (keeps result inside Number.MAX_SAFE_INTEGER).'}
            </>
          )}
        </div>
        <div className="p1-button-row">
          <button className="btn btn-primary" onClick={onCompute}>
            Compute
          </button>
          <button className="btn btn-secondary" onClick={onRunTests}>
            Run test suite
          </button>
        </div>

        <h2>Result</h2>
        <div
          className={`p1-result ${
            result?.error ? 'error' : result?.value ? 'ok' : ''
          }`}
        >
          {!result && (
            <span className="p1-result-placeholder">No computation yet.</span>
          )}
          {result?.error && (
            <>
              <div className="p1-result-value">Error</div>
              <div className="p1-result-meta">{result.error}</div>
            </>
          )}
          {result?.value !== undefined && !result.error && (
            <>
              <div className="p1-result-value mono">{result.value}</div>
              <div className="p1-result-meta">
                computed in {result.time?.toFixed(3)} ms
              </div>
              {result.warning && (
                <div className="p1-result-warning">{result.warning}</div>
              )}
            </>
          )}
        </div>

        <h2>Tests</h2>
        {!tests && (
          <div className="p1-test-summary">
            Click <em>Run test suite</em> to execute the in-browser test cases.
          </div>
        )}
        {testSummary && (
          <div
            className={`p1-test-summary ${
              testSummary.passed === testSummary.total
                ? 'all-pass'
                : 'some-fail'
            }`}
          >
            {testSummary.passed} / {testSummary.total} passed
          </div>
        )}
        {tests && (
          <ul className="p1-test-list">
            {tests.map((r, i) => (
              <li key={i} className={`p1-test-item ${r.pass ? 'pass' : 'fail'}`}>
                <span className="p1-test-mark">{r.pass ? '✓' : '✗'}</span>
                <span className="p1-test-label mono">{r.label}</span>
                <span className="p1-test-expected">
                  expected <code>{r.expected}</code>
                  {!r.pass && (
                    <>
                      , got <code>{r.actual}</code>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
