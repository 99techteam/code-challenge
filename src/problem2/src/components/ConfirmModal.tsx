import React from 'react';
import { Token, SwapQuote, TxStep } from '../types/swap';
import { TokenIcon } from './TokenIcon';
import { formatNumber, formatUsd } from '../services/priceService';
import { X, ArrowDown, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromToken: Token;
  toToken: Token;
  quote: SwapQuote;
  slippage: number;
  txStep: TxStep;
  errorMessage: string | null;
  onConfirm: () => void;
  onRetry: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  fromToken,
  toToken,
  quote,
  slippage,
  txStep,
  errorMessage,
  onConfirm,
  onRetry
}) => {
  if (!isOpen) return null;

  const isProcessing = ['approving', 'submitting', 'confirming'].includes(txStep);

  const getStepText = () => {
    switch (txStep) {
      case 'approving':
        return 'Approving token spend in wallet...';
      case 'submitting':
        return 'Broadcasting transaction to blockchain...';
      case 'confirming':
        return 'Waiting for block confirmation...';
      default:
        return 'Processing swap...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 z-10 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Review Swap</h3>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Swap Tokens Preview */}
        <div className="mt-4 space-y-2">
          {/* From token box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TokenIcon symbol={fromToken.symbol} size="md" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">You Pay</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{fromToken.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
                {formatNumber(quote.fromAmount, 6)} {fromToken.symbol}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                ~{formatUsd(quote.fromUsd)}
              </div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex justify-center -my-1 relative z-10">
            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* To token box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TokenIcon symbol={toToken.symbol} size="md" />
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">You Receive</span>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{toToken.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumber(quote.toAmount, 6)} {toToken.symbol}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                ~{formatUsd(quote.toUsd)}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Meta Details */}
        <div className="my-4 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Exchange Rate</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              1 {fromToken.symbol} ≈ {formatNumber(quote.rate, 6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guaranteed Minimum</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              {formatNumber(quote.minimumReceived, 6)} {toToken.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Slippage Tolerance</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Network Fee</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">~{formatUsd(quote.estimatedFeeUsd)}</span>
          </div>
          <div className="flex justify-between">
            <span>Security Check</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Router
            </span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Transaction Failed</span>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Processing State Indicator */}
        {isProcessing && (
          <div className="mb-4 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Executing Swap</span>
              <span className="text-slate-600 dark:text-slate-400">{getStepText()}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {errorMessage ? (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
            >
              Retry Swap
            </button>
          </div>
        ) : (
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm transition flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting Transaction...</span>
              </>
            ) : (
              <span>Confirm Swap</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
