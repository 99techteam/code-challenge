import React, { useState } from 'react';
import { TransactionReceipt } from '../types/swap';
import { CheckCircle2, ExternalLink, Copy, Check, Sparkles, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: TransactionReceipt | null;
  onSwapAgain: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onSwapAgain
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !receipt) return null;

  const shortHash = `${receipt.hash.slice(0, 10)}...${receipt.hash.slice(-8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 z-10 text-center animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10 relative">
          <CheckCircle2 className="w-9 h-9" />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-300 animate-bounce" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Swap Successful!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Your transaction has been broadcasted and confirmed on chain.
        </p>

        {/* Swap Summary Box */}
        <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 mb-5 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Paid:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
              {receipt.fromAmount} {receipt.fromSymbol}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Received:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              +{receipt.toAmount} {receipt.toSymbol}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{shortHash}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-400 transition rounded"
                title="Copy Transaction Hash"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simulated Explorer Link */}
        <div className="mb-5">
          <a
            href={`https://etherscan.io/tx/${receipt.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => {
              e.preventDefault();
              alert(`Simulated Explorer view for TX: ${receipt.hash}`);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition font-medium"
          >
            <span>View on Block Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Button */}
        <button
          onClick={onSwapAgain}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          Make Another Swap
        </button>
      </div>
    </div>
  );
};
