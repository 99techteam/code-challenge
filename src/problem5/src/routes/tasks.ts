import { Router } from 'express';
import * as taskController from '../controllers/tasks';

const router = Router();

router.post('/', taskController.asyncHandler(taskController.createTask));
router.get('/', taskController.asyncHandler(taskController.listTasks));
router.get('/:id', taskController.asyncHandler(taskController.getTask));
router.put('/:id', taskController.asyncHandler(taskController.updateTask));
router.delete('/:id', taskController.asyncHandler(taskController.deleteTask));

export default router;