// import * as Select from '@radix-ui/react-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import './style.scss';

type Token = {
  currency: string;
  price: number;
};

type Props = {
  tokens: Token[];
  value: string;
  onChange: (value: string) => void;
};

export const ConSelect = ({ tokens, value, onChange }: Props) => {

  const imageSvgSrc = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${value}.svg`;

  const getImgToken = (token: string) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="token-select-trigger" aria-label="Token">
        <div className="token-select-option">
          <img
            src={imageSvgSrc}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <span>{value}</span>
        </div>
      </SelectTrigger>

      <SelectContent>
        {tokens.map((token) => (
          <SelectItem
            key={token.currency}
            value={token.currency}
          >
            <div className="token-select-option">
              <img
                src={getImgToken(token.currency)}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <span>{token.currency}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
