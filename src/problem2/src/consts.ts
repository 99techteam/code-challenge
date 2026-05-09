/// <reference types="vite/client" />

/** Augment Vite env for optional app overrides. */
interface ImportMetaEnv {
  readonly VITE_PRICES_URL?: string;
  readonly VITE_TOKEN_ICONS_BASE_URL?: string;
}

function viteEnvString(key: keyof ImportMetaEnv): string | undefined {
  const v = import.meta.env[key];
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

/** Token price JSON. Override with `VITE_PRICES_URL` in `src/problem2/with-react/.env`. */
export const PRICES_URL =
  viteEnvString("VITE_PRICES_URL") ??
  "https://interview.switcheo.com/prices.json";

/**
 * Base URL for token SVGs (no trailing slash). Override with `VITE_TOKEN_ICONS_BASE_URL`
 * in `src/problem2/with-react/.env`.
 */
export const TOKEN_ICONS_BASE_URL =
  viteEnvString("VITE_TOKEN_ICONS_BASE_URL")?.replace(/\/+$/, "") ??
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const COMMON_UI_STYLES = {
  focusWithinRing: {
    borderColor: "#9333ea",
    boxShadow: "0 0 0 3px rgba(147, 51, 234, 0.28)",
  },
  gridCss: {
    display: "grid",
    minHeight: 0,
    gridTemplateColumns: "1fr",
    gap: "0.65rem",
    alignItems: "stretch",
    "& > div": { minHeight: 0 },
    "@media (min-width: 421px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.15fr)",
    },
  },
};
