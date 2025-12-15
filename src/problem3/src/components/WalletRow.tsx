import React from "react";
import { WalletRowProps } from "../types/wallet";

export const WalletRow: React.FC<WalletRowProps> = ({
  className,
  amount,
  usdValue,
  formattedAmount,
}) => {
  return (
    <div
      className={`${className} flex justify-between items-center p-4 border-b border-gray-200 bg-white/50 hover:bg-gray-50 transition duration-150`}
    >
      {/* Formatted Amount Display */}
      <span className="min-w-37.5 font-semibold text-lg text-gray-800">
        {formattedAmount}
      </span>

      {/* USD Value Display (Hidden on small screens) */}
      <span className="min-w-37.5 text-base text-gray-600 hidden sm:block">
        USD: <span className="font-medium">${usdValue.toFixed(2)}</span>
      </span>

      {/* Raw Amount */}
      <span className="text-sm text-gray-400">Raw: {amount.toFixed(6)}</span>
    </div>
  );
};
