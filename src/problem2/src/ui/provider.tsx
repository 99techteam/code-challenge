"use client";

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";

const dmSans = '"DM Sans", system-ui, sans-serif';
const jetBrainsMono = '"JetBrains Mono", ui-monospace, monospace';

const swapPalette = {
  brand: "#9333ea",
  brandDeep: "#7c22ce",
  brandSoft: "#c084fc",
  brandSoftBg: "rgba(192, 132, 252, 0.18)",
  brandRing: "rgba(147, 51, 234, 0.28)",
  ink: "#000000",
  inkSubtle: "#404040",
  inkMuted: "#737373",
  surface: "#ffffff",
  surfaceElevated: "#fafafa",
  surfaceTint: "rgba(192, 132, 252, 0.1)",
  line: "rgba(0, 0, 0, 0.08)",
  lineStrong: "rgba(147, 51, 234, 0.22)",
  danger: "#dc2626",
  dangerBg: "rgba(220, 38, 38, 0.08)",
} as const;

const swapColors = Object.fromEntries(
  Object.entries(swapPalette).map(([k, v]) => [k, { value: v }])
) as Record<keyof typeof swapPalette, { value: string }>;

/**
 * Full scale for `colorPalette="brand"` on Chakra components (buttons, badges, etc.).
 * Anchored to the same purples as `swapPalette` / pure-js.
 */
const brandScale = {
  50: { value: "#faf5ff" },
  100: { value: "#f3e8ff" },
  200: { value: "#e9d5ff" },
  300: { value: "#d8b4fe" },
  400: { value: "#c084fc" },
  500: { value: "#a855f7" },
  600: { value: "#9333ea" },
  700: { value: "#7c22ce" },
  800: { value: "#5b1899" },
  900: { value: "#3d0f6b" },
  950: { value: "#200838" },
} as const;

/**
 * Chakra design system for the swap UI: fonts + 99TECH brand colors (pure-js parity).
 */
export const swapSystem = createSystem(
  defaultConfig,
  defineConfig({
    theme: {
      tokens: {
        fonts: {
          body: { value: dmSans },
          heading: { value: dmSans },
          mono: { value: jetBrainsMono },
        },
        colors: {
          swap: swapColors,
          brand: brandScale,
        },
        radii: {
          "swap-lg": { value: "20px" },
          "swap-md": { value: "14px" },
          "swap-def": { value: "12px" },
        },
        borders: {
          "swap-def": { value: "1px solid rgba(0, 0, 0, 0.08)" },
          "swap-strong": { value: "1px solid rgba(147, 51, 234, 0.22)" },
        },
        shadows: {
          "swap-lg": {
            value:
              "0 24px 48px -12px rgba(147, 51, 234, 0.18), 0 8px 16px rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
    globalCss: {
      html: {
        colorScheme: "light",
      },
      body: {
        fontFamily: "body",
        fontOpticalSizing: "auto",
        color: "swap.ink",
      },
    },
  })
);

export const UIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ChakraProvider value={swapSystem}>{children}</ChakraProvider>;
};
