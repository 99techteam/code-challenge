import { useEffect, useRef, memo } from 'react';
import { TokenIcon } from './TokenIcon';

// --- 1. ĐỊNH NGHĨA HOOK Ở ĐÂY (Để ngay đầu file) ---
// Hook này giúp phát hiện click ra ngoài element
const useClickOutside = (
	// Dùng HTMLElement để nhận mọi loại thẻ (div, button, etc.)
	ref: React.RefObject<HTMLElement | null>,
	handler: () => void
) => {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			// Nếu ref không tồn tại hoặc click vào bên trong ref -> Bỏ qua
			if (!ref.current || ref.current.contains(event.target as Node)) {
				return;
			}
			handler();
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler]);
};

// --- 2. SUB-COMPONENT ---
const SelectorItem = memo(
	({ currency, onClick }: { currency: string; onClick: () => void }) => (
		<button
			type="button"
			role="option"
			onClick={onClick}
			className="
      flex items-center w-full p-2.5 text-left transition-colors
      text-gray-900 dark:text-gray-100
      hover:bg-gray-100 dark:hover:bg-gray-800/80
      active:bg-gray-200 dark:active:bg-gray-700
      first:rounded-t-lg last:rounded-b-lg
    "
		>
			<TokenIcon
				currency={currency}
				className="w-5 h-5"
			/>
			<span className="ml-3 font-medium text-sm">{currency}</span>
		</button>
	)
);

SelectorItem.displayName = 'SelectorItem';

// --- 3. MAIN COMPONENT ---
interface TokenSelectorProps {
	isOpen: boolean;
	onClose: () => void;
	currencies: string[];
	onSelect: (currency: string) => void;
}

export const TokenSelector = ({
	isOpen,
	onClose,
	currencies,
	onSelect,
}: TokenSelectorProps) => {
	// Ref cho cái hộp menu (HTMLDivElement là con của HTMLElement nên OK)
	const menuRef = useRef<HTMLDivElement>(null);

	// Gọi hook đã định nghĩa ở trên
	useClickOutside(menuRef, () => {
		if (isOpen) onClose();
	});

	if (!isOpen) return null;

	return (
		<div
			ref={menuRef}
			role="listbox"
			className="
        absolute z-50 mt-1 w-full max-h-60 overflow-y-auto
        bg-white/95 dark:bg-[#131b2e]/95 backdrop-blur-md
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-2xl
        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent
        animate-in fade-in zoom-in-95 duration-100
      "
		>
			{currencies.length > 0 ? (
				currencies.map((curr) => (
					<SelectorItem
						key={curr}
						currency={curr}
						onClick={() => {
							onSelect(curr);
							onClose();
						}}
					/>
				))
			) : (
				<div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
					No tokens found
				</div>
			)}
		</div>
	);
};
