// Toast.jsx
import React from 'react';
import './Toast.css';

const Toast = ({ title, message, onClose }) => {
  return (
    <div className="custom-toast" onClick={onClose} style={{ cursor: 'pointer' }}>
      <div className="toast-icon">✓</div>
      <div className="toast-content">
        <strong>{title || 'Success!'}</strong>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;