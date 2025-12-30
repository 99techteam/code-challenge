import { useState, useMemo, memo } from 'react';
import { TokenIcon } from './TokenIcon';

// --- TYPES & CONSTANTS ---
type GasOption = {
	id: string;
	label: string;
	price: number;
	time: string;
};

interface SwapFormProps {
	fromCurrency: string;
	toCurrency: string;
	amount: string;
	onAmountChange: (val: string) => void;
	onSwap: () => void;
	result: string;
	loading: boolean;
	onOpenTokenSelect: (type: 'from' | 'to') => void;
	onSwitch: () => void;
	exchangeRate: number;
	fromPriceUSD: number;
	toPriceUSD: number;
}

const GAS_OPTIONS: GasOption[] = [
	{ id: 'standard', label: 'Standard', price: 2.4, time: '~5 secs' },
	{ id: 'fast', label: 'Fast', price: 4.5, time: '~2 secs' },
	{ id: 'instant', label: 'Instant', price: 8.2, time: '< 1 sec' },
];

const MOCK_BALANCES: Record<string, number> = {
	ETH: 2.45,
	USDC: 5400.21,
	USDT: 120.5,
	WBTC: 0.045,
	BLUR: 4500,
	bNEO: 150,
};

// --- SUB-COMPONENT: TOKEN INPUT SECTION ---
interface TokenInputBlockProps {
	label: string;
	currency: string;
	amount: string;
	balance: number;
	usdValue: number;
	onChange?: (val: string) => void;
	onTokenSelect: () => void;
	onMax?: () => void;
	isError?: boolean;
}

