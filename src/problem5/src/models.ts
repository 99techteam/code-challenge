export interface Item {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListQuery {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export type JsonOk<T> = { success: true; data: T; message?: string };
export type JsonErr = { success: false; error: string };
