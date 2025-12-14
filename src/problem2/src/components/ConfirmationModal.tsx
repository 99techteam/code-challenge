import { type FC } from 'react';
import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { ExchangeRate } from './ExchangeRate';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  isSubmitting: boolean;
  fromBalance: number;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  exchangeRate,
  isSubmitting,
  fromBalance
}) => {
  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 border border-slate-600 rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">Confirm Swap</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-slate-200 transition-colors duration-150 disabled:opacity-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-6 space-y-4">
          {/* From */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-2">You send</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {fromToken && <TokenIcon token={fromToken} size={32} />}
                <div>
                  <div className="text-lg font-semibold text-slate-100">
                    {fromAmount} {fromToken?.symbol}
                  </div>
                  <div className="text-xs text-slate-400">
                    Balance: {fromBalance.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4V16M10 16L6 12M10 16L14 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* To */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-2">You receive</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {toToken && <TokenIcon token={toToken} size={32} />}
                <div>
                  <div className="text-lg font-semibold text-slate-100">
                    {toAmount} {toToken?.symbol}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <ExchangeRate fromToken={fromToken} toToken={toToken} exchangeRate={exchangeRate} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="md"
            className="flex-1"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Swap'}
          </Button>
        </div>
      </div>
    </div>
  );
};
