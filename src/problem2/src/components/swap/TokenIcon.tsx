import { useState } from "react"

import { cn } from "@/lib/utils"
import type { Token } from "@/types/token"

type TokenIconProps = {
  token: Token
  size?: number
  className?: string
}

export function TokenIcon({ token, size = 24, className }: TokenIconProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-1 ring-border",
          className
        )}
        style={{ width: size, height: size }}
      >
        {token.symbol.slice(0, 3).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={token.iconUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn(
        "rounded-full bg-background ring-1 ring-border",
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}
