import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TokenAmountInput from './TokenAmountInput';
import SwapHistory from './SwapHistory';
import { fetchPrices, calculateSwapAmount, formatNumber, simulateSwap } from '../utils/api';
import { mockBalances, getInitialMockBalances, tokenNames, getTokenIconUrl } from '../data/mockData';
import { PriceData, TokenBalance, SwapTransaction } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SwapForm: React.FC = () => {
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [prices, setPrices] = useState<PriceData>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Persistent state using localStorage
  const [balances, setBalances] = useLocalStorage<TokenBalance>('swap-balances', mockBalances);
  const [swapHistory, setSwapHistory] = useLocalStorage<SwapTransaction[]>('swap-history', []);

  // Fetch prices on component mount and initialize balances
  useEffect(() => {
    const loadPrices = async () => {
      setIsLoading(true);
      try {
        const priceData = await fetchPrices();
        setPrices(priceData);
        
        // Initialize balances based on available tokens from API
        const availableTokens = Object.keys(priceData);
        const initialBalances = getInitialMockBalances(availableTokens);
        
        // Only update balances if they haven't been initialized yet or don't match API tokens
        const currentTokens = Object.keys(balances);
        const hasApiTokens = availableTokens.some(token => currentTokens.includes(token));
        
        if (currentTokens.length === 0 || !hasApiTokens) {
          setBalances(initialBalances);
        }
      } catch (err) {
        setError('Failed to load prices');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();
  }, []); // Only run once on mount

  // Calculate toAmount when fromAmount, fromToken, or toToken changes
  useEffect(() => {
    if (fromAmount && fromToken && toToken && prices[fromToken] && prices[toToken]) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount) && amount > 0) {
        // Correct swap formula: amountToReceive = (amountFrom * priceFrom) / priceTo
        const calculated = calculateSwapAmount(amount, prices[fromToken], prices[toToken]);
        setToAmount(formatNumber(calculated, 6));
      } else {
        setToAmount('');
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, prices]);

  // Clear error/success messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Memoized validation to prevent re-renders
  const validation = useMemo(() => {
    if (!fromToken) return { isValid: false, errorMessage: 'Please select a token to swap from' };
    if (!toToken) return { isValid: false, errorMessage: 'Please select a token to swap to' };
    if (fromToken === toToken) return { isValid: false, errorMessage: 'Cannot swap the same token' };
    if (!fromAmount || parseFloat(fromAmount) <= 0) return { isValid: false, errorMessage: 'Please enter a valid amount greater than 0' };
    
    // Check if tokens have price data
    if (!prices[fromToken]) return { isValid: false, errorMessage: `Price not available for ${fromToken}` };
    if (!prices[toToken]) return { isValid: false, errorMessage: `Price not available for ${toToken}` };
    
    const amount = parseFloat(fromAmount);
    const balance = balances[fromToken] || 0;
    if (amount > balance) return { isValid: false, errorMessage: `Insufficient ${fromToken} balance. Available: ${formatNumber(balance, 4)}` };

    return { isValid: true, errorMessage: '' };
  }, [fromToken, toToken, fromAmount, prices, balances]);

  const handleFlip = useCallback(() => {
    if (!fromToken && !toToken) return;
    
    const tempToken = fromToken;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount('');
    
    // Clear any existing errors
    setError('');
    setSuccess('');
  }, [fromToken, toToken, toAmount]);

  const addSwapTransaction = useCallback((
    from: string,
    to: string,
    amountFrom: number,
    amountTo: number,
    txHash?: string
  ) => {
    const transaction: SwapTransaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      from,
      to,
      amountFrom,
      amountTo,
      timestamp: new Date().toISOString(),
      txHash
    };
    
    setSwapHistory(prev => [...prev, transaction]);
  }, [setSwapHistory]);

  const handleSwap = async () => {
    if (!validation.isValid) {
      setError(validation.errorMessage);
      return;
    }

    setIsSwapping(true);
    setError('');
    setSuccess('');

    try {
      const swapAmount = parseFloat(fromAmount);
      const result = await simulateSwap(fromToken, toToken, swapAmount);
      
      if (result.success) {
        const receivedAmount = parseFloat(toAmount);
        
        // Update balances after successful swap
        const newBalances = { ...balances };
        newBalances[fromToken] = Math.max(0, (newBalances[fromToken] || 0) - swapAmount);
        newBalances[toToken] = (newBalances[toToken] || 0) + receivedAmount;
        setBalances(newBalances);
        
        // Add to swap history
        addSwapTransaction(fromToken, toToken, swapAmount, receivedAmount, result.txHash);
        
        setSuccess(`Successfully swapped ${formatNumber(swapAmount, 4)} ${fromToken} to ${formatNumber(receivedAmount, 4)} ${toToken}`);
        
        // Reset form but keep token selections for easy re-swapping
        setFromAmount('');
        setToAmount('');
        
        // Auto-setup for next swap: move the received token to "from" position
        if (newBalances[toToken] > 0) {
          setFromToken(toToken);
          setToToken(''); // Clear "to" token so user can select new target
        }
      } else {
        setError(result.error || 'Swap failed');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFromTokenSelect = useCallback((token: { symbol: string; name: string; price: number; iconUrl: string }) => {
    setFromToken(token.symbol);
    setError(''); // Clear errors when token changes
  }, []);

  const handleToTokenSelect = useCallback((token: { symbol: string; name: string; price: number; iconUrl: string }) => {
    setToToken(token.symbol);
    setError(''); // Clear errors when token changes
  }, []);

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value);
    setError(''); // Clear errors when amount changes
  }, []);

  const clearSwapHistory = useCallback(() => {
    setSwapHistory([]);
  }, [setSwapHistory]);

  const resetBalances = useCallback(() => {
    const availableTokens = Object.keys(prices);
    if (availableTokens.length > 0) {
      const newBalances = getInitialMockBalances(availableTokens);
      setBalances(newBalances);
    } else {
      setBalances(mockBalances);
    }
    setSuccess('Balances reset to initial values');
  }, [setBalances, prices]);

  // Helper function to create TokenInfo objects
  const createTokenInfo = (symbol: string): { symbol: string; name: string; price: number; iconUrl: string } | null => {
    if (!prices[symbol]) return null;
    
    return {
      symbol,
      name: tokenNames[symbol] || symbol,
      price: prices[symbol],
      iconUrl: getTokenIconUrl(symbol)
    };
  };

  // Create token list for TokenSelector
  const tokenList = useMemo(() => {
    return Object.keys(prices)
      .map(symbol => createTokenInfo(symbol))
      .filter(token => token !== null) as Array<{ symbol: string; name: string; price: number; iconUrl: string }>;
  }, [prices]);

  // Get selected token objects
  const selectedFromToken = fromToken ? createTokenInfo(fromToken) : null;
  const selectedToToken = toToken ? createTokenInfo(toToken) : null;

  const selectedFromBalance = fromToken ? balances[fromToken] || 0 : 0;

  return (
    <div className="w-full space-y-6 relative overflow-x-hidden">
      {/* Main Swap Form */}
      <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 sm:p-6 space-y-6 relative z-10 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Swap</h2>
          <button
            onClick={resetBalances}
            className="text-gray-400 hover:text-white text-xs transition-colors duration-150 hover:bg-white/10 px-2 py-1 rounded flex-shrink-0"
            title="Reset balances to initial values"
          >
            Reset Balances
          </button>
        </div>
        
        {/* From Section */}
        <TokenAmountInput
          label="From"
          selectedToken={selectedFromToken}
          onTokenSelect={handleFromTokenSelect}
          tokenList={tokenList}
          balanceMap={balances}
          amount={fromAmount}
          onAmountChange={handleFromAmountChange}
          amountReadonly={false}
          excludeToken={toToken}
          showBalanceFilter={true}
          showBalance={true}
          maxButtonLabel="Max"
          onMaxClick={() => setFromAmount(selectedFromBalance.toString())}
          className={error && error.toLowerCase().includes('amount') ? 'ring-2 ring-red-500/50' : ''}
        />

        {/* Flip Button */}
        <div className="flex justify-center">
          <button
            onClick={handleFlip}
            disabled={(!fromToken && !toToken) || isSwapping}
            className={`
              p-3 rounded-full transition-all duration-200 group
              ${(!fromToken && !toToken) || isSwapping
                ? 'bg-gray-600/50 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110 cursor-pointer shadow-lg hover:shadow-xl'
              }
            `}
            title="Flip tokens"
          >
            <svg className={`w-5 h-5 text-white transition-transform duration-200 ${!isSwapping && fromToken && toToken ? 'group-hover:rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Section */}
        <TokenAmountInput
          label="To (estimated)"
          selectedToken={selectedToToken}
          onTokenSelect={handleToTokenSelect}
          tokenList={tokenList}
          balanceMap={balances}
          amount={toAmount}
          amountReadonly={true}
          excludeToken={fromToken}
          estimatedValue={toAmount ? parseFloat(toAmount) : undefined}
          showBalance={true}
        />

        {/* Real-time conversion preview */}
        {fromToken && toToken && fromAmount && toAmount && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>1 {fromToken} =</span>
                <span className="text-green-400">
                  {formatNumber(prices[fromToken] / prices[toToken], 6)} {toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Est. USD Value:</span>
                <span className="text-green-400">
                  ${formatNumber(parseFloat(toAmount) * prices[toToken], 2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl animate-fade-in">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!validation.isValid || isSwapping || isLoading}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 relative overflow-hidden
            ${validation.isValid && !isSwapping && !isLoading
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-xl transform hover:scale-[1.02]'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
          `}
          title={!validation.isValid ? validation.errorMessage : ''}
        >
          {isSwapping ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Swapping...</span>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading prices...</span>
            </div>
          ) : (
            'Swap'
          )}
        </button>

        {/* Exchange Rate Info - Compact version */}
        {fromToken && toToken && prices[fromToken] && prices[toToken] && (
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-xs text-gray-300 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Prices:</span>
                <div className="text-right space-y-0.5">
                  <div>{fromToken}: <span className="text-green-400">${formatNumber(prices[fromToken], 2)}</span></div>
                  <div>{toToken}: <span className="text-green-400">${formatNumber(prices[toToken], 2)}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            Prices from Switcheo API • Balances persist locally
          </p>
        </div>
      </div>

      {/* Swap History */}
      <div className="max-w-md mx-auto relative z-0 w-full">
        <SwapHistory transactions={swapHistory} onClearHistory={clearSwapHistory} />
      </div>
    </div>
  );
};

export default SwapForm;
