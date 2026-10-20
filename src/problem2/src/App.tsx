import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SwapCard } from './components/SwapCard';
import { TokenSelectModal } from './components/TokenSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SuccessModal } from './components/SuccessModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Token, SwapSettings, WalletState, TxStep, TransactionReceipt } from './types/swap';
import { fetchTokens, calculateSwapQuote, buildToken } from './services/priceService';
import { INITIAL_WALLET } from './data/mockWallet';
import { Shield, TrendingUp, Zap } from 'lucide-react';

export const App: React.FC = () => {
  // Tokens & Pricing State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLivePrice, setIsLivePrice] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  // Form State
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>('0.5');

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);

  // Settings State
  const [settings, setSettings] = useState<SwapSettings>({
    slippage: 0.5,
    deadline: 20,
    simulateFailure: false
  });

  // UI Modals State
  const [tokenSelectTarget, setTokenSelectTarget] = useState<'from' | 'to' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Transaction State
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [txReceipt, setTxReceipt] = useState<TransactionReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark/Light Mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load Tokens on Mount
  const loadTokens = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshingPrices(true);
    try {
      const res = await fetchTokens();
      setTokens(res.tokens);
      setIsLivePrice(res.isLive);
      setLastUpdated(res.lastUpdated);

      // Set initial token selection if not yet set
      setFromToken(prev => prev || res.tokens.find(t => t.symbol === 'ETH') || res.tokens[0]);
      setToToken(prev => prev || res.tokens.find(t => t.symbol === 'USDC') || res.tokens[1]);

      if (isRefresh) {
        addToast({
          type: 'info',
          title: 'Rates Updated',
          message: 'Market prices refreshed with latest oracle data.'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isRefresh) setIsRefreshingPrices(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // Calculate Swap Quote
  const quote = useMemo(() => {
    if (!fromToken || !toToken) {
      return calculateSwapQuote(buildToken('ETH', 1645), buildToken('USDC', 1), 0, settings.slippage);
    }
    const num = parseFloat(fromAmount) || 0;
    return calculateSwapQuote(fromToken, toToken, num, settings.slippage);
  }, [fromToken, toToken, fromAmount, settings.slippage]);

  const toAmount = useMemo(() => {
    if (quote.toAmount <= 0) return '';
    // Format to readable precision
    if (quote.toAmount < 0.000001) return '< 0.000001';
    if (quote.toAmount < 1) return quote.toAmount.toFixed(6);
    return quote.toAmount.toFixed(4);
  }, [quote.toAmount]);

  // Handle Token Flip
  const handleSwapTokens = () => {
    if (!fromToken || !toToken) return;
    const oldFrom = fromToken;
    const oldTo = toToken;
    setFromToken(oldTo);
    setToToken(oldFrom);
    // If output amount was computed, keep it as new input
    if (parseFloat(toAmount) > 0) {
      setFromAmount(toAmount);
    }
  };

  // Wallet Actions
  const handleConnectWallet = () => {
    setWallet(INITIAL_WALLET);
    addToast({
      type: 'success',
      title: 'Wallet Connected',
      message: `Connected as ${INITIAL_WALLET.address.slice(0, 6)}...${INITIAL_WALLET.address.slice(-4)}`
    });
  };

  const handleDisconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: '',
      balances: {}
    });
    addToast({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Demo wallet session cleared.'
    });
  };

  // Execute Swap Simulation
  const executeSwapSimulation = async () => {
    if (!fromToken || !toToken) return;

    setErrorMessage(null);
    setTxStep('approving');

    try {
      // Step 1: Approving
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Submitting
      setTxStep('submitting');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check simulated failure
      if (settings.simulateFailure) {
        throw new Error('Simulation Error: Slippage tolerance exceeded or gas price spiked. Transaction reverted by EVM.');
      }

      // Step 3: Confirming
      setTxStep('confirming');
      await new Promise(resolve => setTimeout(resolve, 900));

      // Step 4: Success!
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const fromVal = parseFloat(fromAmount) || 0;
      const toVal = quote.toAmount;

      // Update mock balances
      setWallet(prev => {
        const newBalances = { ...prev.balances };
        const currentFrom = newBalances[fromToken.symbol] || 0;
        const currentTo = newBalances[toToken.symbol] || 0;

        newBalances[fromToken.symbol] = Math.max(0, currentFrom - fromVal);
        newBalances[toToken.symbol] = currentTo + toVal;

        return { ...prev, balances: newBalances };
      });

      const receipt: TransactionReceipt = {
        hash: mockHash,
        fromSymbol: fromToken.symbol,
        fromAmount: fromAmount,
        toSymbol: toToken.symbol,
        toAmount: toAmount,
        rate: quote.rate,
        feeUsd: quote.estimatedFeeUsd,
        timestamp: Date.now()
      };

      setTxReceipt(receipt);
      setTxStep('success');
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);

      addToast({
        type: 'success',
        title: 'Swap Completed',
        message: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown transaction execution error';
      setErrorMessage(msg);
      setTxStep('error');
      addToast({
        type: 'error',
        title: 'Transaction Failed',
        message: msg
      });
    }
  };

  const handleSwapAgain = () => {
    setIsSuccessOpen(false);
    setTxStep('idle');
    setTxReceipt(null);
    setFromAmount('');
  };

  if (!fromToken || !toToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Initializing Switcheo DEX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'} flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-300/25 via-purple-300/15 to-transparent dark:from-indigo-600/20 dark:via-purple-600/10 dark:to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/15 dark:bg-blue-600/10 blur-3xl rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-300/15 dark:bg-purple-600/10 blur-3xl rounded-full" />
      </div>

      {/* App Header */}
      <Header
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefreshPrices={() => loadTokens(true)}
        isRefreshingPrices={isRefreshingPrices}
        isLivePrice={isLivePrice}
        lastUpdated={lastUpdated}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <SwapCard
          tokens={tokens}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          toAmount={toAmount}
          onChangeFromAmount={setFromAmount}
          onSwapTokens={handleSwapTokens}
          onOpenSelectFrom={() => setTokenSelectTarget('from')}
          onOpenSelectTo={() => setTokenSelectTarget('to')}
          wallet={wallet}
          onConnectWallet={handleConnectWallet}
          quote={quote}
          settings={settings}
          isCalculating={false}
          onInitiateSwap={() => {
            setTxStep('idle');
            setErrorMessage(null);
            setIsConfirmOpen(true);
          }}
        />

        {/* Value Prop Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Audited Smart Router</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Near-Instant Settlement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Zero Protocol Fees</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-900 z-10">
        <p>Switcheo Code Challenge Problem 2 • Built with Vite, React & Tailwind CSS</p>
      </footer>

      {/* Modals */}
      <TokenSelectModal
        isOpen={tokenSelectTarget !== null}
        onClose={() => setTokenSelectTarget(null)}
        tokens={tokens}
        selectedToken={tokenSelectTarget === 'from' ? fromToken : toToken}
        otherToken={tokenSelectTarget === 'from' ? toToken : fromToken}
        onSelectToken={token => {
          if (tokenSelectTarget === 'from') {
            setFromToken(token);
          } else {
            setToToken(token);
          }
        }}
        walletBalances={wallet.balances}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={newSettings => {
          setSettings(newSettings);
          addToast({
            type: 'info',
            title: 'Settings Saved',
            message: `Slippage set to ${newSettings.slippage}%`
          });
        }}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          if (!['approving', 'submitting', 'confirming'].includes(txStep)) {
            setIsConfirmOpen(false);
          }
        }}
        fromToken={fromToken}
        toToken={toToken}
        quote={quote}
        slippage={settings.slippage}
        txStep={txStep}
        errorMessage={errorMessage}
        onConfirm={executeSwapSimulation}
        onRetry={executeSwapSimulation}
      />

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        receipt={txReceipt}
        onSwapAgain={handleSwapAgain}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
