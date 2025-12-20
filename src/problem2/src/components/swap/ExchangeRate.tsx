interface ExchangeRateProps {
	result?: string;
	error?: string;
	// isDarkMode: boolean;
}

export const ExchangeRate = ({
	result,
	error,
}: // isDarkMode,
ExchangeRateProps) => {
	if (error) {
		return (
			<div className="p-2 mt-2 text-red-700 bg-red-50 rounded-lg border border-red-300 transition-colors dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-300">
				<p className="text-sm font-medium text-center">{error}</p>
			</div>
		);
	}

	if (result) {
		return (
			<p
				className="mt-2 text-sm font-medium text-center text-green-700 transition-colors dark:text-green-400"
			>
				{result}
			</p>
		);
	}

	return null;
};
