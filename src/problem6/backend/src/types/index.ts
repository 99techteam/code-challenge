import { Request } from "express"
import { Socket } from "socket.io"
import { User as PrismaUser, UserAction as PrismaUserAction } from "@prisma/client"

// Export Prisma types
export type User = PrismaUser
export type UserAction = PrismaUserAction

// Derived types from Prisma models
export type UserPublic = Omit<User, "passwordHash">

// Input types for API
export interface UserRegistration {
  email: string
  password: string
  username: string
}

export interface UserLogin {
  email: string
  password: string
}

// Auth related types
export interface AuthResponse {
  success: boolean
  user: UserPublic
  token: string
  message?: string
}

export interface JWTPayload {
  userId: number
  iat?: number
  exp?: number
}

// Score and Action related types
export interface MathAction {
  action: "plus" | "minus"
  operand1: number
  operand2: number
}

export interface ActionResult extends MathAction {
  result: number
  points_earned: number
  new_score: number
  leaderboard_affected: boolean
}

export interface MathProblem {
  action: "plus" | "minus"
  operand1: number
  operand2: number
  expected_result: number
  problem_text: string
}

// Leaderboard related types
export interface LeaderboardEntry {
  id: number
  username: string
  score: number
  rank: number
}

export interface UserRank {
  user_id: number
  username: string
  score: number
  rank: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

// Socket.io related types
export interface SocketUser extends Socket {
  userId?: number
}

export interface SocketAuthData {
  token: string
}

export interface LeaderboardUpdateData {
  leaderboard: LeaderboardEntry[]
  updated_at: string
}

export interface ScoreUpdateData {
  new_score: number
  points_earned: number
  updated_at: string
}

export interface UserRankUpdateData {
  rank: UserRank
  updated_at: string
}

// Database related types
export interface DatabaseConfig {
  connectionString: string
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

export interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
}

// Redis related types
export interface RedisConfig {
  url: string
}

// Rate limiting types removed

export interface SessionData {
  email: string
  username: string
  loginTime: string
}

// Statistics types
export interface UserStats {
  total_users: number
  average_score: number
  highest_score: number
  lowest_score: number
  active_users: number
}

export interface ActionStats {
  total_actions: number
  users_with_actions: number
  average_points_per_action: number
}

// Express Request extensions
export interface AuthenticatedRequest extends Request {
  user: UserPublic
  validatedData?: any
}

export interface ValidatedRequest extends Request {
  validatedData: any
}

// Environment variables
export interface EnvironmentConfig {
  DATABASE_URL: string
  REDIS_URL: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  PORT: string
  NODE_ENV: string
  CORS_ORIGIN: string
  // Rate limiting environment variables removed
}

// Service method return types
export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
