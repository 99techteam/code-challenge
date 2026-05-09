import { Button as ChakraButton } from "@chakra-ui/react";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "flip";

export type ButtonProps = Omit<
  ComponentPropsWithoutRef<typeof ChakraButton>,
  "variant" | "loading"
> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children?: ReactNode;
};

const sansFont = `"DM Sans", system-ui, sans-serif`;

const primaryCss = {
  width: "100%",
  fontFamily: sansFont,
  border: "1px solid rgba(0, 0, 0, 0.06)",
  borderRadius: "14px",
  background: "linear-gradient(135deg, #c084fc 0%, #9333ea 52%, #7c22ce 100%)",
  color: "#ffffff",
  fontWeight: 600,
  letterSpacing: "0.02em",
  padding: "0.95rem 1.25rem",
  fontSize: "0.95rem",
  boxShadow: "0 10px 32px rgba(147, 51, 234, 0.35)",
  transition:
    "opacity 0.2s ease, transform 0.22s cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 0.25s ease, filter 0.25s ease",
  _hover: {
    transform: "translateY(-3px) scale(1.015)",
    filter: "brightness(1.06)",
    boxShadow:
      "0 16px 40px rgba(147, 51, 234, 0.42), 0 6px 16px rgba(124, 34, 206, 0.25)",
  },
  _active: {
    transform: "translateY(0) scale(0.98)",
    filter: "brightness(0.97)",
    boxShadow:
      "0 6px 18px rgba(147, 51, 234, 0.28), 0 2px 6px rgba(0, 0, 0, 0.1)",
    transitionDuration: "0.1s",
  },
  _focusVisible: {
    outline: "2px solid #7c22ce",
    outlineOffset: "3px",
  },
  _disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    transform: "none",
    filter: "none",
  },
  _motionReduce: {
    transition: "none",
    _hover: { transform: "none", filter: "none" },
    _active: { transform: "none" },
  },
} as const;

const secondaryCss = {
  fontFamily: sansFont,
  borderRadius: "14px",
  border: "1px solid rgba(147, 51, 234, 0.22)",
  background: "#ffffff",
  color: "#000000",
  fontWeight: 600,
  letterSpacing: "0.02em",
  padding: "0.95rem 1.25rem",
  fontSize: "0.95rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  transition:
    "opacity 0.2s ease, transform 0.22s cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 0.25s ease, filter 0.25s ease",
  _hover: {
    borderColor: "#9333ea",
    background: "rgba(192, 132, 252, 0.1)",
  },
  _focusVisible: {
    outline: "2px solid #7c22ce",
    outlineOffset: "3px",
  },
  _disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  _motionReduce: { transition: "none" },
} as const;

const flipCss = {
  display: "grid",
  width: "44px",
  height: "44px",
  flexShrink: 0,
  placeItems: "center",
  borderRadius: "14px",
  border: "1px solid rgba(147, 51, 234, 0.22)",
  background: "linear-gradient(180deg, #ffffff, #faf5ff)",
  color: "#9333ea",
  boxShadow:
    "0 4px 14px rgba(147, 51, 234, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
  transition:
    "transform 0.28s cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 0.28s ease, border-color 0.2s ease, color 0.2s ease, background 0.25s ease",
  "& svg": {
    transformOrigin: "center",
    transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  _hover: {
    transform: "translateY(-0.5px) scale(1.07)",
    borderColor: "#9333ea",
    background: "linear-gradient(180deg, #fdf4ff, #f5e8ff)",
    color: "#7c22ce",
    boxShadow:
      "0 14px 32px rgba(147, 51, 234, 0.28), 0 6px 14px rgba(0, 0, 0, 0.08)",
    "& svg": { transform: "rotate(180deg)" },
  },
  _active: {
    transform: "translateY(0) scale(0.94)",
    boxShadow:
      "0 4px 12px rgba(147, 51, 234, 0.18), 0 2px 4px rgba(0, 0, 0, 0.06)",
    transitionDuration: "0.1s",
    "& svg": {
      transform: "rotate(180deg) scale(0.9)",
      transitionDuration: "0.12s",
    },
  },
  _focusVisible: {
    outline: "2px solid #9333ea",
    outlineOffset: "3px",
  },
  _motionReduce: {
    transition: "none",
    "& svg": { transition: "none" },
    _hover: { transform: "none", "& svg": { transform: "none" } },
    _active: { transform: "none", "& svg": { transform: "none" } },
  },
} as const;

export function Button({
  variant = "secondary",
  loading = false,
  disabled,
  children,
  type,
  "aria-busy": ariaBusy,
  css: cssProp,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const busy = loading || ariaBusy;
  const isDisabled = Boolean(disabled) || (isPrimary && Boolean(loading));

  const variantCss =
    variant === "primary"
      ? primaryCss
      : variant === "flip"
        ? flipCss
        : secondaryCss;

  return (
    <ChakraButton
      {...rest}
      type={type}
      unstyled
      cursor={isDisabled ? "not-allowed" : "pointer"}
      css={[variantCss, cssProp]}
      disabled={isDisabled}
      loading={isPrimary ? loading : false}
      aria-busy={busy === true ? true : undefined}
    >
      {children}
    </ChakraButton>
  );
}
