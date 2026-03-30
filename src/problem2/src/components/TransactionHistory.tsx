import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { formatAmount, timeAgo } from '../utils/format';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <svg className="text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
        </div>
        <div>
          <div className="text-gray-800 text-sm font-medium">
            {tx.fromToken} &rarr; {tx.toToken}
          </div>
          <div className="text-gray-400 text-xs">
            {formatAmount(tx.fromAmount)} {tx.fromToken} for {formatAmount(tx.toAmount)} {tx.toToken}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-emerald-600 text-[10px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
          Completed
        </span>
        <div className="text-gray-300 text-xs mt-1">{timeAgo(tx.timestamp)}</div>
      </div>
    </div>
  );
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mt-3 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-gray-100">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Recent Transactions</h3>
        <div>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}
