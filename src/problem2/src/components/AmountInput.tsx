import { Input, Typography } from "antd";
import { UI_CONFIG } from "../constants";

const { Text } = Typography;

interface AmountInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  readOnly?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  suffix,
  readOnly = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <Input
      size={UI_CONFIG.INPUT_SIZE}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      className="amount-input"
      suffix={suffix ? <Text type="secondary">{suffix}</Text> : undefined}
    />
  );
};
