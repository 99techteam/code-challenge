/**
 * This file now re-exports types from Zod schemas for centralized type management
 * All types are inferred from Zod schemas to ensure validation and types are always in sync
 */

export {
  Resource,
  CreateResourceDTO,
  UpdateResourceDTO,
  ResourceFilters,
  ResourceStatus,
  ResourceSchema,
  CreateResourceSchema,
  UpdateResourceSchema,
  ResourceFiltersSchema,
  ResourceIdSchema,
  ResourceStatusEnum,
} from '../schemas/resourceSchema';
