import { useState } from "react";
import { cn } from "@/lib/utils";
import { getTokenIconUrl } from "@/lib/prices";

interface TokenIconProps {
  currency: string;
  className?: string;
}

const TokenIcon = ({ currency, className }: TokenIconProps) => {
  const [failed, setFailed] = useState(false);
  const initials = currency.slice(0, 2).toUpperCase();

  if (failed || !currency) {
    return (
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold text-brand-muted",
          className,
        )}
        aria-hidden
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    <img
      src={getTokenIconUrl(currency)}
      alt=""
      className={cn("size-10 shrink-0 rounded-full bg-surface-800 object-cover", className)}
      onError={() => {
        setFailed(true);
      }}
    />
  );
};

export default TokenIcon;
