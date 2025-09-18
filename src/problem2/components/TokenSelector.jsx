import React from 'react'

const TokenSelector = ({ token, onClick }) => {
  if (!token) {
    return (
      <div className="token-selector" onClick={onClick}>
        <div className="token-icon-placeholder"></div>
        <span className="token-symbol">Select Token</span>
        <i className="fas fa-chevron-down"></i>
      </div>
    )
  }

  return (
    <div className="token-selector" onClick={onClick}>
      <img 
        src={token.icon} 
        alt={token.symbol} 
        className="token-icon"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><circle cx="12" cy="12" r="10"/></svg>'
        }}
      />
      <span className="token-symbol">{token.symbol}</span>
      <i className="fas fa-chevron-down"></i>
    </div>
  )
}

export default TokenSelector
