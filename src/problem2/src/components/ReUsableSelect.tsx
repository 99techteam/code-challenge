import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TokenPrice } from '@/@types/type';
const ReUsableSelect = (props: {
  currencies: TokenPrice[];
  fromCurrency: string;
  toCurrency: string;
  handleFromCurrencyChange: (value: string) => void;
  handleToCurrencyChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <Select
      value={props.fromCurrency}
      onValueChange={props.handleFromCurrencyChange}
    >
      <SelectTrigger className={`flex-1 px-4 py-3 text-lg ${props.className ?? ''}`}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {props.currencies.map((token) => (
          <SelectItem key={token.currency} value={token.currency}>
            <div className="flex items-center gap-2">
              <img
                src={token.icon}
                alt={token.currency}
                className="w-5 h-5 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
                }}
              />
              <span>{token.currency}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ReUsableSelect;
