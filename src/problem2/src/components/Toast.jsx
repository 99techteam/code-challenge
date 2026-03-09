import React, { useEffect } from "react";

export function Toast({ message, type = "info", onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!duration || !onDismiss) return;
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [duration, onDismiss]);

  return (
    <div
      className={`toast toast-${type}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