const TokenInputBlock = memo(
	({
		label,
		currency,
		amount,
		balance,
		usdValue,
		onChange,
		onTokenSelect,
		onMax,
		isError,
	}: TokenInputBlockProps) => {
		const isReadOnly = !onChange;

		// Xử lý logic nhập liệu an toàn
		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (!onChange) return;
			const val = e.target.value;
			if (parseFloat(val) < 0) return; // Chặn số âm
			onChange(val);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
		};

		return (
			<div
				className={`
      p-4 rounded-2xl border transition-colors group relative bg-gray-50 dark:bg-[#131b2e]
      ${
				isError
					? 'border-red-500/50 hover:border-red-500'
					: 'border-gray-200 dark:border-gray-700 hover:border-cyan-500/50'
			}
    `}
			>
				{/* Header: Label & Balance */}
				<div className="flex justify-between mb-2">
					<span
						className={`text-sm font-medium ${
							isError ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
						}`}
					>
						{isError ? 'Insufficient Balance' : label}
					</span>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						Balance:
						<button
							type="button"
							onClick={onMax}
							disabled={!onMax}
							className={`
              font-medium ml-1 transition-all 
              ${
								onMax
									? 'text-gray-900 dark:text-gray-300 hover:text-cyan-500 hover:underline cursor-pointer'
									: 'text-gray-900 dark:text-gray-300 cursor-default'
							}
            `}
						>
							{balance.toLocaleString('en-US')}
						</button>
						{onMax && currency === 'ETH' && (
							<span className="text-[10px] ml-1 text-gray-400">
								(Max - Gas)
							</span>
						)}
					</span>
				</div>

				{/* Input & Token Select */}
				<div className="flex justify-between items-start gap-3">
					<div className="flex flex-col w-full">
						<input
							type={isReadOnly ? 'text' : 'number'}
							min="0"
							value={amount}
							readOnly={isReadOnly}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder="0.0"
							className={`
              w-full bg-transparent text-3xl font-bold outline-none placeholder-gray-400 p-0 m-0 leading-tight 
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
              ${isReadOnly ? 'cursor-default' : ''}
              ${isError ? 'text-red-500' : 'text-gray-900 dark:text-white'}
            `}
						/>
						<div className="text-sm text-gray-400 font-medium pl-1 mt-1 h-5">
							{usdValue > 0
								? `≈ $${usdValue.toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
								  })}`
								: ''}
						</div>
					</div>

					<button
						type="button"
						onClick={onTokenSelect}
						className="
            flex items-center gap-2 px-3 py-1.5 mt-1 rounded-full shadow-sm border 
            bg-white dark:bg-[#2d3a5c] border-gray-200 dark:border-gray-600 
            hover:bg-gray-100 dark:hover:bg-[#37466e] transition-all shrink-0 active:scale-95
          "
					>
						<TokenIcon
							currency={currency}
							className="w-6 h-6"
						/>
						<span className="font-bold text-lg text-gray-700 dark:text-white">
							{currency}
						</span>
						<svg
							className="w-4 h-4 text-gray-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>
			</div>
		);
	}
);

// --- SUB-COMPONENT: GAS SELECTOR ---
const GasSelector = memo(
	({
		gasMode,
		onSelect,
		currentGas,
	}: {
		gasMode: number;
		onSelect: (idx: number) => void;
		currentGas: GasOption;
	}) => {
		const [isHovered, setIsHovered] = useState(false);

		const gasColorClass = useMemo(() => {
			if (gasMode === 0) return 'text-cyan-500';
			if (gasMode === 1) return 'text-blue-500';
			return 'text-orange-500';
		}, [gasMode]);

		return (
			<div
				className="relative group"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<span className="flex items-center gap-1 cursor-pointer hover:text-cyan-500 transition-colors py-2 px-1 rounded-lg">
					<svg
						className={`w-3 h-3 ${
							gasMode === 2 ? 'text-red-500' : 'text-gray-400'
						}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
					Gas:{' '}
					<span className={`font-bold transition-all ${gasColorClass}`}>
						${currentGas.price.toFixed(2)}
					</span>
				</span>

				{isHovered && (
					<div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-[#1e2a47] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
						{/* Invisible Bridge */}
						<div className="absolute -bottom-4 left-0 w-full h-4 bg-transparent" />

						<div className="text-[10px] uppercase text-gray-400 font-bold mb-2 px-2">
							Select Gas Speed
						</div>
						<div className="flex flex-col gap-1">
							{GAS_OPTIONS.map((option, index) => (
								<button
									key={option.id}
									type="button"
									onClick={() => {
										onSelect(index);
										setIsHovered(false);
									}}
									className={`
                  flex justify-between items-center p-2 rounded-lg text-xs transition-all
                  ${
										gasMode === index
											? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500/50'
											: 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
									}
                `}
								>
									<div className="flex flex-col items-start">
										<span className="font-bold">{option.label}</span>
										<span className="text-[10px] opacity-70">
											{option.time}
										</span>
									</div>
									<span className="font-bold">${option.price.toFixed(2)}</span>
								</button>
							))}
						</div>
						<div className="absolute -bottom-1 right-4 w-2 h-2 bg-white dark:bg-[#1e2a47] border-b border-r border-gray-200 dark:border-gray-700 rotate-45"></div>
					</div>
				)}
			</div>
		);
	}
);

// --- MAIN COMPONENT ---
export const SwapForm = ({
	fromCurrency,
	toCurrency,
	amount,
	onAmountChange,
	onSwap,
	result,
	loading,
	onOpenTokenSelect,
	onSwitch,
	exchangeRate,
	fromPriceUSD,
	toPriceUSD,
}: SwapFormProps) => {
	const [gasMode, setGasMode] = useState<number>(0);
	const currentGas = GAS_OPTIONS[gasMode];

	// (Derived State)
	const {
		fromBalance,
		toBalance,
		fromTotalUSD,
		toTotalUSD,
		isInsufficientBalance,
	} = useMemo(() => {
		const fromBal = MOCK_BALANCES[fromCurrency] || 0;
		const toBal = MOCK_BALANCES[toCurrency] || 0;

		const amtNum = parseFloat(amount);
		const validAmount = amount && !isNaN(amtNum) ? amtNum : 0;
		const fTotalUSD = validAmount * fromPriceUSD;

		const resNumStr = result ? result.split('=')[1]?.trim().split(' ')[0] : '0';
		const resNum = parseFloat(resNumStr);
		const tTotalUSD = isNaN(resNum) ? 0 : resNum * toPriceUSD;

		return {
			fromBalance: fromBal,
			toBalance: toBal,
			fromTotalUSD: fTotalUSD,
			toTotalUSD: tTotalUSD,
			isInsufficientBalance: validAmount > fromBal,
		};
	}, [fromCurrency, toCurrency, amount, result, fromPriceUSD, toPriceUSD]);

	const handleMaxClick = () => {
		const GAS_ESTIMATE = 0.002;
		if (fromCurrency === 'ETH') {
			const maxAmount = Math.max(0, fromBalance - GAS_ESTIMATE);
			onAmountChange(maxAmount.toString());
		} else {
			onAmountChange(fromBalance.toString());
		}
	};

	return (
		<div className="flex flex-col gap-2">
			{/* FROM SECTION */}
			<TokenInputBlock
				label="From"
				currency={fromCurrency}
				amount={amount}
				balance={fromBalance}
				usdValue={fromTotalUSD}
				onChange={onAmountChange}
				onTokenSelect={() => onOpenTokenSelect('from')}
				onMax={handleMaxClick}
				isError={isInsufficientBalance}
			/>

			{/* SWAP INDICATOR */}
			<div className="relative h-0 z-10">
				<div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
					<button
						type="button"
						onClick={onSwitch}
						className="p-3 rounded-full bg-gray-100 dark:bg-[#1e2a47] border-4 border-white dark:border-[#1e2a47] shadow-sm hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer transition-all duration-300 ease-in-out hover:rotate-180 hover:scale-110 active:scale-95 group"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-5 h-5 text-cyan-500 group-hover:text-blue-500 transition-colors"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16V4m0 12l-4-4m4 4l4-4m6 8v-12m0 12l-4-4m4 4l4-4"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* TO SECTION */}
			<TokenInputBlock
				label="To"
				currency={toCurrency}
				amount={result ? result.split('=')[1]?.trim().split(' ')[0] : '0.0'}
				balance={toBalance}
				usdValue={toTotalUSD}
				onTokenSelect={() => onOpenTokenSelect('to')}
				// 'To' field is ReadOnly (no onChange, no onMax)
			/>

			{/* SWAP BUTTON */}
			<button
				type="button"
				onClick={onSwap}
				disabled={loading || isInsufficientBalance}
				className={`
          w-full mt-4 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.99]
          ${
						loading || isInsufficientBalance
							? 'bg-gray-500 cursor-not-allowed opacity-70'
							: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 hover:-translate-y-0.5'
					}
        `}
			>
				{loading
					? 'Swapping...'
					: isInsufficientBalance
					? `Insufficient ${fromCurrency} Balance`
					: 'Swap Token'}
			</button>

			{/* FOOTER INFO */}
			<div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1 font-medium relative items-center">
				<span className="flex items-center gap-1">
					Price: 1 {fromCurrency} ≈{' '}
					{exchangeRate > 0
						? exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 6 })
						: '...'}{' '}
					{toCurrency}
				</span>
				<GasSelector
					gasMode={gasMode}
					onSelect={setGasMode}
					currentGas={currentGas}
				/>
			</div>

			<div className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
				Token data from{' '}
				<a
					href="https://interview.switcheo.com/prices.json"
					target="_blank"
					rel="noopener noreferrer"
					className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors hover:underline"
				>
					Switcheo API
				</a>
				.
			</div>
		</div>
	);
};
