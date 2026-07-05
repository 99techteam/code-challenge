# System Design

## 1. Overview

### Problem Statement
Design a real-time leaderboard service that displays the top 10 users across multiple time windows with live updates. The system must handle high-throughput score updates while maintaining data consistency and providing sub-100ms query latency.

### Key Requirements

**Functional Requirements:**
- Display top 10 users across three time windows: Last hour, Today, All-time
- Live updates via Server-Sent Events (SSE)
- Query user's current rank in any time window
- Server-side validation prevents unauthorized score updates
- Rate limiting: 100 actions/minute per user, 10K TPS global

**Non-Functional Requirements:**
- Scale: 1M MAU, 100K DAU, 10K concurrent peak users
- Throughput: 10K TPS sustained write load
- Latency: < 100ms for leaderboard queries
- Freshness: Near real-time updates (within 1-2 seconds)
- Durability: Events persisted for 90 days for recovery and analytics
- Availability: 99.9% uptime target

### Scale Assumptions
- 1M MAU users (100K DAU, 10K concurrent peak)
- 10K TPS sustained write throughput
- 3 time windows: Last hour, Today, All-time
- Top 10 leaderboard (extensible to 100)
- Score updates are additive only
- Server validates all actions before processing
- Events retained for 90 days in ClickHouse

### Tech Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Event Bus | Kafka | Durable event streaming, source of truth |
| Cache | Redis | Live leaderboards (sorted sets) |
| Analytics DB | ClickHouse | Long-term event storage, aggregations |
| Live Updates | Server-Sent Events | Real-time push to clients |
| Authentication | JWT | Stateless user authentication |

## 2. Component Architecture

### Services Overview

We have **3 microservices** in the system:

1. **Score Update Service** - Handles score submissions and publishes to Kafka
2. **Event Processor Service** - Consumes events from Kafka and updates both Redis and ClickHouse
3. **Leaderboard Service** - Serves leaderboard queries (HTTP) and pushes live updates (SSE)

Plus infrastructure components: API Gateway/Load Balancer, Kafka Cluster, Redis, ClickHouse.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  (Web/Mobile - 1M MAU)                                                  │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ 1. POST /scores (JWT auth)
                 │ 2. GET /leaderboard (HTTP)
                 │ 3. GET /leaderboard/stream (SSE)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                         │
│  - JWT validation                                                       │
│  - Rate limiting (per-user + global)                                    │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 SERVICE 1: SCORE UPDATE SERVICE                          │
│  - Validates action with business logic                                 │
│  - Writes score event to Kafka                                          │
│  - Returns 202 Accepted immediately                                     │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ 4. Publish to Kafka (round-robin partitioning)
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           KAFKA CLUSTER                                  │
│  Topic: score-events                                                    │
│  Partitions: 12 (scaled to throughput)                                  │
│  Retention: 7 days                                                      │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
                 │ 5. Consume events
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 SERVICE 2: EVENT PROCESSOR SERVICE                       │
│  - Consumes events from Kafka                                           │
│  - Checks idempotency (skip duplicates)                                 │
│  - Updates Redis sorted sets (last_hour, today, alltime)                │
│  - Inserts into ClickHouse for long-term storage                        │
│  - Handles TTL and window resets                                        │
└────────────────┬────────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│    REDIS     │  │  CLICKHOUSE  │
│  (3 sorted   │  │  (Event      │
│   sets)      │  │   storage)   │
└──────┬───────┘  └──────────────┘
       │
       │ 6. Query / Subscribe
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 SERVICE 3: LEADERBOARD SERVICE                           │
│  - Reads from Redis sorted sets                                         │
│  - Returns top 10 or user rank (HTTP API)                               │
│  - Maintains persistent SSE connections                                 │
│  - Subscribes to Redis pub/sub for live changes                         │
│  - Pushes leaderboard & rank updates to clients (SSE)                   │
│  - Selective broadcasting: only notify active viewers                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Infrastructure Components:**

**API Gateway / Load Balancer:**
- JWT validation on every request
- Rate limiting (per-user + global)
- SSL termination
- Request routing to appropriate services

**Kafka Cluster:**
- Durable event streaming
- Fan-out to multiple consumers
- 7-day retention for recovery

**Redis:**
- Live leaderboards (3 sorted sets)
- Idempotency keys
- Pub/Sub for SSE fan-out

