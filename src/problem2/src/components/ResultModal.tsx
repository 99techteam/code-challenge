import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface SwapSummary {
  fromAmount: string;
  fromToken: string;
  toAmount: string;
  toToken: string;
  rate?: string;
}

interface ResultModalProps {
  isOpen: boolean;
  success: boolean;
  message: string;
  summary?: SwapSummary | null;
  onClose: () => void;
}

export const ResultModal = ({ isOpen, success, message, summary, onClose }: ResultModalProps) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeBtnRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="modal-content">
        <div className={`modal-icon ${success ? 'success' : 'error'}`} aria-hidden="true">
          {success ? <CheckIcon /> : <XIcon />}
        </div>
        <h2 id="modal-title" className="modal-title">
          {success ? 'Success' : 'Error'}
        </h2>
        <p id="modal-message" className="modal-message">
          {message}
        </p>
        {success && summary && (
          <div className="modal-summary" aria-live="polite">
            <div className="modal-summary-row">
              <span className="modal-summary-label">You sent</span>
              <span className="modal-summary-value">{summary.fromAmount} {summary.fromToken}</span>
            </div>
            <div className="modal-summary-row">
              <span className="modal-summary-label">You receive</span>
              <span className="modal-summary-value">{summary.toAmount} {summary.toToken}</span>
            </div>
            {summary.rate && (
              <div className="modal-summary-row modal-summary-rate">
                <span className="modal-summary-label">Rate</span>
                <span className="modal-summary-value">{summary.rate}</span>
              </div>
            )}
          </div>
        )}
        <button
          ref={closeBtnRef}
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          OK
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
