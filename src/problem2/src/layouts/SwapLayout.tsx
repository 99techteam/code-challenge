import { SwapOutlined } from "@ant-design/icons";
import { Button, Card, message, Typography } from "antd";
import {
  TokenSelector,
  AmountInput,
  ExchangeRateDisplay,
  SwapButton,
  LoadingState,
  ErrorState,
} from "../components";
import { usePrices } from "../hooks/usePrices";
import { useSwapForm } from "../hooks/useSwapForm";
import { isValidSwapAmount, areTokensDifferent } from "../utils/validation";
import { UI_CONFIG } from "../constants";

const { Title } = Typography;

export const SwapLayout: React.FC = () => {
  const { tokens, loading, error } = usePrices();
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    exchangeRate,
    setFromToken,
    setToToken,
    handleFromAmountChange,
    handleSwapTokens,
    isSwapDisabled,
  } = useSwapForm({ tokens });

  const handleSwap = () => {
    if (!isValidSwapAmount(fromAmount)) {
      message.error("Please enter a valid amount");
      return;
    }

    if (!areTokensDifferent(fromToken, toToken)) {
      message.error("Please select different tokens");
      return;
    }

    message.success(
      `Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`,
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="app-container">
      <Card className="swap-card" bordered={false}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          <SwapOutlined /> Currency Swap
        </Title>
        <div className="swap-form">
          <div className="token-section">
            <TokenSelector
              label="From"
              value={fromToken}
              tokens={tokens}
              onChange={setFromToken}
            />
            <AmountInput
              value={fromAmount}
              onChange={handleFromAmountChange}
              suffix={fromToken}
            />
          </div>
          <SwapButton onClick={handleSwapTokens} />
          <div className="token-section">
            <TokenSelector
              label="To"
              value={toToken}
              tokens={tokens}
              onChange={setToToken}
            />
            <AmountInput value={toAmount} suffix={toToken} readOnly />
          </div>
          {exchangeRate && areTokensDifferent(fromToken, toToken) && (
            <ExchangeRateDisplay
              fromToken={fromToken}
              toToken={toToken}
              exchangeRate={exchangeRate}
            />
          )}
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSwap}
            disabled={isSwapDisabled}
            style={{ marginTop: 24, height: UI_CONFIG.BUTTON_HEIGHT }}
          >
            Swap
          </Button>
        </div>
      </Card>
    </div>
  );
};
