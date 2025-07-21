import { CreateResourceCommand } from '../../commands';
import { ICommandHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { Resource } from '../../../types';
import { logCqrs, logError } from '../../../utils/logger';

export class CreateResourceCommandHandler implements ICommandHandler<CreateResourceCommand, Resource> {
  private resourceModel = new ResourceModel();

  async handle(command: CreateResourceCommand): Promise<Resource> {
    const { data } = command;
    
    try {
      logCqrs('Executing CreateResourceCommand', { resourceName: data.name, category: data.category });
      const result = await this.resourceModel.create(data);
      logCqrs('CreateResourceCommand executed successfully', { resourceId: result.id });
      return result;
    } catch (error) {
      logError('Error in CreateResourceCommandHandler', error);
      throw new Error('Failed to create resource');
    }
  }
} 