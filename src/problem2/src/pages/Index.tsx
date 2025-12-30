import { useEffect, useState, useMemo } from 'react';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useTheme } from '../hooks/useTheme';
import { SwapForm } from '../components/swap/SwapForm';
import { TokenModal } from '../components/swap/TokenModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tokenGlowColors, DEFAULT_GLOW } from '../config/TokenGlowColorsConfig';

export const Index = () => {
	const [fromCurrency, setFromCurrency] = useState<string>('USD');
	const [toCurrency, setToCurrency] = useState<string>('ETH');
	const [amount, setAmount] = useState<string>('');
	const [result, setResult] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState<'from' | 'to'>('from');

	const { isDarkMode, toggleTheme } = useTheme();
	const {
		exchangeRates,
		currencies,
		loading: pricesLoading,
	} = useTokenPrices();

	const fromPriceUSD = exchangeRates[fromCurrency]?.price || 0;
	const toPriceUSD = exchangeRates[toCurrency]?.price || 0;

	const currentExchangeRate = useMemo(() => {
		if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return 0;

		const fromPrice = exchangeRates[fromCurrency].price;
		const toPrice = exchangeRates[toCurrency].price;

		if (toPrice === 0) return 0;
		return fromPrice / toPrice;
	}, [fromCurrency, toCurrency, exchangeRates]);

	useEffect(() => {
		const amountNum = parseFloat(amount);

		if (
			!amount ||
			isNaN(amountNum) ||
			amountNum <= 0 ||
			!exchangeRates[fromCurrency] ||
			!exchangeRates[toCurrency]
		) {
			setResult('');
			return;
		}

		const timer = setTimeout(() => {
			const converted = amountNum * currentExchangeRate;
			const resultText = `${amountNum} ${fromCurrency} = ${converted.toFixed(
				6
			)} ${toCurrency}`;
			setResult(resultText);
		}, 500);

		return () => clearTimeout(timer);
	}, [amount, currentExchangeRate, fromCurrency, toCurrency]);

	const activeGlow = useMemo(() => {
		const targetToken = fromCurrency === 'USD' ? toCurrency : fromCurrency;
		return tokenGlowColors[targetToken.toUpperCase()] || DEFAULT_GLOW;
	}, [fromCurrency, toCurrency]);

	const openTokenModal = (type: 'from' | 'to') => {
		setModalType(type);
		setIsModalOpen(true);
	};

	const handleTokenSelect = (token: string) => {
		if (modalType === 'from') {
			if (token === toCurrency) {
				setToCurrency(fromCurrency);
			}
			setFromCurrency(token);
		} else {
			if (token === fromCurrency) {
				setFromCurrency(toCurrency);
			}
			setToCurrency(token);
		}
		setIsModalOpen(false);
	};

	const handleSwitch = () => {
		setFromCurrency(toCurrency);
		setToCurrency(fromCurrency);
	};

	const handleSwap = () => {
		if (!result) {
			toast.error('Please enter a valid amount to swap.');
			return;
		}

		setLoading(true);

		setTimeout(() => {
			setLoading(false);
			toast.success(`Swap successful! ${result}`);
		}, 1500);
	};

	return (
		<div className={`${isDarkMode ? 'dark' : ''} w-full min-h-screen`}>
			<div className="flex justify-center items-center min-h-screen w-full transition-colors duration-500 overflow-hidden relative bg-slate-50 dark:bg-[#0f172a]">
				<div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
					{isDarkMode && (
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] transition-all duration-1000">
							<div
								className={`absolute inset-0 bg-gradient-to-r ${activeGlow} rounded-full blur-[100px] animate-pulse-slow transition-all duration-1000`}
							></div>
						</div>
					)}
					{!isDarkMode && (
						<>
							<div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/40 rounded-full blur-[120px] mix-blend-multiply"></div>
							<div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
						</>
					)}
				</div>

				<div
					className={`
            w-[452px] min-h-[600px] p-6 rounded-3xl relative z-10 flex flex-col transition-all duration-300
            dark:bg-[#1e2a47]/90 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-2xl dark:shadow-black/50
            bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]
          `}
				>
					<div className="flex justify-between items-center mb-6 shrink-0">
						<h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300">
							Swap Machine
						</h1>
						<button
							onClick={toggleTheme}
							className="flex justify-center items-center w-10 h-10 rounded-full transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-yellow-400 dark:hover:bg-gray-600"
						>
							{isDarkMode ? '☀️' : '🌙'}
						</button>
					</div>

					<div className="flex-1">
						{!pricesLoading ? (
							<SwapForm
								fromCurrency={fromCurrency}
								toCurrency={toCurrency}
								amount={amount}
								onAmountChange={setAmount}
								onSwap={handleSwap}
								result={result}
								loading={loading}
								onOpenTokenSelect={openTokenModal}
								onSwitch={handleSwitch}
								exchangeRate={currentExchangeRate}
								fromPriceUSD={fromPriceUSD}
								toPriceUSD={toPriceUSD}
							/>
						) : (
							<div className="space-y-4 animate-pulse">
								<div className="h-24 bg-gray-200 rounded-xl dark:bg-gray-700/50"></div>
								<div className="h-24 bg-gray-200 rounded-xl dark:bg-gray-700/50"></div>
								<div className="h-14 bg-gray-200 rounded-xl dark:bg-gray-700/50 mt-4"></div>
							</div>
						)}
					</div>
				</div>
			</div>

			<TokenModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSelect={handleTokenSelect}
				currencies={currencies}
				exchangeRates={exchangeRates}
			/>

			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme={isDarkMode ? 'dark' : 'light'}
				toastClassName={`
          relative flex p-2 min-h-12 rounded-2xl justify-between overflow-hidden cursor-pointer shadow-2xl mb-4
          transition-all duration-300 ease-in-out
          ${
						isDarkMode
							? 'bg-[#1e2a47]/90 backdrop-blur-xl border border-white/10 text-white'
							: 'bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-800'
					}
        `}
				progressClassName="!bg-gradient-to-r !from-cyan-500 !to-blue-500 !h-1"
			/>
		</div>
	);
};
