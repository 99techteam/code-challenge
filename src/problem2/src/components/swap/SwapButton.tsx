interface SwapButtonProps {
	onClick: () => void;
}

export const SwapButton = ({ onClick }: SwapButtonProps) => {
	return (
		<div className="flex justify-center">
			<button
				onClick={onClick}
				className={`p-2 text-white bg-gray-700 rounded-full border-2 border-gray-900 transition-all duration-300 hover:bg-gray-600 hover:rotate-180`}
			>
				{/* Icon mũi tên */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-7 h-7 text-white"
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
				{/* Glow effect khi hover (dùng pseudo-element) */}
				<span
					className={`absolute inset-0 rounded-full shadow-2xl opacity-0 blur-xl pointer-events-none motion-safe:hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-500 bg-purple-500/30`}
				/>
			</button>
		</div>
	);
};
