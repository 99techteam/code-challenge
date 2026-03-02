import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps {
  loading: boolean
  disabled?: boolean
}

export function SubmitButton({ loading, disabled }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={loading || disabled}
      className="w-full h-12 text-base font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Confirming...
        </>
      ) : (
        'Confirm Swap'
      )}
    </Button>
  )
}
