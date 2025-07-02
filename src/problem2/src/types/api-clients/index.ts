import type { AxiosRequestConfig } from "axios";

export interface RequestOptions extends AxiosRequestConfig {
  customBaseURL?: string;
  isSecure?: boolean;
  noCleanProps?: boolean;
}