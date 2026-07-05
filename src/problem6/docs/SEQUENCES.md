# Sequence Diagrams

All diagrams use Mermaid syntax and render natively in GitHub/GitLab.

## 1. Score Update Flow

The main write path for processing user actions and updating leaderboards.

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant S as Score Service
    participant K as Kafka
    participant EP as Event Processor
    participant R as Redis
    participant CH as ClickHouse

    C->>API: POST /scores (JWT)
    API->>API: Validate JWT + Rate Limit
    API->>S: Forward request
    S->>S: Validate action with business logic
    S->>K: Publish event (round-robin)
    S-->>C: 202 Accepted (event_id)
    
    Note over K: Event persisted to disk
    
    K->>EP: Consume event
    EP->>R: Check idempotency (Redis EXISTS)
    R-->>EP: Not exists
    EP->>R: Update 3 sorted sets (last_hour, today, alltime)
    EP->>R: Mark event as processed (24h TTL)
    EP->>CH: Insert into score_events table
    EP->>CH: Update materialized view
    EP-->>K: Acknowledge event
```

**Key Points:**
- Asynchronous processing (client doesn't wait for Redis/ClickHouse)
- Single service processes events to both Redis and ClickHouse
- Idempotency prevents duplicate processing
- Round-robin partitioning ensures even load distribution

---

## 2. Leaderboard Query Flow

Read path for retrieving leaderboard rankings.

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant LS as Leaderboard Service
    participant R as Redis

    C->>API: GET /leaderboard?window=today&limit=10
    API->>API: Validate JWT
    API->>LS: Forward request
    LS->>R: ZREVRANGE leaderboard:today 0 9 WITHSCORES
    R-->>LS: Return top 10 (encoded scores)
    LS->>LS: Decode scores (extract rank, timestamp)
    LS->>LS: Fetch usernames from user service
    LS-->>API: Rankings with metadata
    API-->>C: 200 OK + rankings + freshness indicator
```

**Key Points:**
- Query time < 5ms (Redis sorted set operation)
- Score decoding extracts original score and timestamp
- Freshness indicator shows data age (e.g., "2 seconds old")
- No database queries (pure cache read)

---

## 3. Live Update Flow (SSE)

Real-time push updates to connected clients with horizontal scaling and selective broadcasting.

```mermaid
sequenceDiagram
    participant C1 as Client 1 (Viewing)
    participant C2 as Client 2 (Not Viewing)
    participant C3 as Client 3 (Viewing)
    participant LB as Load Balancer
    participant LS1 as Leaderboard Service 1
    participant LS2 as Leaderboard Service 2
    participant Redis as Redis Pub/Sub

    C1->>LB: GET /stream?window=today&viewing=true
    LB->>LS1: Route (sticky session)
    LS1->>Redis: HSET user:1:state viewing today
    LS1-->>C1: SSE connection established
    LS1->>Redis: SUBSCRIBE leaderboard:today:updates
    
    C2->>LB: GET /stream?window=today&viewing=false
    LB->>LS1: Route (sticky session)
    LS1->>Redis: HSET user:2:state viewing false
    LS1-->>C2: SSE connection established
    
    C3->>LB: GET /stream?window=today&viewing=true
    LB->>LS2: Route (different instance)
    LS2->>Redis: HSET user:3:state viewing today
    LS2-->>C3: SSE connection established
    LS2->>Redis: SUBSCRIBE leaderboard:today:updates
    
    Note over LS1,LS2: Leaderboard changes (user 5 score update)
    LS1->>Redis: PUBLISH leaderboard:today:updates
    Redis->>LS1: Message received
    Redis->>LS2: Message received
    
    LS1->>Redis: HGETALL user:*:state (get viewing users)
    Redis-->>LS1: [user:1: viewing, user:3: viewing]
    
    LS1->>LS1: Fetch latest top 10 from Redis
    LS1->>LS1: Check which users' rank changed
    
    LS1-->>C1: event: leaderboard_update (full top 10)
    Note over C2: No update (not viewing)
    
    LS2->>Redis: HGETALL user:*:state
    Redis-->>LS2: [user:1: viewing, user:3: viewing]
    LS2->>LS2: Fetch latest top 10 from Redis
    LS2-->>C3: event: rank_update (your rank: 5 → 4)
```

**Key Points:**
- **Horizontal scaling**: Multiple Leaderboard Service instances behind load balancer
- **Sticky sessions**: Clients stay on same instance (session affinity)
- **Redis pub/sub**: All instances receive updates simultaneously
- **Selective broadcasting**: Only active viewers receive updates (90% reduction)
- **Immediate updates**: No batching delay (100-200ms latency)
- **Targeted updates**: Users whose rank changed receive personalized `rank_update`
- **Each instance**: Handles ~10K connections independently

---

## 4. Redis Failure Recovery Flow

Disaster recovery when Redis fails and needs to be rebuilt.

```mermaid
sequenceDiagram
    participant M as Monitor
    participant R as Redis
    participant K as Kafka
    participant CH as ClickHouse
    participant EP as Event Processor

    Note over R: Redis fails (connection refused)
    M->>M: Health check fails
    M->>M: Alert: "Redis unavailable"
    M->>R: Attempt restart
    R-->>M: Health check passes
    
    alt Recovery within 7 days
        M->>K: Reset consumer group offset (7 days ago)
        K->>EP: Replay events from Kafka
        EP->>EP: Process events (idempotency check)
        EP->>R: Rebuild sorted sets
        EP-->>M: Recovery complete
    else Recovery older than 7 days
        M->>CH: Query all-time scores (materialized view)
        CH-->>M: Return aggregated data
        M->>R: Rebuild alltime sorted set
        M->>CH: Query today's scores
        CH-->>M: Return today's data
        M->>R: Rebuild today sorted set
        M-->>M: Recovery complete
    end
    
    M->>M: Validate recovery (compare counts)
    M->>M: Resume normal operations
```

