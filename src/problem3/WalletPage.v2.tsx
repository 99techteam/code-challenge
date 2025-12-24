import React, { useMemo } from "react";

/* ============================================================================
   TYPES
============================================================================ */

/**
 * Explicit blockchain union ensures:
 * - Exhaustive checks
 * - Compile-time safety
 * - No invalid network strings
 */
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

/**
 * Raw balance data as returned from wallet source
 * This should remain minimal and unformatted
 */
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

/**
 * UI-ready balance model
 * Derived once to avoid formatting logic during render
 */
interface DisplayBalance extends WalletBalance {
  priority: number;
  formattedAmount: string;
  formattedUsdValue: string;
}

/**
 * Minimal layout props
 * Avoids over-coupling to UI libraries
 */
interface BoxProps {
  className?: string;
  children?: React.ReactNode;
}

interface WalletPageProps extends BoxProps {}

/* ============================================================================
   CONSTANTS
============================================================================ */

/**
 * Priority lookup table
 * Object map provides O(1) access and avoids switch statements
 */
const PRIORITY_MAP: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

/* ============================================================================
   MOCK HOOKS
============================================================================ */

/**
 * Wallet balances source
 * Expected to be stable and externally managed (API/store)
 */
const useWalletBalances = (): WalletBalance[] => [];

/**
 * Price lookup map
 * Currency → USD price
 */
const usePrices = (): Record<string, number> => ({});

/* ============================================================================
   COMPONENTS
============================================================================ */

interface WalletRowProps {
  balance: DisplayBalance;
}

/**
 * Pure presentational component
 * Receives pre-formatted data to keep render cheap and predictable
 */
const WalletRow: React.FC<WalletRowProps> = ({ balance }) => {
  return (
    <li className="wallet-row">
      <span>{balance.currency}</span>
      <span>{balance.formattedAmount}</span>
      <span>{balance.formattedUsdValue}</span>
      <span>{balance.blockchain}</span>
    </li>
  );
};

/* ============================================================================
   MAIN
============================================================================ */

/**
 * WalletPage
 *
 * Responsibilities:
 * - Transform raw wallet data into display-ready data
 * - Apply filtering and sorting rules
 * - Render a stable, predictable list
 *
 * Non-responsibilities:
 * - Fetching logic details
 * - Formatting during render
 */
const WalletPage: React.FC<WalletPageProps> = ({
  className = "",
  children,
}) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * Memoized transformation pipeline
   *
   * Why useMemo:
   * - Avoids recomputation on every render
   * - Sorting + formatting can be expensive at scale
   *
   * Pipeline order:
   * 1. map    → compute derived fields once
   * 2. filter → remove invalid entries
   * 3. sort   → deterministic ordering by priority
   */
  const displayBalances = useMemo<DisplayBalance[]>(() => {
    return balances
      .map((balance) => {
        const priority = PRIORITY_MAP[balance.blockchain] ?? -99;
        const usd = (prices[balance.currency] ?? 0) * balance.amount;

        return {
          ...balance,
          priority,
          formattedAmount: balance.amount.toFixed(2),
          formattedUsdValue: `$${usd.toFixed(2)}`,
        };
      })
      .filter((b) => b.amount > 0 && b.priority >= 0)
      .sort((a, b) => b.priority - a.priority);
  }, [balances, prices]);

  /**
   * Explicit empty state
   * Avoids rendering empty lists and improves UX clarity
   */
  if (displayBalances.length === 0) {
    return <div className={className}>No wallet balances available.</div>;
  }

  /**
   * Semantic list rendering
   * Stable keys prevent reconciliation bugs during reordering
   */
  return (
    <ul className={className}>
      {displayBalances.map((balance) => (
        <WalletRow
          key={`${balance.currency}-${balance.blockchain}`}
          balance={balance}
        />
      ))}
      {children}
    </ul>
  );
};

export default WalletPage;
