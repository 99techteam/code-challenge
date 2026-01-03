import { Router } from 'express';
import { ScoreController } from '../controllers/scoreController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateScoreUpdate } from '../middleware/validationMiddleware';

const router = Router();

router.post(
  '/update',
  authenticateToken,
  validateScoreUpdate,
  ScoreController.updateScore
);

export default router;

