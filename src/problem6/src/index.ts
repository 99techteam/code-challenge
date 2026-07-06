export const DOC_REV = '1.0.0';
export const LAST_UPDATED = '2026-03-09';

export interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  score: number;
  rank?: number;
}

export interface PendingAction {
  actionToken: string;
  actionId: string;
  expiresAt: string;
}

export interface ScoreUpdate {
  scoreIncrement: number;
  newScore: number;
  rank: number;
  rankChange: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  updatedAt: string;
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'POST /auth/login',
    REFRESH: 'POST /auth/refresh',
    LOGOUT: 'POST /auth/logout'
  },
  ACTIONS: {
    REQUEST: 'POST /actions/request',
    COMPLETE: 'POST /actions/complete'
  },
  LEADERBOARD: {
    GET: 'GET /leaderboard',
    WEBSOCKET: 'WSS /leaderboard/live'
  },
  USERS: {
    ME: 'GET /users/me',
    SCORE: 'GET /users/me/score'
  }
};

export const CONFIG = {
  ACTION_TOKEN_EXPIRY_MS: 5 * 60 * 1000,
  JWT_EXPIRY: '1h',
  RATE_LIMITS: {
    ACTIONS_PER_MINUTE: 10,
    ACTIONS_PER_HOUR: 100,
    ACTIONS_PER_DAY: 500
  },
  LEADERBOARD: {
    TOP_N: 10,
    CACHE_TTL_SECONDS: 5
  }
};
