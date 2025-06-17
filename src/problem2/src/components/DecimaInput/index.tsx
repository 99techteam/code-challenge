import React from "react";
import type { FieldErrors } from "react-hook-form";

interface DecimalInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  errors: FieldErrors<any>;
}

const DecimalInput = ({ errors, ...rest }: DecimalInputProps) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(,.*?),/g, "$1");

    if (rest?.onChange) rest.onChange(e);
  };

  return (
    <div className="px-0 py-2">
      <input
        type="text"
        inputMode="decimal"
        className="text-black rounded-xl focus:outline-none w-full"
        onInput={handleInput}
        {...rest}
        value={
          Number(rest.value) === 0 || typeof rest.value === "undefined"
            ? undefined
            : rest.value
        }
      />
      {rest.name && (
        <p className="text-red-500 text-xs mt-1">
          {errors[rest.name]?.message?.toString() ?? ""}
        </p>
      )}
    </div>
  );
};

export default DecimalInput;
