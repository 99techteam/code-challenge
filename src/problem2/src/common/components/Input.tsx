import { cn } from "@/common/utils/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  className?: string;
}

export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: Props) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full bg-transparent",
        "text-white placeholder:text-white/30",
        "focus:outline-none",
        "text-[32px] font-semibold tracking-tight leading-none",
        type === "number" &&
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",

        className
      )}
    />
  );
}
