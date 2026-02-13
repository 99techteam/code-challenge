import {
  Box,
  styled,
  Typography,
  IconButton,
  Modal,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { type TokenPriceType } from "@types";
import { useMemo, useEffect } from "react";
import { getLatestPricesMap, formatCurrencyAmount } from "@common";
import { useExchangeForm } from "./hooks";
import { useExchangeModal } from "@contexts";
import { ExchangeForm } from "./exchange-form";

interface ExchangeModalProps {
  prices: TokenPriceType[];
}

export const ExchangeModal = ({ prices }: ExchangeModalProps) => {
  const pricesMap = useMemo(() => getLatestPricesMap(prices), [prices]);
  const { isOpen, closeModal } = useExchangeModal();

  const exchangeForm = useExchangeForm(pricesMap, () => closeModal());
  const { fromToken, isPending, resetForm, ballance } = exchangeForm;

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  return (
    <Modal
      open={isOpen}
      onClose={isPending ? undefined : closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ExchangeStyled>
        {isPending && (
          <LoadingOverlay>
            <CircularProgress />
          </LoadingOverlay>
        )}

        <CloseIconButton onClick={closeModal} disabled={isPending}>
          <CloseIcon />
        </CloseIconButton>

        <ModalContainer>
          <Typography variant="h5" component="h2" gutterBottom>
            Swap Tokens
          </Typography>
          {fromToken && (
            <Typography variant="body1" gutterBottom>
              Current {fromToken} balance: {formatCurrencyAmount(ballance)}
            </Typography>
          )}
          <ExchangeForm pricesMap={pricesMap} formData={exchangeForm} />
        </ModalContainer>
      </ExchangeStyled>
    </Modal>
  );
};

const ExchangeStyled = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "100%",
  maxWidth: "800px",
  maxHeight: "90vh",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("md")]: {
    width: "100vw",
    height: "100vh",
    maxWidth: "none",
    maxHeight: "none",
    top: 0,
    left: 0,
    transform: "none",
    borderRadius: 0,
    padding: theme.spacing(4),
    overflow: "auto",
  },
}));

const CloseIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  top: theme.spacing(1),
  color: theme.palette.grey[500],
  zIndex: 1,
  display: "flex",
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const ModalContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flex: 1,
});

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    borderRadius: 0,
  },
}));
