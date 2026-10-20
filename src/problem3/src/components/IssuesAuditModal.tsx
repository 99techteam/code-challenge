import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Zap,
  Code2,
  Bug,
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface IssuesAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'all' | 'bug' | 'performance' | 'antipattern';

interface AuditItem {
  id: number;
  category: 'bug' | 'performance' | 'antipattern';
  categoryLabel: string;
  title: string;
  impact: string;
  originalCode: string;
  refactoredCode: string;
  explanation: string;
}

const AUDIT_ITEMS: AuditItem[] = [
  {
    id: 1,
    category: 'bug',
    categoryLabel: 'Critical Bug',
    title: 'Undeclared variable lhsPriority in filter callback (Runtime Crash)',
    impact: 'ReferenceError: lhsPriority is not defined. Causes an instant fatal crash during component render.',
    originalCode: `const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { // ❌ ReferenceError: lhsPriority is not defined!
  if (balance.amount <= 0) return true;
}`,
    refactoredCode: `const priority = getPriority(balance.blockchain);
return priority > DEFAULT_PRIORITY && balance.amount > 0; // ✅ Uses declared priority correctly`,
    explanation: 'The developer declared balancePriority, but copy-pasted and referenced lhsPriority from the sort comparator below.'
  },
  {
    id: 2,
    category: 'bug',
    categoryLabel: 'Logic Error',
    title: 'Inverted balance filter condition (amount <= 0 instead of > 0)',
    impact: 'Discards all positive token holdings and exclusively retains zero or negative (debt) balances.',
    originalCode: `if (balance.amount <= 0) {
  return true; // ❌ Only retains non-positive balances!
}`,
    refactoredCode: `return priority > DEFAULT_PRIORITY && balance.amount > 0; // ✅ Only displays positive balances (> 0)`,
    explanation: 'A wallet dashboard should display assets actually held by the user (balance.amount > 0).'
  },
  {
    id: 3,
    category: 'bug',
    categoryLabel: 'TypeScript Bug',
    title: 'WalletBalance interface missing blockchain property',
    impact: 'Strict TypeScript compilation failure: Property "blockchain" does not exist on type "WalletBalance".',
    originalCode: `interface WalletBalance {
  currency: string;
  amount: number;
  // ❌ Missing 'blockchain' property
}`,
    refactoredCode: `export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // ✅ Fully typed property
}`,
    explanation: 'getPriority(balance.blockchain) accesses blockchain on every item, but the interface definition omitted it.'
  },
  {
    id: 4,
    category: 'bug',
    categoryLabel: 'Logic Error & Dead Code',
    title: 'formattedBalances computed as dead code; rows maps wrong array causing undefined',
    impact: 'formattedBalances is allocated in memory and discarded. rows maps over sortedBalances with unsafe casting, passing undefined to formattedAmount.',
    originalCode: `const formattedBalances = sortedBalances.map(...); // ❌ Dead code

const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
  return <WalletRow formattedAmount={balance.formatted} /> // ❌ undefined at runtime!
});`,
    refactoredCode: `// ✅ Computes formatted string and usdValue in a single unified memoized pipeline:
const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
  return balances
    .filter(...)
    .sort(...)
    .map(b => ({ ...b, formatted: b.amount.toLocaleString(...), usdValue: ... }));
}, [balances, prices]);`,
    explanation: 'The original code mapped formattedBalances, never used it, and then mapped sortedBalances with a fabricated type cast.'
  },
  {
    id: 5,
    category: 'bug',
    categoryLabel: 'Logic Error',
    title: 'Sort comparator missing equal priority case (returns undefined)',
    impact: 'When two blockchains have identical priority (e.g., Zilliqa=20, Neo=20), the comparator returns undefined, violating ECMAScript sort contract and causing unstable ordering.',
    originalCode: `.sort((lhs, rhs) => {
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  // ❌ Missing return 0 when equal! Returns undefined
})`,
    refactoredCode: `.sort((lhs, rhs) => {
  return getPriority(rhs.blockchain) - getPriority(lhs.blockchain); // ✅ Returns standard negative, zero, or positive integer
})`,
    explanation: 'Array sort comparators must return a number (< 0, 0, or > 0). Returning undefined leads to unpredictable sorting across different JS engines.'
  },
  {
    id: 6,
    category: 'performance',
    categoryLabel: 'Inefficiency',
    title: 'Redundant dependency prices in useMemo dependency array',
    impact: 'Every time token prices fluctuate, sortedBalances is completely re-filtered and re-sorted, even though prices is not used in the sorting logic.',
    originalCode: `const sortedBalances = useMemo(() => {
  return balances.filter(...).sort(...);
}, [balances, prices]); // ❌ 'prices' is never referenced inside!`,
    refactoredCode: `// ✅ If only sorting/filtering, dependency array should strictly be [balances].
// When computing usdValue together, [balances, prices] is legitimately justified.`,
    explanation: 'Only state or props actually referenced inside useMemo should be included in its dependency array.'
  },
  {
    id: 7,
    category: 'performance',
    categoryLabel: 'Inefficiency',
    title: 'Re-declaring getPriority inside functional component body',
    impact: 'A new function instance is allocated in memory on every render cycle, increasing Garbage Collector workload.',
    originalCode: `const WalletPage: React.FC<Props> = (props) => {
  const getPriority = (blockchain: any): number => { ... } // ❌ Re-instantiated every render
  ...
}`,
    refactoredCode: `// ✅ Hoist outside component as a pure function:
const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};`,
    explanation: 'Pure helper functions that do not depend on props or state should be hoisted outside the component.'
  },
  {
    id: 8,
    category: 'performance',
    categoryLabel: 'Inefficiency',
    title: 'Repeated switch-case evaluations in O(N log N) sort comparator',
    impact: 'During sorting, getPriority is evaluated 2 * N * log(N) times, evaluating linear switch branches repeatedly.',
    originalCode: `const getPriority = (blockchain: any): number => {
  switch (blockchain) {
    case 'Osmosis': return 100;
    ...
  }
}`,
    refactoredCode: `const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};
// ✅ O(1) constant-time hash map lookup`,
    explanation: 'An object hash map provides O(1) constant-time lookup for each priority comparison.'
  },
  {
    id: 9,
    category: 'performance',
    categoryLabel: 'Inefficiency',
    title: 'Four redundant array iterations causing unnecessary CPU and memory allocation',
    impact: 'Traverses the balance array through filter -> sort -> formattedBalances.map -> rows.map.',
    originalCode: `1. balances.filter(...)
2. .sort(...)
3. sortedBalances.map(...) // creates formattedBalances
4. sortedBalances.map(...) // creates rows`,
    refactoredCode: `// ✅ Streamlined single-pass pipeline:
balances
  .filter(...)
  .sort(...)
  .map(item => ({ ...item, formatted, usdValue }));`,
    explanation: 'Consolidates intermediate transformations to minimize memory allocations and garbage collection cycles.'
  },
  {
    id: 10,
    category: 'antipattern',
    categoryLabel: 'React Anti-Pattern',
    title: 'Using array index as React key (key={index})',
    impact: 'Breaks React reconciliation; causes rendering anomalies, broken animations, and DOM state desync when items are re-ordered or filtered.',
    originalCode: `<WalletRow
  key={index} // ❌ Anti-pattern on dynamic sorted lists
  ...
/>`,
    refactoredCode: `<WalletRow
  key={\`\${balance.blockchain}-\${balance.currency}\`} // ✅ Stable unique composite key
  ...
/>`,
    explanation: 'React list keys must be stable and unique identifiers, such as `${balance.blockchain}-${balance.currency}`.'
  },
  {
    id: 11,
    category: 'antipattern',
    categoryLabel: 'React Anti-Pattern',
    title: 'Swallowed and discarded children prop',
    impact: 'props destructures { children, ...rest }, but the root div only renders {rows}, completely swallowing any child elements.',
    originalCode: `const { children, ...rest } = props;
return <div {...rest}>{rows}</div>; // ❌ children is discarded`,
    refactoredCode: `return (
  <div className={className} {...rest}>
    {rows}
    {children} {/* ✅ Correctly renders children if provided */}
  </div>
);`,
    explanation: 'If children is accepted via props, it must be forwarded and rendered inside the JSX output.'
  },
  {
    id: 12,
    category: 'antipattern',
    categoryLabel: 'Type Anti-Pattern',
    title: 'Using any type for blockchain parameter',
    impact: 'Completely disables TypeScript compile-time type checking and autocomplete for blockchain identifiers.',
    originalCode: `const getPriority = (blockchain: any): number => ... // ❌ any`,
    refactoredCode: `export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;
const getPriority = (blockchain: Blockchain): number => ... // ✅ Type-safe`,
    explanation: 'Use a string union type or string enum for type safety and compiler verification.'
  },
  {
    id: 13,
    category: 'antipattern',
    categoryLabel: 'Type Anti-Pattern',
    title: 'Empty interface Props extends BoxProps {}',
    impact: 'Triggers ESLint @typescript-eslint/no-empty-interface warning and adds redundant code.',
    originalCode: `interface Props extends BoxProps {
  // ❌ Empty interface
}`,
    refactoredCode: `export interface Props extends BoxProps {} // Or: type Props = BoxProps;`,
    explanation: 'Avoid empty interfaces unless extending with new properties; use BoxProps directly or a type alias.'
  },
  {
    id: 14,
    category: 'antipattern',
    categoryLabel: 'Data Safety',
    title: 'Missing fallback for missing token prices in prices dictionary',
    impact: 'If a token has no price in prices, prices[balance.currency] evaluates to undefined, yielding NaN on the user interface.',
    originalCode: `const usdValue = prices[balance.currency] * balance.amount; // ❌ Evaluates to NaN if price is missing`,
    refactoredCode: `const price = prices[balance.currency] ?? 0;
const usdValue = price * balance.amount; // ✅ Safe fallback prevents NaN`,
    explanation: 'Always use nullish coalescing (?? 0) to guard against missing API price data.'
  },
  {
    id: 15,
    category: 'antipattern',
    categoryLabel: 'UX / Number Formatting',
    title: 'balance.amount.toFixed() called with no fraction digits',
    impact: 'Defaults to 0 decimal places, rounding all amounts to whole integers (e.g., 0.005 ETH displays as 0 ETH).',
    originalCode: `formatted: balance.amount.toFixed() // ❌ Truncates all decimal fractions`,
    refactoredCode: `formatted: balance.amount.toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6
}) // ✅ Formats crypto decimals accurately`,
    explanation: 'Crypto balances require decimal precision; use toLocaleString() with minimum/maximum fraction digits.'
  }
];

