import { TokenAvatar } from "@atom";
import { formatCurrencyAmount } from "@common";
import { useExchangeModal } from "@contexts";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import React, { useCallback } from "react";

interface WalletCardProps {
  currency: string;
  amount: number;
}

export const WalletCard = React.memo(
  ({ currency, amount }: WalletCardProps) => {
    const { openModal } = useExchangeModal();

    const handleExchangeClick = useCallback(() => {
      openModal(currency);
    }, [openModal, currency]);

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TokenAvatar token={currency} size={40} />
            <Typography variant="h6">{currency}</Typography>
          </Box>
          <Typography variant="body2">
            Your current balance in the wallet
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {formatCurrencyAmount(amount)} {currency}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleExchangeClick}>
            Exchange Now
          </Button>
        </CardActions>
      </Card>
    );
  },
);

WalletCard.displayName = "WalletCard";
