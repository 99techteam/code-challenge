import { memo } from 'react';

interface ExchangeRateProps {
	result?: string;
	error?: string;
}

export const ExchangeRate = memo(({ result, error }: ExchangeRateProps) => {
	if (error) {
		return (
			<div
				role="alert"
				className="
          mt-2 p-2 rounded-lg border text-center text-sm font-medium
          bg-red-50 border-red-300 text-red-700 
          dark:bg-red-500/10 dark:border-red-500/50 dark:text-red-300
          animate-in fade-in slide-in-from-top-1 duration-200
        "
			>
				{error}
			</div>
		);
	}
	if (result) {
		return (
			<p
				className="
          mt-2 text-center text-sm font-medium 
          text-green-700 dark:text-green-400
          animate-in fade-in zoom-in-95 duration-200
        "
			>
				{result}
			</p>
		);
	}

	return null;
});


ExchangeRate.displayName = 'ExchangeRate';
