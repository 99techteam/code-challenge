import { useState } from 'react';
import { TokenIcon } from './TokenIcon';
import { TokenSelectModal } from './TokenSelectModal';
import type { PriceData } from '../types';

interface TokenSelectorProps {
  tokens: string[];
  value: string;
  onChange: (symbol: string) => void;
  ariaLabel: string;
  priceMap: Map<string, PriceData>;
}

export const TokenSelector = ({ tokens, value, onChange, ariaLabel, priceMap }: TokenSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const title = 'Select a token';

  return (
    <>
      <div className="token-select-wrapper token-select-wrapper--trigger">
        <TokenIcon symbol={value || null} />
        <div className="token-select-custom">
          <button
            type="button"
            className="token-trigger"
            aria-expanded={isModalOpen}
            aria-haspopup="dialog"
            aria-label={ariaLabel}
            onClick={handleOpen}
          >
            <span className="token-trigger-label">{value || 'Select token'}</span>
            <svg
              className="token-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <TokenSelectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tokens={tokens}
        priceMap={priceMap}
        selectedSymbol={value}
        onSelect={handleSelect}
        title={title}
      />
    </>
  );
};
