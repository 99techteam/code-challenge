import { memo } from 'react';

interface SwapButtonProps {
	onClick: () => void;
	className?: string; 
}

export const SwapButton = memo(
	({ onClick, className = '' }: SwapButtonProps) => {
		return (
			<div className={`flex justify-center ${className}`}>
				<button
					type="button" 
					onClick={onClick}
					aria-label="Swap currencies" 
					className="
          group relative flex items-center justify-center w-12 h-12
          bg-gray-900 text-white rounded-full shadow-lg border-none
          transition-all duration-300 ease-out
          hover:bg-gray-800 hover:scale-110 active:scale-95
        "
				>
					{/* Arrow Icons */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-5 h-5 transition-transform duration-500 ease-in-out group-hover:rotate-180" // Thêm xoay khi hover
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M7 16V4m0 12l-4-4m4 4l4-4m6 8v-12m0 12l-4-4m4 4l4-4"
						/>
					</svg>

					{/* Glow effect (Purple) */}
					<span
						className="
            absolute inset-0 rounded-full bg-purple-500/40 blur-lg 
            opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          "
					/>
				</button>
			</div>
		);
	}
);

SwapButton.displayName = 'SwapButton';
