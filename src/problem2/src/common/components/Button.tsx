import { cn } from "@/common/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        // base
        "inline-flex items-center justify-center",
        "cursor-pointer select-none",
        "rounded transition",
        "focus:outline-none focus-visible:outline-none",
        "active:scale-[0.98]",
        "disabled:opacity-40 disabled:cursor-not-allowed",

        // variants
        variant === "primary" && "bg-indigo-600 hover:bg-indigo-500 text-white",

        variant === "ghost" &&
          "bg-slate-800 hover:bg-slate-700 border border-white/10",

        className
      )}
    />
  );
}
