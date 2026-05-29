# Scoreboard API Service - Specification

## Overview

The Scoreboard API Service is a backend module designed to manage user scores and provide real-time updates to a web-based scoreboard displaying the top 10 users. This specification outlines the architecture, API contracts, security measures, and implementation guidelines for the engineering team.

### Key Features

- Real-time score updates via WebSocket or polling
- Secure score increment with authorization checks
- Top 10 leaderboard retrieval
- Prevention of unauthorized score manipulation
- Audit logging for score changes
- Rate limiting and DDoS protection

### Architecture Highlights

- **Redis as Primary Leaderboard Database:** Sorted Sets (ZSET) provide O(log N) operations, in-memory performance, and atomic operations for score updates
- **PostgreSQL for Audit Logs:** Maintains full history of score changes for compliance and debugging
- **Hybrid Database Strategy:** Fast leaderboard operations in Redis + reliable audit trail in PostgreSQL
- **No Cache Invalidation:** Redis Sorted Sets serve as the single source of truth, eliminating cache coherency issues

### Implementation Notes - Redis-Based Approach

| Aspect | Traditional DB Approach | Redis Approach |
|--------|------------------------|-----------------|
| **Leaderboard Query** | `SELECT * FROM users ORDER BY score DESC LIMIT 10` (O(n log n)) | `ZRANGE game:leaderboard 0 9 REV WITHSCORES` (O(log n)) |
| **Score Update** | Transaction with read lock + update | `ZINCRBY game:leaderboard 10 username` (atomic) |
| **Response Time** | 50-200ms (disk I/O + sorting) | <5ms (in-memory) |
| **Rank Lookup** | Complex query or separate index | `ZRANK game:leaderboard username REV` (O(log n)) |
| **Cache Management** | Requires invalidation logic | N/A (single source of truth) |
| **Consistency Model** | Strong consistency | Strong consistency (atomic operations) |
| **Scalability** | Vertical (server hardware) | Horizontal (Redis cluster/replication) |

### Why Redis Sorted Sets for Leaderboards?

Redis Sorted Sets are purpose-built for ranking scenarios:

- **Natural fit:** Members with scores, sorted by score automatically
- **Atomic operations:** No race conditions, no need for complex locking
- **Fast access patterns:** O(log n) for all operations (add, remove, rank, range)
- **Built-in scoring:** Numeric scores with comparison built-in
- **Perfect for real-time:** Sub-millisecond response times for any query

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Website)                    │
│              (Scoreboard Display + UI)                  │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌──────────────────────────────┐
         │                              │
       HTTP                          WebSocket
  GET /leaderboard                /ws/leaderboard
  PUT /score/update                     │
         │                              │
         │                              │
┌────────▼──────────────────────────────▼──────────────────┐
│                  Scoreboard API Service                  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │          Authentication & Authorization             │ │
│  │  (JWT Validation, User Identity Verification)       │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │     Score Update Service                            │ │
│  │  • Validate action completion                       │ │
│  │  • Atomic score increment (ZINCRBY)                 │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │     Leaderboard Service                             │ │
│  │  • Fetch top N users (ZRANGE REV)                   │ │
│  │  • Get player rank (ZRANK)                          │ │
│  │  • Real-time broadcast                              │ │
│  │  • Player metadata (HSET/HGETALL)                   │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │     Audit & Logging Service                         │ │
│  │  • Log score changes to PostgreSQL                  │ │
│  │  • Track suspicious activities                      │ │
│  │  • Compliance records                               │ │
│  └─────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────────┐    ┌─────────────────┐
    │PostgreSQL       │    │Redis (Primary)  │
    │Database         │    │Leaderboard      │
    │• User accounts  │    │• Sorted Sets    │
    │• Audit logs     │    │• Player metadata│
    │• Metadata       │    │• Real-time data │
    └─────────────────┘    └─────────────────┘
