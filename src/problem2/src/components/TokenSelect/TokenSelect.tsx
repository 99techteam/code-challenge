import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { Token } from 'src/types/token.type'

interface TokenSelectProps {
  tokens: Token[]
  selectedToken?: Token
  onSelect: (token: Token) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

export default function TokenSelect({
  tokens,
  selectedToken,
  onSelect,
  label,
  placeholder = 'Select token',
  disabled = false,
  error
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter tokens by search term
  const filteredTokens = tokens.filter((token) => token.currency.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleSelect = (token: Token) => {
    onSelect(token)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    const fallback = target.nextElementSibling as HTMLElement
    if (fallback) fallback.style.display = 'flex'
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {label && <label className='mb-2 block text-sm font-medium text-gray-700'>{label}</label>}

      {/* Selected Token Display / Trigger Button */}
      <button
        type='button'
        onClick={handleToggle}
        disabled={disabled}
        className={classNames(
          'flex w-full items-center justify-between rounded-xl border-2 bg-white px-4 py-3 transition-all duration-200',
          {
            'border-indigo-500 ring-2 ring-indigo-200': isOpen,
            'border-gray-200 hover:border-gray-300': !isOpen && !error,
            'border-red-400 hover:border-red-500': error,
            'cursor-not-allowed opacity-60': disabled
          }
        )}
      >
        {selectedToken ? (
          <div className='flex items-center gap-3'>
            <div className='relative h-8 w-8'>
              <img
                src={selectedToken.iconUrl}
                alt={selectedToken.currency}
                className='h-8 w-8 rounded-full object-cover'
                onError={handleImageError}
              />
              <div
                className='hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white'
                style={{ display: 'none' }}
              >
                {selectedToken.currency.slice(0, 2)}
              </div>
            </div>
            <div className='text-left'>
              <div className='font-semibold text-gray-900'>{selectedToken.currency}</div>
              <div className='text-xs text-gray-500'>${selectedToken.price.toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <span className='text-gray-400'>{placeholder}</span>
        )}

        {/* Dropdown Arrow */}
        <svg
          className={classNames('h-5 w-5 text-gray-400 transition-transform duration-200', {
            'rotate-180': isOpen
          })}
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className='absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg'
          >
            {/* Search Input */}
            <div className='border-b border-gray-100 p-3'>
              <div className='relative'>
                <svg
                  className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
                <input
                  ref={inputRef}
                  type='text'
                  placeholder='Search tokens...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                />
              </div>
            </div>

            {/* Token List */}
            <div className='max-h-60 overflow-y-auto'>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.currency}
                    type='button'
                    onClick={() => handleSelect(token)}
                    className={classNames(
                      'flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-indigo-50',
                      {
                        'bg-indigo-50': selectedToken?.currency === token.currency
                      }
                    )}
                  >
                    <div className='relative h-8 w-8'>
                      <img
                        src={token.iconUrl}
                        alt={token.currency}
                        className='h-8 w-8 rounded-full object-cover'
                        onError={handleImageError}
                      />
                      <div
                        className='hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white'
                        style={{ display: 'none' }}
                      >
                        {token.currency.slice(0, 2)}
                      </div>
                    </div>
                    <div className='flex-1 text-left'>
                      <div className='font-medium text-gray-900'>{token.currency}</div>
                      <div className='text-xs text-gray-500'>${token.price.toLocaleString()}</div>
                    </div>
                    {selectedToken?.currency === token.currency && (
                      <svg className='h-5 w-5 text-indigo-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    )}
                  </button>
                ))
              ) : (
                <div className='px-4 py-8 text-center text-gray-500'>No tokens found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
