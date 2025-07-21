import { GetResourceByIdQuery } from '../../queries';
import { IQueryHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { Resource } from '../../../types';
import { logCqrs, logError } from '../../../utils/logger';

export class GetResourceByIdQueryHandler implements IQueryHandler<GetResourceByIdQuery, Resource | null> {
  private resourceModel = new ResourceModel();

  async handle(query: GetResourceByIdQuery): Promise<Resource | null> {
    const { id } = query;
    
    try {
      logCqrs('Executing GetResourceByIdQuery', { resourceId: id });
      const result = await this.resourceModel.findById(id);
      
      if (result) {
        logCqrs('GetResourceByIdQuery executed successfully', { resourceId: id, resourceName: result.name });
      } else {
        logCqrs('GetResourceByIdQuery: resource not found', { resourceId: id });
      }
      
      return result;
    } catch (error) {
      logError('Error in GetResourceByIdQueryHandler', error, { resourceId: id });
      throw new Error('Failed to fetch resource');
    }
  }
} 