**ClickHouse:**
- Long-term event storage
- Materialized views for aggregations

**Microservices:**

**Service 1: Score Update Service**
- Action validation with business logic
- Event generation and publishing to Kafka
- Asynchronous response (202 Accepted)

**Service 2: Event Processor Service**
- Consumes events from Kafka
- Idempotency checking (skip duplicates)
- Updates Redis sorted sets for all time windows
- Inserts events into ClickHouse for long-term storage
- Handles TTL and window resets

**Service 3: Leaderboard Service**
- Read from Redis sorted sets
- Return top 10 or user rank (HTTP API)
- Maintain persistent SSE connections
- Subscribe to Redis pub/sub for live changes
- Push leaderboard and rank updates to clients (SSE)
- Selective broadcasting: only notify active viewers (5.8)

### Future: 100K User Optimization Architecture

When concurrent users exceed 100K, the following optimization layers are added on top of the base architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OPTIMIZATION LAYERS                              │
│                                                                          │
│  Layer 1: SSE Transport (5.4)                                           │
│  └─ Foundation: Server-Sent Events for real-time push                   │
│                                                                          │
│  Layer 2: Selective Broadcasting (5.8)                │
│  └─ Track user viewing state in Redis                                   │
│  └─ Only send updates to active viewers + affected users                │
│  └─ Reduces messages by 90% (100K → 10K per update)                    │
│                                                                          │
│  Layer 3: Batching (10.1) - FUTURE (if needed)                           │
│  └─ Group updates into 1-second windows                                 │
│  └─ Reduces message rate by 50-80%                                      │
│  └─ Tradeoff: 1-second delay (acceptable for leaderboards)             │
│                                                                          │
│  Layer 4: Priority Tiers (10.2) - FUTURE (if needed)                    │
│  └─ Top 100 users: 1-second updates                                     │
│  └─ Rank 101-1000: 2-second updates                                     │
│  └─ Rank 1000+: 5-second updates                                        │
│  └─ Reduces load by 50-70%                                              │
└─────────────────────────────────────────────────────────────────────────┘

Current Implementation (10K TPS, 100K concurrent users):
  SSE + Selective Broadcasting = 10K messages/sec (sustainable)

Future (50K+ TPS, 500K+ concurrent users):
  SSE + Selective Broadcasting + Batching + Priority Tiers
  = 5K messages/sec (sustainable)
```

**Key Changes for 100K Users:**

1. **Selective Broadcasting (5.8)**: Track which users are actively viewing leaderboard
   - Redis hash: `HSET user:123:state viewing today`
   - Only send `leaderboard_update` to active viewers
   - Send `rank_update` only to users whose rank changed

2. **Event Batching (10.1)**: Future optimization
   - Group updates into 1-second windows
   - Reduces message rate by 50-80%
   - Tradeoff: 1-second delay (acceptable for leaderboards)

3. **Priority Tiers (10.2)**: Future optimization
   - Higher-ranked users get more frequent updates
   - Reduces overall load while satisfying top users

## 3. Data Schema

### 3.1 Redis Data Model

**Sorted Sets (Leaderboards):**

```
Key: leaderboard:last_hour
Type: Sorted Set
Members: user_id
Scores: encoded score (score + timestamp for tie-breaking)
TTL: 3600 seconds (1 hour)

Key: leaderboard:today
Type: Sorted Set
Members: user_id
Scores: encoded score
Reset: Daily at midnight UTC (cron job)

Key: leaderboard:alltime
Type: Sorted Set
Members: user_id
Scores: encoded score
```

### 3.2 ClickHouse Schema

**Event Storage Table:**

```sql
CREATE TABLE score_events (
  timestamp DateTime,
  user_id UInt32,
  action_type String,
  score_delta Int32,
  event_id String,
  metadata String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, timestamp);
```

**Materialized View (All-Time Aggregation):**

```sql
CREATE MATERIALIZED VIEW alltime_scores
ENGINE = AggregatingMergeTree()
ORDER BY user_id
AS SELECT
    user_id,
    sumState(score_delta) AS total_score
FROM score_events
GROUP BY user_id;
```

**Query Examples:**

```sql
-- Top 10 today
SELECT user_id, SUM(score_delta) as total_score
FROM score_events
WHERE timestamp >= today()
GROUP BY user_id
ORDER BY total_score DESC
LIMIT 10;

