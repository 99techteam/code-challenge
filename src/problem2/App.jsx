import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import SwapForm from './components/SwapForm'
import TokenModal from './components/TokenModal'
import Toast from './components/Toast'
import Footer from './components/Footer'
import { useCurrencySwap } from './hooks/useCurrencySwap'

function App() {
  const {
    prices,
    tokens,
    selectedFromToken,
    selectedToToken,
    fromAmount,
    toAmount,
    exchangeRate,
    isLoading,
    error,
    success,
    setSelectedFromToken,
    setSelectedToToken,
    setFromAmount,
    setToAmount,
    swapTokens,
    handleSubmit,
    clearAmounts,
    showError,
    showSuccess
  } = useCurrencySwap()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'from' or 'to'
  const [toasts, setToasts] = useState([])

  const openTokenModal = useCallback((type) => {
    setModalType(type)
    setIsModalOpen(true)
  }, [])

  const closeTokenModal = useCallback(() => {
    setIsModalOpen(false)
    setModalType(null)
  }, [])

  const selectToken = useCallback((symbol) => {
    if (modalType === 'from') {
      setSelectedFromToken(symbol)
    } else if (modalType === 'to') {
      setSelectedToToken(symbol)
    }
    closeTokenModal()
    clearAmounts()
  }, [modalType, setSelectedFromToken, setSelectedToToken, closeTokenModal, clearAmounts])

  const addToast = useCallback((message, type) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      addToast(error, 'error')
    }
  }, [error, addToast])

  useEffect(() => {
    if (success) {
      addToast(success, 'success')
    }
  }, [success, addToast])

  return (
    <div className="app">
      <Header />
      
      <main className="main">
        <div className="swap-container">
          <SwapForm
            selectedFromToken={selectedFromToken}
            selectedToToken={selectedToToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            exchangeRate={exchangeRate}
            isLoading={isLoading}
            onFromTokenClick={() => openTokenModal('from')}
            onToTokenClick={() => openTokenModal('to')}
            onFromAmountChange={setFromAmount}
            onToAmountChange={setToAmount}
            onSwapTokens={swapTokens}
            onSubmit={handleSubmit}
            prices={prices}
            tokens={tokens}
          />
        </div>

        {isModalOpen && (
          <TokenModal
            isOpen={isModalOpen}
            onClose={closeTokenModal}
            onSelectToken={selectToken}
            tokens={tokens}
            prices={prices}
            selectedToken={modalType === 'from' ? selectedFromToken : selectedToToken}
          />
        )}
      </main>

      <Footer />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default App
