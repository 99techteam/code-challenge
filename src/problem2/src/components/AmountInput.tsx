interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  label?: string
  error?: string
  className?: string
}

export default function AmountInput({
  value,
  onChange,
  placeholder = '0.00',
  disabled = false,
  readOnly = false,
  label,
  error,
  className,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty string or valid decimal numbers
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue)
    }
  }

  return (
     <div className="w-full">
      {label && (
         <label className="block text-sm font-semibold text-slate-600 mb-2">
          {label}
        </label>
      )}
       <input
        type="text"
        inputMode="decimal"
        value={value}
         onChange={handleChange}
         placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
           className={`w-full max-w-xs px-0 py-0 border-0 bg-transparent font-semibold text-2xl text-right focus:outline-none
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          placeholder:text-slate-400 text-slate-900
          ${className ?? ''}
        `}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
