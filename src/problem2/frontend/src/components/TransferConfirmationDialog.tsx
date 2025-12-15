import { useEffect } from "react";

interface TransferConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientWallet: string;
  tokenSymbol: string;
  amount: string;
  isLoading?: boolean;
}

const TransferConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  recipientWallet,
  tokenSymbol,
  amount,
  isLoading = false,
}: TransferConfirmationDialogProps) => {
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

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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
            Confirm Transfer
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
            You are about to transfer tokens to the following address:
          </p>

          {/* Transfer Details */}
          <div className="bg-crypto-darker rounded-xl p-3 sm:p-4 space-y-4 border border-crypto-cardHover">
            {/* Amount */}
            <div className="flex items-center justify-between pb-3 border-b border-crypto-cardHover">
              <div>
                <p className="text-xs text-gray-400 mb-1">Amount</p>
                <p className="text-lg sm:text-xl font-bold text-white">
                  {parseFloat(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </p>
              </div>
              <div className="px-3 py-1.5 bg-crypto-accent/20 rounded-lg">
                <p className="text-sm font-bold text-crypto-accent">{tokenSymbol}</p>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Recipient Address</p>
              <div className="bg-crypto-card rounded-lg p-3 border border-crypto-cardHover">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-white font-mono break-all">
                    {recipientWallet}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                  Shortened: {truncateAddress(recipientWallet)}
                </p>
              </div>
            </div>

            {/* Network Fee */}
            <div className="flex items-center justify-between pt-2 border-t border-crypto-cardHover">
              <p className="text-xs sm:text-sm text-gray-400">Network Fee</p>
              <p className="text-xs sm:text-sm text-white">~$0.50</p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs sm:text-sm text-red-300 flex items-start gap-2">
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
              <span>
                <strong>Warning:</strong> This transfer is irreversible. Please verify the
                recipient address carefully before confirming.
              </span>
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
                Confirm Transfer
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
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

export default TransferConfirmationDialog;
