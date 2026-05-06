import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "iconRound" | "dropdownTrigger" | "listItem";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 px-4 py-[0.95rem] text-[0.95rem] font-bold tracking-wide text-white shadow-glow ring-1 ring-white/25 transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_16px_48px_-14px_rgba(99,102,241,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:brightness-100",
  iconRound:
    "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[1.05rem] text-indigo-600 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.35)] ring-2 ring-white/80 transition-[transform,background-color,color,box-shadow,border-color] duration-300 ease-out hover:border-indigo-200 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-teal-50 hover:text-indigo-700 hover:shadow-md active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-indigo-300 dark:shadow-black/50 dark:ring-white/12 dark:hover:border-indigo-500/55 dark:hover:from-indigo-950 dark:hover:to-slate-900 dark:hover:text-indigo-200 dark:hover:shadow-black/65",
  dropdownTrigger:
    "absolute right-[0.2rem] top-1/2 flex h-[1.85rem] w-[1.85rem] -translate-y-1/2 items-center justify-center rounded-lg border border-transparent bg-white/95 text-indigo-500 shadow-sm backdrop-blur-sm transition-[background,border,color,transform] duration-200 ease-out hover:border-indigo-200/85 hover:bg-indigo-50/95 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-slate-800/92 dark:border-slate-600/40 dark:text-indigo-300 dark:hover:bg-slate-700 dark:hover:border-indigo-500/45 dark:hover:text-indigo-200",
  listItem:
    "inline-flex w-full items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left text-[0.9rem] font-medium text-slate-800 transition-[background,color,border] duration-200 ease-out hover:border-indigo-200/90 hover:bg-gradient-to-r hover:from-indigo-50/92 hover:to-teal-50/55 hover:text-indigo-900 dark:border-transparent dark:text-slate-100 dark:hover:border-indigo-500/35 dark:hover:from-indigo-950 dark:hover:to-teal-950/40 dark:hover:text-indigo-100",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Shows a spinner and disables interaction while true. */
  inProgress?: boolean;
  /** When true (and not `inProgress`), shows a check icon; does **not** disable the button — use alongside `disabled` if you want to block presses. */
  ready?: boolean;
};

function ButtonSpinner({
  variant,
}: {
  variant: ButtonVariant;
}) {
  const size =
    variant === "dropdownTrigger" ?
      "h-3 w-3 border-[2px]"
    : variant === "iconRound" ?
      "h-5 w-5 border-2"
    : "h-[1.06em] w-[1.06em] border-2";

  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-solid border-current border-r-transparent opacity-95 motion-reduce:animate-none ${size}`}
      aria-hidden
    />
  );
}

function ReadyCheckGlyph({ variant }: { variant: ButtonVariant }) {
  const size =
    variant === "dropdownTrigger" ? "h-3 w-3"
    : variant === "iconRound" ? "h-5 w-5"
    : "h-[1.15em] w-[1.15em] shrink-0";
  return (
    <svg
      className={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4.75 10.25 L8.5 14 L15.35 7.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    className,
    type = "button",
    inProgress = false,
    ready = false,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const variantClass = VARIANT_CLASSES[variant];
  const merged = [variantClass, className].filter(Boolean).join(" ");
  const showReady = Boolean(ready && !inProgress);

  return (
    <button
      ref={ref}
      type={type}
      className={merged}
      disabled={Boolean(disabled || inProgress)}
      aria-busy={inProgress || undefined}
      {...rest}
    >
      {inProgress ? (
        <>
          <ButtonSpinner variant={variant} />
          {children}
        </>
      ) : showReady ? (
        <>
          <ReadyCheckGlyph variant={variant} />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
});
