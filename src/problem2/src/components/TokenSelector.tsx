import { useState, useRef, useEffect, useCallback } from 'react'
import TokenImage from './TokenImage'
import { ChevronDown, Check } from 'lucide-react'
import { TokenSelectorProps } from '../models/component'

const TokenSelector = ({ tokens, selectedToken, onTokenChange, error, disabled }: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleTokenSelect = useCallback((token: string) => {
    onTokenChange(token)
    setIsOpen(false)
  }, [onTokenChange])

  return (
    <div className="relative flex-shrink-0 min-w-[120px] sm:min-w-[140px]" ref={dropdownRef}>
      <button
        type="button"
        className={`w-full px-3 sm:px-4 py-3 border-2 rounded-xl bg-white flex items-center gap-2 text-sm font-medium text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          error 
            ? 'border-red-500' 
            : 'border-slate-200 hover:border-blue-500'
        } ${
          disabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'cursor-pointer'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedToken ? (
          <>
            <TokenImage symbol={selectedToken} />
            <span className="font-semibold">{selectedToken}</span>
          </>
        ) : (
          <span className="text-slate-500">Select token</span>
        )}
        <ChevronDown 
          className={`ml-auto w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {tokens.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No tokens available</div>
          ) : (
            tokens.map((token) => (
              <button
                key={token}
                type="button"
                className={`w-full px-3 sm:px-4 py-3 flex items-center gap-2 text-sm text-left text-slate-900 transition-colors hover:bg-slate-50 ${
                  selectedToken === token ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleTokenSelect(token)}
              >
                <TokenImage symbol={token} />
                <span className="font-medium flex-1">{token}</span>
                {selectedToken === token && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default TokenSelector
