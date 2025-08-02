import { forwardRef } from "react";


// Styles
import style from "./style";

// Types
import type { ReactNode } from "react";
import type { ButtonVariantProps } from "./style";
import type { As, ComponentProps } from "@/types/apps/misc";

export type ButtonProps<C extends As = "button"> = ComponentProps<C> &
  ButtonVariantProps & {
    children?: ReactNode;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props: ButtonProps, ref) => {
    const {
      className: classNameProp,
      variant,
      theme,
      isIconOnly,
      size,
      disabled,
      disableAnimation,
      fullWidth,
      as,
      children,
      ...rest
    } = props

    const className = style({
      className: classNameProp,
      variant: variant ?? "solid",
      theme: theme ?? "primary",
      isIconOnly: isIconOnly ?? false,
      size: size ?? "md",
      disabled: disabled ?? false,
      disableAnimation: disableAnimation ?? false,
      fullWidth: fullWidth ?? false,
    });

    const Component = as ?? "button";

    return (
      <Component {...rest} className={className} ref={ref}>
        {children}
      </Component>
    );
  }
);

export default Button;
