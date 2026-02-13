import { useState, useCallback, useMemo, type ReactNode } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";
import { ToastContext } from "./context-definition";
import { TOAST_AUTO_HIDE_DURATION } from "@common";

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSuccess = useCallback((message: string) => {
    setToast({ open: true, message, severity: "success" });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ open: true, message, severity: "error" });
  }, []);

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({ showSuccess, showError }),
    [showSuccess, showError],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={TOAST_AUTO_HIDE_DURATION}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
