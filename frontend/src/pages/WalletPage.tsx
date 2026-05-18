import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { Coin } from '../types';

interface WalletPageProps {
  coins: Coin[];
}

// Problem 3 Fix: Use a HashMap for O(1) lookup instead of O(n) switch
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  'Osmosis': 100,
  'Ethereum': 50,
  'Arbitrum': 30,
  'Zilliqa': 20,
  'Neo': 20
};

// Mock balances since we don't have a real wallet connection
const generateMockBalances = (coins: Coin[]) => {
  return coins.map((c, i) => ({
    currency: c.currency,
    blockchain: c.blockchain,
    amount: i % 3 === 0 ? 0 : Math.random() * 100 + 10 // Every 3rd coin is empty
  }));
};

export const WalletPage: FC<WalletPageProps> = ({ coins }) => {
  const [showComparison, setShowComparison] = useState(false);
  
  // Create mock balances only once
  const balances = useMemo(() => generateMockBalances(coins), [coins]);

  // Problem 3 Fix: Single pass filter, sort, and map using useMemo
  const processedBalances = useMemo(() => {
    return balances
      // 1. Filter: Fix inverted logic (amount > 0)
      .filter(balance => {
        const priority = BLOCKCHAIN_PRIORITY[balance.blockchain] ?? -99;
        return priority > -99 && balance.amount > 0;
      })
      // 2. Sort: Fix missing return 0
      .sort((a, b) => {
        const priorityA = BLOCKCHAIN_PRIORITY[a.blockchain] ?? -99;
        const priorityB = BLOCKCHAIN_PRIORITY[b.blockchain] ?? -99;
        if (priorityA > priorityB) return -1;
        if (priorityA < priorityB) return 1;
        return 0;
      })
      // 3. Map to include formatted data + USD value (since we have coins array with prices)
      .map(balance => {
        const coinInfo = coins.find(c => c.currency === balance.currency);
        const price = coinInfo ? coinInfo.price : 0;
        const usdValue = price * balance.amount;
        
        return {
          ...balance,
          formatted: balance.amount.toFixed(4),
          usdValue,
          iconFilename: coinInfo?.iconFilename
        };
      });
  }, [balances, coins]); // Removed 'prices' dependency as they are inside 'coins'

  return (
    <div className="max-w-4xl mx-auto pt-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Wallet</h1>
          <p className="text-slate-400 text-sm">Refactored version of the Problem 3 component</p>
        </div>
        <button 
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
        >
          {showComparison ? 'View Wallet' : 'View Code Comparison'}
        </button>
      </div>

      {showComparison ? (
        <WalletComparison />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedBalances.map((balance) => (
            <div key={balance.currency} className="glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                {balance.iconFilename ? (
                  <img src={`/coins/${balance.iconFilename}`} alt={balance.currency} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                    {balance.currency[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{balance.currency}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 uppercase">
                    {balance.blockchain}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-white font-medium">{balance.formatted}</div>
                <div className="text-sm text-slate-400">${balance.usdValue.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {processedBalances.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-2xl">
              No balances found matching priority criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WalletComparison = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-red-400 font-medium">Before (Original Code)</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono text-slate-300">
            <pre><code>{`// 1. O(n) switch statement recreated every render
const getPriority = (blockchain: any): number => {
  switch (blockchain) {
    case 'Osmosis': return 100
    // ...
  }
}

const sortedBalances = useMemo(() => {
  return balances.filter((balance: WalletBalance) => {
    // 2. lhsPriority is undefined (should be balancePriority)
    const balancePriority = getPriority(balance.blockchain);
    if (lhsPriority > -99) {
       // 3. Inverted logic: keeps empty balances!
       if (balance.amount <= 0) {
         return true;
       }
    }
    return false
  }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
    // 4. Missing return 0 for equal cases
    if (leftPriority > rightPriority) return -1;
    else if (rightPriority > leftPriority) return 1;
  });
// 5. prices is a dependency but not used in the block
}, [balances, prices]); 

// 6. formattedBalances computed but not used for rows
const formattedBalances = sortedBalances.map(...)

// 7. key={index} is an anti-pattern
const rows = sortedBalances.map((balance, index) => {
  <WalletRow key={index} />
})`}</code></pre>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-green-400 font-medium">After (Refactored)</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono text-slate-300">
            <pre><code>{`// 1. O(1) HashMap lookup, defined outside component
const PRIORITY: Record<string, number> = {
  'Osmosis': 100, /* ... */
};
const getPriority = (chain: string) => PRIORITY[chain] ?? -99;

// 5. Removed unused 'prices' dependency
// 6. Combined filter, sort, and format into one pass
const processedBalances = useMemo(() => {
  return balances
    .filter(balance => {
      // 2. Fixed variable name
      const priority = getPriority(balance.blockchain);
      // 3. Fixed logic to keep non-empty balances
      return priority > -99 && balance.amount > 0;
    })
    .sort((a, b) => {
      const pA = getPriority(a.blockchain);
      const pB = getPriority(b.blockchain);
      if (pA > pB) return -1;
      if (pA < pB) return 1;
      // 4. Added missing return 0
      return 0;
    })
    .map(balance => ({
      ...balance,
      formatted: balance.amount.toFixed(4),
      usdValue: prices[balance.currency] * balance.amount
    }));
}, [balances, prices]);

// 7. Used currency as unique key
const rows = processedBalances.map((balance) => {
  <WalletRow key={balance.currency} />
})`}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
};
