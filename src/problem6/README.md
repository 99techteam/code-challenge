# Real-Time Scoreboard Module Specification

## Overview

This module provides a secure, real-time scoreboard system that displays the top 10 users by score. It handles score updates from user actions while preventing unauthorized score manipulation through cryptographic verification and rate limiting.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [API Specification](#api-specification)
4. [Security Model](#security-model)
5. [Data Flow](#data-flow)
6. [Implementation Requirements](#implementation-requirements)
7. [Scalability Considerations](#scalability-considerations)
8. [Monitoring & Observability](#monitoring--observability)
9. [Recommendations for Improvement](#recommendations-for-improvement)

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   Web Client    │
│  (User Action)  │
└────────┬────────┘
         │
         │ 1. Complete Action
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
│  • Receives action completion event                         │
│  • Includes action verification token (signed by server)    │
└────────┬────────────────────────────────────────────────────┘
         │
         │ 2. POST /api/scores/update
         │    Headers: Authorization: Bearer <JWT>
         │    Body: { actionToken, userId }
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer               │
│  • Rate Limiting (per user, per IP)                         │
│  • DDoS Protection                                           │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Application Server (Node.js/Python)             │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │  1. Authentication Middleware                     │       │
│  │     • Verify JWT token                            │       │
│  │     • Extract user identity                       │       │
│  └──────────────────────────────────────────────────┘       │
│                          │                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │  2. Score Update Handler                          │       │
│  │     • Validate action token (HMAC signature)      │       │
│  │     • Check token hasn't been used (idempotency)  │       │
│  │     • Verify token expiration                     │       │
│  │     • Apply rate limiting per user                │       │
│  └──────────────────────────────────────────────────┘       │
│                          │                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │  3. Score Service                                 │       │
│  │     • Increment user score in database            │       │
│  │     • Update leaderboard cache (Redis ZADD)       │       │
│  │     • Store action token in used tokens set       │       │
│  │     • Emit score update event                     │       │
│  └──────────────────────────────────────────────────┘       │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                     ▼
┌──────────────────┐              ┌─────────────────────────┐
│   PostgreSQL/    │              │    Redis Cache          │
│     MySQL        │              │                         │
│                  │              │  • Sorted Set:          │
│  users table:    │              │    "leaderboard"        │
│  - id            │              │    score → userId       │
│  - username      │              │                         │
│  - score         │              │  • Set: "used_tokens"   │
│  - updated_at    │              │    (with TTL)           │
│                  │              │                         │
│  score_history:  │              │  • Hash: "user:{id}"    │
│  - user_id       │              │    cached user data     │
│  - action_id     │              └─────────────────────────┘
│  - points        │
│  - timestamp     │
└──────────────────┘
         │
         │ 4. Publish Event
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Message Queue / Pub/Sub (Redis)                 │
│              Channel: "scoreboard:updates"                   │
└────────┬────────────────────────────────────────────────────┘
         │
         │ 5. Subscribe to updates
         ▼
┌─────────────────────────────────────────────────────────────┐
│           WebSocket Server / SSE Endpoint                    │
│                                                               │
│  • Maintains persistent connections to clients               │
│  • Broadcasts top 10 leaderboard on updates                 │
│  • Handles client reconnection                              │
└────────┬────────────────────────────────────────────────────┘
         │
         │ 6. Real-time push
         │    Event: "leaderboard:update"
         │    Data: [top 10 users]
         ▼
┌─────────────────┐
│   Web Client    │
│  (Scoreboard)   │
│  Auto-updates   │
└─────────────────┘
```

---

## Core Components

### 1. Action Token Generation Service

**Purpose:** Generate cryptographically signed tokens when users complete actions.

**Implementation:**
```javascript
// When user completes an action (e.g., game level, task completion)
function generateActionToken(userId, actionType, points) {
  const payload = {
    userId: userId,
    actionType: actionType,
    points: points,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'), // Prevent replay
    expiresAt: Date.now() + (5 * 60 * 1000) // 5 minute expiry
  };

  const signature = crypto
    .createHmac('sha256', process.env.ACTION_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  return {
    payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
    signature: signature
  };
}
```

**Security Properties:**
- HMAC-SHA256 signature prevents tampering
- Nonce prevents replay attacks
- Expiration time limits window of use
- Server-only secret key prevents client-side forgery

---

### 2. Score Update Endpoint

**Endpoint:** `POST /api/scores/update`

**Request:**
```json
{
  "actionToken": {
    "payload": "eyJ1c2VySWQiOjEyMywi...",
    "signature": "a3f5c8e9d..."
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "newScore": 1250,
  "rank": 7,
  "message": "Score updated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "Action token signature is invalid"
}
```

**Error Codes:**
- `INVALID_TOKEN` - Signature verification failed
- `EXPIRED_TOKEN` - Token past expiration time
- `USED_TOKEN` - Token already redeemed (replay attack)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `UNAUTHORIZED` - Invalid or missing JWT authentication

---

### 3. Leaderboard Query Endpoint

**Endpoint:** `GET /api/leaderboard/top`

**Query Parameters:**
- `limit` (optional, default: 10) - Number of top users to return

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": 456,
      "username": "player_one",
      "score": 9850,
      "lastUpdated": "2025-11-09T10:30:00Z"
    },
    {
      "rank": 2,
      "userId": 123,
      "username": "top_scorer",
      "score": 8920,
      "lastUpdated": "2025-11-09T10:28:15Z"
    }
    // ... up to 10 entries
  ],
  "lastUpdated": "2025-11-09T10:30:00Z"
}
```

**Caching:**
- Redis caching with 1-second TTL
- Cache invalidation on score updates

---

### 4. WebSocket Real-time Updates

**Connection:** `wss://api.example.com/ws/leaderboard`

**Authentication:**
- JWT token in query parameter or header
- Connection upgrade with authentication check

**Events Sent to Client:**

```json
// Event: "leaderboard:update"
{
  "type": "leaderboard:update",
  "data": {
    "leaderboard": [/* top 10 users */],
    "timestamp": "2025-11-09T10:30:00Z"
  }
}

// Event: "score:personal"
// Sent only to the user whose score changed
{
  "type": "score:personal",
  "data": {
    "userId": 123,
    "newScore": 1250,
    "previousScore": 1200,
    "rank": 7,
    "previousRank": 8
  }
}
```

**Heartbeat:**
- Server sends ping every 30 seconds
- Client responds with pong
- Connection closed if no pong received within 10 seconds

---

## Security Model

### 1. Multi-Layer Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                               │
│ • HTTPS/TLS encryption                                  │
│ • DDoS protection (Cloudflare/AWS Shield)              │
│ • IP-based rate limiting                                │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Authentication                                 │
│ • JWT-based user authentication                         │
│ • Token refresh mechanism                               │
│ • Session management                                    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Authorization (Action Token)                   │
│ • HMAC-SHA256 signature verification                    │
│ • Server-side secret key (never exposed)                │
│ • Token expiration (5 minute window)                    │
│ • Nonce for replay attack prevention                    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Rate Limiting                                  │
│ • Per-user: 10 score updates per minute                 │
│ • Per-IP: 100 requests per minute                       │
│ • Global: Circuit breaker on abnormal patterns          │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Idempotency & Audit                           │
│ • Used token tracking (Redis set with TTL)              │
│ • Complete audit log of score changes                   │
│ • Anomaly detection for suspicious patterns             │
└─────────────────────────────────────────────────────────┘
```

### 2. Attack Prevention

| Attack Vector | Prevention Mechanism |
|--------------|---------------------|
| **Score Injection** | Action tokens signed with HMAC-SHA256; client cannot forge valid tokens |
| **Replay Attack** | Nonce + used token tracking in Redis; tokens can only be used once |
| **Token Theft** | Short expiration (5 min); HTTPS only; can add IP binding |
| **Brute Force** | Rate limiting: 10 updates/min per user, 100 req/min per IP |
| **DDoS** | API Gateway rate limiting, connection limits, CloudFlare protection |
| **Man-in-the-Middle** | HTTPS/TLS encryption, HSTS headers, certificate pinning (mobile) |
| **Timing Attack** | Constant-time signature comparison, random delay on errors |
| **SQL Injection** | Parameterized queries, ORM usage, input validation |

### 3. Action Token Verification Flow

```javascript
async function verifyActionToken(token, userId) {
  // 1. Decode payload
  const payloadJson = Buffer.from(token.payload, 'base64').toString();
  const payload = JSON.parse(payloadJson);

  // 2. Verify user match
  if (payload.userId !== userId) {
    throw new Error('INVALID_TOKEN: User mismatch');
  }

  // 3. Check expiration
  if (Date.now() > payload.expiresAt) {
    throw new Error('EXPIRED_TOKEN');
  }

  // 4. Verify signature (constant-time comparison)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.ACTION_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (!crypto.timingSafeEqual(
    Buffer.from(token.signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )) {
    throw new Error('INVALID_TOKEN: Signature verification failed');
  }

  // 5. Check if already used (Redis)
  const tokenKey = `used_token:${token.signature}`;
  const alreadyUsed = await redis.exists(tokenKey);
  if (alreadyUsed) {
    throw new Error('USED_TOKEN: Token already redeemed');
  }

  // 6. Mark as used (TTL = token expiry time + 1 hour buffer)
  const ttl = Math.ceil((payload.expiresAt - Date.now()) / 1000) + 3600;
  await redis.setex(tokenKey, ttl, '1');

  return payload;
}
```

---

## Data Flow

### Sequence Diagram: Score Update Flow

```
User          Client App      API Server      Auth Service    Score Service    Database    Redis    WebSocket Server    Other Clients
 │                │                │                │               │              │          │             │                  │
 │ Complete      │                │                │               │              │          │             │                  │
 │  Action       │                │                │               │              │          │             │                  │
 │──────────────>│                │                │               │              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │ Generate       │                │               │              │          │             │                  │
 │                │ Action Token   │                │               │              │          │             │                  │
 │                │ (server-side)  │                │               │              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │ POST /api/scores/update        │               │              │          │             │                  │
 │                │   {actionToken, userId}        │               │              │          │             │                  │
 │                │──────────────────────────────>│                │              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │  Verify JWT   │               │              │          │             │                  │
 │                │                │───────────────>│               │              │          │             │                  │
 │                │                │  JWT Valid    │               │              │          │             │                  │
 │                │                │<───────────────│               │              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │  Verify Action Token          │              │          │             │                  │
 │                │                │  (signature, expiry, nonce)   │              │          │             │                  │
 │                │                │───────────────────────────────>│              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │  Check Used  │              │          │             │                  │
 │                │                │                │  Tokens      │              │          │             │                  │
 │                │                │                │───────────────────────────────────────>│             │                  │
 │                │                │                │  Token Fresh │              │          │             │                  │
 │                │                │                │<───────────────────────────────────────│             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │  Update Score│              │          │             │                  │
 │                │                │                │───────────────>│             │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │               │ UPDATE users│          │             │                  │
 │                │                │                │               │ SET score   │          │             │                  │
 │                │                │                │               │─────────────>│          │             │                  │
 │                │                │                │               │ INSERT      │          │             │                  │
 │                │                │                │               │ score_history│         │             │                  │
 │                │                │                │               │─────────────>│          │             │                  │
 │                │                │                │               │   Success   │          │             │                  │
 │                │                │                │               │<─────────────│          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │               │ ZADD leaderboard       │             │                  │
 │                │                │                │               │ score userId│          │             │                  │
 │                │                │                │               │─────────────────────────>│            │                  │
 │                │                │                │               │ SETEX used_token       │             │                  │
 │                │                │                │               │─────────────────────────>│            │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │               │ PUBLISH "scoreboard:updates"         │                  │
 │                │                │                │               │──────────────────────────────────────>│                  │
 │                │                │                │               │              │          │             │                  │
 │                │  Response      │                │               │              │          │             │                  │
 │                │  {success,     │                │               │              │          │             │                  │
 │                │   newScore,    │                │               │              │          │             │                  │
 │                │   rank}        │                │               │              │          │             │                  │
 │                │<──────────────────────────────│                │              │          │             │                  │
 │<───────────────│                │                │               │              │          │             │                  │
 │                │                │                │               │              │          │             │                  │
 │                │                │                │               │              │          │  WS: "leaderboard:update"      │
 │                │                │                │               │              │          │  {top 10 users}                │
 │                │                │                │               │              │          │─────────────────────────────────>│
 │                │                │                │               │              │          │                                 │
 │  WS Update    │                │                │               │              │          │             │                   │
 │<──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────>│
```

---

## Implementation Requirements

### Technology Stack Recommendations

| Component | Recommended Technology | Alternatives |
|-----------|----------------------|--------------|
| **Application Server** | Node.js (Express/Fastify) | Python (FastAPI), Go (Gin) |
| **WebSocket** | Socket.io, ws library | Server-Sent Events (SSE) |
| **Database** | PostgreSQL | MySQL, MongoDB |
| **Cache/Pub-Sub** | Redis | Memcached + RabbitMQ |
| **Authentication** | JWT (jsonwebtoken) | OAuth2, Session-based |
| **Rate Limiting** | express-rate-limit, ioredis | nginx rate limiting |
| **Logging** | Winston, Pino | Bunyan, Morgan |
| **Monitoring** | Prometheus + Grafana | DataDog, New Relic |

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  score BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_score (score DESC),
  INDEX idx_username (username)
);

-- Score history for audit trail
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  points_earned INTEGER NOT NULL,
  previous_score BIGINT NOT NULL,
  new_score BIGINT NOT NULL,
  action_token_signature VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action_token (action_token_signature)
);

-- Trigger to update users.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Redis Data Structures

```redis
# Leaderboard (Sorted Set)
# Key: "leaderboard"
# Score: user's total score
# Member: userId
ZADD leaderboard 1250 "user:123"
ZREVRANGE leaderboard 0 9 WITHSCORES  # Get top 10

# Used tokens (Set with TTL)
# Key: "used_token:{signature}"
# Value: "1"
# TTL: token expiration + buffer
SETEX used_token:a3f5c8e9d... 3900 "1"

# Rate limiting (String with TTL)
# Key: "rate_limit:user:{userId}"
# Value: request count
# TTL: 60 seconds (1 minute window)
INCR rate_limit:user:123
EXPIRE rate_limit:user:123 60

# User cache (Hash)
# Key: "user:{userId}"
# Fields: username, score, rank
HSET user:123 username "player_one" score "1250" rank "7"
EXPIRE user:123 300  # 5 minute cache
```

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Security
ACTION_SECRET_KEY=<cryptographically-secure-random-key>
JWT_SECRET=<jwt-secret-key>
JWT_EXPIRY=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scoreboard
DB_USER=app_user
DB_PASSWORD=<secure-password>
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>
REDIS_DB=0

# Rate Limiting
RATE_LIMIT_USER_WINDOW=60  # seconds
RATE_LIMIT_USER_MAX=10     # requests
RATE_LIMIT_IP_WINDOW=60
RATE_LIMIT_IP_MAX=100

# WebSocket
WS_HEARTBEAT_INTERVAL=30000  # ms
WS_HEARTBEAT_TIMEOUT=10000   # ms
WS_MAX_CONNECTIONS=10000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

---

## Scalability Considerations

### Horizontal Scaling Architecture

```
                          ┌──────────────┐
                          │ Load Balancer│
                          │  (nginx/ALB) │
                          └──────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
         ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
         │  App     │      │  App     │      │  App     │
         │ Server 1 │      │ Server 2 │      │ Server 3 │
         └────┬─────┘      └────┬─────┘      └────┬─────┘
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼────┐  ┌───▼────┐  ┌───▼─────┐
              │PostgreSQL│  │ Redis  │  │ Redis   │
              │ Primary  │  │Primary │  │ Pub/Sub │
              └────┬─────┘  └────────┘  └─────────┘
                   │
              ┌────▼─────┐
              │PostgreSQL│
              │ Replica  │
              └──────────┘
```

### Performance Optimizations

1. **Database**
   - Index on `users.score` for fast top-N queries
   - Read replicas for leaderboard queries
   - Connection pooling (10 connections per app server)
   - Prepared statements for common queries

2. **Caching Strategy**
   - Redis sorted set for leaderboard (O(log N) updates, O(1) top-10 read)
   - 1-second TTL on leaderboard cache
   - User profile cache (5-minute TTL)
   - Cache-aside pattern with fallback to database

3. **WebSocket Optimization**
   - Sticky sessions (same user → same server)
   - Redis pub/sub for cross-server message broadcasting
   - Message batching (aggregate updates every 100ms)
   - Compression for large payloads

4. **Query Optimization**
   ```sql
   -- Efficient top-10 query
   SELECT id, username, score, updated_at
   FROM users
   ORDER BY score DESC, id ASC
   LIMIT 10;

   -- With Redis: ZREVRANGE O(log(N)+M) where M=10
   ```

### Capacity Planning

| Metric | Expected Load | Max Capacity | Notes |
|--------|--------------|--------------|-------|
| **Concurrent Users** | 10,000 | 50,000 | With 5 app servers |
| **Score Updates/sec** | 100 | 500 | Rate limited per user |
| **WebSocket Connections** | 10,000 | 50,000 | 10K per server |
| **Database Queries/sec** | 200 | 1,000 | With read replicas |
| **Redis Operations/sec** | 1,000 | 10,000 | In-memory ops |

---

## Monitoring & Observability

### Key Metrics to Track

1. **Application Metrics**
   - Request rate (req/sec)
   - Error rate (4xx, 5xx)
   - Response time (p50, p95, p99)
   - Score update latency
   - WebSocket connection count
   - Active WebSocket subscriptions

2. **Business Metrics**
   - Score updates per minute
   - Top 10 leaderboard changes
   - Invalid token attempts (security)
   - Rate limit hits
   - Unique active users

3. **Infrastructure Metrics**
   - CPU utilization
   - Memory usage
   - Database connection pool
   - Redis memory usage
   - Network I/O

### Logging Strategy

```javascript
// Structured logging example
logger.info('Score updated', {
  userId: 123,
  previousScore: 1200,
  newScore: 1250,
  pointsEarned: 50,
  actionType: 'level_complete',
  processingTime: 45, // ms
  timestamp: new Date().toISOString()
});

// Security event logging
logger.warn('Invalid action token', {
  userId: 123,
  ipAddress: '192.168.1.1',
  reason: 'SIGNATURE_MISMATCH',
  timestamp: new Date().toISOString()
});
```

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| **High Error Rate** | 5xx errors > 5% for 5 min | Critical | Page on-call engineer |
| **Invalid Tokens** | >100 invalid tokens/min | High | Check for attack, review logs |
| **Database Latency** | p95 query time > 500ms | High | Check DB, consider scaling |
| **WebSocket Drops** | >10% connections drop/min | Medium | Check server health |
| **Redis Down** | Redis unavailable | Critical | Failover to replica |

---

## Recommendations for Improvement

### Phase 1: MVP Implementation (Current Spec)
✅ Basic functionality as specified above

### Phase 2: Enhanced Security & Performance

1. **Advanced Rate Limiting**
   - Implement sliding window algorithm (vs fixed window)
   - Adaptive rate limiting based on user trust score
   - Distributed rate limiting across servers (Redis)

2. **Action Token Enhancement**
   ```javascript
   // Add IP binding to prevent token theft
   const payload = {
     ...existingFields,
     ipAddress: req.ip,
     userAgent: req.headers['user-agent']
   };

   // Verify IP on token redemption
   if (payload.ipAddress !== req.ip) {
     // Allow with warning, log for anomaly detection
     logger.warn('IP mismatch on token redemption', {...});
   }
   ```

3. **Anomaly Detection**
   - Track score velocity (points/hour per user)
   - Flag users with abnormal patterns
   - Automatic temporary suspension for review
   - Machine learning for fraud detection

4. **Caching Improvements**
   - Implement cache warming on app startup
   - Predictive cache pre-loading
   - Client-side caching with ETag support

### Phase 3: Advanced Features

1. **Real-time Rank Updates**
   ```javascript
   // Send personalized updates when user enters/leaves top 10
   if (previousRank > 10 && newRank <= 10) {
     sendPersonalNotification(userId, 'Congratulations! You are now in the top 10!');
   }
   ```

2. **Historical Leaderboards**
   - Daily/weekly/monthly leaderboards
   - Season-based rankings
   - Personal score history graphs

3. **Geographic Leaderboards**
   - Country/region-specific leaderboards
   - Nearby users ranking

4. **Score Decay Mechanism**
   ```javascript
   // Prevent stale high scores, encourage ongoing engagement
   // Reduce score by 1% per day of inactivity
   function calculateDecayedScore(score, lastActiveDate) {
     const daysInactive = (Date.now() - lastActiveDate) / (24 * 60 * 60 * 1000);
     return Math.floor(score * Math.pow(0.99, daysInactive));
   }
   ```

5. **Batch Updates for High-Load Scenarios**
   - Queue score updates during peak load
   - Process in micro-batches (100 updates/batch)
   - Eventual consistency with guaranteed delivery

### Phase 4: Resilience & Disaster Recovery

1. **Circuit Breaker Pattern**
   ```javascript
   // Protect against cascading failures
   const circuitBreaker = new CircuitBreaker(updateScore, {
     timeout: 3000,
     errorThresholdPercentage: 50,
     resetTimeout: 30000
   });
   ```

2. **Graceful Degradation**
   - If Redis down: Fall back to database queries (slower but functional)
   - If WebSocket fails: Fall back to polling (every 5 seconds)
   - If database replica down: Route reads to primary

3. **Data Backup & Recovery**
   - Automated daily database backups
   - Point-in-time recovery capability
   - Redis persistence (RDB + AOF)
   - Test restore procedures quarterly

4. **Multi-Region Deployment**
   - Active-active configuration for low latency
   - Database replication across regions
   - Global load balancing with geo-routing

### Phase 5: Compliance & Governance

1. **GDPR Compliance**
   - User data export API
   - Right to be forgotten (score deletion)
   - Consent management for leaderboard display

2. **Audit Trail**
   - Immutable log of all score changes
   - Admin actions logging
   - Compliance reporting dashboard

3. **API Versioning**
   - Support for multiple API versions
   - Graceful deprecation policy
   - Backward compatibility guarantees

### Phase 6: Developer Experience

1. **API Documentation**
   - OpenAPI/Swagger specification
   - Interactive API explorer
   - Code examples in multiple languages

2. **Testing Infrastructure**
   - Unit tests (>80% coverage)
   - Integration tests for API endpoints
   - Load testing scripts (k6, JMeter)
   - Chaos engineering tests

3. **Developer Tools**
   - Local development environment (Docker Compose)
   - Token generation CLI tool for testing
   - Mock WebSocket server
   - Database seeding scripts

---

## Testing Requirements

### Unit Tests

```javascript
describe('Action Token Verification', () => {
  test('should accept valid token', async () => {
    const token = generateActionToken(123, 'level_complete', 50);
    const result = await verifyActionToken(token, 123);
    expect(result.userId).toBe(123);
  });

  test('should reject expired token', async () => {
    const expiredToken = generateActionToken(123, 'test', 10);
    // Manipulate expiration
    expiredToken.payload.expiresAt = Date.now() - 1000;
    await expect(verifyActionToken(expiredToken, 123))
      .rejects.toThrow('EXPIRED_TOKEN');
  });

  test('should reject tampered token', async () => {
    const token = generateActionToken(123, 'test', 10);
    token.signature = 'invalid_signature';
    await expect(verifyActionToken(token, 123))
      .rejects.toThrow('INVALID_TOKEN');
  });

  test('should reject replayed token', async () => {
    const token = generateActionToken(123, 'test', 10);
    await verifyActionToken(token, 123);
    await expect(verifyActionToken(token, 123))
      .rejects.toThrow('USED_TOKEN');
  });
});
```

### Integration Tests

```javascript
describe('Score Update API', () => {
  test('should update score and broadcast to WebSocket', async () => {
    const user = await createTestUser();
    const token = generateActionToken(user.id, 'test', 50);

    const wsClient = new WebSocket('ws://localhost:3000/ws/leaderboard');
    const wsMessage = new Promise(resolve => {
      wsClient.on('message', data => resolve(JSON.parse(data)));
    });

    const response = await request(app)
      .post('/api/scores/update')
      .set('Authorization', `Bearer ${user.jwt}`)
      .send({ actionToken: token });

    expect(response.status).toBe(200);
    expect(response.body.newScore).toBe(50);

    const wsData = await wsMessage;
    expect(wsData.type).toBe('leaderboard:update');
  });
});
```

### Load Testing

```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const token = generateActionToken(); // Helper function
  const response = http.post('http://api.example.com/api/scores/update',
    JSON.stringify({ actionToken: token }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Deployment Checklist

### Pre-Production

- [ ] Security audit completed
- [ ] Load testing passed (500 req/sec sustained)
- [ ] Database indexes created and verified
- [ ] Redis cluster configured with replication
- [ ] Environment variables set in production
- [ ] SSL/TLS certificates installed
- [ ] Monitoring dashboards configured
- [ ] Alert rules tested
- [ ] Backup/restore procedure tested
- [ ] API documentation published

### Production Deployment

- [ ] Blue-green deployment strategy
- [ ] Database migration plan executed
- [ ] Cache warming completed
- [ ] Health checks passing
- [ ] Rollback plan documented and tested
- [ ] On-call rotation scheduled
- [ ] Incident response runbook prepared

### Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Verify WebSocket connections stable
- [ ] Check leaderboard accuracy
- [ ] Review security logs for anomalies
- [ ] Conduct post-deployment review meeting

---

## Support & Maintenance

### Operational Runbooks

**Issue: High Invalid Token Rate**
1. Check logs for patterns (same IP, user, action type)
2. If coordinated attack: implement IP blocking
3. Review ACTION_SECRET_KEY rotation policy
4. Consider temporary increase in rate limits for investigation

**Issue: WebSocket Connections Dropping**
1. Check server resource utilization (CPU, memory)
2. Review WebSocket heartbeat logs
3. Verify load balancer timeout settings
4. Check Redis pub/sub connection health

**Issue: Leaderboard Not Updating**
1. Verify Redis connection and cluster health
2. Check pub/sub message flow in Redis
3. Review application server logs for errors
4. Manually trigger cache refresh if needed

### Maintenance Windows

- **Database**: Weekly maintenance window Sunday 2-4 AM UTC
- **Redis**: Rolling restarts, no downtime
- **Application Servers**: Rolling deployments, zero-downtime
- **Certificate Renewal**: Automated (Let's Encrypt), 30-day renewal buffer

---

## Glossary

- **Action Token**: Cryptographically signed token authorizing a score update
- **HMAC**: Hash-based Message Authentication Code for signature verification
- **JWT**: JSON Web Token for user authentication
- **Nonce**: Number used once to prevent replay attacks
- **WebSocket**: Persistent bidirectional connection for real-time updates
- **Sorted Set**: Redis data structure for efficient leaderboard operations
- **Rate Limiting**: Throttling mechanism to prevent abuse
- **Circuit Breaker**: Resilience pattern to prevent cascading failures

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Redis Sorted Sets Documentation](https://redis.io/docs/data-types/sorted-sets/)
- [WebSocket Protocol RFC 6455](https://tools.ietf.org/html/rfc6455)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-09
**Author**: Nhat Do
**Review Date**: 2025-12-09
