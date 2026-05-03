import { ArrowsDownUpIcon } from "@phosphor-icons/react"

import { Button } from "@/shared/ui/button"

interface SwitchButtonProps {
  onClick: () => void
}

export function SwitchButton({ onClick }: SwitchButtonProps) {
  return (
    <div className="switch-row">
      <Button
        variant="outline"
        size="icon"
        className="switch-button"
        onClick={onClick}
        type="button"
        aria-label="Switch selected tokens"
      >
        <ArrowsDownUpIcon aria-hidden size={18} weight="bold" />
      </Button>
    </div>
  )
}
