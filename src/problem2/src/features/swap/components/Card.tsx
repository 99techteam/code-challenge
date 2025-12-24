import type { ReactNode } from "react";
import { cn } from "@/common/utils/cn";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        "bg-gradient-to-b from-[#1b1f26] to-[#0e1116]",
        "border border-white/5",
        "shadow-[0_0_40px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </div>
  );
}
