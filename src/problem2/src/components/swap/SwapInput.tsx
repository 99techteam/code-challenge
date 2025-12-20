import { useState } from 'react';
import { TokenIcon } from './TokenIcon';
import { TokenSelector } from './TokenSelector';

interface SwapInputProps {
	label: string;
	currency: string;
	currencies: string[];
	onCurrencyChange: (currency: string) => void;
	disabled?: boolean;
	// Xóa isDarkMode
}

export const SwapInput = ({
	label,
	currency,
	currencies,
	onCurrencyChange,
	disabled = false,
}: SwapInputProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-colors">
				{label}
			</label>
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					disabled={disabled}
					className={`flex justify-between items-center w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50
            bg-white text-black border-gray-300 hover:bg-gray-50
            dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
				>
					<div className="flex items-center">
						<TokenIcon currency={currency} />
						<span className="ml-3 font-semibold">{currency}</span>
					</div>
					<svg
						className={`w-5 h-5 transition-transform duration-200 ${
							isOpen ? 'rotate-180' : ''
						} 
              text-gray-600 dark:text-gray-400`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				<TokenSelector
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					currencies={currencies}
					onSelect={(selected) => {
						onCurrencyChange(selected);
						setIsOpen(false);
					}}
					// Không cần truyền isDarkMode nữa
				/>
			</div>
		</div>
	);
};
