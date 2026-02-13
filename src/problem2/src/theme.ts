import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        "*::before": {
          boxSizing: "border-box",
        },
        "*::after": {
          boxSizing: "border-box",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
          },
        },
      },
    },
  },
});
