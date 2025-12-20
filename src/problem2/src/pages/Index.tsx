import { useState } from 'react';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useTheme } from '../hooks/useTheme';
import { SwapForm } from '../components/swap/SwapForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Index = () => {
	const [fromCurrency, setFromCurrency] = useState<string>('USD');
	const [toCurrency, setToCurrency] = useState<string>('ETH');
	const [amount, setAmount] = useState<string>('');
	const [result, setResult] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');

	const { isDarkMode, toggleTheme } = useTheme();

	const {
		exchangeRates,
		currencies,
		loading: pricesLoading,
	} = useTokenPrices();

	const handleSwap = () => {
		setLoading(true);
		setError('');
		setResult('');

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			toast.error('Please enter a valid amount greater than 0.');
			setLoading(false);
			return;
		}

		if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
			toast.error('Exchange rate not available for selected currencies.');
			setLoading(false);
			return;
		}

		const fromRate = exchangeRates[fromCurrency].price;
		const toRate = exchangeRates[toCurrency].price;
		console.log(
			`From Rate (${fromCurrency}): ${fromRate}, To Rate (${toCurrency}): ${toRate}`
		);

		setTimeout(() => {
			const converted = (amountNum / toRate) * fromRate;
			const resultText = `${amountNum} ${fromCurrency} = ${converted.toFixed(
				6
			)} ${toCurrency}`;
			setResult(resultText);
			toast.success(resultText);
			setLoading(false);
		}, 1000);
	};

	return (
		<div className={isDarkMode ? 'dark' : ''}>
			{/* Background Container */}
			<div className="flex justify-center items-center min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-[#0f172a]">
				{/* Main Card */}
				<div
					className={`
            /* --- FIXED DIMENSIONS: 362x522 --- */
            w-[362px] h-[600px]
            
            p-6 rounded-xl shadow-xl 
            transition-colors duration-300 
            relative flex flex-col
            ${isDarkMode ? 'bg-[#1e2a47] text-white' : 'bg-white text-black'}
          `}
				>
					{/* Header */}
					<div className="flex justify-between items-center mb-4 shrink-0">
						<h1 className="text-xl font-bold">Token Swap</h1>

						<button
							onClick={toggleTheme}
							className="flex justify-center items-center p-2 ml-2 w-10 h-10 text-gray-900 bg-yellow-400 rounded-full transition-all duration-300 hover:bg-yellow-500 focus:outline-none"
							title="Toggle Theme"
						>
							{isDarkMode ? '☀️' : '🌙'}
						</button>
					</div>

					{/* Form Content */}
					<div className="flex-1">
						{!pricesLoading && (
							<SwapForm
								fromCurrency={fromCurrency}
								toCurrency={toCurrency}
								onFromCurrencyChange={setFromCurrency}
								onToCurrencyChange={setToCurrency}
								amount={amount}
								onAmountChange={setAmount}
								onSwap={handleSwap}
								currencies={currencies}
								exchangeRates={exchangeRates}
								result={result}
								error={error}
								loading={loading}
							/>
						)}

						{pricesLoading && (
							<div className="space-y-4 animate-pulse">
								<div className="h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
								<div className="h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
								<div className="h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Add ToastContainer here */}
			<ToastContainer
				position="top-center"
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme={isDarkMode ? 'dark' : 'light'}
			/>
		</div>
	);
};
