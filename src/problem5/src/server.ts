/**
 * Main server file for CRUD Server
 */

import express from "express";
import { createServer } from "http";
import { Database } from "./models/Database";
import { createRoutes } from "./routes";
import {
  corsMiddleware,
  securityMiddleware,
  requestLogger,
  requestIdMiddleware,
  errorHandler,
} from "./middleware";
import { serverConfig, databaseConfig } from "./config";

class CrudeServer {
  private app: express.Application;
  private server: any;
  private database: Database;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.database = new Database(databaseConfig);

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

    // Request ID and logging
    this.app.use(requestIdMiddleware);
    this.app.use(requestLogger);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use(
      `/api/${serverConfig.apiVersion}`,
      createRoutes(this.database)
    );

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: serverConfig.apiVersion,
      });
    });

    // Root endpoint
    this.app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Welcome to CRUD Server API",
        version: serverConfig.apiVersion,
        endpoints: {
          health: "/health",
          users: `/api/${serverConfig.apiVersion}/users`,
        },
        features: [
          "Create, Read, Update, Delete operations",
          "User management with filters and pagination",
          "SQLite database for data persistence",
          "TypeScript for type safety",
          "Input validation and error handling",
        ],
      });
    });

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint not found",
        error: `Cannot ${req.method} ${req.originalUrl}`,
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
        console.log("🚀 CRUD Server started successfully!");
        console.log(`📍 Port: ${serverConfig.port}`);
        console.log(`🌍 Environment: ${serverConfig.nodeEnv}`);
        console.log(`🔗 Base URL: http://localhost:${serverConfig.port}`);
        console.log(
          `📊 API Base: http://localhost:${serverConfig.port}/api/${serverConfig.apiVersion}`
        );
        console.log("=".repeat(60));
        console.log("🎯 Available Endpoints:");
        console.log(`  • GET    /health - Health check`);
        console.log(
          `  • GET    /api/${serverConfig.apiVersion}/users - Get all users`
        );
        console.log(
          `  • POST   /api/${serverConfig.apiVersion}/users - Create user`
        );
        console.log(
          `  • GET    /api/${serverConfig.apiVersion}/users/:id - Get user by ID`
        );
        console.log(
          `  • PUT    /api/${serverConfig.apiVersion}/users/:id - Update user`
        );
        console.log(
          `  • DELETE /api/${serverConfig.apiVersion}/users/:id - Delete user`
        );
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
const server = new CrudeServer();
server.start().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
