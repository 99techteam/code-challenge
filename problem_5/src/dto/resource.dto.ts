import { ResourceStatusEnum } from '../enums/resource-status.enum';
import { ResourceModel } from '../models/resource.model';

export interface CreateResourceDto {
  name?: string;
  description?: string | null;
  status?: ResourceStatusEnum;
}

export interface UpdateResourceDto {
  name?: string;
  description?: string | null;
  status?: ResourceStatusEnum;
}

export interface BatchUpdateResourceDto {
  ids?: number[];
  patch?: UpdateResourceDto;
}

export interface BatchDeleteResourceDto {
  ids?: number[];
}

export interface ListResourcesQueryDto {
  status?: string;
  name?: string;
  limit?: string;
  offset?: string;
}

export interface ResourceResponseDto {
  id: number;
  name: string;
  description: string | null;
  status: ResourceStatusEnum;
  is_archived: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListResourcesResponseDto {
  data: ResourceResponseDto[];
  count: number;
}

export function toResourceResponseDto(model: ResourceModel): ResourceResponseDto {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    status: model.status,
    is_archived: model.isArchived,
    deleted_at: model.deletedAt ? model.deletedAt.toISOString() : null,
    created_at: model.createdAt.toISOString(),
    updated_at: model.updatedAt.toISOString()
  };
}
