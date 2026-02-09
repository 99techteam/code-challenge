import './AmountInput.css'

export function AmountInput({
  value,
  onChange,
  placeholder = '0.0',
  readOnly,
  disabled,
  error,
  className = '',
}) {
  const handleChange = (e) => {
    const v = e.target.value
    if (/^$|^\.?\d*\.?\d*$/.test(v)) onChange(v)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={`amount-input ${error ? 'amount-input--error' : ''}`}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
    />
  )
}
