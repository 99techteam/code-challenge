import React, { useState, useEffect, useRef } from 'react'

interface SelectedCurrency {
  value: string | number
  price: number
  currency: string
  iconUrl: string
  [key: string]: any
}

interface InputCurrencyProps {
  selected: SelectedCurrency
  onChange: (selected: SelectedCurrency) => void
  currencies: SelectedCurrency[]
  label?: string
}

const InputCurrency: React.FC<InputCurrencyProps> = ({ selected, onChange, currencies, label = '' }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const validateOnChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) {
      onChange({ ...selected, value: e.target.value })
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-gray-400 text-sm">{label}</p>
      <div className="flex items-center justify-between gap-2 rounded-lg">
        <input
          type="text"
          inputMode="decimal"
          name={label + selected.value}
          className="flex-1 border border-gray-700 rounded-s-md p-2 bg-transparent text-white text-lg w-24 outline-none"
          value={selected.value}
          onChange={validateOnChangeInput}
        />
        <div className="relative w-full max-w-36" ref={dropdownRef}>
          {/* Selected */}
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setOpen((o) => !o)}
          >
            {selected.iconUrl && (
              <img src={selected.iconUrl} alt={selected.currency} />
            )}
            <span className="text-white font-medium">{selected?.currency}</span>
            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dropdown */}
          {open && (
            <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-2 flex flex-col gap-2 animate-fade-in-down">
              <ul className="overflow-y-auto max-h-60 flex flex-col gap-1 pr-1 -mr-1">
                {currencies.map((opt, index) => (
                  <li
                    key={`${opt.currency}-${index}`}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-700 ${opt.currency === selected.currency ? 'bg-gray-700' : ''}`}
                    onClick={() => {
                      onChange({ ...selected, currency: opt.currency, iconUrl: opt.iconUrl, price: opt.price })
                      setOpen(false)
                    }}
                  >
                    <img src={opt.iconUrl} alt={opt.currency} />
                    <span className="text-white">{opt.currency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InputCurrency
