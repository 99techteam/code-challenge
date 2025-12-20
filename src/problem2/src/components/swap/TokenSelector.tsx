import { useEffect, useRef } from 'react';
import { TokenIcon } from './TokenIcon';

interface TokenSelectorProps {
	isOpen: boolean;
	onClose: () => void;
	currencies: string[];
	onSelect: (currency: string) => void;
	// Xóa isDarkMode prop
}

export const TokenSelector = ({
	isOpen,
	onClose,
	currencies,
	onSelect,
}: TokenSelectorProps) => {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// ... Giữ nguyên logic click outside
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () =>
				document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			ref={menuRef}
			className="overflow-y-auto absolute z-10 mt-1 w-full max-h-40 bg-white rounded-lg border border-gray-300 shadow-xl dark:bg-gray-900 dark:border-gray-700"
		>
			{currencies.map((curr) => (
				<button
					key={curr}
					onClick={() => {
						onSelect(curr);
						onClose();
					}}
					className="flex items-center p-2 w-full text-left text-black transition-colors cursor-pointer hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
				>
					<TokenIcon currency={curr} />
					<span className="ml-2 font-medium">{curr}</span>
				</button>
			))}
		</div>
	);
};
