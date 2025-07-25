# Scoreboard API Service

## Overview

The Scoreboard API Service is a backend system for managing user scores and providing real-time leaderboard updates. It securely handles score submissions, maintains a leaderboard, and broadcasts changes using WebSocket connections. With an event-driven architecture powered by a Message Queue (MQ), the system achieves scalability, resilience, and decoupled services.

---

## Technology Stack

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis (leaderboard + rate limit + token store)
- **WebSocket**: WS or Socket.IO
- **Authentication**: JWT
- **Message Queue**: BullMQ / Kafka / RabbitMQ

---

## Key Features

- Secure score update with JWT and action tokens
- Leaderboard with top 10 users
- Real-time broadcasting using WebSockets
- Redis caching for leaderboard performance
- Rate limiting and anti-cheat token validation
- Asynchronous processing via Message Queue

---

## System Architecture

<img width="7826" height="2632" alt="scoreboard-service-flow-diagram" src="https://github.com/user-attachments/assets/1822b003-680e-47db-9fec-e4a0a113f520" />

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as Web Client
    participant Gateway as Gateway (Express.js + WS)
    participant Server as App Server
    participant Redis as Redis (Cache + PubSub)
    participant DB as PostgreSQL
    participant MQ as Event Bus (Kafka/BullMQ)
    participant Worker1 as Worker (Score Processor)
    participant Worker2 as Worker (Leaderboard Sync)
    participant WS as WebSocket Manager

    %% [1] WebSocket Initialization
    Client->>Gateway: [1.1] WS Connect /ws/scoreboard
    Gateway->>Redis: [1.2] Init Socket
    Redis-->>Gateway: [1.3] Initialized socket

    %% [2] Get Leaderboard Top 10
    Client->>Gateway: [2] GET /leaderboard/top10
    Gateway->>Server: Forward request
    Server->>Redis: [2.1] Try Redis (cache)
    alt Cache Hit
        Redis-->>Server: [2.2] Respond top 10
    else Cache Miss
        Server->>DB: [2.3] Fetch top 10
        DB-->>Server: [2.4] Respond top 10
        Server->>Redis: [2.5] Sync top 10 to cache
    end
    Server-->>Gateway: Response
    Gateway-->>Client: Return leaderboard data

    %% [3] Submit Score Update
    Client->>Gateway: [3] POST /scores/update
    Gateway->>Server: Forward request
    Server->>MQ: [3.1] Emit action executed event

    %% [3.2] Pull Events
    MQ-->>Worker1: [3.2] Pull event (score_updated)
    Worker1->>DB: [3.3] Sync user’s score
    Worker1->>Worker2: [4.1] Fetch updated top 10 from DB
    Worker2->>DB: [4.1] Fetch top 10
    Worker2->>Redis: [4.2] Sync top 10 to cache

    %% [4.3] Broadcast to WebSocket Clients
    Worker2->>WS: [4.3] Broadcast leaderboard + score update
    WS-->>Redis: Publish via Redis PubSub
    Redis-->>Gateway: [4.4] Broadcast message
    Gateway-->>Client: Send `leaderboard_update` + `score_update`
```

---

## Components

### Core Modules

- **ScoreService**: Processes score changes, validates tokens, and emits events.
- **LeaderboardService**: Manages Redis leaderboard (ZSET).
- **WebSocketManager**: Listens to MQ and broadcasts updates to clients.
- **RateLimitingMiddleware**: Enforces per-user and per-IP rate limits.
- **AuthenticationMiddleware**: Validates JWT tokens and permissions.

---

## Database Schema

### PostgreSQL Tables

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0 NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_user_score ON scores(total_score DESC);
```

### Redis Data Structures

leaderboard:top10 → Sorted Set (ZSET)

- Key: "leaderboard:top10"
- Score: user's current score
- Member: user_id:username

rate_limit:user:{user_id} → String with TTL

- Value: number of requests in current window
- TTL: rate limit window duration

---

## API Endpoints

### POST /api/scores/update

