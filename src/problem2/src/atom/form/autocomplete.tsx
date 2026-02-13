import { Autocomplete, TextField } from "@mui/material";
import type { AutocompleteProps, TextFieldProps } from "@mui/material";
import type { Ref } from "react";

const HELPER_TEXT_PLACEHOLDER = " "; // Preserve field height when no error

type CommonAutocompleteProps<T> = {
  name: string;
  label?: string;
  textFieldProps?: Omit<TextFieldProps, "label">;
  onChange?: (value: T | null) => void;
  error?: string;
  ref?: Ref<HTMLInputElement>;
} & Omit<AutocompleteProps<T, false, false, false>, "renderInput" | "onChange">;

export const CommonAutocomplete = <T,>({
  label,
  textFieldProps,
  onChange,
  error,
  ref,
  ...props
}: CommonAutocompleteProps<T>) => {
  return (
    <Autocomplete
      {...props}
      onChange={(_, newValue) => onChange?.(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          label={label}
          inputRef={ref}
          error={!!error}
          helperText={error || HELPER_TEXT_PLACEHOLDER}
          fullWidth
          slotProps={{
            input: {
              ...params.InputProps,
              ...textFieldProps?.slotProps?.input,
            },
          }}
        />
      )}
    />
  );
};
