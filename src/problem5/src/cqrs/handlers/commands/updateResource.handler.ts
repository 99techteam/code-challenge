import { UpdateResourceCommand } from '../../commands';
import { ICommandHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { Resource } from '../../../types';
import { logCqrs, logError } from '../../../utils/logger';

export class UpdateResourceCommandHandler implements ICommandHandler<UpdateResourceCommand, Resource | null> {
  private resourceModel = new ResourceModel();

  async handle(command: UpdateResourceCommand): Promise<Resource | null> {
    const { id, data } = command;
    
    try {
      logCqrs('Executing UpdateResourceCommand', { resourceId: id, updateFields: Object.keys(data) });
      const result = await this.resourceModel.update(id, data);
      if (result) {
        logCqrs('UpdateResourceCommand executed successfully', { resourceId: id });
      } else {
        logCqrs('UpdateResourceCommand: resource not found', { resourceId: id });
      }
      return result;
    } catch (error) {
      logError('Error in UpdateResourceCommandHandler', error, { resourceId: id });
      throw new Error('Failed to update resource');
    }
  }
} 