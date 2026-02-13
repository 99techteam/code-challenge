import { Alert, Box, Button } from "@mui/material";
import { ERROR_MESSAGES } from "@common";

interface ErrorBoxProps {
  error?: Error;
  refetch?: () => void;
}

export const ErrorBox = ({ error, refetch }: ErrorBoxProps) => {
  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={
          refetch && (
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          )
        }
      >
        {ERROR_MESSAGES.FAILED_TO_LOAD}:{" "}
        {error?.message ?? ERROR_MESSAGES.UNKNOWN_ERROR}
      </Alert>
    </Box>
  );
};
