import { ICommandHandler, IQueryHandler } from '../interfaces/handler.interface';

// Command and Query types
import { CreateResourceCommand, UpdateResourceCommand, DeleteResourceCommand } from '../commands';
import { GetAllResourcesQuery, GetResourceByIdQuery, GetCategoriesQuery } from '../queries';

// Handler types
import { 
  CreateResourceCommandHandler, 
  UpdateResourceCommandHandler, 
  DeleteResourceCommandHandler 
} from '../handlers/commands';
import { 
  GetAllResourcesQueryHandler, 
  GetResourceByIdQueryHandler, 
  GetCategoriesQueryHandler,
  GetAllResourcesResult
} from '../handlers/queries';

// Type unions
type Command = CreateResourceCommand | UpdateResourceCommand | DeleteResourceCommand;
type Query = GetAllResourcesQuery | GetResourceByIdQuery | GetCategoriesQuery;

export class Mediator {
  private commandHandlers = new Map<string, ICommandHandler<any, any>>();
  private queryHandlers = new Map<string, IQueryHandler<any, any>>();

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Register command handlers
    this.commandHandlers.set(CreateResourceCommand.name, new CreateResourceCommandHandler());
    this.commandHandlers.set(UpdateResourceCommand.name, new UpdateResourceCommandHandler());
    this.commandHandlers.set(DeleteResourceCommand.name, new DeleteResourceCommandHandler());

    // Register query handlers
    this.queryHandlers.set(GetAllResourcesQuery.name, new GetAllResourcesQueryHandler());
    this.queryHandlers.set(GetResourceByIdQuery.name, new GetResourceByIdQueryHandler());
    this.queryHandlers.set(GetCategoriesQuery.name, new GetCategoriesQueryHandler());
  }

  async send<TResult>(command: Command): Promise<TResult> {
    const commandName = command.constructor.name;
    const handler = this.commandHandlers.get(commandName);

    if (!handler) {
      throw new Error(`No handler registered for command: ${commandName}`);
    }

    return await handler.handle(command) as TResult;
  }

  async query<TResult>(query: Query): Promise<TResult> {
    const queryName = query.constructor.name;
    const handler = this.queryHandlers.get(queryName);

    if (!handler) {
      throw new Error(`No handler registered for query: ${queryName}`);
    }

    return await handler.handle(query) as TResult;
  }
}

// Create and export singleton instance
export const mediator = new Mediator(); 