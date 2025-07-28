import { RedisClientType, createClient } from "redis"
import { LeaderboardEntry, SessionData } from "../types"

class RedisClient {
  private client: RedisClientType | null = null
  private isConnected: boolean = false

  async connect(): Promise<RedisClientType> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      })

      this.client.on("error", (err: Error) => {
        console.error("Redis Client Error:", err)
        this.isConnected = false
      })

      this.client.on("connect", () => {
        console.log("Redis Client Connected")
        this.isConnected = true
      })

      this.client.on("disconnect", () => {
        console.log("Redis Client Disconnected")
        this.isConnected = false
      })

      await this.client.connect()
      return this.client
    } catch (error) {
      console.error("Failed to connect to Redis:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect()
    }
  }

  // Cache operations
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null
    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error("Redis GET error:", error)
      return null
    }
  }

  async set<T = any>(key: string, value: T, ttlSeconds: number = 3600): Promise<boolean> {
    if (!this.isConnected || !this.client) return false
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Redis SET error:", error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false
    try {
      await this.client.del(key)
      return true
    } catch (error) {
      console.error("Redis DEL error:", error)
      return false
    }
  }

  // Leaderboard caching
  async cacheLeaderboard(
    leaderboard: LeaderboardEntry[],
    ttlSeconds: number = 30,
  ): Promise<boolean> {
    return await this.set("leaderboard:top10", leaderboard, ttlSeconds)
  }

  async getCachedLeaderboard(): Promise<LeaderboardEntry[] | null> {
    return await this.get<LeaderboardEntry[]>("leaderboard:top10")
  }

  async invalidateLeaderboard(): Promise<boolean> {
    return await this.del("leaderboard:top10")
  }

  // User session management
  async setUserSession(
    userId: number,
    sessionData: SessionData,
    ttlSeconds: number = 86400,
  ): Promise<boolean> {
    return await this.set(`session:${userId}`, sessionData, ttlSeconds)
  }

  async getUserSession(userId: number): Promise<SessionData | null> {
    return await this.get<SessionData>(`session:${userId}`)
  }

  async deleteUserSession(userId: number): Promise<boolean> {
    return await this.del(`session:${userId}`)
  }

  // Rate limiting and cooldown functionality removed
}

export default new RedisClient()
