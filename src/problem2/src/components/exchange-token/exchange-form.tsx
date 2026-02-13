import type { TokenPriceType } from "@types";
import { useCallback, useEffect } from "react";
import type { useExchangeForm } from "./hooks";
import { useExchangeModal } from "@contexts";
import {
  CommonAutocomplete,
  CommonNumberInput,
  TokenAvatar,
  TokenOption,
} from "@atom";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

interface ExchangeFormProps {
  pricesMap: Record<string, TokenPriceType>;
  formData: ReturnType<typeof useExchangeForm>;
}

export const ExchangeForm = ({ pricesMap, formData }: ExchangeFormProps) => {

  const { isOpen, selectedCurrency } = useExchangeModal();

  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    formError,
    handleAmountChange,
    handleSubmit,
    swapTokens,
    handleAllToken,
    handleTokenChange,
  } = formData;

  const tokenOptions = Object.keys(pricesMap);

  const renderTokenOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement> & { key: string },
      option: string,
    ) => {
      const { key, ...rest } = props;
      return <TokenOption key={key} option={option} {...rest} />;
    },
    [],
  );

  useEffect(() => {
    // Set fromToken when modal opens with selectedCurrency
    if (isOpen && selectedCurrency) {
      handleTokenChange("fromToken", selectedCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedCurrency]);
  return (
    <Box>
      <Grid container spacing={3}>
        {/* From Section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              From{" "}
              {fromToken && (
                <Chip
                  label="Swap all"
                  sx={{ ml: 1 }}
                  onClick={handleAllToken}
                />
              )}
            </Typography>
            <CommonAutocomplete
              name="fromToken"
              label="Select Token"
              options={tokenOptions.filter((tkn) => tkn !== toToken)}
              renderOption={renderTokenOption}
              onChange={(value) => handleTokenChange("fromToken", value)}
              value={fromToken}
              error={formError?.fromToken}
              textFieldProps={{
                slotProps: {
                  input: {
                    startAdornment: fromToken && (
                      <TokenAvatar token={fromToken} />
                    ),
                  },
                },
              }}
            />
            <CommonNumberInput
              name="fromAmount"
              label="Amount"
              onChange={(e) => {
                handleAmountChange("fromAmount", e.target.value);
              }}
              error={!!formError?.fromAmount}
              helperText={formError?.fromAmount}
              value={fromAmount ?? ""}
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Stack>
        </Grid>

        {/* Swap Icon - Visual indicator only */}
        <Grid
          size={{ xs: 12, md: 2 }}
          sx={{
            display: { xs: "flex" },
            justifyContent: "center",
            alignItems: "center",
            pt: 5,
          }}
        >
          <IconButton onClick={swapTokens}>
            <SwapHorizIcon sx={{ fontSize: 32, color: "text.secondary" }} />
          </IconButton>
        </Grid>

        {/* To Section */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              To
            </Typography>
            <CommonAutocomplete
              name="toToken"
              label="Select Token"
              options={tokenOptions.filter((tkn) => tkn !== fromToken)}
              onChange={(value) => handleTokenChange("toToken", value)}
              renderOption={renderTokenOption}
              value={toToken}
              error={formError?.toToken}
              textFieldProps={{
                slotProps: {
                  input: {
                    startAdornment: toToken && <TokenAvatar token={toToken} />,
                  },
                },
              }}
            />
            <CommonNumberInput
              name="toAmount"
              label="Amount"
              value={toAmount ?? ""}
              error={!!formError?.toAmount}
              helperText={formError?.toAmount}
              onChange={(e) => {
                handleAmountChange("toAmount", e.target.value);
              }}
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Stack>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ mt: 4 }}
        onClick={() =>
          handleSubmit({
            fromToken,
            toToken,
            fromAmount: +fromAmount,
            toAmount: +toAmount,
          })
        }
      >
        Swap Tokens
      </Button>
    </Box>
  );
};
