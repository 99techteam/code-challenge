/**
 * Type definitions for the CRUD Server
 */

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number;
}

export interface UserFilters {
  name?: string;
  email?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DatabaseConfig {
  path: string;
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  apiVersion: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
