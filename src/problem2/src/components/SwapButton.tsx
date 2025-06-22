import React from "react";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

interface ISwapButtonProps {
  onClick?: () => void;
  className?: string;
}

export const SwapButton: React.FC<ISwapButtonProps> = ({
  onClick,
  className = "",
}) => (
  <div className={`flex justify-center items-center ${className}`}>
    <button
      className="inline-flex rounded-full border border-solid border-gray-250 bg-white p-4 hover:bg-gray-150"
      aria-label="Swap currencies"
      type="button"
      onClick={onClick}
    >
      <SwapHorizIcon sx={{ color: "black", fontSize: 30 }} />
    </button>
  </div>
);
