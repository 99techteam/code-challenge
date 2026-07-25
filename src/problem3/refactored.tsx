import React, { useMemo } from 'react';

/**
 * Refactored version of the Problem 3 WalletPage.
 *
 * This file is illustrative and is not meant to compile standalone: the symbols
 * below are assumed to come from the surrounding application (a design-system
 * `Box`, data hooks, a CSS-modules `classes` object, and the `WalletRow`
 * component). Minimal stubs/comments are provided so the intent is clear and the
 * file is internally consistent.
 */

// ---------------------------------------------------------------------------
// External dependencies (provided elsewhere in the real app)
// ---------------------------------------------------------------------------
type BoxProps = React.HTMLAttributes<HTMLDivElement>;

declare const classes: { row: string };

declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
declare const WalletRow: React.FC<WalletRowProps>;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** All blockchains we know how to prioritise. Replace `any` with a real union. */
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // was missing from the original interface
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

// ---------------------------------------------------------------------------
// Pure helpers — hoisted out of the component so they are defined once,
// carry no per-render identity, and are trivially testable.
// ---------------------------------------------------------------------------

const DEFAULT_PRIORITY = -99;

/** Priority lookup table; O(1) instead of a re-created switch each render. */
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = BoxProps;

const WalletPage: React.FC<Props> = (props: Props) => {
  // `children` intentionally left inside `...rest` so it passes through the
  // spread rather than being destructured and dropped.
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Single derivation: filter -> sort. Priority is computed once per item
  // (not on every comparator call), the filter keeps positive balances, and
  // the comparator always returns a number. Depends only on `balances`.
  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance) =>
          getPriority(balance.blockchain) > DEFAULT_PRIORITY &&
          balance.amount > 0,
      )
      .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
      .sort((lhs, rhs) => rhs.priority - lhs.priority) // descending, total order
      .map(({ balance }) => balance);
  }, [balances]);

  // Formatting + USD value computed once, and this is the array `rows` consumes.
  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((balance) => {
      const price = prices[balance.currency] ?? 0; // guard against missing price / NaN
      return {
        ...balance,
        formatted: balance.amount.toFixed(2), // explicit precision
        usdValue: price * balance.amount,
      };
    });
  }, [sortedBalances, prices]);

  const rows = useMemo(
    () =>
      formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={balance.currency} // stable, unique key instead of index
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      )),
    [formattedBalances],
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
