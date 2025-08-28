import React, { forwardRef } from "react";

export type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  wrapperClassName?: string;
};

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, wrapperClassName, className, ...props }, ref) => (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full border rounded p-2 mt-1 ${
          error ? "border-red-500" : ""
        } ${className ?? ""}`}
      />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  )
);

export default FormInput;