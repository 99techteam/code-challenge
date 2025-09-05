/**
 * Application configuration for Scoreboard System
 */

import dotenv from "dotenv";
import { ServerConfig, DatabaseConfig } from "../types";

// Load environment variables
dotenv.config();

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret:
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10), // 1 minute for dev
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "1000", // 1000 requests per minute for dev
    10
  ),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  maxTopScores: parseInt(process.env.MAX_TOP_SCORES || "10", 10),
  scoreUpdateCooldown: parseInt(
    process.env.SCORE_UPDATE_COOLDOWN || "1000",
    10
  ),
};

export const databaseConfig: DatabaseConfig = {
  path: process.env.DB_PATH || "./scoreboard.sqlite",
};

export const isDevelopment = serverConfig.nodeEnv === "development";
export const isProduction = serverConfig.nodeEnv === "production";
