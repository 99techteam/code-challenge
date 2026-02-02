import { Typography, Divider } from "antd";
import { formatAmount } from "../utils/validation";
import { VALIDATION } from "../constants";

const { Text } = Typography;

interface ExchangeRateDisplayProps {
  fromToken: string;
  toToken: string;
  exchangeRate: number;
}

export const ExchangeRateDisplay: React.FC<ExchangeRateDisplayProps> = ({
  fromToken,
  toToken,
  exchangeRate,
}) => {
  return (
    <>
      <Divider />
      <div className="exchange-rate">
        <Text type="secondary">Exchange Rate</Text>
        <Text strong>
          1 {fromToken} = {formatAmount(exchangeRate, VALIDATION.RATE_DECIMALS)}{" "}
          {toToken}
        </Text>
      </div>
    </>
  );
};
