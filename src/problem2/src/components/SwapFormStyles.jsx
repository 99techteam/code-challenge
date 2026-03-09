import React from "react";

export function SwapFormStyles() {
  return (
    <style>{`
      .swap-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 24px;
        box-shadow: var(--shadow);
      }

      .swap-title {
        margin: 0 0 20px;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .swap-message {
        padding: 12px 14px;
        border-radius: var(--radius-sm);
        margin-bottom: 16px;
      }

      .swap-message-error {
        background: rgba(255, 92, 92, 0.12);
        color: var(--error);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .swap-retry {
        background: transparent;
        border: 1px solid var(--error);
        color: var(--error);
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .swap-retry:hover {
        background: rgba(255, 92, 92, 0.15);
      }

      .swap-loading {
        padding: 32px;
        text-align: center;
        color: var(--text-secondary);
      }

      .swap-field {
        margin-bottom: 16px;
      }

      .swap-amount-label {
        display: block;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin-bottom: 6px;
      }

      .swap-input {
        width: 100%;
        padding: 12px 14px;
        font-size: 1.125rem;
        font-family: inherit;
        color: var(--text-primary);
        background: var(--bg-input);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        outline: none;
        transition: border-color 0.15s;
      }

      .swap-input::placeholder {
        color: var(--text-secondary);
        opacity: 0.7;
      }

      .swap-input:hover:not(:disabled) {
        border-color: #3a4255;
      }

      .swap-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(0, 211, 149, 0.2);
      }

      .swap-input-error {
        border-color: var(--error);
      }

      .swap-input-error:focus {
        border-color: var(--error);
        box-shadow: 0 0 0 2px rgba(255, 92, 92, 0.2);
      }

      .swap-input-readonly {
        cursor: default;
        opacity: 0.95;
      }

      .swap-field-error {
        display: block;
        font-size: 0.8125rem;
        color: var(--error);
        margin-top: 6px;
      }

      .swap-rate {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin: 6px 0 0;
      }

      .swap-flip {
        display: block;
        width: 44px;
        height: 44px;
        margin: -8px auto 16px;
        background: var(--bg-input);
        border: 1px solid var(--border);
        border-radius: 50%;
        font-size: 1.25rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: background 0.15s, color 0.15s, transform 0.15s;
      }

      .swap-flip:hover:not(:disabled) {
        background: var(--border);
        color: var(--text-primary);
        transform: rotate(180deg);
      }

      .swap-flip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .swap-submit {
        width: 100%;
        margin-top: 8px;
        padding: 14px 20px;
        font-size: 1rem;
        font-weight: 600;
        font-family: inherit;
        color: #0d0f14;
        background: var(--accent);
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: background 0.15s, opacity 0.15s;
      }

      .swap-submit:hover:not(:disabled) {
        background: var(--accent-dim);
      }

      .swap-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .swap-submit[aria-busy="true"] {
        pointer-events: none;
      }

      .swap-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(13, 15, 20, 0.3);
        border-top-color: #0d0f14;
        border-radius: 50%;
        animation: swap-spin 0.7s linear infinite;
      }

      @keyframes swap-spin {
        to { transform: rotate(360deg); }
      }

      .token-select {
        position: relative;
        margin-bottom: 8px;
      }

      .token-select-label {
        display: block;
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin-bottom: 6px;
      }

      .token-select-trigger {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        font-size: 0.9375rem;
        font-family: inherit;
        color: var(--text-primary);
        background: var(--bg-input);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s;
      }

      .token-select-trigger:hover:not(:disabled) {
        border-color: #3a4255;
      }

      .token-select-trigger:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .token-select-symbol {
        font-weight: 600;
      }

      .token-select-placeholder {
        color: var(--text-secondary);
      }

      .token-select-chevron {
        margin-left: auto;
        font-size: 0.65rem;
        color: var(--text-secondary);
      }

      .token-select-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin: 4px 0 0;
        padding: 6px;
        list-style: none;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow);
        max-height: 240px;
        overflow-y: auto;
        z-index: 10;
      }

      .token-select-option {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        font-size: 0.9375rem;
        font-family: inherit;
        color: var(--text-primary);
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s;
      }

      .token-select-option:hover {
        background: var(--bg-input);
      }

      .token-select-option-symbol {
        font-weight: 600;
        min-width: 48px;
      }

      .token-select-option-name {
        color: var(--text-secondary);
        font-size: 0.8125rem;
      }

      .token-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
      }

      .token-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .token-icon-fallback {
        width: 100%;
        height: 100%;
        background: var(--border);
        color: var(--text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      }

      .toast-container > * {
        pointer-events: auto;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: var(--radius-sm);
        font-size: 0.9375rem;
        font-weight: 500;
        box-shadow: var(--shadow);
        animation: toast-in 0.25s ease-out;
      }

      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .toast-success {
        background: rgba(0, 211, 149, 0.15);
        color: var(--accent);
        border: 1px solid rgba(0, 211, 149, 0.4);
      }

      .toast-error {
        background: rgba(255, 92, 92, 0.15);
        color: var(--error);
        border: 1px solid rgba(255, 92, 92, 0.4);
      }

      .toast-message {
        flex: 1;
      }

      .toast-close {
        background: none;
        border: none;
        color: inherit;
        opacity: 0.8;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: 0 4px;
      }

      .toast-close:hover {
        opacity: 1;
      }
    `}</style>
  );
}
