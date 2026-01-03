import { Request, Response } from 'express';
import { ScoreModel } from '../models/scoreModel';
import { ScoreUpdateResponse } from '../types/score';
import { broadcastScoreboardUpdate } from '../websocket/websocketServer';

export class ScoreController {
  static async updateScore(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { increment } = req.body;

      const currentScore = ScoreModel.findByUserId(userId);
      const previousScore = currentScore ? currentScore.score : 0;

      const updatedScore = ScoreModel.updateScore(userId, increment);
      const newScore = updatedScore.score;

      const rank = ScoreModel.getUserRank(userId) || 0;

      const response: ScoreUpdateResponse = {
        message: 'Score updated successfully',
        userId,
        previousScore,
        newScore,
        rank,
      };

      broadcastScoreboardUpdate();

      res.json(response);
    } catch (error) {
      console.error('Score update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
