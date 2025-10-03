import type { ButtonTokenProps } from '../types';

export default function ButtonToken({ selectedToken }: ButtonTokenProps) {
    return (
        <div className="flex items-center justify-space-between ">
            <img
                src={selectedToken.logo}
                alt={selectedToken.currency}
                className="w-8 h-8 mr-2 rounded-full"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
            <div className="flex items-center justify-between">
                <div className="font-semibold text-[var(--colors-text)]">
                    {selectedToken.currency}
                </div>
                <svg
                    className="w-3 h-3 text-[var(--colors-text)] font-[700] ml-1"
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
            </div>
        </div>
    );
}
