import { GetCategoriesQuery } from '../../queries';
import { IQueryHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { logCqrs, logError } from '../../../utils/logger';

export class GetCategoriesQueryHandler implements IQueryHandler<GetCategoriesQuery, string[]> {
  private resourceModel = new ResourceModel();

  async handle(query: GetCategoriesQuery): Promise<string[]> {
    try {
      logCqrs('Executing GetCategoriesQuery');
      const result = await this.resourceModel.getCategories();
      logCqrs('GetCategoriesQuery executed successfully', { categoriesCount: result.length });
      return result;
    } catch (error) {
      logError('Error in GetCategoriesQueryHandler', error);
      throw new Error('Failed to fetch categories');
    }
  }
} 