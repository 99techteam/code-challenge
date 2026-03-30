import type { Token } from '../types';
import { TokenIcon } from './TokenSelectorModal';
import { formatUSD } from '../utils/format';
import { DECIMAL_NUMBER_REGEX, KEY_ARROW_UP, KEY_ARROW_DOWN } from '../constants';

interface TokenInputProps {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  token: Token | null;
  onTokenSelect: () => void;
  error?: string;
  disabled?: boolean;
  approximate?: boolean;
}

export default function TokenInput({
  label,
  amount,
  onAmountChange,
  token,
  onTokenSelect,
  error,
  disabled,
  approximate,
}: TokenInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || DECIMAL_NUMBER_REGEX.test(value)) {
      onAmountChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN) {
      e.preventDefault();
      const current = parseFloat(amount) || 0;
      const step = e.shiftKey ? 1 : 0.1;
      const next = e.key === KEY_ARROW_UP ? current + step : Math.max(0, current - step);
      onAmountChange(parseFloat(next.toFixed(6)).toString());
    }
  };

  const usdValue = token && amount ? parseFloat(amount) * token.price : 0;

  return (
    <div className={`bg-gray-50 rounded-2xl p-4 border-2 transition-all ${
      error ? 'border-red-300 bg-red-50/30' : 'border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/20'
    }`}>
      {/* Label */}
      <div className="mb-2">
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Amount input */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline">
            {approximate && amount && (
              <span className="text-gray-900 text-2xl sm:text-[28px] font-semibold mr-1 select-none">&asymp;</span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="0.00"
              disabled={disabled}
              className="w-full bg-transparent text-gray-900 text-2xl sm:text-[28px] font-semibold outline-none placeholder-gray-300 min-w-0 disabled:opacity-50"
            />
          </div>
          <div className="mt-1 h-4">
            {token && amount && parseFloat(amount) > 0 ? (
              <span className="text-gray-400 text-xs">&asymp;{formatUSD(usdValue)}</span>
            ) : error ? (
              <span className="text-red-400 text-xs">{error}</span>
            ) : null}
          </div>
        </div>

        {/* Token selector badge */}
        <button
          onClick={onTokenSelect}
          className={`flex items-center gap-2 rounded-full py-2 pl-2 pr-3 transition-all flex-shrink-0 ${
            token
              ? 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
          }`}
        >
          {token ? (
            <>
              <TokenIcon token={token} size={28} />
              <span className="text-gray-900 font-semibold text-sm">{token.currency}</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">{token.currency}</span>
            </>
          ) : (
            <span className="text-white font-semibold text-sm whitespace-nowrap px-1">Select</span>
          )}
          <svg
            className={token ? 'text-gray-400' : 'text-white/80'}
            width="12" height="12" viewBox="0 0 12 12" fill="none"
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
