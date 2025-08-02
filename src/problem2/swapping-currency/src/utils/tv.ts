import { tv as tvBase } from "tailwind-variants";
import { twMergeConfig } from "./cn";

import type { TV } from "tailwind-variants";
import type { TVConfig } from "tailwind-variants/dist/config.js";

export const tv = ((options, config) => {
  return tvBase(options, {
    ...config,
    twMerge: config?.twMerge ?? true,
    twMergeConfig: {
      ...config?.twMergeConfig,
      theme: {
        ...config?.twMergeConfig?.theme,
        ...(twMergeConfig as TVConfig['twMergeConfig']).theme,
      },
      classGroups: {
        ...config?.twMergeConfig?.classGroups,
        ...(twMergeConfig as TVConfig['twMergeConfig']).classGroups,
      },
    },
  });
}) as TV;
