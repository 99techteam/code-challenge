import React, { useState } from 'react';
import { SwapTransaction } from '../types';
import { formatNumber } from '../utils/api';
import { getTokenIconUrl } from '../data/mockData';

interface SwapHistoryProps {
  transactions: SwapTransaction[];
  onClearHistory?: () => void;
}

const SwapHistory: React.FC<SwapHistoryProps> = ({ transactions, onClearHistory }) => {
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());

  const handleImageError = (symbol: string) => {
    setFailedIcons(prev => new Set(prev).add(symbol));
  };
  if (transactions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Swap History</span>
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No swaps yet</p>
          <p className="text-gray-500 text-xs mt-1">Your swap history will appear here</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTokenIcon = (symbol: string) => {
    const hasFailed = failedIcons.has(symbol);
    
    return (
      <div className="relative w-6 h-6">
        {!hasFailed ? (
          <img
            src={getTokenIconUrl(symbol)}
            alt={symbol}
            className="w-6 h-6 rounded-full border border-white/20"
            onError={() => handleImageError(symbol)}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border border-white/20">
            {symbol.charAt(0)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 relative z-10 animate-fade-in w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">Swap History</span>
          <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
            {transactions.length}
          </span>
        </h3>
        {onClearHistory && transactions.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-gray-400 hover:text-red-400 text-xs transition-colors hover:bg-red-500/10 px-2 py-1 rounded flex-shrink-0"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto w-full">
        {transactions.slice().reverse().map((tx, index) => (
          <div
            key={tx.id}
            className={`bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 group animate-fade-in delay-${index * 100} w-full overflow-hidden`}
          >
            {/* Main swap info */}
            <div className="flex items-center justify-between mb-2 w-full overflow-hidden">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  {renderTokenIcon(tx.from)}
                  <div className="min-w-0">
                    <span className="text-white text-sm font-bold block truncate">
                      {formatNumber(tx.amountFrom, 4)}
                    </span>
                    <span className="text-indigo-300 text-xs font-medium block truncate">
                      {tx.from}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/30 transition-colors flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                  {renderTokenIcon(tx.to)}
                  <div className="min-w-0">
                    <span className="text-white text-sm font-bold block truncate">
                      {formatNumber(tx.amountTo, 4)}
                    </span>
                    <span className="text-green-300 text-xs font-medium block truncate">
                      {tx.to}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-gray-300 text-xs font-medium">
                  {formatDate(tx.timestamp)}
                </div>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs">Success</span>
                </div>
              </div>
            </div>
            
            {/* Transaction hash */}
            {tx.txHash && (
              <div className="mt-3 pt-2 border-t border-white/10 w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs flex-shrink-0">Transaction ID:</span>
                  <div className="flex items-center space-x-2 min-w-0 ml-2">
                    <code className="text-gray-300 text-xs font-mono bg-white/5 px-2 py-1 rounded truncate max-w-[120px]">
                      {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(tx.txHash!)}
                      className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      title="Copy transaction hash"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer summary */}
      <div className="mt-4 pt-3 border-t border-white/10 text-center">
        <p className="text-gray-400 text-xs">
          Total swaps: <span className="text-white font-medium">{transactions.length}</span>
        </p>
      </div>
    </div>
  );
};

export default SwapHistory;
