export interface ApiResponse<T = any> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  meta: {
    timestamp: string;
  };
}