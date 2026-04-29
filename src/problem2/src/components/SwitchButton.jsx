export default function SwitchButton({ disabled, onClick }) {
  return (
    <button
      className="focus-ring grid size-9 rotate-90 place-items-center rounded-full border border-blue-100 bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      type="button"
      aria-label="Switch currencies"
      disabled={disabled}
      onClick={onClick}
    >
      <svg className="size-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7h11l-3-3 1.4-1.4L22.8 9l-6.4 6.4L15 14l3-3H7V7Zm10 10H6l3 3-1.4 1.4L1.2 15l6.4-6.4L9 10l-3 3h11v4Z" />
      </svg>
    </button>
  );
}