-- All-time top 10 (from materialized view)
SELECT user_id, sumMerge(total_score) AS score
FROM alltime_scores
GROUP BY user_id
ORDER BY score DESC
LIMIT 10;
```

### 3.3 Kafka Topic Schema

**Topic Configuration:**

```
Topic: score-events
Partitions: 12 (scaled to handle 10K TPS)
Partitioning: Round-robin (even distribution, no hot partitions)
Retention: 7 days (allows Redis recovery from Kafka replay)
Replication factor: 3 (fault tolerance)
```

**Event Schema:**

```json
{
  "event_id": "abc-123-def-456",
  "user_id": 123,
  "action_type": "level_complete",
  "score_delta": 100,
  "event_timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "level_id": 42,
    "completion_time_ms": 12345
  }
}
```

## 4. API Specification

### 4.1 Score Update API

**Endpoint:** `POST /api/v1/scores`

**Request:**

```
Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Body:
{
  "action_type": "level_complete",
  "score_delta": 100,
  "event_timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "level_id": 42,
    "completion_time_ms": 12345
  }
}
```

**Response:**

```
202 Accepted
{
  "status": "accepted",
  "event_id": "abc-123-def-456"
}
```

**Error Responses:**

| Status Code | Description |
|-------------|-------------|
| 401 | Invalid or expired JWT |
| 429 | Rate limit exceeded |
| 400 | Invalid action or score_delta |
| 503 | Kafka unavailable |

### 4.2 Leaderboard Query API

**Get Leaderboard:**

```
GET /api/v1/leaderboard?window={hour|today|alltime}&limit=10&offset=0

Response:
{
  "window": "today",
  "rankings": [
    {"user_id": 123, "username": "player1", "score": 5000, "rank": 1},
    {"user_id": 456, "username": "player2", "score": 4800, "rank": 2}
  ],
  "total_count": 100000,
  "metadata": {
    "last_updated": "2024-01-15T10:30:45Z",
    "data_age_seconds": 2
  }
}
```

**Get User Rank:**

```
GET /api/v1/leaderboard/rank?window=today&user_id=789

Response:
{
  "user_id": 789,
  "username": "player789",
  "score": 1500,
  "rank": 42,
  "window": "today"
}
```

### 4.3 SSE Stream API

**Endpoint:** `GET /api/v1/leaderboard/stream?window=today&user_id=789`

**SSE Event Format:**

```
event: leaderboard_update
data: {"window": "today", "rankings": [...]}

