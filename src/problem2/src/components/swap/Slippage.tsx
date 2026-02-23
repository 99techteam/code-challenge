import React from "react";

interface SlippageProps {
  value: number;
  onChange: (val: number) => void;
}

export const Slippage: React.FC<SlippageProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4 p-4 bg-gray-800/50 rounded-xl animate-in slide-in-from-top-2 border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-text-primary">Slippage Tolerance</span>
        <span className="text-xs text-text-secondary">
          Your transaction will revert if the price changes unfavorably by more than this
          percentage.
        </span>
      </div>
      <div className="flex gap-2">
        {[0.1, 0.5, 1.0].map((val) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
              value === val
                ? "bg-primary text-background"
                : "bg-gray-700 text-text-primary hover:bg-gray-600"
            }`}>
            {val}%
          </button>
        ))}
      </div>
    </div>
  );
};
