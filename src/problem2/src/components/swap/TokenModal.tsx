import React, { useState } from "react";
import { Modal, Input } from "@/components/ui";
import { Token } from "@/types";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  tokens: Token[];
}

export const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onClose, onSelect, tokens }) => {
  const [search, setSearch] = useState("");

  const filteredTokens = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Token">
      <div className="mb-4">
        <Input
          placeholder="Search name or paste address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-secondary mb-2">Hot Tokens</h3>
        <div className="flex gap-2 flex-wrap">
          {tokens.slice(0, 4).map((token) => (
            <button
              key={token.symbol}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              className="px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 hover:border-primary text-sm text-text-primary transition-colors flex items-center gap-2">
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-4 h-4 rounded-full"
              />
              {token.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto overflow-x-hidden px-2 custom-scrollbar">
        {filteredTokens.map((token) => (
          <button
            key={token.symbol}
            onClick={() => {
              onSelect(token);
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors group">
            <div className="flex items-center gap-3">
              <img
                src={token.icon}
                alt={token.symbol}
                className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform"
              />
              <div className="text-left">
                <div className="font-semibold text-text-primary">{token.symbol}</div>
                <div className="text-xs text-text-secondary">{token.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-text-primary">{token.balance}</div>
              <div className="text-xs text-text-secondary">Available</div>
            </div>
          </button>
        ))}
        {filteredTokens.length === 0 && (
          <div className="text-center py-8 text-text-secondary">No tokens found</div>
        )}
      </div>
    </Modal>
  );
};
