import React from 'react'
import TokenSelector from './TokenSelector'
import AmountInput from './AmountInput'
import SwapButton from './SwapButton'
import ExchangeRate from './ExchangeRate'
import SubmitButton from './SubmitButton'

const SwapForm = ({
  selectedFromToken,
  selectedToToken,
  fromAmount,
  toAmount,
  exchangeRate,
  isLoading,
  onFromTokenClick,
  onToTokenClick,
  onFromAmountChange,
  onToAmountChange,
  onSwapTokens,
  onSubmit,
  prices,
  tokens
}) => {
  const fromToken = tokens.find(t => t.symbol === selectedFromToken)
  const toToken = tokens.find(t => t.symbol === selectedToToken)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="swap-card">
      <div className="swap-header">
        <h2>Swap Tokens</h2>
        <div className="network-indicator">
          <i className="fas fa-circle"></i>
          <span>Ethereum</span>
        </div>
      </div>

      <form className="swap-form" onSubmit={handleSubmit}>
        {/* From Token Section */}
        <div className="token-section">
          <div className="token-section-header">
            <label htmlFor="from-amount">From</label>
            <span className="balance" id="from-balance">Balance: 0.00</span>
          </div>
          <div className="token-input-group">
            <TokenSelector
              token={fromToken}
              onClick={onFromTokenClick}
            />
            <AmountInput
              id="from-amount"
              value={fromAmount}
              onChange={onFromAmountChange}
              placeholder="0.0"
              step="0.000001"
              min="0"
            />
          </div>
          <div className="error-message" id="from-error"></div>
        </div>

        {/* Swap Direction Button */}
        <SwapButton onClick={onSwapTokens} />

        {/* To Token Section */}
        <div className="token-section">
          <div className="token-section-header">
            <label htmlFor="to-amount">To</label>
            <span className="balance" id="to-balance">Balance: 0.00</span>
          </div>
          <div className="token-input-group">
            <TokenSelector
              token={toToken}
              onClick={onToTokenClick}
            />
            <AmountInput
              id="to-amount"
              value={toAmount}
              onChange={onToAmountChange}
              placeholder="0.0"
              step="0.000001"
              min="0"
              readOnly
            />
          </div>
          <div className="error-message" id="to-error"></div>
        </div>

        {/* Exchange Rate */}
        <ExchangeRate
          fromToken={selectedFromToken}
          toToken={selectedToToken}
          rate={exchangeRate}
        />

        {/* Submit Button */}
        <SubmitButton isLoading={isLoading} />
      </form>
    </div>
  )
}

export default SwapForm
