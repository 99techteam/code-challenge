import { forwardRef } from 'react'
import { AmountInputProps } from '../models/component'

const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, error, disabled, placeholder }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      // Allow empty string, numbers, and one decimal point
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        onChange(inputValue)
      }
    }

    return (
      <div className="flex-1">
        <input
          ref={ref}
          type="text"
          className={`w-full px-3 sm:px-4 py-3 border-2 rounded-xl text-base font-medium text-slate-900 bg-white transition-all placeholder:text-slate-400 placeholder:opacity-50 tabular-nums focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
          } ${
            disabled
              ? 'opacity-60 cursor-not-allowed bg-slate-50'
              : ''
          }`}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="decimal"
        />
      </div>
    )
  }
)

AmountInput.displayName = 'AmountInput'

export default AmountInput

