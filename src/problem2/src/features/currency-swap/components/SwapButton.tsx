import type { CurrencySwapFormValues } from '../types';

export default function SwapButton({
    from,
    to,
    onClick,
}: CurrencySwapFormValues) {
    return (
        <div className="flex relative justify-center border-0 border-gray-300  p-3 space-y-1">
            {/* <div className="absolute top-[calc(50%)] left-0 right-0 h-[1px] bg-gray-300 z-1"></div> */}
            <div className="relative bg-[var(--colors-cardBackground)] z-2 flex justify-center">
                <button
                    type="button"
                    onClick={() => onClick(from, to)}
                    disabled={!from || !to}
                    className="border-2 border-[var(--colors-cardBorder)] rounded-full p-2 hover:shadow-lg hover:border-[var(--colors-primary)] hover:bg-[var(--colors-primary)] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:shadow-md"
                    title="Hoán đổi currency"
                >
                    <svg
                        className="w-6 h-6 font-bold text-[var(--colors-primary)] group-hover:text-[var(--colors-cardBackground)] group-hover:bg-[var(--colors-primary)] transition-colors duration-200 group-hover:rotate-180 transform transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
