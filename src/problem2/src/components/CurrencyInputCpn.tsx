import type { Token } from '../types';
import SearchableCurrencyDropdown from './SearchableCurrencyDropdown';

interface CurrencyInputProps {
  label: string;
  tokens: Token[];
  amount: string;
  onAmountChange: (value: string) => void;
  onSelectCurrency: (value: Token) => void;
  selectedCurrency: Token | undefined;
}

const CurrencyInputCpn = ({ label, tokens, amount, onAmountChange, onSelectCurrency, selectedCurrency }: CurrencyInputProps) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) {
      onAmountChange(e.target.value);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col gap-2 transition-all focus-within:border-blue-500">
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>{label}</span>
      </div>
      <div className="flex justify-between items-center gap-15">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          className="bg-transparent text-3xl font-mono text-white w-full focus:outline-none"
          value={amount}
          onChange={handleAmountChange}
        />
         <SearchableCurrencyDropdown
            currencies={tokens}
            selectedCurrency={selectedCurrency}
            onSelectCurrency={onSelectCurrency}
        />
      </div>
    </div>
  );
};

export default CurrencyInputCpn;