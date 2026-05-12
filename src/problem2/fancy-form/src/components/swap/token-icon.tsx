import { cn } from "../../utils";
import { Token } from "../../types";

interface TokenIconProps {
  token: Token;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export function TokenIcon({ token, size = "md", className }: TokenIconProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 ring-1 ring-white/10",
        sizeMap[size],
        className,
      )}
    >
      <img
        src={token.icon}
        className="size-full"
        alt={token?.name}
        loading="lazy"
      />
    </div>
  );
}
