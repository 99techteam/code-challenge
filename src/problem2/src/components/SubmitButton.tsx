import { motion } from "framer-motion";

type Props = {
  isSubmitting: boolean;
  disabled: boolean;
  disabledReason?: string | null;
};

export function SubmitButton({ isSubmitting, disabled, disabledReason }: Props) {
  const label = isSubmitting ? "Swapping…" : "Confirm Swap";
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      title={disabled && !isSubmitting ? disabledReason ?? undefined : undefined}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`
        focus-ring relative w-full h-14 rounded-2xl font-semibold text-white
        transition-all overflow-hidden
        ${
          disabled
            ? "bg-white/5 text-ink-muted cursor-not-allowed"
            : "bg-accent-gradient shadow-[0_10px_30px_-10px_rgba(168,85,247,0.7)] hover:shadow-[0_14px_36px_-10px_rgba(168,85,247,0.9)]"
        }
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {isSubmitting && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3"/>
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        )}
        {label}
      </span>
    </motion.button>
  );
}
