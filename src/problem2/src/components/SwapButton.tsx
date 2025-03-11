import React from "react";
import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";

type SwapButtonProps = {
  isSwapped: boolean;
  onClick: () => void;
};

const SwapButton: React.FC<SwapButtonProps> = ({ isSwapped, onClick }) => {
  const buttonVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: isSwapped ? 180 : 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    hover: { scale: 1.2 },
    tap: { scale: 0.9 },
  };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-700 cursor-pointer"
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      <FaArrowDown size={16} />
    </motion.button>
  );
};

export default SwapButton;
