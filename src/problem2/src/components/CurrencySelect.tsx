import { useState, memo, useRef, useEffect } from 'react';

interface Token {
  currency: string;
  price: number;
}

interface CurrencySelectProps {
  value: string;
  onChange: (currency: string) => void;
  tokens: Token[];
}

export const CurrencySelect = memo(function CurrencySelect({ value, onChange, tokens }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const idx = tokens.findIndex((t) => t.currency === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, tokens, value]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const button = listRef.current.children[focusedIndex] as HTMLElement;
      if (button) {
        button.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const getTokenIconUrl = (currency: string) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
  };

  return (
    <div 
      className="relative shrink-0" 
      onBlur={(e) => {
        // If focus moves to an element outside this container, close the dropdown
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          return;
        }
        
        if (!isOpen) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev < tokens.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < tokens.length) {
            onChange(tokens[focusedIndex].currency);
            setIsOpen(false);
          }
        }
      }}
    >
      <button
        type="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-36 appearance-none bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-sm py-1.5 px-3 rounded-xl outline-none cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <img 
            src={getTokenIconUrl(value)} 
            alt={value} 
            className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>';
            }}
          />
          <span className="truncate">{value}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div ref={listRef} className="absolute right-0 top-full mt-2 w-48 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2">
          {tokens.map((t, index) => {
            const isSelected = value === t.currency;
            const isFocused = focusedIndex === index;
            
            return (
              <button
                key={t.currency}
                type="button"
                onClick={() => {
                  onChange(t.currency);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  isSelected 
                    ? 'bg-slate-50 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400' 
                    : isFocused
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <img 
                  src={getTokenIconUrl(t.currency)} 
                  alt={t.currency} 
                  loading="lazy"
                  className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-900 object-contain shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>';
                  }}
                />
                <span className="font-medium">{t.currency}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default CurrencySelect;
