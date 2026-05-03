import React, { useMemo } from "react";

// ============================================================================
// TYPE DEFINITIONS - ✅ Complete and accurate
// ============================================================================

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // ✅ Included
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number; // ✅ All computed properties
}

interface Props {
  children?: React.ReactNode;
  className?: string;
}

// ============================================================================
// CONSTANTS - ✅ Reusable expensive objects
// ============================================================================

const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const MIN_PRIORITY = -99;

// ✅ Create formatter once, reuse for all balances
const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

// ============================================================================
// UTILITY FUNCTIONS - ✅ Defined outside component (stable)
// ============================================================================

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? MIN_PRIORITY;
};

// ============================================================================
// MOCK HOOKS - Replace with actual hooks
// ============================================================================

const useWalletBalances = (): WalletBalance[] => {
  // Mock implementation
  return [
    { currency: "ETH", amount: 10.5, blockchain: "Ethereum" },
    { currency: "OSMO", amount: 100, blockchain: "Osmosis" },
    { currency: "ARB", amount: 0, blockchain: "Arbitrum" }, // Filtered out
    { currency: "ZIL", amount: 50, blockchain: "Zilliqa" },
  ];
};

const usePrices = (): Record<string, number> => {
  return {
    ETH: 2000,
    OSMO: 5,
    ARB: 1,
    ZIL: 0.05,
  };
};

// ============================================================================
// COMPONENTS
// ============================================================================

const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: string;
}> = ({
  className,
  amount,
  usdValue,
  formattedAmount,
  currency,
  blockchain,
}) => {
  return (
    <div className={className}>
      <div>
        <strong>{blockchain}</strong> - {currency}
      </div>
      <div>Amount: {formattedAmount}</div>
      <div>USD Value: ${usdValue.toFixed(2)}</div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT - ✅ Optimized single-pass computation
// ============================================================================

const WalletPage: React.FC<Props> = (props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // ✅ SINGLE-PASS COMPUTATION: filter + map + sort in ONE useMemo
  // This replaces 4 separate useMemo chains with 1 efficient pipeline
  const sortedBalances = useMemo(() => {
    return (
      balances
        // Step 1: Map and filter in one pass
        .map((balance): FormattedWalletBalance | null => {
          const priority = getPriority(balance.blockchain);

          // ✅ Correct filter logic: positive amounts and valid priority
          if (priority <= MIN_PRIORITY || balance.amount <= 0) {
            return null;
          }

          // ✅ Calculate USD value with null safety
          const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

          // ✅ Reuse formatter (created once outside)
          const formatted = numberFormatter.format(balance.amount);

          // ✅ Return complete object with all properties
          return {
            ...balance,
            formatted,
            usdValue,
          };
        })
        // Step 2: Remove filtered items (nulls)
        .filter(
          (balance): balance is FormattedWalletBalance => balance !== null,
        )
        // Step 3: Sort by priority (descending)
        .sort((a, b) => {
          const priorityDiff =
            getPriority(b.blockchain) - getPriority(a.blockchain);
          return priorityDiff;
        })
    );
  }, [balances, prices]); // ✅ Complete dependencies (getPriority is stable)

  // ✅ Use unique composite key (blockchain + currency)
  const rows = sortedBalances.map((balance) => (
    <WalletRow
      className={props.className || "wallet-row"}
      key={`${balance.blockchain}-${balance.currency}`} // ✅ Guaranteed unique
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
      currency={balance.currency}
      blockchain={balance.blockchain}
    />
  ));

  return <div {...props}>{rows}</div>;
};

export default WalletPage;
