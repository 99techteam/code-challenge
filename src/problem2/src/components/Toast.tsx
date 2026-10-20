import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-lg flex items-start gap-3 animate-slideUp text-xs transition ${
            toast.type === 'success'
              ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/40 text-slate-800 dark:text-slate-100'
              : toast.type === 'error'
              ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/40 text-slate-800 dark:text-slate-100'
              : 'bg-white/95 dark:bg-slate-900/95 border-indigo-500/40 text-slate-800 dark:text-slate-100'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <div className="font-bold text-slate-900 dark:text-white">{toast.title}</div>
            {toast.message && <div className="text-slate-500 dark:text-slate-400 mt-0.5">{toast.message}</div>}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
