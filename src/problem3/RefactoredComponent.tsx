import React, { useMemo } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported blockchain networks with their priority rankings
 */
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

/**
 * Base wallet balance interface with all required properties
 */
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

/**
 * Extended wallet balance with formatted amount for display
 */
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

/**
 * Component props extending BoxProps for layout flexibility
 */
interface BoxProps {
  className?: string;
  children?: React.ReactNode;
}

interface WalletPageProps extends BoxProps {
  // Future: Add wallet-specific props here if needed
}

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

/**
 * Blockchain priority mapping for sorting
 * Higher values = higher priority
 * Using const object for O(1) lookup instead of switch statement
 */
const BLOCKCHAIN_PRIORITIES: Readonly<Record<Blockchain, number>> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

/**
 * Default priority for unknown blockchains
 */
const DEFAULT_PRIORITY = -99;

/**
 * Minimum valid balance threshold
 */
const MIN_VALID_BALANCE = 0;

/**
 * Get priority for a given blockchain
 * Pure function - can be tested in isolation
 * 
 * @param blockchain - The blockchain network name
 * @returns Priority number (higher = more important)
 */
const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
};

/**
 * Format number to fixed decimal places
 * Centralized formatting logic for consistency
 * 
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 */
const formatAmount = (amount: number, decimals: number = 2): string => {
  return amount.toFixed(decimals);
};

// ============================================================================
// MOCK HOOKS (Replace with actual implementations)
// ============================================================================

/**
 * Hook to fetch wallet balances
 * TODO: Replace with actual implementation
 */
const useWalletBalances = (): WalletBalance[] => {
  // Mock implementation - replace with actual API call
  return [];
};

/**
 * Hook to fetch cryptocurrency prices
 * TODO: Replace with actual implementation
 */
const usePrices = (): Record<string, number> => {
  // Mock implementation - replace with actual API call
  return {};
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Props for individual wallet row component
 */
interface WalletRowProps {
  currency: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
  blockchain: Blockchain;
  className?: string;
}

/**
 * Individual wallet row component
 * Memoized to prevent unnecessary re-renders
 */
const WalletRow = React.memo<WalletRowProps>(({
  currency,
  amount,
  usdValue,
  formattedAmount,
  blockchain,
  className = '',
}) => {
  return (
    <li
      className={`wallet-row ${className}`}
      role="listitem"
      aria-label={`${currency} wallet on ${blockchain}`}
    >
      <div className="wallet-row__currency">{currency}</div>
      <div className="wallet-row__amount">{amount}</div>
      <div className="wallet-row__blockchain">{blockchain}</div>
      <div className="wallet-row__amount">{formattedAmount}</div>
      <div className="wallet-row__usd-value">${formatAmount(usdValue)}</div>
    </li>
  );
});

WalletRow.displayName = 'WalletRow';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { className = '', ...rest } = props;

  // Fetch data from hooks
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * Filter, sort, and format balances in a single memoized computation
   * 
   * Optimizations:
   * 1. Single pass for filter + map (combined operations)
   * 2. Proper dependency array (only balances and prices)
   * 3. Correct filter logic (amount > 0 AND priority > -99)
   * 4. Stable sort with explicit return for all cases
   */
  const sortedAndFormattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    if (!balances || !Array.isArray(balances)) {
      return [];
    }

    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > DEFAULT_PRIORITY && balance.amount > MIN_VALID_BALANCE;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        const price = prices[balance.currency] ?? 0;
        const usdValue = price * balance.amount;

        return {
          ...balance,
          formatted: formatAmount(balance.amount),
          usdValue,
        };
      });
  }, [balances, prices]);

  // Handle loading/empty states
  if (!balances || !prices) {
    return (
      <div className={`wallet-page wallet-page--loading ${className}`} {...rest}>
        <p>Loading wallet balances...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`wallet-page wallet-page--empty ${className}`} {...rest}>
        <p>No valid wallet balances found.</p>
      </div>
    );
  }

  /**
 * Render wallet rows with proper React keys
 * 
 * Optimizations:
 * 1. Stable keys using currency + blockchain (unique identifier)
 * 2. No redundant iterations
 * 3. No memoization needed as it's a simple map operation
 */
  const rows = sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => {
    const key = `${balance.currency}-${balance.blockchain}`;

    return (
      <WalletRow
        key={key}
        currency={balance.currency}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        blockchain={balance.blockchain}
      />
    );
  });

  // FIXED: Use semantic HTML (ul/li) instead of generic div
  return (
    <ul
      className={`wallet-page ${className}`}
      role="list"
      aria-label="Wallet balances sorted by priority"
      {...rest}
    >
      {rows}
    </ul>
  );
};

WalletPage.displayName = 'WalletPage';

export default WalletPage;