```

---

## API Endpoints

### 1. **Get Leaderboard (Top 10)**

**Endpoint:** `GET /api/leaderboard`

**Description:** Retrieve the top 10 users with the highest scores.

**Request:**

```http
GET /api/leaderboard HTTP/1.1
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": 1,
        "username": "alice",
        "score": 9850,
        "lastUpdated": "2026-05-28T14:35:22Z"
      },
      {
        "rank": 2,
        "userId": 2,
        "username": "bob",
        "score": 9720,
        "lastUpdated": "2026-05-28T14:30:10Z"
      },
      {
        "rank": 3,
        "userId": 3,
        "username": "charlie",
        "score": 9500,
        "lastUpdated": "2026-05-28T14:20:05Z"
      }
      // ... 7 more users (up to rank 10)
    ],
    "generatedAt": "2026-05-28T14:36:00Z"
  }
}
```

---

### 2. **Update User Score**

**Endpoint:** `POST /api/score/update`

**Description:** Increment a user's score upon action completion. This endpoint requires authentication and validates the action before updating the score.

**Authentication:** Bearer Token (JWT)

**Request:**

```http
POST /api/score/update HTTP/1.1
Host: api.scoreboard.local
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "userId": 1,
  "actionId": "action_update_score",
  "actionTimestamp": "2026-05-28T14:35:15Z",
  "point": 10,
  "deviceInfo": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "newScore": 9850,
    "scoreIncrement": 10,
    "totalActionsCompleted": 985,
    "leaderboardRank": 1,
    "updatedAt": "2026-05-28T14:35:22Z"
  }
}
```

**Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Invalid action ID or missing required fields",
  "code": "INVALID_REQUEST"
}
```

**Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid or expired authentication token",
  "code": "AUTH_FAILED"
}
```

**Response (403 Forbidden):**

```json
{
  "success": false,
  "error": "User ID in token does not match request user ID",
  "code": "USER_MISMATCH"
}
```

**Response (409 Conflict):**

```json
{
  "success": false,
  "error": "Duplicate action submission detected",
  "code": "DUPLICATE_ACTION"
}
```

**Response (429 Too Many Requests):**

```json
{
  "success": false,
  "error": "Rate limit exceeded. Maximum 100 requests per minute",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

### 3. **WebSocket Connection (Real-time Updates)**

**Endpoint:** `WS /ws/leaderboard`

**Description:** Establish a WebSocket connection to receive real-time leaderboard updates when scores change.

**Connection Request:**

```javascript
ws = new WebSocket('ws://api.scoreboard.local/ws/leaderboard?token=<JWT_TOKEN>');

ws.onopen = () => {
  console.log('Connected to leaderboard updates');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Leaderboard updated:', message);
};
```

**Message Format (Leaderboard Update):**

```json
{
  "type": "LEADERBOARD_UPDATE",
  "timestamp": "2026-05-28T14:35:22Z",
  "data": [
    {
      "rank": 1,
      "userId": 1,
      "username": "alice",
      "score": 9850
    },
    // ... more users
  ]
}
```

**Message Format (Score Change):**

```json
{
  "type": "SCORE_CHANGED",
  "timestamp": "2026-05-28T14:35:22Z",
  "data": {
    "username": "alice",
    "newScore": 9850,
  }
}
```

---

## Database Schema

### Redis Data Structures (Leaderboard - Primary Database)

#### Sorted Set: Leaderboard Data

```
Key: game:leaderboard
Type: Sorted Set (ZSET)
Data: {username: score, username: score, ...}

Example:
  username: "alice"       score: 9850
  username: "bob"        score: 9720
  username: "charlie"    score: 9500
  
Useful Commands:
  - ZADD game:leaderboard <score> <username>         // Add/update score
  - ZINCRBY game:leaderboard <amount> <username>     // Increment score (atomic)
  - ZRANGE game:leaderboard 0 9 REV WITHSCORES       // Get top 10
  - ZRANK game:leaderboard <username> REV            // Get rank (1-indexed)
  - ZSCORE game:leaderboard <username>               // Get user's score
  - ZCARD game:leaderboard                            // Total players
  - ZREM game:leaderboard <username>                  // Remove player
```

#### Hash Set: Player Metadata (Optional)

```
Key: player:meta:{username}
Type: Hash (HSET)
Data: {field: value, field: value, ...}
TTL: 1 days (automatically expires)

Example for username "alice":
Key: player:meta:alice
Fields:
  - email: alice@example.com
  - region: US-East
  - joinDate: 2024-01-15

Useful Commands:
  - HSET player:meta:alice field1 value1 field2 value2
  - HGETALL player:meta:alice                         // Get all metadata
  - EXPIRE player:meta:alice 2592000                  // Set TTL (30 days)
  - HDEL player:meta:alice field1                     // Remove field
```

### PostgreSQL Database (Audit & Account Management)

#### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  INDEX idx_username (username),
  INDEX idx_created_at (created_at)
);
```

#### Actions Table

```sql
CREATE TABLE actions (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_data JSON,
  score_increment INT DEFAULT 10,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_completed_at (completed_at DESC),
  UNIQUE KEY unique_action_per_user (id, user_id)
);
```

#### Score History Table (Audit Log)

```sql
CREATE TABLE score_history (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  action_id INT NOT NULL,
  score_change INT NOT NULL,
  new_score INT NOT NULL,
  old_score INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  change_reason VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (action_id) REFERENCES actions(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_username (username)
);
```

### Why Redis for Leaderboard?

**Performance Benefits:**

- O(log N) operations for sorted set queries (vs O(n log n) for SQL sorting)
- In-memory storage = microsecond response times (vs milliseconds for disk I/O)
- Atomic operations prevent race conditions
- Natural data structure fit (sorted sets are perfect for leaderboards)
- No complex joins or transactions needed

**Trade-offs:**

- Redis data persists in memory (use RDB snapshots or AOF for durability)
- Limited to available RAM (but leaderboard is typically small data)
- Audit logs still stored in PostgreSQL for compliance/history

---

## Security & Authorization

### Authentication Flow

1. **User Login:** User authenticates via login endpoint (not in this spec) and receives JWT token
2. **Token Content:** JWT includes:
   - `userId` - Unique user identifier
   - `username` - Username
   - `iat` - Issued at timestamp
   - `exp` - Expiration timestamp (recommend: 1 hour)
   - `scope` - Permissions (e.g., "score:update")

### Authorization Checks

**For Score Update Endpoint:**

```
1. Validate JWT token
   - Check signature using secret key
   - Verify token has not expired
   - Return 401 if invalid/expired

2. Verify user identity
   - Extract userId from token
   - Compare with userId in request body
   - Return 403 if mismatch

3. Rate limiting check
   - Check if user exceeded rate limit (e.g., 100 requests/minute)
   - Return 429 if exceeded

4. Action validation
   - Verify action exists and belongs to this user
   - Check action was not already processed
   - Return 409 if duplicate action detected

5. Timestamp validation
   - Verify actionTimestamp is within acceptable window (e.g., ±5 minutes)
   - Prevent replay attacks
   - Return 400 if timestamp is invalid

6. IP/Device validation (optional)
   - Compare current IP with user's profile
   - Flag suspicious activities for audit log
   - Allow but log if different from usual pattern
```

### Security Measures

1. **Input Validation**
   - Validate all input parameters against expected types/formats
   - Sanitize strings to prevent injection attacks

2. **Rate Limiting**
   - Per-user rate limiting: 100 requests per minute
   - Per-IP rate limiting: 500 requests per minute
   - Use Redis or in-memory store to track request counts

3. **Duplicate Detection**
   - Track recently processed actionIds in Redis (TTL: 5 minutes)
   - Prevent duplicate score increments from retry requests

4. **Audit Logging**
   - Log all score changes with full context
   - Store IP address, user agent, timestamp
   - Flag suspicious patterns (e.g., rapid score increases)

5. **HTTPS Only**
   - All endpoints must use HTTPS/WSS (WebSocket Secure)
   - Enforce HTTPS redirect for HTTP requests

6. **CORS Configuration**
   - Restrict CORS to trusted domains only
   - Set appropriate headers: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`

---

## Execution Flow Diagrams

### Score Update Flow

```mermaid
sequenceDiagram
    participant Client as Client (Web)
    participant API as Score Update API
    participant Auth as Auth Service
    participant Redis as Redis (Leaderboard DB)
    participant PostgreSQL as PostgreSQL (Audit Log)
    participant WS as WebSocket Handler

    Client->>API: POST /api/score/update (with JWT)
    
    API->>Auth: Validate JWT token
    alt Token Invalid/Expired
        Auth-->>API: 401 Unauthorized
        API-->>Client: 401 Response
    else Token Valid
        Auth-->>API: Token verified
        
        API->>PostgreSQL: Check action exists & not processed
        alt Action Already Processed
            PostgreSQL-->>API: Duplicate detected
            API-->>Client: 409 Conflict
        else Action Valid
            PostgreSQL-->>API: Action retrieved
            
            API->>API: Calculate score increment (10 points)
            
            API->>Redis: ZINCRBY game:leaderboard 10 username
            Redis-->>API: New score (atomic operation)
            
            API->>Redis: ZRANK game:leaderboard username REV
            Redis-->>API: User's rank
            
            API->>PostgreSQL: Insert score history record (async/background)
            
            API->>WS: Broadcast leaderboard update to all clients
            WS-->>Client: WebSocket message (LEADERBOARD_UPDATE)
            
            API-->>Client: 200 OK (new score + rank from Redis)
        end
    end
```

**Key Improvements with Redis:**

- Score increment is atomic (no race conditions with ZINCRBY)
- Rank lookup is instant with ZRANK REV
- No cache invalidation needed
- Direct read from primary source (Redis Sorted Set)

### Leaderboard Retrieval Flow

```mermaid
sequenceDiagram
    participant Client as Client (Web)
    participant API as Leaderboard API
    participant Redis as Redis (Primary DB)

    Client->>API: GET /api/leaderboard

    API->>Redis: ZRANGE game:leaderboard 0 9 REV WITHSCORES
    
    Redis-->>API: Top 10 users with scores (microseconds)
    
    API->>API: Format response
    
    API-->>Client: 200 OK (fresh data from Redis)
```

**Note:** No caching layer needed - Redis Sorted Sets are optimized for this exact use case and provide sub-millisecond response times.

### WebSocket Real-time Update Flow

```mermaid
sequenceDiagram
    participant Client1 as Client 1
    participant Client2 as Client 2
    participant WSServer as WebSocket Server
    participant API as Score Update API
    participant Redis as Redis (Leaderboard DB)

    Client1->>WSServer: WS /ws/leaderboard (subscribe)
    WSServer-->>Client1: Connected
    Client2->>WSServer: WS /ws/leaderboard (subscribe)
    WSServer-->>Client2: Connected

    Client1->>API: POST /api/score/update (user1 score +10)
    
    API->>Redis: ZINCRBY game:leaderboard 10 username
    Redis-->>API: New score
    
    API->>Redis: ZRANGE game:leaderboard 0 9 REV WITHSCORES
    Redis-->>API: Current top 10 data
    
    API->>WSServer: Broadcast LEADERBOARD_UPDATE
    WSServer-->>Client1: LEADERBOARD_UPDATE message
    Client1->>Client1: Update UI with new leaderboard
    WSServer-->>Client2: LEADERBOARD_UPDATE message
    Client2->>Client2: Update UI with new leaderboard

    API->>WSServer: Broadcast SCORE_CHANGED
    WSServer-->>Client1: SCORE_CHANGED message
    Client1->>Client1: Update UI with new score
    
```

**Benefits:**

- Single source of truth (Redis, not fragmented cache + DB)
- Consistent data across all clients
- No cache coherency issues
- Instant updates without synchronization delays

---

## Implementation Guidelines

### Technology Stack (Recommendations)

- **Framework:** Node.js (Express)
- **Leaderboard Database:** Redis (Primary - Sorted Sets for leaderboard, Hashes for metadata)
- **Audit & Account Database:** PostgreSQL (ACID transactions for audit logs and user accounts)
- **Real-time Communication:** Socket.io or native WebSockets
- **Authentication:** JWT with RS256 algorithm (asymmetric signing)
- **Rate Limiting:** Redis (with sliding window algorithm)
- **Implementation Reference:** See [LeaderboardService.ts](LeaderboardService.ts), [RedisCLient.ts](RedisCLient.ts) for implementation example

### Configuration

```bash
// API Configuration
API_PORT=3000

// Database Configuration (Audit Logs & User Accounts)
DATABASE_URL=postgresql://user:pass@localhost:5432/scoreboard

// Redis Configuration (Leaderboard - Primary Database)
REDIS_URL=redis://localhost:6379
LEADERBOARD_KEY=game:leaderboard
PLAYER_META_PREFIX=player:meta:
PLAYER_META_TTL_SECONDS=2592000 // 30 days

// JWT Configuration
JWT_SECRET=<your-secret-key>
JWT_EXPIRY=3600 // 1 hour in seconds

// Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_IP=500 // global limit
RATE_LIMIT_WINDOW=60 // seconds

// Duplicate Action Detection (Using Redis)
DUPLICATE_ACTION_WINDOW=300 // 5 minutes
```

### Error Handling

All error responses must follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-05-28T14:35:22Z"
}
```

### Logging

Log all significant events:

- User authentication (success/failure)
- Score updates (userId, amount, timestamp)
- Suspicious activities (duplicate actions, unusual patterns)
- API errors and exceptions
- Performance metrics (response times, cache hit rates)

---

## Improvement Suggestions & Considerations

### 1. **Score Decay / Time-Based Ranking**

**Current Issue:** Older high scores remain at the top indefinitely.

**Suggestion:** Implement a score decay mechanism where scores gradually decrease over time, encouraging continuous engagement. Or use a time-weighted leaderboard (top scores in last 7 days).

```
Formula: adjusted_score = score * decay_factor ^ (days_since_update)
where decay_factor = 0.95 (5% decay per day)
```

### 2. **Anti-Cheat Mechanisms**

**Current Issue:** Specification assumes valid action completion, but doesn't validate actions on backend.

**Suggestions:**

- Implement server-side action validation
- Track action completion patterns and flag anomalies (e.g., 1000 actions in 1 minute)
- Use machine learning for fraud detection
- Implement CAPTCHA for users with suspicious patterns

### 3. **Tiered Scoring System**

**Current Issue:** All actions give fixed score increment (10 points).

**Suggestion:** Implement difficulty-based scoring:

```
- Easy action: +5 points
- Medium action: +10 points
- Hard action: +25 points
- Rare achievement: +100 points
```

### 4. **Pagination for Leaderboard**

**Current Issue:** Only returns top 10 users.

**Suggestion:**

- Add pagination support: `GET /api/leaderboard?page=1&limit=10`
- Add user's current rank and nearby users: `GET /api/leaderboard/around-me`

### 5. **Redis Persistence & Durability**

**Current Implementation:** Redis stores leaderboard in memory.

**Recommendation:**

- Enable Redis RDB snapshots: `BGSAVE` every 60 seconds
- Or enable AOF (Append-Only File) for write durability
- Or use Redis replication with a secondary replica
- Consider "redis:latest" with persistent volume for production

```bash
// Redis configuration for durability
save 60 1000  // Snapshot every 60 sec if 1000 keys changed
appendonly yes // Enable AOF
appendfsync everysec // Fsync every second
```

### 6. **Multiple Leaderboards in Redis**

**Suggestion:** Support multiple leaderboards using different keys:

```javascript
// Global leaderboard
game:leaderboard:global

