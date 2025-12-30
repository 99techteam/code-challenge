import { useState, useMemo, useEffect } from 'react';
import { TokenIcon } from './TokenIcon';

interface TokenModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (token: string) => void;
	currencies: string[];
	exchangeRates?: any;
}

export const TokenModal = ({
	isOpen,
	onClose,
	onSelect,
	currencies,
}: TokenModalProps) => {
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		if (isOpen) setSearchQuery('');
	}, [isOpen]);

	const filteredTokens = useMemo(() => {
		return currencies.filter((token) =>
			token.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [currencies, searchQuery]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div
				className="absolute inset-0"
				onClick={onClose}
			/>
			<div
				className="
          relative z-10 w-full max-w-md mx-4 
          bg-white dark:bg-[#1e2a47] 
          rounded-2xl shadow-2xl 
          border border-gray-200 dark:border-gray-700
          overflow-hidden
          animate-in zoom-in-95 duration-200
        "
			>
				{/* HEADER */}
				<div className="p-4 border-b border-gray-100 dark:border-gray-700">
					<div className="flex justify-between items-center mb-4">
						<h3 className="text-lg font-bold text-gray-900 dark:text-white">
							Select a Token
						</h3>
						<button
							onClick={onClose}
							className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-6 h-6 text-gray-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					<div className="relative">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							type="text"
							placeholder="Search by name"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="
                w-full pl-10 pr-4 py-3 
                bg-gray-100 dark:bg-[#131b2e] 
                border border-transparent focus:border-cyan-500 
                rounded-xl outline-none 
                text-gray-900 dark:text-white placeholder-gray-500
                transition-all
              "
							autoFocus
						/>
					</div>
				</div>
				<div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
					{filteredTokens.length > 0 ? (
						<div className="p-2 space-y-1">
							{filteredTokens.map((token) => (
								<button
									key={token}
									onClick={() => {
										onSelect(token);
										onClose();
									}}
									className="
                    flex items-center w-full p-3 rounded-xl 
                    hover:bg-gray-100 dark:hover:bg-white/5 
                    transition-colors group
                  "
								>
									<TokenIcon
										currency={token}
										className="w-8 h-8 mr-3"
									/>
									<div className="flex flex-col items-start">
										<span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
											{token}
										</span>
										<span className="text-xs text-gray-500 dark:text-gray-400">
											{token}
										</span>
									</div>
								</button>
							))}
						</div>
					) : (
						<div className="p-8 text-center text-gray-500 dark:text-gray-400">
							No tokens found for "{searchQuery}"
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
