import { DeleteResourceCommand } from '../../commands';
import { ICommandHandler } from '../../interfaces/handler.interface';
import { ResourceModel } from '../../../models/resource';
import { logCqrs, logError } from '../../../utils/logger';

export class DeleteResourceCommandHandler implements ICommandHandler<DeleteResourceCommand, boolean> {
  private resourceModel = new ResourceModel();

  async handle(command: DeleteResourceCommand): Promise<boolean> {
    const { id } = command;
    
    try {
      logCqrs('Executing DeleteResourceCommand', { resourceId: id });
      const result = await this.resourceModel.delete(id);
      if (result) {
        logCqrs('DeleteResourceCommand executed successfully', { resourceId: id });
      } else {
        logCqrs('DeleteResourceCommand: resource not found or not deleted', { resourceId: id });
      }
      return result;
    } catch (error) {
      logError('Error in DeleteResourceCommandHandler', error, { resourceId: id });
      throw new Error('Failed to delete resource');
    }
  }
} 