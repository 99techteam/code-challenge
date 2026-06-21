import { Router } from 'express';
import { createResource, deleteResource, getResourceById, getResources, updateResource } from './resource.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createResourceSchema } from './resource.schema.js';

const router: Router = Router();

router.get('/', getResources);
router.post('/', validate(createResourceSchema),createResource);
router.get('/:id', getResourceById);         
router.put('/:id', updateResource);          
router.delete('/:id', deleteResource);        

export default router;