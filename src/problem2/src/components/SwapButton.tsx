import React, { useState } from 'react'

interface SwapButtonProps {
  onClick: () => void
  disabled?: boolean
}

const SwapButton: React.FC<SwapButtonProps> = ({ onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  const getIconSrc = () => {
    if (disabled) return '/swap-icon-gray.svg'
    if (isHovered) return '/swap-icon-blue.svg'
    return '/swap-icon-cyan.svg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group absolute right-1/2 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-14 h-14 p-2 rounded-full border-2 flex justify-center items-center transition-all duration-300 z-10 ${
        disabled 
          ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50' 
          : 'bg-zinc-900 border-blue-500 hover:bg-zinc-800 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-110 active:scale-95'
      }`}
      data-testid="swap-button"
    >
      <img 
        src={getIconSrc()}
        alt="Swap currencies"
        className="w-6 h-6 transition-all duration-500 ease-in-out group-hover:rotate-180 group-active:rotate-[360deg]"
      />
    </button>
  )
}

export default SwapButton 