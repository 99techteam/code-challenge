import { Router } from 'express';
import { BookController } from '../controllers/bookController';

const router = Router();
const bookController = new BookController();

router.post('/', bookController.create);
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);
router.put('/:id', bookController.update);
router.delete('/:id', bookController.delete);

export default router; 