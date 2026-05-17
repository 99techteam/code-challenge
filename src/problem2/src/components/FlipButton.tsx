import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function FlipButton({ onClick, disabled }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Swap direction"
      whileTap={{ scale: 0.92 }}
      whileHover={{ rotate: 180 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="
        focus-ring grid h-11 w-11 place-items-center rounded-2xl
        border border-border-card bg-[#15172e] text-ink-secondary
        shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)]
        hover:text-ink-primary hover:border-accent-mid/60
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-colors
      "
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
        <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
      </svg>
    </motion.button>
  );
}