```http
POST /api/scores/update
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{
  "actionToken": "unique_token",
  "scoreIncrease": 10,
  "actionType": "level_complete"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "newScore": 1010,
    "rank": 7
  }
}
```

---

### GET /api/leaderboard

```http
GET /api/leaderboard
```

**Response**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      { "rank": 1, "userId": 100, "username": "player1", "score": 9999 },
      { "rank": 2, "userId": 200, "username": "player2", "score": 9000 }
    ],
    "lastUpdated": "2025-07-25T10:30:00Z"
  }
}
```

### WebSocket: /ws/scoreboard

**Connection Header**:  
`Authorization: Bearer <JWT>`

**Message Types**

**Leaderboard Update (Server → Client):**

```json
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "1",
        "username": "player1",
        "score": 2000,
      },
      ...
    ]
  },
  "timestamp": "2025-07-25T10:30:00Z"
}
```

**Score Update Notification (Server → Client):**

```json
{
  "userId": 1,
  "username": "player1",
  "scoreIncrease": 10,
  "actionType": "level_complete",
  "timestamp": "2025-07-25T10:31:00Z"
}
```

---

## Security & Anti-Cheat

### Action Token System

- Short-lived, one-time tokens in Redis.
- Used to validate score update authenticity

1. Token Generation: When user initiates an action on frontend, request an action token from /api/actions/token
2. Token Storage: Store token in Redis with short TTL (60 seconds)
3. Token Validation: Score update endpoint validates and consumes the token
4. Token Cleanup: Expired tokens are automatically removed by Redis TTL

```js
// Token generation endpoint
POST /api/actions/token
{
    "actionType": "level_complete",
    "expectedScore": 10
}

// Response includes one-time token
{
    "actionToken": "act_12345_67890_abcdef",
    "expiresAt": "2025-07-25T10:31:00Z"
}
```

### Rate Limiting (in Redis)

### JWT Authentication

```json
{
  "userId": 123,
  "username": "player1",
  "iat": 1690200000,
  "exp": 1690286400,
  "scope": ["score:update", "leaderboard:read"]
}
```

---

## Service Implementation

### Core Services

#### ScoreService

```javascript
class ScoreService {
  async updateScore(userId, scoreIncrease, actionToken, actionType) {
    // 1. Validate action token
    // 2. Update database with transaction
    // 3. Update Redis leaderboard
    // 4. Broadcast to WebSocket clients
    // 5. Log transaction for audit
  }

  async getLeaderboard() {
    // 1. Check Redis cache first
    // 2. Fallback to database if cache miss
    // 3. Update cache with fresh data
  }
}
```

#### LeaderboardService

```javascript
class LeaderboardService {
  async updateUserScore(userId, username, newScore) {
    // 1. Update Redis sorted set
    // 2. Trim to top 10
    // 3. Return rank information
  }

  async getTop10() {
    // 1. Get from Redis ZSET
    // 2. Format for API response
  }
}
```

#### WebSocketManager

```javascript
class WebSocketManager {
  broadcastLeaderboardUpdate(leaderboard) {
    // Send to all connected clients
  }

  notifyScoreUpdate(scoreUpdate) {
    // Send targeted notifications
  }
}
```

### Middleware Stack

#### Authentication Middleware

```javascript
const authenticateJWT = (req, res, next) => {
  // 1. Extract JWT from Authorization header
  // 2. Verify token signature and expiration
  // 3. Attach user info to request object
  // 4. Check required scopes
};
```

#### Rate Limiting Middleware

```javascript
const rateLimitMiddleware = (req, res, next) => {
  // 1. Check Redis for current rate limit counters
  // 2. Increment counter with sliding window
  // 3. Reject if limit exceeded
  // 4. Add rate limit headers to response
};
```

---

## Health Check

```http
GET /health
```

**Response**

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "websocket": "active_connection"
}
```

### Conclusion

This specification provides a robust foundation for implementing a secure, scalable scoreboard system with real-time updates. The modular architecture allows for easy extension and maintenance while ensuring security against malicious score manipulation.
