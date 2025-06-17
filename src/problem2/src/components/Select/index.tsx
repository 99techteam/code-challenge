import React from "react";

type Option<T = any> = {
  label: string;
  value: string | number;
  data?: T;
};

type SelectProps<T = any> = {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option<T>[];
  placeholder?: string;
  className?: string;
  rendered?: {
    option?: (option: Option<T>, index: number) => React.ReactNode;
  };
};

export const Select = <T = any>({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  rendered,
}: SelectProps<T>) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, i) =>
          rendered?.option ? (
            rendered.option(opt, i) // Custom rendering for options
          ) : (
            <option key={`${opt.value}_${i}`} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
};
