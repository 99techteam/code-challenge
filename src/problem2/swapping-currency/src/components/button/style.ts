import { tv } from "@/utils/tv";
import type { VariantProps } from "tailwind-variants";

const solid = {
  primary: "bg-brand text-brand-foreground",
  secondary: "!bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
};

const bordered = {
  primary: "bg-transparent border-brand text-brand",
  secondary: "bg-transparent border-secondary text-secondary",
  success: "bg-transparent border-success text-success",
  warning: "bg-transparent border-warning text-warning",
  danger: "bg-transparent border-danger text-danger",
};

const flat = {
  primary: "bg-brand/10 text-brand",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

const light = {
  primary: "bg-transparent text-brand",
  secondary: "bg-transparent text-secondary",
  success: "bg-transparent text-success",
  warning: "bg-transparent text-warning",
  danger: "bg-transparent text-danger",
};

const ghost = {
  primary: "border-brand text-brand",
  secondary: "border-secondary text-secondary",
  success: "border-success text-success",
  warning: "border-warning text-warning",
  danger: "border-danger text-danger",
};

const text = {
  primary: "bg-transparent text-brand",
  secondary: "bg-transparent text-secondary",
  success: "bg-transparent text-success",
  warning: "bg-transparent text-warning",
  danger: "bg-transparent text-danger",
};

export const colorVariants = {
  solid,
  bordered,
  flat,
  light,
  ghost,
  text,
};

/**
 * Button wrapper **Tailwind Variants** component
 *
 * const classNames = button({...})
 *
 * @example
 * <button
 *  className={classNames())}
 *  data-pressed={true/false}
 *  data-hover={true/false}
 *  data-focus={true/false}
 *  data-focus-visible={true/false}
 * >
 *   Button
 * </button>
 */
const style = tv({
  base: [
    "z-0",
    "group",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "box-border",
    "appearance-none",
    "outline-none",
    "select-none",
    "whitespace-nowrap",
    "min-w-max",
    "font-semibold",
    "antialiased",
    "overflow-hidden",
    "tap-highlight-transparent",
    "active:scale-[0.97]",
  ],
  variants: {
    variant: {
      solid: "",
      bordered: "border-[1px] bg-transparent",
      light: "bg-transparent",
      flat: "",
      ghost: "border-medium bg-transparent",
      text: "bg-transparent",
    },
    size: {
      sm: "px-3 min-w-16 h-8 text-tiny gap-2 rounded",
      md: "px-4 min-w-20 h-10 text-small gap-2 rounded-md",
      lg: "px-6 min-w-24 h-12 text-medium gap-3 rounded-lg",
    },
    theme: {
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      danger: "",
    },
    fullWidth: {
      true: "w-full",
    },
    disabled: {
      true: "opacity-70 cursor-not-allowed active:scale-100",
    },
    isIconOnly: {
      true: "px-0 !gap-0",
      false: "[&>svg]:max-w-[theme(spacing.8)]",
    },
    disableAnimation: {
      true: "!transition-none data-[pressed=true]:scale-100",
      false:
        "transition-transform-colors-opacity motion-reduce:transition-none",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "solid",
    theme: "primary",
    fullWidth: false,
    disabled: false,
    isIconOnly: false,
  },
  compoundVariants: [
    // solid / color
    {
      variant: "solid",
      theme: "primary",
      class: colorVariants.solid.primary,
    },
    {
      variant: "solid",
      theme: "secondary",
      class: colorVariants.solid.secondary,
    },
    {
      variant: "solid",
      theme: "success",
      class: colorVariants.solid.success,
    },
    {
      variant: "solid",
      theme: "warning",
      class: colorVariants.solid.warning,
    },
    {
      variant: "solid",
      theme: "danger",
      class: colorVariants.solid.danger,
    },
    // bordered / color
    {
      variant: "bordered",
      theme: "primary",
      class: colorVariants.bordered.primary,
    },
    {
      variant: "bordered",
      theme: "secondary",
      class: colorVariants.bordered.secondary,
    },
    {
      variant: "bordered",
      theme: "success",
      class: colorVariants.bordered.success,
    },
    {
      variant: "bordered",
      theme: "warning",
      class: colorVariants.bordered.warning,
    },
    {
      variant: "bordered",
      theme: "danger",
      class: colorVariants.bordered.danger,
    },
    // flat / color
    {
      variant: "flat",
      theme: "primary",
      class: colorVariants.flat.primary,
    },
    {
      variant: "flat",
      theme: "secondary",
      class: colorVariants.flat.secondary,
    },
    {
      variant: "flat",
      theme: "success",
      class: colorVariants.flat.success,
    },
    {
      variant: "flat",
      theme: "warning",
      class: colorVariants.flat.warning,
    },
    {
      variant: "flat",
      theme: "danger",
      class: colorVariants.flat.danger,
    },
    // light / color
    {
      variant: "light",
      theme: "primary",
      class: [colorVariants.light.primary, "hover:bg-brand/20"],
    },
    {
      variant: "light",
      theme: "secondary",
      class: [colorVariants.light.secondary, "hover:bg-secondary/20"],
    },
    {
      variant: "light",
      theme: "success",
      class: [colorVariants.light.success, "hover:bg-success/20"],
    },
    {
      variant: "light",
      theme: "warning",
      class: [colorVariants.light.warning, "hover:bg-warning/20"],
    },
    {
      variant: "light",
      theme: "danger",
      class: [colorVariants.light.danger, "hover:bg-danger/20"],
    },
    // ghost / color
    {
      variant: "ghost",
      theme: "primary",
      class: [
        colorVariants.ghost.primary,
        "hover:!bg-brand hover:!text-brand-foreground",
      ],
    },
    {
      variant: "ghost",
      theme: "secondary",
      class: [
        colorVariants.ghost.secondary,
        "hover:!bg-secondary hover:!text-secondary-foreground",
      ],
    },
    {
      variant: "ghost",
      theme: "success",
      class: [
        colorVariants.ghost.success,
        "hover:!bg-success hover:!text-success-foreground",
      ],
    },
    {
      variant: "ghost",
      theme: "warning",
      class: [
        colorVariants.ghost.warning,
        "hover:!bg-warning hover:!text-warning-foreground",
      ],
    },
    {
      variant: "ghost",
      theme: "danger",
      class: [
        colorVariants.ghost.danger,
        "hover:!bg-danger hover:!text-danger-foreground",
      ],
    },

    // text / color
    {
      variant: "text",
      theme: "primary",
      class: colorVariants.text.primary,
    },
    {
      variant: "text",
      theme: "secondary",
      class: colorVariants.text.secondary,
    },
    {
      variant: "text",
      theme: "success",
      class: colorVariants.text.success,
    },
    {
      variant: "text",
      theme: "warning",
      class: colorVariants.text.warning,
    },
    {
      variant: "text",
      theme: "danger",
      class: colorVariants.text.danger,
    },
    // isInGroup / bordered / ghost
    {
      isIconOnly: true,
      size: "sm",
      class: "min-w-8 w-8 h-8",
    },
    {
      isIconOnly: true,
      size: "md",
      class: "min-w-10 w-10 h-10",
    },
    {
      isIconOnly: true,
      size: "lg",
      class: "min-w-12 w-12 h-12",
    },
    // variant / hover
    {
      variant: ["solid", "flat", "bordered", "text"],
      class: "hover:opacity-hover",
    },
  ],
});

export type ButtonVariantProps = VariantProps<typeof style>;

export default style;
