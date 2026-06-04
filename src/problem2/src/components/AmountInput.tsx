import { useState, useEffect } from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0.0',
  error,
  readOnly = false,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setLocalValue('');
      onChange('');
      return;
    }

    if (/^\d*\.?\d*$/.test(inputValue)) {
      setLocalValue(inputValue);
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (localValue && !Number.isNaN(Number(localValue))) {
      const num = Number(localValue);
      setLocalValue(num.toLocaleString(undefined, { maximumFractionDigits: 8 }));
    }
  };

  const handleFocus = () => {
    if (localValue) {
      setLocalValue(localValue.replace(/,/g, ''));
    }
  };

  return (
    <div className="amount-input">
      <input
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        readOnly={readOnly}
        data-error={Boolean(error)}
      />
    </div>
  );
};
