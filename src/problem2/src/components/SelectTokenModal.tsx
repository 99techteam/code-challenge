import { Avatar, Input } from "@mui/material";
import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import type { TokenWithIcon } from "types/token";
import { getTokenIcon } from "utils/common";
import CheckIcon from '@mui/icons-material/Check';

interface Props {
  open: boolean;
  onClose: () => void;
  onTokenSelect: (token: TokenWithIcon) => void;
  data: TokenWithIcon[];
  current: TokenWithIcon | null;
}

export function TokenSelectModal(props: Props) {
  const [searchToken, setSearchToken] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<TokenWithIcon[]>([]);

  const handleSelectToken = (token: TokenWithIcon, icon: string) => {
    props.onTokenSelect({
      ...token,
      iconUrl: icon
    })
    setSearchToken('');
  }

  useEffect(() => {
    if (searchToken) {
      const filtered = props.data.filter(token =>
        token.currency.toLowerCase().includes(searchToken.toLowerCase())
      );
      setFilteredTokens(filtered);
    } else {
      setFilteredTokens(props.data);
    }
  }, [searchToken, props.data]);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select a token</h2>
            <button onClick={props.onClose}>×</button>
          </div>

          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
          />
          {/* token popular */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {['ETH', 'USDC', 'LUNA', 'WBTC', 'ATOM'].map((symbol) => {
              const token = props.data.find(t => t.currency === symbol);
              const tokenIcon = getTokenIcon(token?.currency ?? "");
              return token ? (
                <button
                  key={symbol}
                  onClick={() => handleSelectToken(token, tokenIcon)}
                  className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Avatar alt={symbol} src={tokenIcon}><span className="text-xs">{symbol}</span></Avatar>

                </button>
              ) : null;
            })}
          </div>

          <div className="mb-2 text-sm text-gray-500">Tokens by 24H volume</div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTokens.map((token) => {
              const tokenIcon = getTokenIcon(token?.currency ?? "");
              return (
                <button
                  key={token.currency}
                  onClick={() => handleSelectToken(token, tokenIcon)}
                  className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg"
                >
                  <Avatar alt={token.currency.toUpperCase()} src={tokenIcon} />
                  <div className="text-left ml-1">
                    <div className="font-medium">{token.currency}</div>
                    <div className="text-xs text-gray-500">
                      {token.currency === 'ETH' ? 'Ethereum' :
                        token.currency === 'USDC' ? 'USDC' :
                          token.currency === 'USDT' ? 'Tether' :
                            token.currency === 'BNB' ? 'Binance Coin' : token.currency}
                    </div>
                  </div>
                  {props.current?.currency === token.currency ? <CheckIcon className="ml-auto text-green-500 w-full justify-end" /> : null}

                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}