/**
 * Score controller for scoreboard and score management
 */

import { Request, Response } from "express";
import { ScoreService } from "../services/scoreService";
import { ApiResponse, UpdateScoreRequest } from "../types";

export class ScoreController {
  private scoreService: ScoreService;

  constructor(scoreService: ScoreService) {
    this.scoreService = scoreService;
  }

  /**
   * Get top scores (scoreboard)
   * GET /api/scores/scoreboard
   */
  public getScoreboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const scoreboard = await this.scoreService.getTopScores();

      const response: ApiResponse<typeof scoreboard> = {
        success: true,
        message: "Scoreboard retrieved successfully",
        data: scoreboard,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve scoreboard",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Update user score
   * POST /api/scores/update
   */
  public updateScore = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const scoreData: UpdateScoreRequest = req.body;
      const score = await this.scoreService.updateScore(
        req.user.id,
        req.user.username,
        scoreData
      );

      const response: ApiResponse<typeof score> = {
        success: true,
        message: "Score updated successfully",
        data: score,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to update score",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(400).json(response);
    }
  };

  /**
   * Get user's current score
   * GET /api/scores/my-score
   */
  public getMyScore = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const score = await this.scoreService.getUserScore(req.user.id);
      const rank = await this.scoreService.getUserRank(req.user.id);

      const response: ApiResponse<{
        totalScore: number;
        scoreCount: number;
        lastUpdate: string;
        rank: number;
        username: string;
      }> = {
        success: true,
        message: "Score retrieved successfully",
        data: {
          totalScore: score,
          scoreCount: 0, // This would need to be calculated
          lastUpdate: new Date().toISOString(),
          rank,
          username: req.user.username,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve score",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get user's recent scores
   * GET /api/scores/my-recent
   */
  public getMyRecentScores = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const scores = await this.scoreService.getUserRecentScores(
        req.user.id,
        limit
      );

      const response: ApiResponse<typeof scores> = {
        success: true,
        message: "Recent scores retrieved successfully",
        data: scores,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve recent scores",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get score statistics
   * GET /api/scores/statistics
   */
  public getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.scoreService.getScoreStatistics();

      const response: ApiResponse<typeof stats> = {
        success: true,
        message: "Statistics retrieved successfully",
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };
}
