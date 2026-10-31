import { Router } from 'express';
import {
  createResource,
  deleteResource,
  getResource,
  listResourceRecords,
  updateResource,
} from '../controllers/resource.controller.js';

export const resourceRouter = Router();

resourceRouter.post('/', createResource);
resourceRouter.get('/', listResourceRecords);
resourceRouter.get('/:id', getResource);
resourceRouter.patch('/:id', updateResource);
resourceRouter.delete('/:id', deleteResource);
