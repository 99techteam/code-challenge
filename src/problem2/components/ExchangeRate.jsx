import React from 'react'

const ExchangeRate = ({ fromToken, toToken, rate }) => {
  if (!rate || !fromToken || !toToken) {
    return null
  }

  return (
    <div className="exchange-rate">
      <span>1 {fromToken} = {rate.toFixed(6)} {toToken}</span>
    </div>
  )
}

export default ExchangeRate
