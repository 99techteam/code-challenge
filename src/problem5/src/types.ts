export type ResourceStatus = "draft" | "active" | "archived";

export interface ResourceRow {
  id: number;
  title: string;
  description: string | null;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceInput {
  title: string;
  description?: string | null;
  status?: ResourceStatus;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string | null;
  status?: ResourceStatus;
}

export interface ListResourcesQuery {
  status?: ResourceStatus;
  q?: string;
  limit?: number;
  offset?: number;
}