**Key Points:**
- Automatic detection and alerting
- Two recovery strategies based on data age
- Kafka replay for recent data (< 7 days)
- ClickHouse query for older data (> 7 days)
- Validation ensures data consistency

---

## 5. Client Reconnection Flow (SSE Storm Prevention)

Exponential backoff prevents connection storm when Redis recovers.

```mermaid
sequenceDiagram
    participant C as Client
    participant LS as Leaderboard Service
    participant LB as Load Balancer

    Note over LS: Redis recovers, all clients reconnect
    
    C->>LB: Connection attempt 1
    LB->>LS: Route request
    LS-->>C: 503 Service Unavailable
    Note over C: Wait 1s (exponential backoff)
    
    C->>LB: Connection attempt 2
    LB->>LS: Route request
    LS-->>C: 503 Service Unavailable
    Note over C: Wait 2s
    
    C->>LB: Connection attempt 3
    LB->>LS: Route request
    LS-->>C: 503 Service Unavailable
    Note over C: Wait 4s + Start polling fallback
    
    loop Polling every 5 seconds
        C->>LB: GET /leaderboard?window=today
        LB->>LS: Route request
        LS-->>C: 200 OK (rankings)
    end
    
    C->>LB: Connection attempt 4
    LB->>LS: Route request
    LS-->>C: 200 OK (SSE connection established)
    Note over C: Stop polling, resume SSE
```

**Key Points:**
- Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s (max)
- Polling fallback after 3 failed attempts
- Prevents DDoS-like reconnection storm
- Graceful degradation (polling → SSE)

---

## 6. Batching Flow (Future Improvement)

> **Status: Future Improvement** - Not implemented yet.
> To be added if message rate becomes unsustainable (50K+ TPS).

Events grouped into 1-second batches to reduce message rate.

```mermaid
sequenceDiagram
    participant C as Client
    participant LS as Leaderboard Service
    participant EP as Event Processor
    participant R as Redis
    
    Note over EP: Multiple events in 1-second window
    EP->>R: ZADD leaderboard:today 500 user:123
    EP->>R: PUBLISH leaderboard:today:updates
    R->>LS: Pub/sub message received
    LS->>LS: Add to batch queue
    
    EP->>R: ZADD leaderboard:today 600 user:456
    EP->>R: PUBLISH leaderboard:today:updates
    R->>LS: Pub/sub message received
    LS->>LS: Add to batch queue
    
    EP->>R: ZADD leaderboard:today 700 user:789
    EP->>R: PUBLISH leaderboard:today:updates
    R->>LS: Pub/sub message received
    LS->>LS: Add to batch queue
    
    Note over LS: 1-second timer fires
    LS->>LS: Process batch (3 events)
    LS->>LS: Fetch latest top 10 from Redis
    LS->>LS: Serialize JSON update
    LS-->>C: event: leaderboard_update (covers 3 changes)
    
    Note over C: Single update covers all 3 changes (1-2s delay)
```

**Key Points:**
- Events grouped into 1-second batches
- Single update covers multiple changes
- Update latency: 1-2 seconds (acceptable for leaderboards)
- Reduces message rate by 50-80% (10K → 2-5K updates/sec)
- Tradeoff: Slightly delayed updates (users wait up to 1 second)
- Implementation: Timer fires every 1 second, processes batch queue

---

## 7. Priority Tiers Flow (Future Improvement)

> **Status: Future Improvement** - Not implemented yet.
> To be added when concurrent users exceed 100K.

Higher-ranked users receive more frequent updates.

```mermaid
sequenceDiagram
    participant C1 as Client (Rank 5)
    participant C2 as Client (Rank 500)
    participant C3 as Client (Rank 5000)
    participant LS as Leaderboard Service
    
    C1->>LS: GET /stream?window=today&rank=5
    LS->>LS: Assign Tier 1 (rank 1-100): 1s updates
    LS-->>C1: SSE connection (Tier 1)
    
    C2->>LS: GET /stream?window=today&rank=500
    LS->>LS: Assign Tier 2 (rank 101-1000): 2s updates
    LS-->>C2: SSE connection (Tier 2)
    
    C3->>LS: GET /stream?window=today&rank=5000
    LS->>LS: Assign Tier 3 (rank 1000+): 5s updates
    LS-->>C3: SSE connection (Tier 3)
    
    Note over LS: Leaderboard changes
    LS->>LS: Add to tier batch queues
    
    Note over LS: 1 second later (Tier 1 timer)
    LS-->>C1: event: leaderboard_update (1s update)
    
    Note over LS: 2 seconds later (Tier 2 timer)
    LS-->>C2: event: leaderboard_update (2s update)
    
    Note over LS: 5 seconds later (Tier 3 timer)
    LS-->>C3: event: leaderboard_update (5s update)
```

**Key Points:**
- Tier 1 (rank 1-100): 1-second updates (best experience)
- Tier 2 (rank 101-1000): 2-second updates (good experience)
- Tier 3 (rank 1000+): 5-second updates (acceptable experience)
- Reduces overall load by 50-70%
- Top users get best experience (they care most)
- Tradeoff: Lower-ranked users get less frequent updates
- Tier assignment updated when rank changes significantly
