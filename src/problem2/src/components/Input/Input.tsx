import { InputHTMLAttributes, forwardRef } from "react";

export type InputVariant = "field" | "combobox";

const SHARED =
  "rounded-xl bg-white/[0.97] text-[0.95rem] font-medium text-slate-800 shadow-panel-inset transition-[border-color,box-shadow,background-color,color] duration-200 ease-out placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/18 disabled:opacity-55 dark:bg-slate-900/93 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none dark:focus:border-indigo-400 dark:focus:ring-indigo-400/26";

const VARIANT_CLASSES: Record<InputVariant, string> = {
  field: `${SHARED} border border-slate-200/95 px-[0.85rem] py-[0.7rem] dark:border-slate-600 read-only:bg-slate-50/95 read-only:text-slate-800 tabular-nums dark:read-only:bg-slate-900/82 dark:read-only:text-slate-200`,
  combobox: `${SHARED} w-full border border-slate-200/95 px-[2.35rem] py-[0.68rem] pr-9 dark:border-slate-600`,
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "field", className, ...rest },
  ref,
) {
  const variantClass = VARIANT_CLASSES[variant];
  const merged = [variantClass, className].filter(Boolean).join(" ");

  return <input ref={ref} className={merged} {...rest} />;
});
