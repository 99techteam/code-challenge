import { useState, useMemo, useRef } from 'react';
import { usePrices } from './hooks/usePrices';
import TokenSelect from './components/TokenSelect';
import Toast from './components/Toast/Toast';
import './App.css';

function App() {
  const prices = usePrices();
  const [amount, setAmount] = useState('');
  const [isSourcing, setIsSourcing] = useState(true);
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFromList, setShowFromList] = useState(false);
  const [showToList, setShowToList] = useState(false);

  const { sendAmount, receiveAmount } = useMemo(() => {
    if (!amount || !prices.length) return { sendAmount: amount, receiveAmount: '' };

    const fromPrice = prices.find(p => p.currency === fromToken)?.price || 0;
    const toPrice = prices.find(p => p.currency === toToken)?.price || 0;
    if (fromPrice === 0 || toPrice === 0) return { sendAmount: amount, receiveAmount: '' };

    if (isSourcing) {
      const res = (parseFloat(amount) * fromPrice) / toPrice;
      return { sendAmount: amount, receiveAmount: res.toFixed(6).replace(/\.?0+$/, "") };
    } else {
      const res = (parseFloat(amount) * toPrice) / fromPrice;
      return { sendAmount: res.toFixed(6).replace(/\.?0+$/, ""), receiveAmount: amount };
    }
  }, [amount, isSourcing, fromToken, toToken, prices]);

  const toastTimerRef = useRef(null);

  const handleConfirmSwap = (e) => {
    e.preventDefault();

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(null);
    
    if (!amount || amount <= 0) {
      const newToast = { title: 'Error', message: 'Please enter a valid amount.' };
      setToast(newToast);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(true);
      setLoading(false);
      const newToast = { title: 'Swap Successful', message: `Successfully swapped ${sendAmount} ${fromToken} to ${receiveAmount} ${toToken}` };
      setToast(newToast);
      setTimeout(() => setToast(null), 4000);
    }, 2000);
  };

  const switchTokens = () => {
    const prevFromToken = fromToken;
    const prevToToken = toToken;
    
    setFromToken(prevToToken);
    setToToken(prevFromToken);

    setIsSourcing(!isSourcing);
  };

  const currentRate = useMemo(() => {
    if (!prices.length) return 0;
    const fromP = prices.find(p => p.currency === fromToken)?.price || 0;
    const toP = prices.find(p => p.currency === toToken)?.price || 0;
    return fromP / toP;
  }, [fromToken, toToken, prices]);

  const getTokenIcon = (symbol) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
  };

  const handleImageError = (e) => {
    e.target.src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDC.svg';
  };

  return (
    <div className="swap-container">
      {toast && (
        <div className="toast-container">
          <Toast 
            title={toast.title} 
            message={toast.message} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
      <form className={`fancy-form ${loading ? 'is-loading' : ''}`} onSubmit={handleConfirmSwap}>
        <h5>Swap</h5>
        
        <div className="input-group">
          <label>Amount to send</label>
          <div className="input-wrapper">
            <input 
              type="text"
              value={sendAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                  setAmount(val);
                  setIsSourcing(true);
                }
              }}
              placeholder="0.00"
            />
            <TokenSelect 
              value={fromToken}
              onSelect={setFromToken}
              isOpen={showFromList}
              setIsOpen={setShowFromList}
              prices={prices}
              getTokenIcon={getTokenIcon}
              handleImageError={handleImageError}
            />
          </div>
          
          {amount !== '' && parseFloat(amount) <= 0 && (
            <span className="error-msg">Please enter a valid amount greater than 0</span>
          )}
        </div>

        <div className="swap-divider-container">
          <button type="button" className="switch-button" onClick={switchTokens}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
            </svg>
          </button>
        </div>

        <div className="input-group">
          <label>Amount to receive</label>
          <div className="input-wrapper">
            <input 
              type="text"
              value={receiveAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                  setAmount(val);
                  setIsSourcing(false);
                }
              }}
              placeholder="0.00"
            />
            <TokenSelect 
              value={toToken}
              onSelect={setToToken}
              isOpen={showToList}
              setIsOpen={setShowToList}
              prices={prices}
              getTokenIcon={getTokenIcon}
              handleImageError={handleImageError}
            />
          </div>
        </div>

        <div className="exchange-rate-info">
          <span>Rate:</span>
          <span>
            1 {fromToken} ≈ {currentRate > 0 ? currentRate.toFixed(6) : "..."} {toToken}
          </span>
        </div>

        <button type="submit" disabled={loading || !amount || amount <= 0}>CONFIRM SWAP</button>
      </form>
    </div>
  );
}

export default App;