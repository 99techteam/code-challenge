// Import the TypeORM entity as the main Resource type
export { Resource } from '../entities/Resource.entity';
import type { Resource as ResourceType } from '../entities/Resource.entity';

// Resource filter interface for queries
export interface ResourceFilters {
  name?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// API Response interfaces
export interface ResourceResponse {
  success: boolean;
  data: ResourceType;
  message?: string;
}

export interface ResourceListResponse {
  success: boolean;
  data: {
    data: ResourceType[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ResourceDeleteResponse {
  success: boolean;
  data: { deleted: boolean };
  message: string;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
} 