import { forwardRef, type ChangeEvent } from "react";

interface CurrencyInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    balance?: number;
    tokenSymbol?: string;
    onMaxClick?: () => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({
    label,
    value,
    onChange,
    error,
    disabled = false,
    placeholder = '0.00',
    balance,
    tokenSymbol,
    onMaxClick
}, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty string
        if (inputValue === '') {
            onChange('');
            return;
        }

        // Allow only numbers and one decimal point
        if (/^\d*\.?\d*$/.test(inputValue)) {
            onChange(inputValue);
        }
    };

    const showBalance = balance !== undefined && tokenSymbol;
    const isLowBalance = balance !== undefined && balance > 0 && balance < 10;
    const hasInsufficientBalance = error?.toLowerCase().includes('insufficient');

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                    {label}
                </label>
                {showBalance && (
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${isLowBalance ? 'text-yellow-400' : 'text-slate-400'}`}>
                            Balance: {balance.toLocaleString()} {tokenSymbol}
                        </span>
                        {onMaxClick && !disabled && (
                            <button
                                type="button"
                                onClick={onMaxClick}
                                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-blue-500/10"
                            >
                                MAX
                            </button>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={ref}
                type="text"
                inputMode="decimal"
                className={`w-full bg-slate-700 border rounded-lg px-4 py-3 text-slate-100 text-base transition-colors duration-200 outline-none ${error
                    ? hasInsufficientBalance
                        ? 'border-yellow-500'
                        : 'border-red-500'
                    : 'border-slate-600 hover:border-slate-500 focus:border-blue-500'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={value}
                onChange={handleChange}
                disabled={disabled}
                placeholder={placeholder}
            />

            {error && (
                <div className={`text-sm mt-2 ${hasInsufficientBalance ? 'text-yellow-400' : 'text-red-500'}`}>
                    {error}
                </div>
            )}
        </div>
    );
});

