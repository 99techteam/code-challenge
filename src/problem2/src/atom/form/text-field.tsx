import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

// Styles to hide number input arrows (spinners)

type CommonNumberInputProps = Omit<TextFieldProps, "type">;

export const CommonNumberInput = ({ sx, ...props }: CommonNumberInputProps) => {
  return (
    <TextField
      {...props}
      type="number"
      sx={{
        // Hide arrows for Chrome, Safari, Edge, Opera
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
          {
            display: "none",
          },
        // Hide arrows for Firefox
        "& input[type=number]": {
          MozAppearance: "textfield",
        },
        ...sx, // Allow override from parent
      }}
    />
  );
};
