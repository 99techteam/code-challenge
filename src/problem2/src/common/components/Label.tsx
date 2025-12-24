import { cn } from "@/common/utils/cn";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Label({ children, className }: Props) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      {children}
    </label>
  );
}
