import React, { useState } from "react";

interface AmountInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
  containerClassName?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  label = "Amount",
  value,
  onChange,
  id = "amount",
  placeholder = "Place holder",
  containerClassName = "",
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Check if the input is a valid number
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      setError("Please enter a valid number");
    } else {
      setError(null); // Clear error if input is valid
    }

    onChange(e);
  };

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      <div className="flex flex-col h-[84px] rounded-lg border border-solid border-gray-250 bg-white px-4 py-2 text-2xl font-semibold hover:bg-[#f7f8f9]">
        <label
          className="top-4 text-sm w-fit font-normal text-[#636e82]"
        >
          {label}
        </label>

        <div className="flex h-full">
          <div className="flex w-full items-center justify-between self-stretch overflow-hidden rounded-lg bg-transparent text-black">
            <span className="amount-input flex items-center whitespace-nowrap">
              <input
                className="m-0 w-full bg-transparent p-0 text-inherit outline-none appearance-none focus:outline-none"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                id={id}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
              />
            </span>
          </div>
        </div>

      </div>
      {error && (
        <div className="flex justify-start text-red-500 text-sm mt-1" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  );
};

export default AmountInput;
