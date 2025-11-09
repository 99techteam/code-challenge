import { Router } from 'express';
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController';

const router = Router();

// CRUD routes
router.post('/resources', createResource);           // Create
router.get('/resources', listResources);             // List with filters
router.get('/resources/:id', getResource);           // Get by ID
router.put('/resources/:id', updateResource);        // Update
router.delete('/resources/:id', deleteResource);     // Delete

export default router;

