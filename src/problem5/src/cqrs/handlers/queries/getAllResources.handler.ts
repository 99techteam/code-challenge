import { GetAllResourcesQuery } from '../../queries';
import { IQueryHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { Resource, ResourceFilters } from '../../../types';
import { logCqrs, logError } from '../../../utils/logger';

export interface GetAllResourcesResult {
  resources: Resource[];
  total: number;
}

export class GetAllResourcesQueryHandler implements IQueryHandler<GetAllResourcesQuery, GetAllResourcesResult> {
  private resourceModel = new ResourceModel();

  async handle(query: GetAllResourcesQuery): Promise<GetAllResourcesResult> {
    const { filters } = query;
    
    try {
      logCqrs('Executing GetAllResourcesQuery', { filters });
      
      // Convert DTO to ResourceFilters format
      const resourceFilters: ResourceFilters = {
        name: filters.name,
        category: filters.category,
        isActive: filters.isActive,
        limit: filters.limit,
        offset: filters.offset
      };

      console.log('resourceFilters', resourceFilters);

      const result = await this.resourceModel.findAll(resourceFilters);
      logCqrs('GetAllResourcesQuery executed successfully', { 
        totalResources: result.total, 
        returnedCount: result.resources.length 
      });
      
      return result;
    } catch (error) {
      logError('Error in GetAllResourcesQueryHandler', error, { filters });
      throw new Error('Failed to fetch resources');
    }
  }
} 