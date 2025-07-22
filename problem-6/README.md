# Live Scoreboard API Module Specification

## Overview

The Live Scoreboard API module provides real-time score management and leaderboard functionality with anti-abuse protection. It handles score updates, maintains top 10 leaderboards, and broadcasts live updates to connected clients while preventing unauthorized score manipulation.

## Architecture Components

### Core Services
- **Score Update Service**: Handles score increment requests with basic validation
- **Leaderboard Service**: Manages top 10 rankings and caching
- **WebSocket Service**: Provides real-time updates to connected clients
- **Authentication Service**: Validates user sessions
- **Workers**: Handles background tasks to update the leaderboard cache and persist the user score in Primary Database

### Data Storage
- **Primary Database**: PostgreSQL for consistent score storage
- **Cache Layer**: Redis for leaderboard caching
- **Redis Pub/Sub**: For real-time notifications
- **Message Queue**: For event-driven architecture

#

## Data Persistence

### Update User Score Worker (Worker 1)
- Interval handle batch updates the user score 

## Caching Strategy

### Redis Cache Structure
```
// Leaderboard cache (30-second TTL)
leaderboard:top10 -> JSON array of top 10 users
```

### Update cache worker (Worker 2)
- Interval handle update leaderboard:top10

## Real-time Updates Flow

### WebSocket Management
1. Client connects to `/ws/leaderboard` with JWT authentication
2. Server subscribes client to leaderboard updates channel
3. On score updates, server publishes changes to Redis Pub/Sub
4. All WebSocket servers receive updates and broadcast to connected clients
5. Clients receive real-time leaderboard changes

### Message Broadcasting
```javascript
// Pseudo-code for broadcasting updates
async function broadcastLeaderboardUpdate(changes) {
    const message = {
        type: 'leaderboard_update',
        data: {
            leaderboard: await getTop10Leaderboard(),
            changes: changes
        },
        timestamp: Date.now()
    };
    
    // Publish to Redis Pub/Sub
    await redis.publish('leaderboard_updates', JSON.stringify(message));
}
```

## Improvements & Tradeoff
- Depend on the business perspective, we would like to adjust the way we persist the score as well as the caching


### More availability
- The current solution (in diagram) showing the more availability way
#### Pros
- Less database hit, even the CCU increased, as we do batch updates to database using cronjob (`Worker 1`)
#### Cons
- Leaderboard is not real-time updated, it depends on the interval we set for `Worker 1` and `Worker 2`

### More consistency
- At step `[3.1]`, instead of sending the event to `Event bus`, we can increase the score directly to database
  - So we can remove the `Worker 1`
- At step `[4.2]` we can decrease the interval time, so the leaderboard caching will be more update to date
#### Pros
- Leaderboard is nearly realtime
#### Cons
- More database hit, When CCU increase, there's potential that the DB can be shut down


## API Endpoints

### 1. Update User Score
```
POST /api/v1/scores/update
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action_type": "level_complete",
  "score_increment": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "12345",
    "previous_score": 1500,
    "new_score": 1600,
    "rank_change": 0,
    "current_rank": 5
  },
  "timestamp": 1690123456789
}
```

**Response (401 - Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token"
  }
}
```

### 2. Get Current Leaderboard
```
GET /api/v1/leaderboard/top10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "54321",
        "username": "player1",
        "score": 2500,
        "avatar_url": "https://cdn.example.com/avatars/54321.jpg"
      },
      ...
    ],
    "last_updated": 1690123456789,
    "cache_ttl": 30
  }
}
```

### 3. WebSocket Connection
```
WebSocket: /ws/leaderboard
```

**Authentication:** JWT token via query parameter or header

**Message Format:**
```json
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "54321",
        "username": "player1",
        "score": 2500,
        "avatar_url": "https://cdn.example.com/avatars/54321.jpg"
      },
      ...
    ]
  },
  "timestamp": 1690123456789
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

### Scores Table
```sql
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_score BIGINT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1, -- For optimistic locking
    UNIQUE(user_id)
);

CREATE INDEX idx_scores_total_desc ON scores(total_score DESC);
CREATE INDEX idx_scores_user_id ON scores(user_id);
```
## Basic Authentication

### JWT Token Validation
- JWT tokens with reasonable expiration (e.g., 24 hours)
- Basic user session validation on each request
- Simple token refresh mechanism

