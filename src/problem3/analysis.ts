// Catalogue of issues in the original WalletPage. Each entry is rendered
// as a card in the Problem 3 tab.

export type Severity = 'bug' | 'perf' | 'anti-pattern' | 'style';

export interface Issue {
  id: number;
  title: string;
  severity: Severity;
  body: string;
}

export const issues: Issue[] = [
  {
    id: 1,
    title: 'Filter references an undefined variable `lhsPriority`',
    severity: 'bug',
    body:
      'Inside `.filter(...)` the condition reads `lhsPriority`, a name ' +
      'that is never declared in scope. The intended variable is the ' +
      '`balancePriority` that was computed one line above. In strict mode ' +
      'this is a ReferenceError; in non-strict (legacy) mode it is silently ' +
      '`undefined`, so `undefined > -99` is `false` and every item is ' +
      'rejected before the inner amount check ever runs.',
  },
  {
    id: 2,
    title: 'Filter logic is inverted — keeps balances with `amount <= 0`',
    severity: 'bug',
    body:
      'The inner branch returns `true` when `balance.amount <= 0`. A swap / ' +
      'wallet view should drop empty or negative balances and keep the ' +
      'positive ones, so the comparison should be `amount > 0`. As written, ' +
      'the only way an item would survive the filter is if priority were ' +
      'valid AND the user had zero or negative funds.',
  },
  {
    id: 3,
    title: '`formattedBalances` is computed but never used',
    severity: 'bug',
    body:
      'After sorting, the code maps `sortedBalances` into `formattedBalances` ' +
      'with a `formatted` field, but `rows` then maps `sortedBalances` again — ' +
      'not `formattedBalances`. As a result `balance.formatted` is `undefined` ' +
      'at render time, which gets passed as `formattedAmount` to `WalletRow`. ' +
      'Either consume `formattedBalances` or fold the format step into the ' +
      'main pipeline.',
  },
  {
    id: 4,
    title: 'Sort comparator returns `undefined` for equal priorities',
    severity: 'bug',
    body:
      'When `leftPriority === rightPriority`, neither branch executes and ' +
      'the comparator implicitly returns `undefined`. The Array.prototype.sort ' +
      'spec requires a number; V8 currently treats this as 0 but the behaviour ' +
      'is fragile and TypeScript with `noImplicitReturns` flags it. Always ' +
      'return `0` (or a tiebreaker like alphabetical currency) explicitly.',
  },
  {
    id: 5,
    title: '`WalletBalance` type is missing the `blockchain` field',
    severity: 'bug',
    body:
      'The component reads `balance.blockchain` to compute priority, but the ' +
      'interface only declares `currency` and `amount`. With TS strict mode ' +
      'this is a compile error; without strict mode it silently typed as ' +
      '`any`. The refactor adds `blockchain: Blockchain` to the interface so ' +
      'the lookup is type-safe.',
  },
  {
    id: 6,
    title: '`getPriority(blockchain: any)` defeats the type system',
    severity: 'anti-pattern',
    body:
      'Typing the parameter as `any` lets any string (or non-string) flow ' +
      'through unchecked. Define a `Blockchain` union of the supported chains ' +
      'and type the parameter as that, so adding a new chain becomes a ' +
      'compile-time TODO instead of a silent `-99`.',
  },
  {
    id: 7,
    title: '`getPriority` is re-declared on every render',
    severity: 'perf',
    body:
      'The function is pure and closes over nothing from the component scope. ' +
      'Defining it inside the component allocates a new function reference on ' +
      'every render, which doesn\'t matter for `getPriority` itself but does ' +
      'matter if you ever pass it as a prop or memo dependency. Hoist it to ' +
      'module scope (or wrap in `useCallback` if it truly needs state).',
  },
  {
    id: 8,
    title: '`getPriority` runs O(n log n) times during sort',
    severity: 'perf',
    body:
      'The sort comparator calls `getPriority` twice per comparison, and a ' +
      'sort performs O(n log n) comparisons, so the function is invoked ' +
      'O(n log n) times. Precompute the priority once per item with a ' +
      '`.map` (a "Schwartzian transform"), sort by the precomputed number, ' +
      'and the lookup cost drops to O(n).',
  },
  {
    id: 9,
    title: '`useMemo` depends on `prices` but the memoised value does not use it',
    severity: 'perf',
    body:
      'The dependency array `[balances, prices]` causes `sortedBalances` to ' +
      'recompute whenever the price feed ticks, even though filter/sort only ' +
      'read `balance.amount` and `balance.blockchain`. Either drop `prices` ' +
      'from the deps OR consume it inside the memo (the refactor does the ' +
      'latter by including USD value).',
  },
  {
    id: 10,
    title: '`formattedBalances` is not memoised',
    severity: 'perf',
    body:
      '`sortedBalances.map(...)` runs on every render, even when nothing ' +
      'relevant changed. Move the format step into the same `useMemo` as the ' +
      'sort so the entire derived array is cached together.',
  },
  {
    id: 11,
    title: 'Using array `index` as React `key`',
    severity: 'anti-pattern',
    body:
      'When the underlying list is sorted or items are inserted / removed, ' +
      'index-based keys force React to re-mount components instead of ' +
      'reusing them, which kills local state and animation continuity. Use a ' +
      'stable identifier — here `balance.currency` is naturally unique per ' +
      'row.',
  },
  {
    id: 12,
    title: '`prices[balance.currency]` may be undefined → NaN in the UI',
    severity: 'bug',
    body:
      '`prices[unknownCurrency]` returns `undefined`, and `undefined * 2` is ' +
      '`NaN`. The UI then shows "$NaN". The refactor either filters out ' +
      'rows with no price OR falls back to 0 (the demo chooses the latter to ' +
      'keep the row visible).',
  },
  {
    id: 13,
    title: 'Empty `interface Props extends BoxProps {}`',
    severity: 'anti-pattern',
    body:
      'The interface declares no members of its own — it is a redundant ' +
      'alias for `BoxProps`. Either use `BoxProps` directly, or `type Props ' +
      '= BoxProps` if you want a local alias.',
  },
  {
    id: 14,
    title: '`children` destructured but never rendered',
    severity: 'anti-pattern',
    body:
      'The original pulls `children` out of `props` and then discards it. ' +
      'If the parent passes JSX between the tags it silently disappears. ' +
      'Either render `{children}` or include it in `...rest` so the wrapping ' +
      '`<div>` keeps acting as a transparent box.',
  },
  {
    id: 15,
    title: '`balance.amount.toFixed()` without a precision argument',
    severity: 'bug',
    body:
      'Calling `toFixed()` with no argument defaults to 0 decimals, so ' +
      '`(1.2345).toFixed()` returns `"1"` and the displayed balance loses ' +
      'precision. Pick an explicit decimal count appropriate for the asset ' +
      '(the refactor uses 4).',
  },
  {
    id: 16,
    title: 'Row items typed as `FormattedWalletBalance` but actually `WalletBalance`',
    severity: 'bug',
    body:
      'The `rows = sortedBalances.map(...)` callback annotates `balance` as ' +
      '`FormattedWalletBalance`, but `sortedBalances` is `WalletBalance[]` ' +
      'because `formattedBalances` was never plumbed in. TS strict mode ' +
      'would flag this as an unsafe cast; without strict mode it hides the ' +
      'runtime "formatted is undefined" bug.',
  },
  {
    id: 17,
    title: '`usdValue` is recomputed in the render path',
    severity: 'perf',
    body:
      'Each render recalculates `prices[balance.currency] * balance.amount` ' +
      'for every row. Move it into the memoised pipeline so the multiplication ' +
      'only fires when balances or prices actually change.',
  },
];

export const SEVERITY_LABEL: Record<Severity, string> = {
  bug: 'Bug',
  perf: 'Perf',
  'anti-pattern': 'Anti-pattern',
  style: 'Style',
};
