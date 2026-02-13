import { Typography, Grid, Box, Button, styled } from "@mui/material";
import { useExchangeModal } from "@contexts";
import { useWallets } from "@api";

const getWalletCountText = (count: number): string => {
  if (!count) return "";
  const label = count > 1 ? "currencies" : "currency";
  return `(${count} ${label})`;
};

export const AppHeader = () => {
  const { openModal } = useExchangeModal();
  const { data: wallets } = useWallets();

  return (
    <AppHeaderStyled>
      <Grid
        container
        spacing={{ xs: 3 }}
        columns={{ xs: 1, sm: 2, md: 4 }}
        alignItems="center"
      >
        <Grid size={{ xs: 1, sm: 1, md: 2 }}>
          <Typography variant="h4" component="h1" textAlign="center">
            My Wallet {getWalletCountText(wallets?.length ?? 0)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 1, sm: 1, md: 2 }} textAlign="center">
          <Button variant="contained" onClick={() => openModal()}>
            Exchange
          </Button>
        </Grid>
      </Grid>
    </AppHeaderStyled>
  );
};

const AppHeaderStyled = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1000,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
}));
