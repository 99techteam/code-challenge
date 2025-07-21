import { Container } from 'inversify';
import { TYPES } from '../types/types';
import { IItemService } from '../interfaces/IItemService';
import { ItemService } from '../services/itemService';
import { ItemController } from '../controllers/itemController';

const container = new Container();

container.bind<IItemService>(TYPES.ItemService).to(ItemService);
container.bind<ItemController>(TYPES.ItemController).to(ItemController);

export { container };