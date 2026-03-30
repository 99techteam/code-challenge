import { useState } from 'react';

interface SwapDirectionButtonProps {
  onClick: () => void;
}

export default function SwapDirectionButton({ onClick }: SwapDirectionButtonProps) {
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    setRotated((r) => !r);
    onClick();
  };

  return (
    <div className="relative flex items-center justify-center py-1 -my-1">
      <button
        onClick={handleClick}
        className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 active:scale-90 transition-all group shadow-sm"
        title="Swap direction"
      >
        <svg
          className={`text-gray-400 group-hover:text-blue-500 transition-all duration-300 ${rotated ? 'rotate-180' : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
      </button>
    </div>
  );
}
