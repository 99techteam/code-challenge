import React from 'react'

const SubmitButton = ({ isLoading }) => {
  return (
    <button 
      type="submit" 
      className="submit-btn" 
      disabled={isLoading}
    >
      <span className="btn-text">Confirm Swap</span>
      <div className="loading-spinner" style={{ display: isLoading ? 'flex' : 'none' }}>
        <i className="fas fa-spinner fa-spin"></i>
      </div>
    </button>
  )
}

export default SubmitButton
