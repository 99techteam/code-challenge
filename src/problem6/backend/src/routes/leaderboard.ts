import express from "express"
import leaderboardController from "../controllers/leaderboardController"
import { authenticateToken, optionalAuth } from "../middleware/auth"

const router = express.Router()

// GET /api/leaderboard - Get top 10 users (public endpoint with optional auth)
router.get("/", optionalAuth, leaderboardController.getLeaderboard)

export default router
