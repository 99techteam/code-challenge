import React, { useState, useEffect } from 'react'

const TokenModal = ({ isOpen, onClose, onSelectToken, tokens, prices, selectedToken }) => {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOverlayClick = (e) => {
    if (e.target.id === 'token-modal-overlay') {
      onClose()
    }
  }

  return (
    <div 
      className="modal-overlay active" 
      id="token-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Select Token</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-content">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              id="token-search" 
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="token-list">
            {filteredTokens.map(token => (
              <div 
                key={token.symbol}
                className={`token-item ${selectedToken === token.symbol ? 'selected' : ''}`}
                onClick={() => onSelectToken(token.symbol)}
              >
                <img 
                  src={token.icon} 
                  alt={token.symbol}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236366f1"><circle cx="12" cy="12" r="10"/></svg>'
                  }}
                />
                <div className="token-info">
                  <div className="token-name">{token.name}</div>
                  <div className="token-symbol">{token.symbol}</div>
                </div>
                {prices[token.symbol] && (
                  <div className="token-price">${prices[token.symbol].price.toFixed(2)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenModal
