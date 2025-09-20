import React from 'react'

const SwapButton = ({ onClick }) => {
  return (
    <div className="swap-button-container">
      <button 
        type="button" 
        className="swap-direction-btn" 
        onClick={onClick}
        aria-label="Swap tokens"
      >
        <i className="fas fa-arrow-down"></i>
      </button>
    </div>
  )
}

export default SwapButton
