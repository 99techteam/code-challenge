export default function SubmitButton({ disabled, isSubmitting }) {
  return (
    <button
      className="focus-ring mt-2.5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:-translate-y-px hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      type="submit"
      disabled={disabled}
    >
      <span className="button-label">{isSubmitting ? "Swapping" : "Confirm swap"}</span>
      {isSubmitting ? (
        <span
          className="size-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}
