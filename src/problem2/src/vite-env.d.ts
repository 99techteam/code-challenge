/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TOKEN_ICONS_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
