import { ArrowUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SwapButtonProps {
  /** Increments per swap; each step turns the button another half rotation. */
  turns: number;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * The control that trades the two sides. It straddles the seam between the
 * panels, so it carries a card-coloured ring to punch a hole through both.
 */
export function SwapButton({ turns, disabled = false, onClick }: SwapButtonProps) {
  return (
    <Button
      size="icon"
      aria-label="Swap currencies"
      disabled={disabled}
      onClick={onClick}
      className="size-11 rounded-full border-4 border-card p-0 shadow-pill"
      style={{
        transform: `rotate(${String(turns * 180)}deg)`,
        transition:
          'transform 320ms var(--ease-settle), background-color 160ms var(--ease-standard)',
      }}
    >
      <ArrowUpDownIcon className="size-4.25" />
    </Button>
  );
}
