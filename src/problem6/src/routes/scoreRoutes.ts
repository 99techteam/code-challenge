/**
 * Score routes
 */

import { Router } from "express";
import { ScoreController } from "../controllers/scoreController";
import { ScoreService } from "../services/scoreService";
import { AuthService } from "../services/authService";
import { Database } from "../config/database";
import { AuthMiddleware } from "../middleware/auth";
import { validateBody, validateQuery } from "../validation";
import { updateScoreSchema } from "../validation/schemas";
import { scoreUpdateRateLimit } from "../middleware";

export function createScoreRoutes(database: Database): Router {
  const router = Router();
  const scoreService = new ScoreService(database);
  const authService = new AuthService(database);
  const authMiddleware = new AuthMiddleware(authService);
  const scoreController = new ScoreController(scoreService);

  /**
   * @route   GET /api/scores/scoreboard
   * @desc    Get top scores (scoreboard)
   * @access  Public
   */
  router.get("/scoreboard", scoreController.getScoreboard);

  /**
   * @route   GET /api/scores/statistics
   * @desc    Get score statistics
   * @access  Public
   */
  router.get("/statistics", scoreController.getStatistics);

  /**
   * @route   POST /api/scores/update
   * @desc    Update user score
   * @access  Private
   */
  router.post(
    "/update",
    scoreUpdateRateLimit,
    authMiddleware.authenticate,
    validateBody(updateScoreSchema),
    scoreController.updateScore
  );

  /**
   * @route   GET /api/scores/my-score
   * @desc    Get user's current score and rank
   * @access  Private
   */
  router.get(
    "/my-score",
    authMiddleware.authenticate,
    scoreController.getMyScore
  );

  /**
   * @route   GET /api/scores/my-recent
   * @desc    Get user's recent scores
   * @access  Private
   */
  router.get(
    "/my-recent",
    authMiddleware.authenticate,
    scoreController.getMyRecentScores
  );

  return router;
}
