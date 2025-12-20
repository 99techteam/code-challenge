import { useState } from 'react';
import type { ExchangeRates } from '../../types/token';
import { SwapInput } from './SwapInput';
import { SwapButton } from './SwapButton';
import { ExchangeRate } from './ExchangeRate';

interface SwapFormProps {
	fromCurrency: string;
	toCurrency: string;
	onFromCurrencyChange: (currency: string) => void;
	onToCurrencyChange: (currency: string) => void;
	onSwap: () => void;
	amount: string;
	onAmountChange: (amount: string) => void;
	exchangeRates: ExchangeRates;
	currencies: string[];
	result?: string;
	error?: string;
	loading: boolean;
}

export const SwapForm = ({
	fromCurrency,
	toCurrency,
	onFromCurrencyChange,
	onToCurrencyChange,
	onSwap,
	amount,
	onAmountChange,
	currencies,
	result,
	error,
	loading,
}: SwapFormProps) => {
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSwap();
	};

	const handleSwapClick = () => {
		onFromCurrencyChange(toCurrency);
		onToCurrencyChange(fromCurrency);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			<SwapInput
				label="From"
				currency={fromCurrency}
				currencies={currencies}
				onCurrencyChange={onFromCurrencyChange}
				disabled={!currencies.length}
			/>

			{/* --- CẬP NHẬT: SWAP BUTTON MÀU ĐỎ --- */}
			<SwapButton
				onClick={handleSwapClick}
				// Thêm className để chỉnh màu đỏ (Red)
				// Lưu ý: File SwapButton.tsx cần phải nhận prop `className` thì mới hoạt động
				// className="text-white bg-red-500 border-red-200 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-800"
			/>

			<SwapInput
				label="To"
				currency={toCurrency}
				currencies={currencies}
				onCurrencyChange={onToCurrencyChange}
				disabled={!currencies.length}
			/>

			<div>
				<label className="block text-sm font-medium text-black transition-colors dark:text-white">
					Amount
				</label>

				<input
					type="number"
					min="0"
					step="any"
					value={amount}
					onChange={(e) => onAmountChange(e.target.value)}
					className={`block p-2 mt-1 w-full text-black bg-white rounded-lg border border-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder:text-gray-500 dark:bg-black dark:text-white dark:border-gray-800`}
					placeholder="Enter amount"
					disabled={!currencies.length}
				/>
			</div>

			<ExchangeRate
				result={result}
				error={error}
			/>

			<button
				type="submit"
				disabled={loading || !currencies.length}
				className={`
          w-full py-2 px-4 rounded-lg text-white font-bold hover:opacity-90 transition-all duration-300
          ${
						loading || !currencies.length
							? 'bg-gray-500'
							: 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-teal-500 dark:to-cyan-400'
					}
        `}
			>
				{loading ? 'Swapping...' : 'Swap'}
			</button>

			<p className="text-xs text-center text-black transition-colors dark:text-white">
				Token data from{' '}
				<a
					href="https://interview.switcheo.com/prices.json"
					target="_blank"
					rel="noopener noreferrer"
					className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				>
					Switcheo API
				</a>
				.
			</p>
		</form>
	);
};
