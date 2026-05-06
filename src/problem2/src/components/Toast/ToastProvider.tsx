import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const AUTO_DISMISS_MS = 6200;
/** Keep in sync with `animate-toast-out` duration in tailwind.config.js */
const TOAST_EXIT_MS = 300;

type Variant = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: Variant;
  exiting?: boolean;
};

export type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    let shouldExit = false;
    setToasts((previous) => {
      const found = previous.find((t) => t.id === id);
      if (!found || found.exiting) {
        return previous;
      }
      shouldExit = true;
      return previous.map((t) => (t.id === id ? { ...t, exiting: true } : t));
    });
    if (!shouldExit) {
      return;
    }
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((t) => t.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((previous) => {
      if (previous.length === 0 || previous.every((toast) => toast.exiting)) {
        return previous;
      }
      return previous.map((toast) => ({ ...toast, exiting: true }));
    });
    window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => !toast.exiting));
    }, TOAST_EXIT_MS);
  }, []);

  const push = useCallback((message: string, variant: Variant) => {
    idRef.current += 1;
    const id = `toast-${idRef.current}`;
    setToasts((previous) => [...previous, { id, message, variant }]);
  }, []);

  const success = useCallback((message: string) => push(message, "success"), [push]);

  const error = useCallback((message: string) => push(message, "error"), [push]);

  const value = useMemo(
    () => ({ success, error, dismiss, dismissAll }),
    [success, error, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[220] flex w-[min(calc(100vw-2rem),22rem)] -translate-x-1/2 flex-col gap-3 sm:right-6 sm:left-auto sm:translate-x-0"
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    portalTarget,
  );
}

function ToastMessage({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.exiting) {
      return;
    }
    const timeout = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeout);
  }, [toast.id, toast.exiting, toast.message, onDismiss]);

  const isError = toast.variant === "error";

  const surface =
    isError ?
      "relative overflow-hidden rounded-2xl border-[1.5px] border-red-600 bg-white text-neutral-950 shadow-[0_18px_50px_-20px_rgba(185,28,28,0.45)] ring-1 ring-neutral-950/[0.1] backdrop-blur-[2px] dark:border-red-400 dark:bg-red-950 dark:text-neutral-50 dark:shadow-[0_22px_50px_-16px_rgba(0,0,0,0.75)] dark:ring-white/22"
      : "relative overflow-hidden rounded-2xl border-[1.5px] border-emerald-700 bg-white text-neutral-950 shadow-[0_18px_50px_-22px_rgba(5,80,62,0.32)] ring-1 ring-neutral-950/[0.08] backdrop-blur-[2px] dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-50 dark:shadow-[0_22px_50px_-16px_rgba(0,0,0,0.65)] dark:ring-emerald-100/22";

  const iconTone =
    isError ?
      "border border-red-800/35 bg-red-600 text-white shadow-md dark:bg-red-500 dark:text-white dark:border-transparent"
      : "border border-emerald-900/30 bg-emerald-600 text-white shadow-md dark:bg-emerald-500 dark:text-white dark:border-transparent";

  const motionClasses = toast.exiting ? "toast-motion-out pointer-events-none" : "toast-motion-in";

  return (
    <div
      className={`pointer-events-auto flex origin-bottom items-start gap-3 px-4 py-3.5
        flex items-center
        will-change-transform
        motion-reduce:!transform-none
        transition-shadow duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-0.5 hover:brightness-[1.02] hover:shadow-2xl
        motion-reduce:hover:translate-y-0 motion-reduce:hover:brightness-100
        ${toast.exiting ? "pointer-events-none" : ""}
        ${motionClasses}
        ${surface}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <span
        className={`mt-[0.1rem] flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.92rem] font-bold ${iconTone}`}
        aria-hidden
      >
        {isError ? "!" : "✓"}
      </span>
      <p className="m-0 min-w-0 flex-1 py-px text-[0.9rem] font-semibold leading-snug text-neutral-900 dark:text-neutral-50">
        {toast.message}
      </p>
      <button
        type="button"
        className={`mt-[-0.1rem] shrink-0 rounded-xl p-2 text-neutral-600 transition-[background-color,opacity,color,transform] duration-200 ease-out hover:bg-neutral-950/[0.09] hover:text-neutral-950 active:scale-95 dark:text-neutral-200 dark:hover:bg-white/14 dark:hover:text-white disabled:pointer-events-none ${toast.exiting ? "opacity-60" : ""}`}
        aria-label="Dismiss notification"
        disabled={toast.exiting}
        onClick={() => onDismiss(toast.id)}
      >
        <span aria-hidden className="block text-[1.2rem] font-light leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
