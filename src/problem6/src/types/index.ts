/**
 * Type definitions for the Live Scoreboard System
 */

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  userId: string;
  username: string;
  score: number;
  action: string;
  timestamp: string;
  isValidated: boolean;
}

export interface ScoreboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  lastUpdate: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateScoreRequest {
  action: string;
  scoreIncrement: number;
  timestamp: number;
  signature?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ScoreboardResponse {
  scores: ScoreboardEntry[];
  lastUpdated: string;
  totalPlayers: number;
  totalScores: number;
}

export interface DatabaseConfig {
  path: string;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  corsOrigin: string;
  maxTopScores: number;
  scoreUpdateCooldown: number;
}

export interface SocketEvents {
  "scoreboard:update": (data: ScoreboardResponse) => void;
  "scoreboard:new-score": (data: ScoreboardEntry) => void;
  "scoreboard:error": (error: string) => void;
  "user:authenticated": (user: { id: string; username: string }) => void;
  "user:unauthorized": () => void;
}

export interface ClientToServerEvents {
  authenticate: (token: string) => void;
  "update-score": (data: UpdateScoreRequest) => void;
  "join-scoreboard": () => void;
  "leave-scoreboard": () => void;
}

export interface ServerToClientEvents {
  "scoreboard:update": (data: ScoreboardResponse) => void;
  "scoreboard:new-score": (data: ScoreboardEntry) => void;
  "scoreboard:error": (error: string) => void;
  "user:authenticated": (user: { id: string; username: string }) => void;
  "user:unauthorized": () => void;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
      id?: string;
      startTime?: number;
    }
  }
}
