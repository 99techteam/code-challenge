import {
  User,
  UserPublic,
  LeaderboardEntry,
  UserAction,
  QueryResult as CustomQueryResult,
} from "../types";
import prisma from "./prisma";

/**
 * Database utility class using Prisma ORM
 * This provides a compatibility layer for the old database interface
 * while using Prisma under the hood for better type safety and performance
 */
class Database {
  constructor() {
    // Prisma client is initialized in ./prisma.ts
  }

  /**
   * Execute raw SQL query using Prisma
   * @deprecated Use Prisma client directly for better type safety
   */
  async query<T = any>(
    text: string,
    params?: any[],
  ): Promise<CustomQueryResult<T>> {
    const start = Date.now();
    try {
      // Convert parameterized query to Prisma raw query
      const result = await prisma.$queryRawUnsafe(text, ...(params || []));
      const duration = Date.now() - start;
      console.log("Executed query", {
        text,
        duration,
        rows: Array.isArray(result) ? result.length : 1,
      });

      return {
        rows: Array.isArray(result) ? (result as T[]) : ([result] as T[]),
        rowCount: Array.isArray(result) ? result.length : 1,
      };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  /**
   * @deprecated Prisma handles connections automatically
   */
  async getClient(): Promise<any> {
    return prisma;
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    await prisma.$disconnect();
  }

  // User-related queries using Prisma
  async createUser(
    email: string,
    passwordHash: string,
    username: string,
  ): Promise<UserPublic> {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getUserById(id: number): Promise<UserPublic | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateUserScore(userId: number, newScore: number): Promise<UserPublic> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { score: newScore },
      select: {
        id: true,
        email: true,
        username: true,
        score: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const users = await prisma.user.findMany({
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      take: limit,
      select: {
        id: true,
        username: true,
        score: true,
      },
    });

    // Add rank to each entry
    return users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }

  async logUserAction(
    userId: number,
    actionType: string,
    operand1: number,
    operand2: number,
    result: number,
    pointsEarned: number = 1,
  ): Promise<UserAction> {
    const action = await prisma.userAction.create({
      data: {
        userId,
        actionType,
        operand1,
        operand2,
        result,
        pointsEarned,
      },
    });
    return action;
  }

  async getUserActionCount(
    userId: number,
    timeWindow: string = "1 minute",
  ): Promise<number> {
    // Parse time window (simple implementation for '1 minute', '1 hour', etc.)
    const parts = timeWindow.split(" ");
    const timeValue = parseInt(parts[0] || "1");
    const timeUnit = parts[1] || "minute";

    let milliseconds = 0;
    switch (timeUnit) {
      case "minute":
      case "minutes":
        milliseconds = timeValue * 60 * 1000;
        break;
      case "hour":
      case "hours":
        milliseconds = timeValue * 60 * 60 * 1000;
        break;
      case "day":
      case "days":
        milliseconds = timeValue * 24 * 60 * 60 * 1000;
        break;
      default:
        milliseconds = 60 * 1000; // Default to 1 minute
    }

    const timeAgo = new Date(Date.now() - milliseconds);

    const count = await prisma.userAction.count({
      where: {
        userId,
        createdAt: {
          gt: timeAgo,
        },
      },
    });

    return count;
  }
}

export default new Database();
