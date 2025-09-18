import React, { useEffect } from 'react'

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'fas fa-exclamation-circle'
      case 'success':
        return 'fas fa-check-circle'
      default:
        return 'fas fa-info-circle'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444'
      case 'success':
        return '#10b981'
      default:
        return '#6366f1'
    }
  }

  return (
    <div 
      className="toast"
      style={{
        background: getBackgroundColor(),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="toast-content">
        <i className={getIcon()}></i>
        <span>{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}

export default Toast
