import React, { useState } from 'react';
import { Token, SwapQuote, WalletState, SwapSettings } from '../types/swap';
import { TokenInput } from './TokenInput';
import { SwapDetails } from './SwapDetails';
import { ArrowDownUp, Sparkles } from 'lucide-react';

interface SwapCardProps {
  tokens: Token[];
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  onChangeFromAmount: (val: string) => void;
  onSwapTokens: () => void;
  onOpenSelectFrom: () => void;
  onOpenSelectTo: () => void;
  wallet: WalletState;
  onConnectWallet: () => void;
  quote: SwapQuote;
  settings: SwapSettings;
  isCalculating: boolean;
  onInitiateSwap: () => void;
}

export const SwapCard: React.FC<SwapCardProps> = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onChangeFromAmount,
  onSwapTokens,
  onOpenSelectFrom,
  onOpenSelectTo,
  wallet,
  onConnectWallet,
  quote,
  settings,
  isCalculating,
  onInitiateSwap
}) => {
  const [isFlipping, setIsFlipping] = useState(false);

  const numericFromAmount = parseFloat(fromAmount) || 0;
  const userBalance = wallet.balances[fromToken.symbol] || 0;

  // Validation logic
  let validationError: string | null = null;
  let buttonText = 'Swap';
  let isButtonDisabled = false;

  if (!wallet.isConnected) {
    buttonText = 'Connect Wallet';
    isButtonDisabled = false;
  } else if (!fromAmount || fromAmount.trim() === '') {
    buttonText = 'Enter an amount';
    isButtonDisabled = true;
  } else if (isNaN(numericFromAmount) || numericFromAmount <= 0) {
    buttonText = 'Enter a valid amount';
    validationError = 'Amount must be greater than 0';
    isButtonDisabled = true;
  } else if (numericFromAmount > userBalance) {
    buttonText = `Insufficient ${fromToken.symbol} balance`;
    validationError = `Max balance: ${userBalance} ${fromToken.symbol}`;
    isButtonDisabled = true;
  } else if (fromToken.symbol === toToken.symbol) {
    buttonText = 'Select different tokens';
    validationError = 'Cannot swap identical tokens';
    isButtonDisabled = true;
  }

  const handlePercentageSelect = (pct: number) => {
    if (userBalance <= 0) return;
    const amount = (userBalance * (pct / 100)).toFixed(
      fromToken.decimals === 6 ? 4 : 6
    );
    // Remove trailing zeroes
    onChangeFromAmount(parseFloat(amount).toString());
  };

  const handleFlip = () => {
    setIsFlipping(true);
    onSwapTokens();
    setTimeout(() => setIsFlipping(false), 300);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-950/40 relative z-10 transition-all">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Swap Assets</h2>
          <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Best Route
          </span>
        </div>
      </div>

      {/* Form Body */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!wallet.isConnected) {
            onConnectWallet();
          } else if (!isButtonDisabled) {
            onInitiateSwap();
          }
        }}
        className="space-y-3"
      >
        {/* PAY INPUT (From Token) */}
        <TokenInput
          id="input-amount"
          label="You Pay"
          token={fromToken}
          amount={fromAmount}
          onChangeAmount={onChangeFromAmount}
          onOpenTokenSelect={onOpenSelectFrom}
          balance={userBalance}
          showPercentages={wallet.isConnected}
          onSelectPercentage={handlePercentageSelect}
          error={validationError}
        />

        {/* FLIP / SWITCH BUTTON */}
        <div className="flex justify-center -my-2 relative z-20">
          <button
            type="button"
            onClick={handleFlip}
            className={`p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 shadow-md shadow-slate-300/40 dark:shadow-black/40 hover:scale-110 active:scale-95 transition-all duration-300 ${
              isFlipping ? 'rotate-180' : ''
            }`}
            title="Switch tokens"
            aria-label="Switch tokens"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* RECEIVE INPUT (To Token) */}
        <TokenInput
          id="output-amount"
          label="You Receive"
          token={toToken}
          amount={toAmount}
          readOnly={true}
          onOpenTokenSelect={onOpenSelectTo}
          balance={wallet.balances[toToken.symbol] || 0}
        />

        {/* SWAP DETAILS ACCORDION */}
        {numericFromAmount > 0 && quote.toAmount > 0 && (
          <div className="pt-1 animate-fadeIn">
            <SwapDetails
              fromToken={fromToken}
              toToken={toToken}
              quote={quote}
              slippage={settings.slippage}
            />
          </div>
        )}

        {/* SUBMIT / CONFIRM ACTION BUTTON */}
        <div className="pt-2">
          {!wallet.isConnected ? (
            <button
              type="button"
              onClick={onConnectWallet}
              className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              type="submit"
              disabled={isButtonDisabled || isCalculating}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] ${
                isButtonDisabled
                  ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50'
              }`}
            >
              {buttonText}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