event: rank_update
data: {"user_id": 789, "rank": 41, "score": 1550}
```

**Connection Management:**
- Persistent HTTP connection
- Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s, 32s, 60s)
- Fallback to polling after 3 failed attempts (every 5 seconds)

## 5. Design Decisions

### 5.1 Event Bus: Kafka vs Redis Streams

**Decision:** Kafka

**Assumptions:**
- 10K TPS sustained write throughput required
- Events must be durable and replayable for disaster recovery
- Multiple consumers need independent access to same events
- Team has Kafka expertise or can acquire it

**Problem:** Need durable, high-throughput event streaming with replay capability for disaster recovery and multiple consumer fan-out.

**Analysis:**

**Why Kafka:**
- **Durability**: Events persisted to disk, replicated across brokers
- **Replayability**: 7-day retention allows Redis recovery by replaying events
- **Horizontal scaling**: 12 partitions can handle 10K+ TPS, easily scalable to 48+ partitions
- **Fan-out pattern**: Multiple consumer groups (Redis, ClickHouse, Analytics) can independently process same events
- **Backpressure handling**: Kafka buffers events when consumers are slow, preventing data loss

**How it works:**
1. Score Update Service publishes events to Kafka topic `score-events` (12 partitions, round-robin)
2. Event Processor Service consumes from Kafka (3 consumer instances)
3. Events retained for 7 days (allows Redis rebuild if needed)
4. Multiple consumer groups can process same events independently

**Benefits:**
- Handles 10K+ TPS with room to scale to 100K+ TPS
- 7-day retention enables disaster recovery
- Fan-out pattern supports multiple downstream services
- Proven at scale (LinkedIn, Uber, Netflix)

**Tradeoffs accepted:**
- **Operational complexity**: Kafka requires 3+ brokers, ZooKeeper/KRaft, monitoring
- **Eventual consistency**: Kafka's at-least-once delivery requires idempotency handling
- **Learning curve**: Team needs Kafka expertise (partitions, consumer groups, offsets)

### 5.2 Cache Layer: Redis Sorted Sets vs Database Indexes

**Decision:** Redis Sorted Sets

**Assumptions:**
- Sub-5ms query latency required for leaderboard reads
- Top-K queries (top 10) are the most common read pattern
- 1M MAU users, ~200MB RAM acceptable for sorted sets
- Team familiar with Redis operations and monitoring

**Problem:** Need fast leaderboard queries (top 10, user rank) with sub-5ms latency at 10K TPS read load.

**Analysis:**

**Why Redis:**
- **Performance**: O(log N) updates, O(K) top-K queries, in-memory speed (< 5ms latency)
- **Purpose-built**: Sorted Sets are designed for leaderboards (ZADD, ZREVRANGE, ZREVRANK)
- **Simplicity**: Single command for top-K (`ZREVRANGE leaderboard:today 0 9 WITHSCORES`)
- **TTL support**: Built-in expiration for "Last hour" window (3600 seconds)
- **Pub/Sub**: Enables SSE fan-out pattern (all SSE servers receive updates)

**How it works:**
1. Three Redis sorted sets: `leaderboard:last_hour`, `leaderboard:today`, `leaderboard:alltime`
2. Event Processor updates sorted sets via `ZADD` command (O(log N))
3. Leaderboard Service queries via `ZREVRANGE` (O(K) for top K)
4. Score encoding includes timestamp for tie-breaking (first-to-reach wins)
5. TTL on `last_hour` set (3600 seconds) for automatic cleanup

**Benefits:**
- Sub-5ms query latency at 10K+ TPS
- Purpose-built data structure for leaderboards
- Built-in TTL for time window management
- Pub/Sub enables real-time SSE updates

**Tradeoffs accepted:**
- **Memory cost**: 1M users × 3 sorted sets = ~200MB RAM (acceptable at current scale)
- **Single-node limitations**: Redis is single-node (can scale with Redis Cluster at 50K+ TPS)
- **Data loss risk**: Redis failure requires recovery from Kafka/ClickHouse (mitigated by idempotency)

### 5.3 Analytics Database: ClickHouse vs PostgreSQL+TimescaleDB

**Decision:** ClickHouse

**Assumptions:**
- Long-term event storage required (90 days retention)
- Analytical queries (SUM, GROUP BY) must be fast (< 1 second)
- Columnar storage provides better compression for time-series data
- Team can learn ClickHouse syntax and operations

**Problem:** Need long-term event storage with fast analytical queries for all-time leaderboard aggregation and historical analysis.

**Analysis:**

**Why ClickHouse:**
- **Columnar storage**: 10-100x compression ratio (30TB → 3TB), reduces storage costs
- **Aggregation performance**: 10-100x faster than PostgreSQL for analytical queries (SUM, GROUP BY)
- **Materialized views**: Pre-aggregate scores per user, query time O(users) not O(events)
- **Horizontal scaling**: Shard by user_id, handle 100K+ TPS with 5-node cluster
- **Time-series optimized**: Built-in functions for time-based aggregations (toYYYYMM, time_bucket)

**How it works:**
1. Event Processor inserts events into `score_events` table (MergeTree engine)
2. Materialized view `alltime_scores` automatically aggregates total score per user
3. Partitioned by month (toYYYYMM) for efficient queries and data lifecycle management
4. Queries use materialized view for O(users) instead of O(events)
5. Data compressed 10-100x (columnar storage)

**Benefits:**
- 10-100x faster analytical queries than row-based databases
- 10-100x better compression (30TB → 3TB storage)
- Materialized views enable fast all-time leaderboard queries
- Horizontal scaling with sharding

**Tradeoffs accepted:**
- **Learning curve**: ClickHouse syntax is different from PostgreSQL, team needs training
- **Operational complexity**: ClickHouse requires cluster management, monitoring, backups
- **Less familiar**: Fewer developers have ClickHouse experience compared to PostgreSQL

### 5.4 Live Updates: SSE vs WebSockets

**Decision:** Server-Sent Events (SSE)

**Assumptions:**
- Unidirectional push (server→client) is sufficient for leaderboard updates
- Clients don't need to send data through the live update channel
- HTTP-based infrastructure (load balancers, proxies) must support the protocol
- Auto-reconnection is valuable for unstable mobile networks

**Problem:** Need real-time push updates to clients when leaderboard changes, with automatic reconnection handling.

**Analysis:**

**Why SSE:**
- **Unidirectional**: Server→client push is sufficient (clients don't send data through SSE channel)
- **HTTP-based**: Works with existing HTTP infrastructure (load balancers, proxies, CORS)
- **Auto-reconnect**: Built-in reconnection handling (browser automatically reconnects on failure)
- **Simplicity**: Standard HTTP protocol, easy to debug, no custom framing
- **Browser support**: All modern browsers support SSE (EventSource API)

**How it works:**
1. Client opens SSE connection: `GET /api/v1/leaderboard/stream?window=today`
2. Leaderboard Service maintains persistent HTTP connection
3. Service subscribes to Redis pub/sub channel `leaderboard:today:updates`
4. When leaderboard changes, Service pushes update to all connected clients
5. Browser automatically reconnects on connection failure (exponential backoff)

**Benefits:**
- Works with existing HTTP infrastructure (no special proxy config)
- Built-in auto-reconnect (better mobile experience)
- Simpler than WebSockets (standard HTTP, easy to debug)
- Scales horizontally with Redis pub/sub fan-out

**Tradeoffs accepted:**
- **HTTP/1.1 connection limits**: Browsers limit 6 connections per domain (mitigated by HTTP/2)
- **Browser support**: IE11 doesn't support SSE (requires polyfill, but IE11 is EOL)
- **Unidirectional limitation**: Cannot send data from client to server (but we don't need to)

**Hierarchical optimization for 100K users:**

SSE is the transport foundation. At 100K concurrent users, additional optimization layers are built on top of SSE:
- **5.8 Selective Broadcasting**: Controls WHO gets updates (only relevant users) - **Implemented**
- **10.1 Event Batching**: Controls WHEN to send (group updates to reduce frequency) - **Future**
- **10.2 Priority Tiers**: Controls HOW OFTEN per user rank (higher rank = more frequent) - **Future**

Each layer builds on SSE and can be implemented incrementally as user count grows. See Section 10 for future enhancements.

### 5.5 All-Time Aggregation: Materialized View vs Raw Queries

**Decision:** ClickHouse materialized view

**Assumptions:**
- All-time leaderboard queries must be fast (< 1 second)
- Historical analysis requires access to raw events
- 1M+ users with billions of events over time
- ClickHouse materialized views are maintained automatically

**Problem:** Need the source of truth and fast all-time leaderboard queries that scale as data grows from millions to billions of events.

**Analysis:**

**Why materialized view:**
- **Performance**: Pre-aggregated scores, query time O(users) not O(events)
- **Automatic maintenance**: ClickHouse maintains materialized view in background
- **Flexibility**: Can query raw events for historical analysis, materialized view for current rankings
- **Scalability**: Handles billions of events, query time remains constant as data grows

**How it works:**
1. Materialized view `alltime_scores` automatically aggregates `SUM(score_delta)` per user
2. View updated in background as new events inserted into `score_events` table
3. Query uses `sumMerge(total_score)` to get pre-aggregated scores
4. Query time O(users) instead of O(events) - constant as data grows
5. Raw events still available for historical analysis

**Benefits:**
- Query time O(users) instead of O(events) - constant as data grows
- Automatic maintenance by ClickHouse (no manual jobs)
- Flexible: can query raw events or pre-aggregated scores
- Scales to billions of events without performance degradation

**Tradeoffs accepted:**
- **Storage overhead**: Materialized view requires extra storage (1M users × 16 bytes = 16MB, acceptable)
- **Background processing**: ClickHouse maintains materialized view in background, adds CPU overhead
- **Complexity**: Requires understanding of ClickHouse materialized views, team needs training

### 5.6 SSE Scalability: Horizontal Scaling + Redis Pub/Sub

**Decision:** Horizontal scaling with Redis pub/sub fan-out

**Assumptions:**
- 10K concurrent connections per SSE server is achievable
- Load balancer supports sticky sessions (session affinity)
- Redis pub/sub has < 1ms latency
- Team can operate multiple SSE server instances

**Problem:** Need to handle 100K+ concurrent SSE connections for live leaderboard updates.

**Analysis:**

**Why horizontal scaling:**
- **Capacity**: 10+ SSE servers handle 100K+ concurrent connections (10K connections per server)
- **Standard pattern**: Proven pattern for real-time systems at scale
- **Flexibility**: Can add/remove SSE servers based on load, auto-scaling friendly

**Why Redis pub/sub:**
- **Fan-out pattern**: All SSE servers receive updates simultaneously
- **Simplicity**: Standard Redis feature, well-documented, easy to implement
- **Performance**: Redis pub/sub is fast (< 1ms latency), suitable for real-time updates

**How it works:**
1. 10+ SSE server instances behind load balancer (sticky sessions)
2. Each server maintains up to 10K persistent SSE connections
3. All servers subscribe to Redis pub/sub channel `leaderboard:today:updates`
4. When leaderboard changes, Event Processor publishes to Redis pub/sub
5. All SSE servers receive message simultaneously
6. Each server broadcasts to its connected clients
7. Load balancer ensures client stays on same server (sticky session)

**Benefits:**
- Handles 100K+ concurrent connections (10 servers × 10K each)
- Easy to scale horizontally (add more SSE servers)
- All servers receive updates simultaneously (Redis pub/sub)
- Proven pattern at scale (Twitch, YouTube Live)

**Tradeoffs accepted:**
- **Infrastructure complexity**: Requires 10+ SSE servers, load balancer, Redis pub/sub
- **Sticky sessions**: Users must connect to same SSE server (requires session affinity in load balancer)
- **Operational overhead**: Monitoring, logging, debugging across multiple SSE servers

### 5.8 Update Delivery: Selective Broadcasting vs Full Broadcasting

**Decision:** Selective broadcasting (only notify relevant users)

**Assumptions:**
- Most users don't need updates when they're not actively viewing the leaderboard
- Users care more about their own rank changes than global leaderboard changes
- Tracking user viewing state is feasible
- 90% of bandwidth can be saved by only notifying active viewers

**Problem:** Broadcasting full leaderboard updates to all 100K connected users wastes bandwidth and CPU when most users aren't actively viewing.

**Analysis:**

**Why selective broadcasting:**
- **Bandwidth reduction**: 90% fewer messages (only notify active viewers + affected users)
- **CPU efficiency**: SSE servers serialize JSON for fewer connections
- **Relevance**: Users only receive updates they care about (own rank, leaderboard they're viewing)
- **Scalability**: Reduces load on SSE servers, allows handling more concurrent users

**How it works:**
1. Client opens SSE connection with viewing context: `GET /stream?window=today&viewing=true`
2. Leaderboard Service tracks viewing state in Redis: `HSET user:123:state viewing today`
3. When leaderboard changes, Event Processor publishes to Redis pub/sub
4. Leaderboard Service receives update, checks which users are viewing
5. Service sends `leaderboard_update` only to active viewers
6. Service sends `rank_update` only to users whose rank changed
7. User closes leaderboard view: `HDEL user:123:state viewing`

**Benefits:**
- 90% reduction in messages sent (100K → 10K per update)
- 80% reduction in bandwidth (100MB/sec → 20MB/sec)
- Better user experience (only relevant updates)
- Enables handling 100K+ concurrent users

**Tradeoffs accepted:**
- **State tracking overhead**: Requires tracking viewing state in Redis (small memory cost)
- **Complexity**: More complex than simple broadcast (need to check viewing state)
- **Delayed updates**: Users not actively viewing don't get real-time updates (acceptable)

**Dependency:** Builds on SSE transport (5.4) and horizontal scaling (5.6).

## 6. Security Considerations

### Authentication
- **JWT tokens**: Stateless, scalable, 15-minute expiration with refresh tokens
- **API Gateway validation**: JWT validated on every request
- **Token storage**: Tokens stored in HTTP-only cookies or localStorage (XSS protection)

### Authorization
- **Server-side validation**: All score updates validated by business logic
- **No direct client writes**: Clients cannot directly modify Redis or database
- **Action verification**: Business logic verifies user completed the action before awarding points

### Rate Limiting
- **Per-user**: 100 actions/minute (prevents individual abuse)
- **Global**: 10K TPS (protects system capacity)
- **Implementation**: Redis-based sliding window counter
- **Response**: 429 Too Many Requests when exceeded

### Data Validation
- **Score delta**: Must be positive integer, max 10000
- **Action type**: Whitelist of valid action types
- **Metadata**: JSON schema validation
- **Timestamp**: Must be within 5 seconds of server time (prevents timestamp manipulation)

## 7. Scalability Strategy

### Current Capacity (10K TPS)
- **Redis**: Single instance (handles 100K+ ops/sec)
- **Kafka**: 12 partitions, 3 consumers
- **ClickHouse**: Single node (handles 100K+ inserts/sec)

### Scaling to 50K TPS
- **Redis**: Add Redis Cluster (sharding by user_id)
- **Kafka**: Increase partitions to 24, add more consumers
- **ClickHouse**: Add 2-3 nodes with sharding

### Scaling to 100K TPS
- **Redis**: 3-node cluster
- **Kafka**: 48 partitions, 6+ consumers
- **ClickHouse**: 5-node cluster with replication

## 8. Monitoring and Alerting

### Key Metrics
- **Write latency**: P95 < 100ms (API → Kafka)
- **Read latency**: P95 < 50ms (Redis queries)
- **Kafka lag**: Consumer lag < 1000 events
- **Redis memory**: < 80% of allocated memory
- **ClickHouse storage**: Growth rate < 1 TB/month
- **SSE connections**: Active connections, reconnection rate
- **Error rate**: < 0.1% for all endpoints

### Alerts
- **Kafka consumer lag**: > 10000 events
- **Redis memory**: > 90%
- **ClickHouse disk usage**: > 80%
- **API error rate**: > 1%
- **SSE connection count**: Drops > 50%

## 9. Constraints and Assumptions

### Constraints
- 1M MAU users (100K DAU, 10K concurrent peak)
- 10K TPS sustained write throughput
- 3 time windows: Last hour, Today, All-time
- Top 10 leaderboard (extensible to 100)
- Score updates are additive only (no decrements)
- Server validates all actions before processing
- Events retained for 90 days in ClickHouse
- Network latency < 100ms between services

### Assumptions
- Users can perform multiple actions per second
- Score deltas are positive integers
- Action validation takes < 50ms
- Kafka write latency < 10ms
- Redis query latency < 5ms
- ClickHouse insert latency < 20ms
- SSE connections are stable (auto-reconnect on failure)
- Clock synchronization across services (NTP)

### Out of Scope
- Arbitrary time windows (e.g., "last 3 days")
- Pagination beyond top 100
- Historical leaderboard queries (e.g., "top 10 last week")
- Multi-region deployment
- GDPR data deletion workflows

## 10. Future Improvements

> **Status: Future Enhancements** - These optimizations are not required for initial implementation.
> To be implemented when the system scales beyond current capacity or when specific user experience improvements are needed.

### 10.1 Event Batching

**Solution:** Implement 1-second batching window for leaderboard updates

**Problem it solves:** At high throughput (50K+ TPS), sending every event immediately creates unsustainable load on SSE servers and network bandwidth.

**How it works:**
1. Event Processor updates Redis sorted set
2. Event Processor publishes to Redis pub/sub
3. Leaderboard Service receives message, adds to batch queue
4. Timer fires every 1 second, processes batch
5. Service fetches latest leaderboard from Redis
6. Service sends single update covering all changes in last second
7. Client receives batched update within 1-2 seconds

**Benefits:**
- 50-80% reduction in message rate (10K → 2-5K updates/sec)
- Lower bandwidth consumption
- Better scalability for high-throughput scenarios
- 1-2 second delay is acceptable for leaderboards

**When to implement:**
- Message rate exceeds 50K TPS
- Bandwidth costs become unsustainable
- SSE servers reach CPU limits

**Dependency:** Builds on SSE transport (5.4) and selective broadcasting (5.8).

### 10.2 Priority-based Connection Tiers

**Solution:** Implement tiered update frequency based on user rank

**Problem it solves:** At 100K+ concurrent users, uniform update frequency creates unsustainable load even with selective broadcasting and batching.

**How it works:**
1. Client connects with tier based on current rank: `GET /stream?window=today&rank=42`
2. Leaderboard Service assigns tier:
   - Tier 1 (rank 1-100): 1-second updates
   - Tier 2 (rank 101-1000): 2-second updates
   - Tier 3 (rank 1000+): 5-second updates
3. Service maintains separate batch queues per tier
4. Timer fires per tier (1s, 2s, 5s), processes batch
5. Service sends update to users in that tier
6. User's tier updated when rank changes significantly

**Benefits:**
- 50-70% reduction in overall message load
- Top-ranked users (who care most) get best experience
- Enables handling 500K+ concurrent users
- Perceived as fair (users who invested time get better service)

**When to implement:**
- Concurrent users exceed 100K
- Top-ranked users request more frequent updates
- Need to scale to 500K+ users

**Tradeoffs:**
- Lower-ranked users get less frequent updates
- Requires tier assignment and tracking logic
- Must update user's tier when rank changes significantly

**Dependency:** Builds on SSE transport (5.4), selective broadcasting (5.8), and batching (10.1).

### 10.3 Distributed Tracing & Observability

**Solution:** Implement comprehensive observability stack

**Implementation:**
- OpenTelemetry for end-to-end request tracing
- Track latency breakdown: API → Kafka → Redis → ClickHouse
- Structured logging with correlation IDs
- Grafana dashboards for system health monitoring

**Benefits:**
- Faster debugging and troubleshooting
- Performance optimization insights
- SLA monitoring and compliance
- Proactive issue detection

### 10.4 Graceful Degradation

**Solution:** Implement circuit breakers and fallback mechanisms

**Implementation:**
- Circuit breakers for Redis/ClickHouse failures
- Fallback to stale data (serve cached leaderboard) when services unavailable
- Automatic recovery when services restored

**Benefits:**
- Higher availability during partial outages
- Better user experience when dependencies fail
- Reduced impact of infrastructure issues

### 10.5 Cost Optimization

**Solution:** Implement storage and memory optimization strategies

**Implementation:**
- Redis memory optimization (use hash encoding for small sorted sets)
- ClickHouse data compression policies (compress data older than 30 days)
- Auto-scaling based on actual load patterns

**Benefits:**
- 20-30% reduction in infrastructure costs
- More efficient resource utilization
- Better cost-to-performance ratio

## 11. Testing Strategy

**Unit Tests:**

- **Score Update Service:**
  - Test action validation logic
  - Test event generation
  - Test Kafka publishing (mock Kafka)
  - Test error handling (invalid input, Kafka unavailable)

- **Event Processor Service:**
  - Test idempotency checking
  - Test score encoding/decoding
  - Test Redis sorted set updates
  - Test ClickHouse event insertion
  - Test materialized view updates
  - Test TTL handling
  - Test error handling

- **Leaderboard Service:**
   - Test top-K queries
   - Test user rank queries
   - Test score decoding
   - Test freshness indicator
   - Test SSE connection management
   - Test selective broadcasting logic
   - Test pub/sub message handling
   - Test user-specific updates

**Integration Tests:**

- **End-to-end flow:**
  - Submit score update → verify Redis and ClickHouse updated
  - Query leaderboard → verify correct rankings
  - SSE connection → verify live updates received

- **Failure scenarios:**
  - Kafka unavailable → API returns 503
  - Redis unavailable → recovery procedure works
  - ClickHouse unavailable → events buffered in Kafka

- **Concurrency:**
  - Multiple concurrent score updates → no data loss
  - Multiple concurrent queries → consistent results
  - SSE reconnection → no missed updates

**Load Tests:**

- **Tools:** k6, JMeter, or custom load generator

- **Scenarios:**
  - **Baseline:** 1K TPS for 10 minutes
  - **Peak:** 10K TPS for 30 minutes
  - **Stress:** 20K TPS for 15 minutes (identify breaking point)
  - **Endurance:** 5K TPS for 2 hours (check for memory leaks)

- **Metrics to monitor:**
  - Request latency (P50, P95, P99)
  - Error rate (should be < 0.1%)
  - Kafka consumer lag (should be < 1000)
  - Redis memory usage (should be < 80%)
  - ClickHouse insert rate (should match write rate)
  - SSE connection count (should be stable)

- **Acceptance criteria:**
  - P95 latency < 100ms for API requests
  - P95 latency < 50ms for leaderboard queries
  - Error rate < 0.1%
  - No data loss (all events processed)
  - System recovers from failures automatically

**Chaos Tests:**

- **Tools:** Chaos Monkey, Gremlin, or custom scripts

- **Scenarios:**
  - Kill Redis → verify recovery procedure
  - Kill Kafka broker → verify cluster continues
  - Kill ClickHouse → verify events buffered in Kafka
  - Network partition → verify system degrades gracefully
  - High latency injection → verify timeouts work correctly

- **Expected behavior:**
   - System continues operating (degraded mode)
   - Automatic recovery when component restored
   - No data loss
   - Alerts triggered appropriately


