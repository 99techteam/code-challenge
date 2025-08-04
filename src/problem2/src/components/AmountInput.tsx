import React, { useRef, useEffect } from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.0",
  disabled = false,
  error = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  // Auto-focus animation effect
  useEffect(() => {
    if (value && inputRef.current) {
      inputRef.current.style.transform = 'scale(1.02)';
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.transform = 'scale(1)';
        }
      }, 150);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full text-right text-2xl font-semibold bg-transparent 
        placeholder-gray-400 outline-none transition-all duration-150
        focus:scale-105 focus:text-indigo-300
        ${error ? 'text-red-400' : 'text-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-200'}
      `}
    />
  );
};

export default AmountInput;
