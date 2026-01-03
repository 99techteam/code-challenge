import { Request, Response } from 'express';
import { ScoreModel } from '../models/scoreModel';
import { ScoreboardResponse } from '../types/score';

export class ScoreboardController {
  static getTopScores(req: Request, res: Response): void {
    try {
      const topScores = ScoreModel.getTopScores(10);
      const totalPlayers = ScoreModel.getTotalPlayers();

      const response: ScoreboardResponse = {
        scores: topScores,
        totalPlayers,
      };

      res.json(response);
    } catch (error) {
      console.error('Get top scores error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static getUserScore(req: Request, res: Response): void {
    try {
      const { userId } = req.params;

      const userScore = ScoreModel.getUserScoreWithRank(userId);
      if (!userScore) {
        res.status(404).json({ error: 'User score not found' });
        return;
      }

      res.json(userScore);
    } catch (error) {
      console.error('Get user score error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
