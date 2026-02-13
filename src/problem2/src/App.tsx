import "./App.css";
import { Grid, Skeleton, CircularProgress, Backdrop } from "@mui/material";
import { ExchangeModal, WalletCard, AppHeader } from "@components";
import { useAllPrices, useWallets } from "@api/hooks";
import { useMemo } from "react";
import { ErrorBox } from "@atom";

function App() {
  const {
    data: prices,
    isError: isPricesError,
    refetch: refetchPrices,
    error: pricesError,
  } = useAllPrices();
  const {
    data: wallets,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useWallets();

  const walletBoxes = useMemo(() => {
    if (!wallets) return null;
    return wallets.map((wallet) => (
      <Grid size={1} key={wallet.currency}>
        <WalletCard currency={wallet.currency} amount={wallet.amount} />
      </Grid>
    ));
  }, [wallets]);

  return (
    <>
      {/* header */}
      <AppHeader />

      {/* Loading overlay khi refetch */}
      <Backdrop
        open={!isLoading && isFetching}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* body */}
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 1, sm: 2, md: 4 }}
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Grid size={1} key={`skeleton-${index}`}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}

        {(isError || isPricesError) && (
          <Grid size={4}>
            {isError && <ErrorBox error={error} refetch={refetch} />}
            {isPricesError && (
              <ErrorBox error={pricesError} refetch={refetchPrices} />
            )}
          </Grid>
        )}

        {wallets && !isError && walletBoxes}
      </Grid>

      <ExchangeModal prices={prices || []} />
    </>
  );
}

export default App;
