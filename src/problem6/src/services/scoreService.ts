/**
 * Score service for managing user scores and scoreboard
 */

import { v4 as uuidv4 } from "uuid";
import { Database } from "../config/database";
import {
  Score,
  ScoreboardEntry,
  UpdateScoreRequest,
  ScoreboardResponse,
} from "../types";
import { serverConfig } from "../config";

export class ScoreService {
  private db: Database;
  private userCooldowns: Map<string, number> = new Map();

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Update user score with security checks
   */
  public async updateScore(
    userId: string,
    username: string,
    scoreData: UpdateScoreRequest
  ): Promise<Score> {
    const { action, scoreIncrement, timestamp } = scoreData;

    // Check cooldown to prevent spam
    const now = Date.now();
    const lastUpdate = this.userCooldowns.get(userId) || 0;

    if (now - lastUpdate < serverConfig.scoreUpdateCooldown) {
      throw new Error(
        "Score update too frequent. Please wait before updating again."
      );
    }

    // Validate score increment (prevent negative or suspiciously large scores)
    if (scoreIncrement <= 0 || scoreIncrement > 1000) {
      throw new Error("Invalid score increment");
    }

    // Validate timestamp (prevent replay attacks)
    const timeDiff = Math.abs(now - timestamp);
    if (timeDiff > 300000) {
      // 5 minutes tolerance
      throw new Error("Request timestamp too old");
    }

    // Get current user's total score
    const currentScoreResult = await this.db.get<{ totalScore: number }>(
      "SELECT COALESCE(SUM(score), 0) as totalScore FROM scores WHERE userId = ?",
      [userId]
    );

    const currentTotalScore = currentScoreResult?.totalScore || 0;
    const newTotalScore = currentTotalScore + scoreIncrement;

    // Create score record
    const scoreId = uuidv4();
    const score: Score = {
      id: scoreId,
      userId,
      username,
      score: scoreIncrement,
      action,
      timestamp: new Date(timestamp).toISOString(),
      isValidated: true,
    };

    // Insert score into database
    await this.db.run(
      `INSERT INTO scores (id, userId, username, score, action, timestamp, isValidated)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        scoreId,
        userId,
        username,
        scoreIncrement,
        action,
        new Date(timestamp).toISOString(),
        true,
      ]
    );

    // Update cooldown
    this.userCooldowns.set(userId, now);

    return score;
  }

  /**
   * Get top scores for scoreboard
   */
  public async getTopScores(): Promise<ScoreboardResponse> {
    const scores = await this.db.query<{
      userId: string;
      username: string;
      totalScore: number;
      lastUpdated: string;
    }>(
      `SELECT 
        userId,
        username,
        SUM(score) as totalScore,
        MAX(timestamp) as lastUpdated
       FROM scores 
       WHERE isValidated = 1
       GROUP BY userId, username
       ORDER BY totalScore DESC
       LIMIT ?`,
      [serverConfig.maxTopScores]
    );

    const scoreboardEntries: ScoreboardEntry[] = scores.map((score, index) => ({
      rank: index + 1,
      userId: score.userId,
      username: score.username,
      totalScore: score.totalScore,
      lastUpdate: score.lastUpdated,
    }));

    // Get total player count
    const totalPlayersResult = await this.db.get<{ count: number }>(
      "SELECT COUNT(DISTINCT userId) as count FROM scores WHERE isValidated = 1"
    );

    // Get total scores count
    const totalScoresResult = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM scores WHERE isValidated = 1"
    );

    return {
      scores: scoreboardEntries,
      lastUpdated: new Date().toISOString(),
      totalPlayers: totalPlayersResult?.count || 0,
      totalScores: totalScoresResult?.count || 0,
    };
  }

  /**
   * Get user's current score
   */
  public async getUserScore(userId: string): Promise<number> {
    const result = await this.db.get<{ totalScore: number }>(
      "SELECT COALESCE(SUM(score), 0) as totalScore FROM scores WHERE userId = ? AND isValidated = 1",
      [userId]
    );

    return result?.totalScore || 0;
  }

  /**
   * Get user's rank
   */
  public async getUserRank(userId: string): Promise<number> {
    const result = await this.db.get<{ rank: number }>(
      `SELECT COUNT(*) + 1 as rank
       FROM (
         SELECT userId, SUM(score) as totalScore
         FROM scores 
         WHERE isValidated = 1
         GROUP BY userId
         HAVING totalScore > (
           SELECT COALESCE(SUM(score), 0)
           FROM scores 
           WHERE userId = ? AND isValidated = 1
         )
       )`,
      [userId]
    );

    return result?.rank || 1;
  }

  /**
   * Get recent scores for a user
   */
  public async getUserRecentScores(
    userId: string,
    limit: number = 10
  ): Promise<Score[]> {
    const scores = await this.db.query<Score>(
      `SELECT * FROM scores 
       WHERE userId = ? AND isValidated = 1
       ORDER BY timestamp DESC
       LIMIT ?`,
      [userId, limit]
    );

    return scores;
  }

  /**
   * Validate score update (additional security checks)
   */
  public async validateScoreUpdate(
    userId: string,
    scoreData: UpdateScoreRequest
  ): Promise<boolean> {
    // Check if user exists and is active
    const user = await this.db.get<{ id: string }>(
      "SELECT id FROM users WHERE id = ? AND isActive = 1",
      [userId]
    );

    if (!user) {
      return false;
    }

    // Additional validation logic can be added here
    // For example: checking for suspicious patterns, rate limiting, etc.

    return true;
  }

  /**
   * Get score statistics
   */
  public async getScoreStatistics(): Promise<{
    totalScores: number;
    totalPlayers: number;
    averageScore: number;
    highestScore: number;
  }> {
    const stats = await this.db.get<{
      totalScores: number;
      totalPlayers: number;
      averageScore: number;
      highestScore: number;
    }>(
      `SELECT 
        COUNT(*) as totalScores,
        COUNT(DISTINCT userId) as totalPlayers,
        AVG(score) as averageScore,
        MAX(score) as highestScore
       FROM scores 
       WHERE isValidated = 1`
    );

    return {
      totalScores: stats?.totalScores || 0,
      totalPlayers: stats?.totalPlayers || 0,
      averageScore: Math.round(stats?.averageScore || 0),
      highestScore: stats?.highestScore || 0,
    };
  }
}
