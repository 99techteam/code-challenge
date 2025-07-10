import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { type Token } from "@/services";

interface SwapActionButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSwapping: boolean;
  isValid: boolean;
  sellToken: Token | null;
  buyToken: Token | null;
  swapSuccess: boolean;
  buttonContent: React.ReactNode;
}

export function SwapActionButton({
  onClick,
  disabled,
  isSwapping,
  isValid,
  sellToken,
  buyToken,
  swapSuccess,
  buttonContent,
}: SwapActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full mt-6 font-medium py-3 rounded-xl transition-all duration-200 shadow-lg",
        swapSuccess
          ? "bg-green-500 text-white cursor-not-allowed shadow-green-500/20"
          : isSwapping || !isValid || !sellToken || !buyToken
          ? "bg-gray-500/80 text-gray-300 cursor-not-allowed"
          : "bg-white hover:bg-gray-50 text-black hover:scale-[1.02] shadow-white/20"
      )}
    >
      {buttonContent}
    </Button>
  );
}
