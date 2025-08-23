// Icon.tsx
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function Loading(props: { className?: string }) {
  return <Loader2 className={cn(props.className, "animate-spin")}></Loader2>;
}
