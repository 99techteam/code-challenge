# Refactoring WalletPage: Making it Better

In this document, we'll walk through some of the performance hiccups and tricky bugs I found in the original `WalletPage` component. I've also put together a refactored version that runs a lot smoother and is easier to read. Let's dive in!

## 1. What Needs Fixing?

1. **Unnecessary Renders with `useMemo`:** The `sortedBalances` calculation was tracking `prices` in its dependency array, even though it wasn't actually using them. This meant that every time prices changed, the balances were sorted again for no reason. Removing `prices` from the list saves us some unnecessary computing.
2. **Oops! Wrong Variable Name:** Inside the `filter` function, the code tried to use `lhsPriority`, which wasn't defined anywhere. It should have been using `balancePriority`. That was definitely a bug waiting to happen!
3. **Sorting Logic Quirks:** The `sort` function was missing a return value when the priorities were equal. In JavaScript, returning `0` keeps the items in the same order if they're tied. I cleaned up the logic so it correctly handles those ties and reads a bit more naturally.
4. **Wasted Effort on `formattedBalances`:** The app was spending time generating a `formattedBalances` array, but then never actually using it in the final output. That's an easy win right there—we can just drop it entirely!
5. **A Few Type Headaches:** 
    - The `WalletBalance` type was missing the `blockchain` property, but the code still tried to read it. I added it in so TypeScript stops complaining.
    - Also, `rows` was expecting `FormattedWalletBalance`, but we were giving it `WalletBalance` instead. Because of that, `balance.formatted` was silently turning into `undefined`.
6. **Don't Use Index as a Key!** In React, using an array index for a `key` is generally a bad idea, especially when the list can be reordered. It can mess up the rendering and hurt performance. Swapping that out for something unique—like `balance.currency`—is a much safer bet.
7. **Speeding Up `getPriority`:** The `getPriority` function was being recreated from scratch on every single render. Moving it outside the component fixes that. Also, swapping the bulky `switch` statement for a clean object map (lookup table) makes it look nicer and run a tiny bit faster too!
8. **Wait, Negative Balances?** The filter condition `if (balance.amount <= 0)` felt really weird for a wallet app. It was hiding positive balances and keeping the negative or zero ones! I've flipped it to `balance.amount > 0` so it actually shows active balances.
9. **Missing Price Fallbacks:** If a price for a specific coin wasn't available, `prices[balance.currency]` would be undefined, and multiplying it by the amount would give us a nasty `NaN`. Adding a quick fallback `|| 0` keeps things safe.

## 2. The Fresh, Refactored Code

Here’s the updated version of the `WalletPage` component with all those fixes rolled in. It’s cleaner, safer, and faster!

```tsx
import React, { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

// Interface can be simplified or removed if we format inline
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

// Moved outside the component to prevent unnecessary recreations 
// and use an O(1) lookup table instead of a switch statement
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => {
  return PRIORITY_MAP[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Corrected variable name and changed to amount > 0 
        // (assuming we only want to display positive balances)
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Simplified sort logic and correctly handles equality
        return rightPriority - leftPriority;
      });
  }, [balances]); // Removed unused 'prices' dependency

  // Map directly from sortedBalances. 
  // We can format the amount inline to avoid an extra map iteration.
  const rows = sortedBalances.map((balance: WalletBalance) => {
    const formattedAmount = balance.amount.toFixed();
    // Added fallback for missing price to prevent NaN
    const price = prices[balance.currency] || 0;
    const usdValue = price * balance.amount;

    return (
      <WalletRow
        // Assuming classes.row was meant to be passed
        className={classes.row} 
        key={balance.currency} // Using unique currency instead of index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formattedAmount}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
```
