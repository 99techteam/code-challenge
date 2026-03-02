import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

interface SwapButtonProps {
  onClick: () => void
}

export function SwapButton({ onClick }: SwapButtonProps) {
  const [rotating, setRotating] = useState(false)

  function handleClick() {
    setRotating(true)
    onClick()
    setTimeout(() => setRotating(false), 300)
  }

  return (
    <div className="flex justify-center -my-2 relative z-10">
      <button
        onClick={handleClick}
        className="h-10 w-10 rounded-full bg-card border-2 border-border flex items-center justify-center hover:bg-muted transition-colors shadow-md"
      >
        <ArrowUpDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${rotating ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}
