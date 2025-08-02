import { tv } from "@/utils/tv";

// Types
import type { SlotsToClasses } from "@/types/tw";
import type { VariantProps } from "tailwind-variants";

const style = tv({
  slots: {
    container: "group flex flex-col gap-2 items-start w-auto antialiased",
    wrapper: "",
    inputWrapper: "flex justify-start items-center gap-1",
    input: [
      "w-full font-normal bg-transparent outline-none placeholder:text-foreground-500 focus-visible:outline-none",
      "data-[has-start-content=true]:ps-1.5",
      "data-[has-end-content=true]:pe-1.5",
      "file:cursor-pointer file:bg-transparent file:border-0",
      "autofill:bg-transparent bg-clip-text",
    ],
    closeButton:
      "w-4 h-4 cursor-pointer text-muted-foreground hover:opacity-90 active:opacity-80",
    label: "text-body-xs",
    helper: "text-body-xs hidden group-data-[has-helper=true]:flex relative",
    errorMsg: "text-danger",
    description: "text-default-foreground",
    contentWrapper:
      "relative w-full inline-flex tap-highlight-transparent flex-row items-center shadow-sm",
    startContent: "",
    endContent: "",
  },
  variants: {
    variant: {
      flat: {
        container: "bg-transparent",
      },
      bordered: {
        container: "",
      },
      underlined: {
        container: "",
        closeButton: "",
      },
    },
    size: {
      sm: {
        container: "",
      },
      md: {
        container: "",
      },
      lg: {
        container: "",
      },
    },
    labelPlacement: {
      inside: {
        container: "",
      },
      outside: {
        container: "",
      },
    },
    isError: {
      true: {
        label: "text-danger",
      },
      false: {
        container: "",
      },
    },
  },
  defaultVariants: {
    variant: "underlined",
    size: "md",
    labelPlacement: "inside",
  },
});

export type InputSlots = keyof ReturnType<typeof style>;
export type InputClasses = SlotsToClasses<InputSlots>;
export type InputVariants = VariantProps<typeof style>;

export default style;
