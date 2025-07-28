import dotenv from "dotenv"
dotenv.config()

import express, { Request, Response, NextFunction, Application } from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import helmet from "helmet"

// Import utilities
import prisma from "./utils/prisma"
import redisClient from "./utils/redis"

// Import routes
import authRoutes from "./routes/auth"
import scoreRoutes from "./routes/score"
import leaderboardRoutes from "./routes/leaderboard"

// Import socket handlers
import SocketHandlers from "./socket/socketHandlers"

// Import middleware

interface AppError extends Error {
  status?: number
}

class App {
  private app: Application
  private server: http.Server
  private io: Server
  private port: number

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    this.io = new Server(this.server, {
      cors: {
        origin: [
          process.env.CORS_ORIGIN || "http://localhost:3001",
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    })

    this.port = parseInt(process.env.PORT || "3000")
    this.setupMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()
    const socketHandler = new SocketHandlers(this.io)
    this.app.set("socketHandler", socketHandler)
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet())

    // CORS configuration
    this.app.use(
      cors({
        origin: [
          process.env.CORS_ORIGIN || "http://localhost:3001",
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      }),
    )

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }))
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }))

    // Make io available to routes
    this.app.set("io", this.io)

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
      next()
    })
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    })

    // API routes
    this.app.use("/api/auth", authRoutes)
    this.app.use("/api/score", scoreRoutes)
    this.app.use("/api/leaderboard", leaderboardRoutes)

    // 404 handler
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: "Endpoint not found",
      })
    })
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: AppError, req: Request, res: Response, next: NextFunction) => {
      console.error("Global error handler:", error)

      res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
      })
    })

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason)
    })

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error)
      process.exit(1)
    })

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully")
      this.shutdown()
    })

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully")
      this.shutdown()
    })
  }

  async initialize(): Promise<void> {
    try {
      // Connect to Redis
      await redisClient.connect()
      console.log("Redis connected successfully")

      // Test database connection
      await prisma.$queryRaw`SELECT NOW()`
      console.log("Database connected successfully")

      console.log("Application initialized successfully")
    } catch (error) {
      console.error("Failed to initialize application:", error)
      process.exit(1)
    }
  }

  async start(): Promise<void> {
    try {
      await this.initialize()

      this.server.listen(this.port, () => {
        console.log(`🚀 Live Scoreboard API Server running on port ${this.port}`)
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
        console.log(`🔗 Health check: http://localhost:${this.port}/health`)
        console.log(`📡 Socket.io ready for real-time connections`)
      })
    } catch (error) {
      console.error("Failed to start server:", error)
      process.exit(1)
    }
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down server...")

    try {
      // Close server
      this.server.close(() => {
        console.log("HTTP server closed")
      })

      // Close database connections
      await prisma.$disconnect()
      console.log("Database connections closed")

      // Close Redis connection
      await redisClient.disconnect()
      console.log("Redis connection closed")

      console.log("Server shutdown complete")
      process.exit(0)
    } catch (error) {
      console.error("Error during shutdown:", error)
      process.exit(1)
    }
  }
}

// Start the application
if (require.main === module) {
  const app = new App()
  app.start()
}

export default App
