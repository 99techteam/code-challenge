import { useState } from 'react';
import { Check, Search, SearchX } from 'lucide-react';
import { formatAmount, type Token } from '../swap';
import Modal from './Modal';
import TokenIcon from './TokenIcon';

export default function TokenPicker({
  tokens,
  selected,
  onSelect,
  onClose,
}: {
  tokens: Token[];
  selected?: string;
  onSelect: (symbol: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filtered = tokens.filter((token) =>
    `${token.currency} ${token.name}`.toLowerCase().includes(query),
  );
  const popular = ['ETH', 'USDC', 'ATOM', 'SWTH']
    .map((symbol) => tokens.find((token) => token.currency === symbol))
    .filter((token): token is Token => !!token);

  return (
    <Modal title="Select a token" onClose={onClose}>
      <div className="search-box">
        <Search size={19} />
        <input
          data-autofocus
          type="search"
          aria-label="Search tokens"
          placeholder="Search name or symbol"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {!query && (
        <div className="popular-tokens">
          {popular.map((token) => (
            <button
              key={token.currency}
              onClick={() => onSelect(token.currency)}
              aria-label={`Select popular ${token.currency}`}
            >
              <TokenIcon symbol={token.currency} size={20} />
              {token.currency}
            </button>
          ))}
        </div>
      )}
      <div className="token-list-heading">
        <span>Asset</span>
        <span>Reference price</span>
      </div>
      <div className="token-list">
        {filtered.length ? (
          filtered.map((token) => (
            <button
              key={token.currency}
              className="token-option"
              onClick={() => onSelect(token.currency)}
              aria-label={`Select ${token.currency}, ${token.name}`}
            >
              <TokenIcon symbol={token.currency} size={36} />
              <span className="token-identity">
                <strong>{token.currency}</strong>
                <span>{token.name}</span>
              </span>
              <span className="token-price">${formatAmount(token.price)}</span>
              <span className="selected-check">
                {selected === token.currency && <Check size={17} />}
              </span>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <SearchX size={28} />
            <h3>No tokens found</h3>
            <p>Try another name or symbol.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
