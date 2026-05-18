import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { Loader2 } from 'lucide-react';
import type { Coin } from '../types';
import '../swap.css';

interface SwapPageProps {
  coins: Coin[];
  sessionToken?: string;
  onScoreUpdate?: (newScore: number) => void;
}

export const SwapPage: FC<SwapPageProps> = ({ coins, sessionToken, onScoreUpdate }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark mode for overall app match
  
  const [fromCoin, setFromCoin] = useState<Coin | null>(null);
  const [toCoin, setToCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => {
    if (coins.length > 1 && !fromCoin && !toCoin) {
      setFromCoin(coins.find(c => c.currency === 'ETH') || coins[0]);
      setToCoin(coins.find(c => c.currency === 'USDC') || coins[1]);
    }
  }, [coins]);

  useEffect(() => {
    if (fromCoin && toCoin) {
      setLoadingRate(true);
      fetch(`http://localhost:3001/api/exchange-rate?from=${fromCoin.currency}&to=${toCoin.currency}`)
        .then(res => res.json())
        .then(data => {
          setRate(data.rate);
          setLoadingRate(false);
        })
        .catch(() => {
          setRate(null);
          setLoadingRate(false);
        });
    }
  }, [fromCoin, toCoin]);

  const handleSwap = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToast({ msg: 'Please enter a valid amount', type: 'error' });
      return;
    }
    if (!fromCoin || !toCoin) return;

    setIsSwapping(true);
    setToast(null);

    try {
      const res = await fetch('http://localhost:3001/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCoin: fromCoin.currency,
          toCoin: toCoin.currency,
          amount: Number(amount),
          sessionToken
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setToast({ msg: data.message, type: 'success' });
        setAmount('');
        // Propagate server-returned score to parent (App.tsx)
        if (data.newScore !== null && data.newScore !== undefined) {
          onScoreUpdate?.(data.newScore);
        }
      } else {
        setToast({ msg: data.error || 'Swap failed', type: 'error' });
      }
    } catch (e) {
      setToast({ msg: 'Network error', type: 'error' });
    } finally {
      setIsSwapping(false);
    }
  };

  const receivedAmount = rate && amount && !isNaN(Number(amount)) ? (Number(amount) * rate).toFixed(6) : '0.00';

  return (
    <div className={`flex justify-center items-center w-full min-h-[70vh] py-10 relative ${isDark ? 'theme-dark' : ''}`}>
      {toast && (
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all animate-in fade-in z-50 ${
          toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="swap-card">
        
        <div className="theme-toggle-container">
            <button className="theme-toggle-btn" id="themeToggle" aria-label="Toggle Theme" onClick={() => setIsDark(!isDark)}>
                <svg className="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                
                <svg className="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </button>
        </div>

        <h1 className="card-title">Swap Assets</h1>

        <div style={{ position: 'relative' }}>
            <div className="input-section you-pay">
                <div className="input-header">You pay</div>
                <div className="input-row">
                    <input 
                      type="text" 
                      className="amount-input" 
                      placeholder="0.0" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    
                    <TokenSelector 
                      coins={coins} 
                      selected={fromCoin} 
                      onSelect={(c) => {
                        if (c.currency === toCoin?.currency) setToCoin(fromCoin);
                        setFromCoin(c);
                      }} 
                    />
                </div>
            </div>

            <div className="swap-icon-container">
                <div 
                  className="swap-icon-button"
                  onClick={() => {
                    setFromCoin(toCoin);
                    setToCoin(fromCoin);
                  }}
                >
                    ⇌
                </div>
            </div>

            <div className="input-section you-receive">
                <div className="input-header">You receive</div>
                <div className="input-row">
                    <input 
                      type="text" 
                      className="amount-input" 
                      placeholder="0.00" 
                      value={receivedAmount}
                      readOnly
                    />
                    
                    <TokenSelector 
                      coins={coins} 
                      selected={toCoin} 
                      onSelect={(c) => {
                        if (c.currency === fromCoin?.currency) setFromCoin(toCoin);
                        setToCoin(c);
                      }} 
                    />
                </div>
            </div>
        </div>

        <div className="info-row">
            <span className="info-label">Exchange Rate</span>
            <span className="info-value">
              {loadingRate ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              {rate && fromCoin && toCoin ? `1 ${fromCoin.currency} = ${rate.toFixed(6)} ${toCoin.currency}` : 'Unavailable'}
            </span>
        </div>

        <button className="confirm-swap-btn" onClick={handleSwap} disabled={isSwapping || !rate}>
            {isSwapping ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Confirm Swap'}
        </button>

      </div>
    </div>
  );
};

const TokenSelector = ({ coins, selected, onSelect }: { coins: Coin[], selected: Coin | null, onSelect: (c: Coin) => void }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button className="token-selector" onClick={() => setOpen(!open)}>
          {selected?.iconFilename ? (
              <img src={`/coins/${selected.iconFilename}`} alt={selected.currency} className="token-icon" style={{ backgroundColor: '#1e293b' }} />
          ) : (
              <span className="token-icon"></span>
          )}
          <span className="token-symbol">{selected?.currency || 'Select'}</span>
          <span className="dropdown-icon">▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '180px', maxHeight: '240px', overflowY: 'auto',
          backgroundColor: 'var(--bg-color, #1a2035)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 50, padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {coins.map(c => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', textAlign: 'left'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img src={`/coins/${c.iconFilename}`} alt={c.currency} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1e293b' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>{c.currency}</span>
                <span style={{ fontSize: '12px', opacity: 0.5 }}>{c.blockchain}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
