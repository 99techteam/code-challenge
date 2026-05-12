import { LoaderIcon } from "lucide-react";
import { cn } from "../../utils";
import { Button } from "./button";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export function Loading() {
  return (
    <Button type="button" disabled size="xl" className="flex items-center gap-2">
      <Spinner data-icon="inline-start" />
      Loading...
    </Button>
  );
}
