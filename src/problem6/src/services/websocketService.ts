/**
 * WebSocket service for real-time scoreboard updates
 */

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { ScoreboardResponse, ScoreboardEntry } from "../types";
import { ScoreService } from "./scoreService";
import { AuthService } from "./authService";

export class WebSocketService {
  private io: SocketIOServer;
  private scoreService: ScoreService;
  private authService: AuthService;
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    httpServer: HTTPServer,
    scoreService: ScoreService,
    authService: AuthService
  ) {
    this.scoreService = scoreService;
    this.authService = authService;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle authentication
      socket.on("authenticate", async (token: string) => {
        try {
          const user = this.authService.verifyToken(token);
          this.connectedUsers.set(socket.id, user.id);

          socket.emit("user:authenticated", {
            id: user.id,
            username: user.username,
          });

          console.log(`✅ User authenticated: ${user.username} (${socket.id})`);
        } catch (error) {
          socket.emit("user:unauthorized");
          console.log(`❌ Authentication failed: ${socket.id}`);
        }
      });

      // Handle joining scoreboard
      socket.on("join-scoreboard", async () => {
        const userId = this.connectedUsers.get(socket.id);
        if (!userId) {
          socket.emit("user:unauthorized");
          return;
        }

        socket.join("scoreboard");
        console.log(`📊 User joined scoreboard: ${socket.id}`);

        // Send current scoreboard
        try {
          const scoreboard = await this.scoreService.getTopScores();
          socket.emit("scoreboard:update", scoreboard);
        } catch (error) {
          socket.emit("scoreboard:error", "Failed to load scoreboard");
        }
      });

      // Handle leaving scoreboard
      socket.on("leave-scoreboard", () => {
        socket.leave("scoreboard");
        console.log(`📊 User left scoreboard: ${socket.id}`);
      });

      // Handle score updates
      socket.on("update-score", async (data) => {
        const userId = this.connectedUsers.get(socket.id);
        if (!userId) {
          socket.emit("user:unauthorized");
          return;
        }

        try {
          // Get user info
          const user = await this.authService.getUserById(userId);
          if (!user) {
            socket.emit("user:unauthorized");
            return;
          }

          // Validate score update
          const isValid = await this.scoreService.validateScoreUpdate(
            userId,
            data
          );
          if (!isValid) {
            socket.emit("scoreboard:error", "Invalid score update");
            return;
          }

          // Update score
          const score = await this.scoreService.updateScore(
            userId,
            user.username,
            data
          );

          // Get updated scoreboard
          const scoreboard = await this.scoreService.getTopScores();

          // Broadcast to all scoreboard subscribers
          this.io.to("scoreboard").emit("scoreboard:update", scoreboard);

          // Send confirmation to user
          socket.emit("scoreboard:new-score", {
            rank: scoreboard.scores.findIndex((s) => s.userId === userId) + 1,
            userId: score.userId,
            username: score.username,
            score: score.score,
            lastUpdated: score.timestamp,
          });

          console.log(
            `🎯 Score updated: ${user.username} +${score.score} points`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          socket.emit("scoreboard:error", errorMessage);
          console.log(`❌ Score update failed: ${errorMessage}`);
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.connectedUsers.delete(socket.id);
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast scoreboard update to all connected clients
   */
  public async broadcastScoreboardUpdate(): Promise<void> {
    try {
      const scoreboard = await this.scoreService.getTopScores();
      this.io.to("scoreboard").emit("scoreboard:update", scoreboard);
    } catch (error) {
      console.error("Failed to broadcast scoreboard update:", error);
    }
  }

  /**
   * Broadcast new score to all connected clients
   */
  public async broadcastNewScore(scoreEntry: ScoreboardEntry): Promise<void> {
    this.io.to("scoreboard").emit("scoreboard:new-score", scoreEntry);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get scoreboard subscribers count
   */
  public getScoreboardSubscribersCount(): number {
    const scoreboardRoom = this.io.sockets.adapter.rooms.get("scoreboard");
    return scoreboardRoom ? scoreboardRoom.size : 0;
  }

  /**
   * Get WebSocket server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}
