import FONT_SIZE from "@/themes/fontSize";
import clsx, { type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const TextUnits = Object.keys(FONT_SIZE);

export const twMergeConfig = {
  extend: {
    theme: {},
    classGroups: {
      "font-size": [{ text: TextUnits }],
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

/**
 * Merges classes using clsx and tailwind-merge
 * @returns {string}
 */
export const cn = (...classes: ClassValue[]): string =>
  twMerge(clsx(...classes));
