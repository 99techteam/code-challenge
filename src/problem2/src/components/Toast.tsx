import React from 'react';
import type { ToastType } from '../types';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        <i className={`toast-icon fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle`} />
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};