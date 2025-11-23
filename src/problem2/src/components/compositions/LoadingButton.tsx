import { useTransition, type MouseEventHandler, type ReactNode } from 'react'
import { cn } from '../../utils/formatters/cn'

type LoadingButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>
  children: ReactNode
  className?: string
}

const LoadingButton = ({ onClick, children, className }: LoadingButtonProps) => {
  const [isLoading, startTransition] = useTransition()

  return (
    <button
      disabled={isLoading}
      onClick={e => {
        startTransition(() => onClick?.(e))
      }}
      className={cn(
        'rounded-full bg-[linear-gradient(90deg,#4f9dfc,#6bc1ff)] px-4 py-3 text-base font-bold text-[#042033] shadow-[0_8px_24px_rgba(91,140,255,0.18)] disabled:opacity-75',
        'transition-opacity duration-300 ease-out will-change-[opacity]',
        isLoading ? 'cursor-progress' : 'cursor-pointer',
        className
      )}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  )
}

export default LoadingButton
