import React from 'react'

const AmountInput = ({ id, value, onChange, placeholder, step, min, readOnly }) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <input
      type="number"
      id={id}
      className="amount-input"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      step={step}
      min={min}
      readOnly={readOnly}
    />
  )
}

export default AmountInput
