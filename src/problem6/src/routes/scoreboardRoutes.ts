import { Router } from 'express';
import { ScoreboardController } from '../controllers/scoreboardController';

const router = Router();

router.get('/top', ScoreboardController.getTopScores);
router.get('/user/:userId', ScoreboardController.getUserScore);

export default router;

