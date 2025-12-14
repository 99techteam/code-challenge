import { Token } from "../data/tokens";

interface SwapButtonProps {
  onClick: () => void;
  disabled: boolean;
  fromToken: Token;
  toToken: Token;
}

const SwapButton = ({ onClick, disabled }: SwapButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
        disabled
          ? "bg-crypto-cardHover text-gray-500 cursor-not-allowed"
          : "bg-linear-to-r from-crypto-accent to-indigo-600 hover:from-crypto-accentHover hover:to-indigo-700 text-white shadow-crypto transform hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      {disabled ? (
        "Enter an amount"
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>Swap</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
  );
};

export default SwapButton;
