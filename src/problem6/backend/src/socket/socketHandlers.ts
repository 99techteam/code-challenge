import { Server, Socket } from "socket.io"
import {
  SocketUser,
  SocketAuthData,
  LeaderboardUpdateData,
  ScoreUpdateData,
  UserRankUpdateData,
} from "../types"
import { verifyToken } from "../middleware/auth"

class SocketHandlers {
  private io: Server

  constructor(io: Server) {
    this.io = io
    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.io.on("connection", async (socket: Socket) => {
      console.log("Client connected:", socket.id)

      // join public leaderboard room
      socket.join("leaderboard")

      // join private user room
      const token = socket.handshake.auth.token as string
      const user = verifyToken(token)
      const userId = user?.userId
      if (userId) socket.join(`user_${userId}`)

      // Handle ping/pong for connection health
      socket.on("ping", () => {
        socket.emit("pong", {
          timestamp: new Date().toISOString(),
        })
      })

      // Handle disconnection
      socket.on("disconnect", (reason: string) => {
        console.log(`Client ${socket.id} disconnected:`, reason)
        const socketUser = socket as SocketUser
        if (socketUser.userId) {
          console.log(`User ${socketUser.userId} disconnected`)
        }
      })

      // Handle connection errors
      socket.on("error", (error: Error) => {
        console.error("Socket error:", error)
      })
    })
  }

  sendScoreUpdate(userId: number, scoreData: Partial<ScoreUpdateData>): void {
    const updateData: ScoreUpdateData = {
      ...scoreData,
      updated_at: new Date().toISOString(),
    } as ScoreUpdateData
    this.io.to(`user_${userId}`).emit("score_update", updateData)
  }

  sendLeaderboardUpdate(leaderboardData: LeaderboardUpdateData): void {
    this.io.to("leaderboard").emit("leaderboard_update", leaderboardData)
  }
}

export default SocketHandlers
