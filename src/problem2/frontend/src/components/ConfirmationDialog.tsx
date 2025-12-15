import { useEffect } from "react";
import { Token } from "../data/tokens";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  isLoading?: boolean;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  isLoading = false,
}: ConfirmationDialogProps) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative bg-crypto-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-crypto-cardHover max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-crypto-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Confirm Swap
          </h3>
          {!isLoading && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-crypto-cardHover transition-colors text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            You are about to swap the following tokens:
          </p>

          {/* Swap Details */}
          <div className="bg-crypto-darker rounded-xl p-3 sm:p-4 space-y-3 border border-crypto-cardHover">
            {/* From */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-crypto-accent to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {fromToken.symbol.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">From</p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {fromToken.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-white">
                  {parseFloat(fromAmount).toFixed(6)}
                </p>
                <p className="text-xs text-gray-400">{fromToken.symbol}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg
                className="w-5 h-5 text-crypto-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>

            {/* To */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {toToken.symbol.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">To</p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {toToken.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-crypto-success">
                  {parseFloat(toAmount).toFixed(6)}
                </p>
                <p className="text-xs text-gray-400">{toToken.symbol}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-300 flex items-start gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              This transaction is irreversible. Please verify the details before confirming.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
              isLoading
                ? "bg-crypto-cardHover text-gray-500 cursor-not-allowed"
                : "bg-crypto-cardHover text-white hover:bg-crypto-darker border border-crypto-cardHover hover:border-gray-600"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
              isLoading
                ? "bg-crypto-cardHover text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-crypto-accent to-indigo-600 hover:from-crypto-accentHover hover:to-indigo-700 text-white shadow-crypto transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Confirm Swap
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
