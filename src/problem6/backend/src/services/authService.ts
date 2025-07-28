import bcrypt from "bcryptjs";
import { AuthResponse, UserPublic, SessionData, ServiceResult } from "../types";
import prisma from "../utils/prisma";
import redisClient from "../utils/redis";
import { generateToken } from "../middleware/auth";

class AuthService {
  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          username,
        },
      });

      // Generate JWT token
      const token = generateToken(user.id);

      // Cache user session in Redis
      await redisClient.setUserSession(user.id, {
        email: user.email,
        username: user.username,
        loginTime: new Date().toISOString(),
      });

      // Create UserPublic object
      const userPublic: UserPublic = {
        id: user.id,
        email: user.email,
        username: user.username,
        score: user.score,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: userPublic,
        token,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Update user session in Redis
      await redisClient.setUserSession(user.id, {
        email: user.email,
        username: user.username,
        loginTime: new Date().toISOString(),
      });

      // Create UserPublic object
      const userPublic: UserPublic = {
        id: user.id,
        email: user.email,
        username: user.username,
        score: user.score,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: userPublic,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout(userId: number): Promise<ServiceResult> {
    try {
      // Remove user session from Redis
      await redisClient.deleteUserSession(userId);
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async getUserProfile(userId: number): Promise<ServiceResult<UserPublic>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error("User not found");
      }

      // Create UserPublic object
      const userPublic: UserPublic = {
        id: user.id,
        email: user.email,
        username: user.username,
        score: user.score,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        data: userPublic,
      };
    } catch (error) {
      console.error("Get user profile error:", error);
      throw error;
    }
  }

  async validateUserSession(userId: number): Promise<boolean> {
    try {
      const session = await redisClient.getUserSession(userId);
      return session !== null;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  }

  async generateToken(userId: number): Promise<{ token: string }> {
    try {
      // Generate a new JWT token
      const token = generateToken(userId);

      // Update user session in Redis with new token time
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        await redisClient.setUserSession(userId, {
          email: user.email,
          username: user.username,
          loginTime: new Date().toISOString(),
        });
      }

      return { token };
    } catch (error) {
      console.error("Token generation error:", error);
      throw error;
    }
  }
}

export default new AuthService();