// Season leaderboards
game:leaderboard:season:season-1
game:leaderboard:season:season-2

// Team leaderboards
game:leaderboard:team:team-001
game:leaderboard:team:team-002

// All commands work the same way with different keys
ZADD game:leaderboard:season:season-1 100 username
ZRANGE game:leaderboard:season:season-1 0 9 REV WITHSCORES
```

### 7. **Seasonal/Reset Mechanics**

**Current Issue:** Leaderboard grows indefinitely without reset.

**Suggestion:**

- Reset leaderboard monthly/quarterly using separate Redis keys
- Archive previous season leaderboards to PostgreSQL
- Show "All-Time" vs "This Season" options

```javascript
// Season management
game:leaderboard:2026-05 // Current season
game:leaderboard:2026-04 // Previous season (archived to PostgreSQL)

// At season end:
// 1. Backup current leaderboard to PostgreSQL
// 2. Create new leaderboard key for new season
// 3. Keep old key for historical queries
```

### 8. **Data Consistency & Redis Replication**

**Current Implementation:** Single Redis instance.

**Recommendation for High Availability:**

- Deploy Redis cluster with replication (primary + replicas)
- Use Sentinel for automatic failover
- Ensure RDB snapshots are replicated across nodes

```
  ┌─────────────────┐
  │  Redis Primary  │
  │  (Leaderboard)  │
  └────────┬────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌──────────┐  ┌──────────┐
