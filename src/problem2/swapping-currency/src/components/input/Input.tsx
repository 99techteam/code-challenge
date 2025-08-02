import { forwardRef, useMemo, useState } from "react";

// Styles
import { cn } from "@/utils/cn";
import style from "./style";

// Hooks
import { useControlledState } from "@/hooks/useControlledState";
import { useFocusWithin } from "@/hooks/useFocusWithin";

// Types
import type { ReactNode, RefObject } from "react";
import type { ComponentProps } from "@/types/misc";
import type { InputClasses, InputVariants } from "./style";

export type InputProps<Component extends "input" | "textarea" = "input"> =
  ComponentProps<Component> &
    InputVariants & {
      as?: Component;
      placeholder?: string; // Placeholder text when no option is selected.
      label?: ReactNode; // Label text.
      description?: ReactNode; // Description text.
      startContent?: ReactNode; // Start content.
      endContent?: ReactNode; // End content.
      allowClear?: boolean; // Allow clear content.
      errorMsg?: string; // Error message.
      className?: string; // Additional CSS classes for the main button.
      classNames?: InputClasses; // Additional CSS classes for specific slots.
      onValueChange?: (value: string) => void;
      defaultValue?: string;
    };

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      onValueChange,
      defaultValue,
      value,
      label,
      description,
      startContent,
      endContent,
      allowClear = true,
      className,
      classNames,
      isError = false,
      errorMsg,
      variant = "flat",
      size = "md",
      labelPlacement = "inside",
      ...props
    },
    ref
  ) => {
    const [internalValue, setValue] = useControlledState({
      defaultValue: defaultValue,
      value: value,
      onChange: onValueChange,
    });

    const [focus, setFocus] = useState<boolean>(false);

    const {
      focusWithinProps: { onFocus, onBlur },
    } = useFocusWithin({
      onFocusWithin() {
        setFocus(true);
      },
      onBlurWithin() {
        setFocus(false);
      },
    });

    const slots = useMemo(
      () =>
        style({
          size: size,
          variant: variant,
          labelPlacement: labelPlacement,
          isError,
        }),
      [size, variant, labelPlacement, isError]
    );

    // LABEL
    const labelContent = label ? (
      <label className={cn(slots.label(), classNames?.label)}>{label}</label>
    ) : null;

    // HELPER
    const helper = useMemo(() => {
      if (isError && errorMsg) {
        return (
          <div
            className={cn(
              slots.helper(),
              slots.errorMsg(),
              classNames?.helper,
              classNames?.errorMsg
            )}
          >
            {errorMsg}
          </div>
        );
      }
      if (description) {
        return (
          <div
            className={cn(
              slots.helper(),
              slots.description(),
              classNames?.helper,
              classNames?.description
            )}
          >
            {description}
          </div>
        );
      }
      return null;
    }, [
      slots,
      isError,
      errorMsg,
      description,
      classNames?.helper,
      classNames?.errorMsg,
      classNames?.description,
    ]);

    // END CONTENT
    const end = useMemo(() => {
      return internalValue && allowClear ? (
        <span
          className={cn(slots.closeButton(), classNames?.closeButton)}
          onClick={() => setValue("")}
        >
          x
        </span>
      ) : (
        endContent
      );
    }, [
      internalValue,
      allowClear,
      slots,
      classNames?.closeButton,
      endContent,
      setValue,
    ]);

    const displayContent = useMemo(() => {
      const Component = props?.as ?? "input";

      return (
        <div
          {...props}
          className={cn(
            slots?.contentWrapper({
              class: classNames?.contentWrapper,
            }),
            className
          )}
        >
          <div
            className={cn(
              slots?.inputWrapper({
                class: classNames?.inputWrapper,
              })
            )}
          >
            {startContent}

            <Component
              className={cn(slots?.input(), classNames?.input)}
              value={internalValue}
              onChange={(e) => setValue(e.target.value)}
              ref={ref as RefObject<HTMLInputElement>}
              {...props}
            />
          </div>
          {end}
        </div>
      );
    }, [
      props,
      className,
      classNames?.contentWrapper,
      classNames?.inputWrapper,
      classNames?.input,
      startContent,
      slots,
      internalValue,
      ref,
      end,
      setValue,
    ]);

    return (
      <div
        className={cn(slots?.container(), classNames?.container)}
        onFocus={onFocus}
        onBlur={onBlur}
        data-focus={focus}
        data-has-end-content={!!endContent}
        data-has-start-content={!!startContent}
        data-has-helper={!!(description || errorMsg)}
      >
        {labelContent}
        {displayContent}
        {helper}
      </div>
    );
  }
);

export default Input;
