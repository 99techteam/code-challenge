import { Button } from "@/shared/ui/button"
import { Spinner } from "@/shared/ui/spinner"

interface SwapSubmitButtonProps {
  canSubmit: boolean
  isLoading: boolean
  onSubmit: () => void
}

export function SwapSubmitButton({
  canSubmit,
  isLoading,
  onSubmit,
}: SwapSubmitButtonProps) {
  return (
    <Button
      className="swap-submit"
      disabled={!canSubmit}
      onClick={onSubmit}
      type="button"
    >
      {isLoading ? (
        <>
          <Spinner className="text-current" />
          Submitting quote
        </>
      ) : canSubmit ? (
        "Review swap"
      ) : (
        "Enter an amount and tokens"
      )}
    </Button>
  )
}
