import React from "react";
import Select, { StylesConfig, GroupBase } from "react-select";
import { TokenDropdownOption } from "./CurrencySwapContainer";

interface Props {
  label: string;
  options: TokenDropdownOption[];
  selectedCurrency: string;
  onCurrencyChange: (option: TokenDropdownOption | null) => void;
  amount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabledInput?: boolean;
  id?: string;
}

const customStyles: StylesConfig<
  TokenDropdownOption,
  false,
  GroupBase<TokenDropdownOption>
> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "transparent",
    border: "1px solid #4A5568",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#6B7280",
    },
    minHeight: "unset",
    borderRadius: "0.375rem", // lg rounding
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#2D3748",
    borderRadius: "0.375rem", // lg rounding
    color: "white",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#4F46E5"
      : state.isFocused
      ? "#4A5568"
      : "transparent",
    color: "white",
    padding: "0.5rem 1rem",
    "&:active": {
      backgroundColor: "#4F46E5",
    },
    borderRadius: "0.25rem", // md rounding
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#A0AEC0",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#A0AEC0",
    "&:hover": {
      color: "white",
    },
    padding: "0.2rem",
  }),
  input: (provided) => ({
    ...provided,
    color: "white",
    margin: 0,
    padding: 0,
  }),
};

const CurrencyInput: React.FC<Props> = ({
  label,
  options,
  selectedCurrency,
  onCurrencyChange,
  amount,
  onAmountChange,
  error,
  disabledInput = false,
  id = "",
}) => {
  const inputClasses = `w-1/2 px-2 py-2 sm:px-4 sm:py-3 text-white placeholder-gray-400 bg-transparent rounded-r-md  ${
    error ? "border-red-500" : "border-gray-600"
  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent `;

  const selectionOptions =
    options?.find((option) => option.value === selectedCurrency) || null;
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}:
        </label>
      )}
      <div className="mt-1 flex rounded-md shadow-md px-1">
        <div className="w-1/2  rounded-l-md  flex items-center pr-2">
          <Select<TokenDropdownOption, false>
            className="w-full rounded-l-md"
            styles={customStyles}
            value={selectionOptions}
            options={options}
            onChange={(newValue) => onCurrencyChange(newValue)}
            isSearchable
            placeholder="Select Currency"
            instanceId={id}
          />
        </div>
        <input
          type="text"
          className={inputClasses}
          value={amount}
          onChange={onAmountChange}
          placeholder="0.00"
          min="0"
          disabled={disabledInput}
        />
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

export default CurrencyInput;
