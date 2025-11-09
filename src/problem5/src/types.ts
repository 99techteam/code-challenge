// Resource interface
export interface Resource {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Query filters for listing resources
export interface ResourceFilters {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

