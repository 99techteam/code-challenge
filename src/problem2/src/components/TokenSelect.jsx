import React, { useState, useEffect, useRef } from 'react';

const TokenSelect = ({ 
  value, 
  onSelect, 
  isOpen, 
  setIsOpen, 
  prices, 
  getTokenIcon, 
  handleImageError 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Reset ô tìm kiếm mỗi khi đóng/mở dropdown
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  // Lọc danh sách dựa trên query (Tìm theo ký hiệu hoặc tên)
  const filteredPrices = prices.filter(p => 
    p.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Đóng dropdown khi click ra ngoài (UX chuẩn Binance)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <div className={`selected-token ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <img src={getTokenIcon(value)} onError={handleImageError} alt={value} />
        <span>{value}</span>
        <span className="arrow">▾</span>
      </div>
      
      {isOpen && (
        <div className="token-options-wrapper">
          {/* Ô Search chuẩn Binance */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search name or paste address" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="token-options-list">
            {filteredPrices.length > 0 ? (
              filteredPrices.map((p, i) => (
                <div 
                  key={`${p.currency}-${i}`} 
                  className={`token-option ${value === p.currency ? 'selected' : ''}`}
                  onClick={() => {
                    onSelect(p.currency);
                    setIsOpen(false);
                  }}
                >
                  <img src={getTokenIcon(p.currency)} onError={handleImageError} alt={p.currency} />
                  <span>{p.currency}</span>
                </div>
              ))
            ) : (
              <div className="no-result">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelect;