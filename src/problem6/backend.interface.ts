// User authentication and management
interface UserService {
  authenticate(username: string, password: string): User | null
  getUserById(userId: number): User | null
  createUser(username: string, email: string, password: string): User
}

// Score management
interface ScoreService {
  getScore(userId: number): number
  incrementScore(userId: number, delta: number): void
  getTopNUsers(n: number): Array<{ userId: number, score: number }>
}

// Event logging for durability and analytics
interface ScoreEventService {
  logEvent(userId: number, delta: number, eventType: string): void
  getEventsForUser(userId: number): Array<ScoreEvent>
}

// Leaderboard snapshotting (optional)
interface LeaderboardSnapshotService {
  saveSnapshot(data: any): void
  getLatestSnapshot(): any
}

// WebSocket broadcasting
interface WebSocketBroadcastService {
  broadcastLeaderboardUpdate(leaderboard: Array<{ userId: number, score: number }>): void
  sendUserNotification(userId: number, message: string): void
}

// Example data types
type User = {
  id: number
  username: string
  email: string
  // ...other fields
}

type ScoreEvent = {
  id: number
  userId: number
  delta: number
  eventType: string
  createdAt: Date
}