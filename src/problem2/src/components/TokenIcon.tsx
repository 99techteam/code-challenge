import { cn } from "@/lib/utils"
import type { TToken } from "@/services/token/token.type"

const sizeClasses = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-6 h-6 text-[10px]",
  lg: "w-10 h-10 text-lg"
}

type TProps = {
  token: TToken
  size?: "sm" | "md" | "lg"
}

export const TokenIcon = ({ token, size = "md" }: TProps) => {
  return (
    <img src={token.logoURI} alt={token.name} className={cn("rounded-full shadow-sm", sizeClasses[size])} />
  )
}
