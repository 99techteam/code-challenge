import type { ComponentPropsWithoutRef, ElementType } from "react";

export type As<Props = unknown> = ElementType<Props>;
export type PropsOf<T extends As> = ComponentPropsWithoutRef<T> & {
  as?: T;
};
export type ComponentProps<T extends As = "div", OmitKeys extends keyof unknown = never> = Omit<
  PropsOf<T>,
  "ref" | "color" | "slot" | "size" | "defaultChecked" | "defaultValue" | OmitKeys
> & {
  as?: As;
};

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
