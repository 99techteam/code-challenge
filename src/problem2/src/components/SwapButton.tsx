
import { Button } from '@/components/ui/button';

interface SwapButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export const SwapButton = ({ onClick, disabled, isLoading }: SwapButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="btn-gradient w-full h-16 text-lg font-bold tracking-wide shadow-xl"
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <span>Swapping...</span>
        </div>
      ) : (
        <span className="flex items-center gap-2">
          Swap
        </span>
      )}
    </Button>
  );
};