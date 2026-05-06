type Props = {
  isDark: boolean;
  onToggle: () => void;
};

export function ThemeToggle({ isDark, onToggle }: Props) {
  return (
    <button
      type="button"
      className="inline-flex h-10 min-w-[2.75rem] items-center justify-center gap-2 rounded-full border border-slate-200/95 bg-white/95 px-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-700 shadow-md backdrop-blur-sm transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-black/35 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Use light appearance" : "Use dark appearance"}
      onClick={onToggle}
    >
      <span className="text-[1rem] leading-none" aria-hidden>
        {isDark ? "☀" : "☾"}
      </span>
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