│ Replica 1│  │ Replica 2│
└──────────┘  └──────────┘
```

### 9. **Performance Optimization**

**Suggestions (Redis-specific):**

- Monitor Redis memory usage (`INFO memory`)
- Use Redis SCAN instead of KEYS for large datasets
- Implement connection pooling to Redis
- Use pipelining for batch operations to reduce network round trips
- Monitor Redis CPU usage and response times

```javascript
// Pipelining example - reduces network round trips
const pipeline = redisClient.pipeline();
for (let i = 0; i < 100; i++) {
  pipeline.zadd('game:leaderboard', score[i], username[i]);
}
await pipeline.exec();
```

### 10. **Testing Strategy**

**Recommendations:**

- Unit tests for leaderboard service (Redis operations)
- Integration tests for API endpoints with real Redis
- Load testing for concurrent score updates (ZINCRBY stress test)
- Security testing (SQL injection, XSS, CSRF, JWT validation)
- End-to-end tests for the full flow (Score update → WebSocket broadcast)
- Redis failover tests (test behavior when Redis is unavailable)

### 11. **Monitoring & Alerting**

**Suggestions:**

- Monitor API response times (target: <100ms for 95th percentile with Redis)
- Alert on error rates exceeding threshold
- Monitor Redis memory usage (alert if >80% of max memory)
- Monitor Redis eviction policies
- Alert on suspicious score patterns (e.g., 100 score increases in 1 second)
- Track WebSocket connection counts and message volumes
- Monitor PostgreSQL audit log write latency

---

## Summary

This specification provides a robust, secure, and scalable foundation for the Scoreboard API Service using a hybrid architecture:

**Redis Layer:** High-performance leaderboard operations (Sorted Sets)
**PostgreSQL Layer:** Reliable audit logs and user account management

The implementation should prioritize:

1. **Security:** Strong authentication, authorization, and input validation
2. **Performance:** Redis ZSET operations for instant leaderboard updates (<10ms)
3. **Reliability:** Audit logging to PostgreSQL for compliance and debugging
4. **Scalability:** Stateless API design with Redis replication for high availability
5. **Data Integrity:** PostgreSQL transactions for account management + Redis atomicity for scores

Follow the API contracts closely to ensure client compatibility. Implement all security measures to prevent unauthorized score manipulation.
