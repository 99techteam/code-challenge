import { useState, useRef } from 'react';
import type { CustomDropdownProps } from '../types';
import { useModal } from '../hooks/useModal';
import ButtonToken from './ButtonToken';

export default function CustomDropdown({
    tokens,
    value,
    typeCard,
    onChange,
    // placeholder,
    disabled = [],
}: CustomDropdownProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const searchInputRef = useRef<HTMLInputElement>(null);
    const placeholderToken = typeCard === 'from' ? tokens[0] : tokens[2];
    const selectedToken = tokens.find((t) => t.id === value);

    const { isOpen, open, close, modalRef } = useModal({
        autoFocusRef: searchInputRef,
        onClose: () => setSearchTerm(''), // reset search when modal closes
    });

    // Filter tokens based on search term
    const filteredTokens = tokens.filter((token) =>
        token.currency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTokenSelect = (tokenId: string) => {
        onChange(tokenId);
        close();
    };
    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={open}
                className="relative rounded-[16px] bg-transparent inline-flex items-center justify-center opacity-1 px-2 py-1 hover:border-gray-400 focus:border-blue-500 focus:outline-none"
            >
                <div className="flex items-center">
                    {selectedToken ? (
                        <ButtonToken selectedToken={selectedToken} />
                    ) : (
                        <ButtonToken selectedToken={placeholderToken} />
                    )}
                </div>
            </button>

            {/* Modal Popup */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-[380px] mx-4 max-h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Select Token
                            </h3>
                            <button
                                onClick={close}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-500"
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

                        {/* Search Bar */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search token..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Token List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredTokens.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No tokens found
                                </div>
                            ) : (
                                filteredTokens.map((token) => (
                                    <button
                                        key={token.id}
                                        type="button"
                                        disabled={disabled.includes(token.id)}
                                        onClick={() =>
                                            handleTokenSelect(token.id)
                                        }
                                        className={`w-full p-4 text-left flex items-center transition-colors ${
                                            disabled.includes(token.id)
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer'
                                        } ${
                                            value === token.id
                                                ? 'bg-blue-100 border-r-2 border-blue-500'
                                                : 'hover:bg-gray-200'
                                        }`}
                                    >
                                        <img
                                            src={token.logo}
                                            alt={token.currency}
                                            className="w-8 h-8 mr-3 rounded-full"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).style.display = 'none';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {token.currency}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                $
                                                {token.price?.toFixed(4) ||
                                                    'N/A'}
                                            </div>
                                        </div>
                                        {value === token.id && (
                                            <svg
                                                className="w-5 h-5 text-blue-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
