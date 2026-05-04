import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface OrderDetailsProps {
  exchangeRate: number;
  fromSymbol: string;
  toSymbol: string;
  fee: number;
  minReceived: string;
  priceImpact: number;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  exchangeRate,
  fromSymbol,
  toSymbol,
  fee,
  minReceived,
  priceImpact
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-background-secondary hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <span>1 {fromSymbol} ≈ {exchangeRate.toFixed(6)} {toSymbol}</span>
          <span className="text-text-secondary cursor-help" title="Real-time exchange rate"><Info size={14}/></span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-text-secondary"/> : <ChevronDown size={16} className="text-text-secondary"/>}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-background border-t border-gray-800 space-y-3 text-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center text-text-secondary">
            <span>Price Impact</span>
            <span className={priceImpact > 2 ? 'text-danger' : 'text-success'}>
              &lt; {priceImpact}%
            </span>
          </div>
          <div className="flex justify-between items-center text-text-secondary">
            <span>Liquidity Provider Fee</span>
            <span className="text-text-primary">{fee} {fromSymbol}</span>
          </div>
          <div className="flex justify-between items-center text-text-secondary">
            <span>Minimum Received</span>
            <span className="text-text-primary">{minReceived} {toSymbol}</span>
          </div>
        </div>
      )}
    </div>
  );
};
