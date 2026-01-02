import { Loader2 } from 'lucide-react'
import { SwapButtonProps } from '../models/component'

const SwapButton = ({ isSubmitting, disabled }: SwapButtonProps) => {
  return (
    <button
      type="submit"
      className={`w-full py-4 bg-blue-500 text-white rounded-xl font-semibold text-base uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
        disabled || isSubmitting
          ? 'bg-blue-300 cursor-not-allowed'
          : 'hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0'
      }`}
      disabled={disabled || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        'CONFIRM SWAP'
      )}
    </button>
  )
}

export default SwapButton
