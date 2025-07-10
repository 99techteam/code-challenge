import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
}

export function LoadingState({ isLoading, error }: LoadingStateProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`${
          isLoading ? "flex items-center justify-center" : "text-center"
        } p-8`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="ml-2 text-white">Loading tokens...</span>
          </>
        ) : (
          <>
            <p className="text-red-400 mb-4">
              {error || "Failed to load tokens"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-white hover:bg-gray-100 text-black"
            >
              Retry
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
