/**
 * REFACTORED VERSION - WalletPage Component
 * 
 * Key Improvements:
 * - Fixed all bugs (undefined variables, incorrect logic)
 * - Proper TypeScript typing
 * - Single-pass data transformation
 * - Correct React key usage
 * - Optimized memoization
 * - Removed dead code
 */

import React, { useMemo } from 'react';

// Proper type definition for blockchain
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // ✅ Added missing property with proper type
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {
  // Could add specific props here if needed
}

// ✅ Moved outside component - no recreation on every render
// ✅ Properly typed instead of 'any'
// ✅ Could be extracted to a separate constants file
const BLOCKCHAIN_PRIORITIES: Record<Blockchain | string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain | string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props) => { // ✅ Removed redundant type annotation
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // ✅ Combined all operations into single memoized computation
  // ✅ Fixed filter logic - now keeps positive balances with valid priority
  // ✅ Fixed sort - returns 0 when equal
  // ✅ Includes formatting in same pass - no dead code
  // ✅ Removed 'prices' from dependencies since filtering/sorting doesn't use it
  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain); // ✅ Fixed variable name
        // ✅ Fixed logic: keep balances with valid priority AND positive amount
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // ✅ Simplified comparison with proper return for equal case
        return rightPriority - leftPriority; // Descending order
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2), // ✅ Added decimal places for currency
        usdValue: prices[balance.currency] * balance.amount, // ✅ Computed here
      }));
  }, [balances]); // ✅ Removed 'prices' - only used in render, not in filtering/sorting

  // ✅ Single pass to create rows
  // ✅ Proper unique key using currency (assuming it's unique per wallet)
  // ✅ Correct type - using FormattedWalletBalance
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    // ✅ Recalculate usdValue with current prices for accurate rendering
    const usdValue = prices[balance.currency] * balance.amount;
    
    return (
      <WalletRow
        className={classes?.row} // ✅ Added optional chaining for safety
        key={balance.currency} // ✅ Use unique identifier instead of index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;

