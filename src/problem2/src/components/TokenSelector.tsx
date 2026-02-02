import { Select, Space, Typography } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { EXTERNAL_RESOURCES, UI_CONFIG } from "../constants";
import type { Token } from "../types";

const { Text } = Typography;

interface TokenSelectorProps {
  label: string;
  value: string;
  tokens: Token[];
  onChange: (value: string) => void;
}

interface TokenOption {
  value: string;
  label: React.ReactNode;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  label,
  value,
  tokens,
  onChange,
}) => {
  const getTokenOption = (token: Token) => ({
    value: token.currency,
    label: (
      <Space>
        <img
          src={token.imageUrl}
          alt={token.currency}
          style={{ width: 24, height: 24 }}
          onError={(e) => {
            e.currentTarget.src = EXTERNAL_RESOURCES.FALLBACK_ICON;
          }}
        />
        <span>{token.currency}</span>
      </Space>
    ),
  });

  const filterOption = (input: string, option?: TokenOption) => {
    if (!option?.value) return false;
    return (option.value as string).toLowerCase().includes(input.toLowerCase());
  };

  return (
    <>
      <Text type="secondary">{label}</Text>
      <Select
        size={UI_CONFIG.INPUT_SIZE as SizeType}
        style={{ width: "100%", marginTop: 8, marginBottom: 12 }}
        value={value}
        onChange={onChange}
        options={tokens.map(getTokenOption)}
        showSearch
        filterOption={filterOption}
      />
    </>
  );
};
