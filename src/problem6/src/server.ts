/**
 * Main server file for Live Scoreboard System
 */

import express from "express";
import { createServer } from "http";
import { Database } from "./config/database";
import { createRoutes } from "./routes";
import { AuthService } from "./services/authService";
import { ScoreService } from "./services/scoreService";
import { WebSocketService } from "./services/websocketService";
import {
  corsMiddleware,
  securityMiddleware,
  compressionMiddleware,
  rateLimitConfig,
  requestLogger,
  requestIdMiddleware,
  timingMiddleware,
  errorHandler,
} from "./middleware";
import { serverConfig, databaseConfig } from "./config";

class ScoreboardServer {
  private app: express.Application;
  private server: any;
  private database: Database;
  private authService: AuthService;
  private scoreService: ScoreService;
  private websocketService: WebSocketService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.database = new Database(databaseConfig);
    this.authService = new AuthService(this.database);
    this.scoreService = new ScoreService(this.database);
    this.websocketService = new WebSocketService(
      this.server,
      this.scoreService,
      this.authService
    );

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(securityMiddleware);
    this.app.use(corsMiddleware);

    // Compression
    this.app.use(compressionMiddleware);

    // Request ID and timing
    this.app.use(requestIdMiddleware);
    this.app.use(timingMiddleware);

    // Rate limiting
    this.app.use(rateLimitConfig);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Static files
    this.app.use(express.static("public"));

    // Logging
    this.app.use(requestLogger);
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use("/api", createRoutes(this.database));

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Development endpoint to reset rate limit
    if (serverConfig.nodeEnv === "development") {
      this.app.post("/api/dev/reset-rate-limit", (req, res) => {
        res.json({
          success: true,
          message:
            "Rate limit configuration updated. Please restart the server to apply changes.",
          currentConfig: {
            windowMs: serverConfig.rateLimitWindowMs,
            maxRequests: serverConfig.rateLimitMaxRequests,
          },
        });
      });
    }

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Welcome to Live Scoreboard API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          auth: "/api/auth",
          scores: "/api/scores",
          websocket: "ws://localhost:" + serverConfig.port,
        },
        features: [
          "Real-time scoreboard updates",
          "User authentication",
          "Score validation and security",
          "WebSocket live updates",
          "Rate limiting and anti-cheat",
        ],
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Initialize database and start server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database
      await this.database.initialize();

      // Start server
      this.server.listen(serverConfig.port, () => {
        console.log("🚀 Live Scoreboard Server started successfully!");
        console.log(`📍 Port: ${serverConfig.port}`);
        console.log(`🌍 Environment: ${serverConfig.nodeEnv}`);
        console.log(`🔗 Base URL: http://localhost:${serverConfig.port}`);
        console.log(`🔌 WebSocket: ws://localhost:${serverConfig.port}`);
        console.log(
          `📊 API Documentation: http://localhost:${serverConfig.port}/api/health`
        );
        console.log("=".repeat(60));
        console.log("🎯 Features:");
        console.log("  • Real-time scoreboard updates");
        console.log("  • User authentication & authorization");
        console.log("  • Score validation & anti-cheat protection");
        console.log("  • WebSocket live updates");
        console.log("  • Rate limiting & security");
        console.log("=".repeat(60));
      });

      // Graceful shutdown
      process.on("SIGINT", this.gracefulShutdown.bind(this));
      process.on("SIGTERM", this.gracefulShutdown.bind(this));
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(): Promise<void> {
    console.log("\n🛑 Shutting down server gracefully...");

    try {
      await this.database.close();
      console.log("✅ Database connection closed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new ScoreboardServer();
server.start().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
