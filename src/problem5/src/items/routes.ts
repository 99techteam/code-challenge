import { Router } from 'express';
import { handleCreate, handleDelete, handleGet, handleList, handleUpdate } from './handlers';

const router = Router();

router.post('/resources', handleCreate);
router.get('/resources', handleList);
router.get('/resources/:id', handleGet);
router.put('/resources/:id', handleUpdate);
router.delete('/resources/:id', handleDelete);

export default router;