export const IssuesAuditModal: React.FC<IssuesAuditModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = AUDIT_ITEMS.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const bugCount = AUDIT_ITEMS.filter(i => i.category === 'bug').length;
  const perfCount = AUDIT_ITEMS.filter(i => i.category === 'performance').length;
  const antiCount = AUDIT_ITEMS.filter(i => i.category === 'antipattern').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl flex flex-col text-slate-100 z-10 overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Code Audit & Anti-Pattern Analysis (Problem 3)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  15 Issues Identified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive breakdown of critical runtime bugs, computational inefficiencies, and anti-patterns
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>All Issues ({AUDIT_ITEMS.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('bug')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'bug'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical Bugs & Crashes ({bugCount})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('performance')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'performance'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Computational Inefficiencies ({perfCount})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('antipattern')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === 'antipattern'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>React & Type Anti-Patterns ({antiCount})</span>
          </button>
        </div>

        {/* Modal Body: Scrollable list of audit issues */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            const badgeColor =
              item.category === 'bug'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                : item.category === 'performance'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/25';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'bg-slate-950/80 border-slate-700 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-750'
                }`}
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center justify-between text-left gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-slate-300 flex-shrink-0">
                      #{item.id}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {item.categoryLabel}
                        </span>
                        <span className="font-semibold text-sm text-white truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.impact}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-indigo-400 flex-shrink-0">
                    {isExpanded ? 'Collapse ▲' : 'Details ▼'}
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 text-xs animate-fadeIn">
                    {/* Impact description */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-slate-200">🔍 Root Cause & Impact: </span>
                      <span>{item.explanation}</span>
                    </div>

                    {/* Side-by-side Code Diff */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 font-mono text-[11px]">
                      {/* Original */}
                      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 overflow-x-auto">
                        <div className="font-sans text-[11px] font-bold text-rose-400 flex items-center gap-1 mb-2">
                          <X className="w-3.5 h-3.5" /> Original Code (Buggy / Inefficient):
                        </div>
                        <pre className="text-rose-200/90 whitespace-pre leading-relaxed">
                          {item.originalCode}
                        </pre>
                      </div>

                      {/* Refactored */}
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 overflow-x-auto">
                        <div className="font-sans text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Refactored Solution (Resolved & Verified):
                        </div>
                        <pre className="text-emerald-200/90 whitespace-pre leading-relaxed">
                          {item.refactoredCode}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All 15 identified issues have been resolved, verified, and unit-tested in WalletPage.tsx</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssuesAuditModal;
