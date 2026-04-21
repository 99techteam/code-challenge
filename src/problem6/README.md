# Problem 6 — Live Scoreboard API

## 1. Requirement

A website scoreboard shows the **top 10 users by score**.

- Completing an action increases a user's score.
- The client calls the server to record the score update on completion.
- The scoreboard updates **in real time** — no page refresh required.
- Score updates must be **authenticated and non-replayable**.

---

## 2. Incremental Design

Each version below solves a concrete problem introduced by the previous one. Reading them in order explains *why* every component exists.

---

### V1 — Write Directly to the Database

The simplest correct implementation.

```
Client
  │  POST /scores/update  { scoreDelta: N }
  │  Authorization: Bearer <jwt>
  ▼
API Server
  ├── verify JWT
  ├── UPDATE user_scores SET score = score + N WHERE user_id = ?
  └── SELECT … ORDER BY score DESC LIMIT 10
        └── broadcast top-10 via WebSocket to all clients
```

**Data model (PostgreSQL)**

| Column | Type | Notes |
|--------|------|-------|
| user_id | VARCHAR | Primary key |
| score | INTEGER | Default 0, never negative |
| updated_at | TIMESTAMP | Auto-updated on write |

**What breaks at scale:**

- Every request holds a DB connection and a row lock for the duration of the `UPDATE`.
- The `SELECT … ORDER BY score DESC LIMIT 10` is a full index scan that hits disk.
- Under 500 concurrent writes, connection pool exhaustion and lock contention cause timeouts.
- All clients are on one server process — WebSocket broadcast works fine for now.

---

### V2 — Add Redis for Fast Leaderboard Reads

**Problem:** The top-10 query is slow and expensive under read load.

**Fix:** Maintain a **Redis Sorted Set** as a live mirror of scores. Score writes still go to PostgreSQL (source of truth), but all leaderboard reads are served from Redis in memory.

```
API Server
  ├── verify JWT
  ├── UPDATE user_scores SET score = score + N WHERE user_id = ?   ← PostgreSQL (write)
  ├── ZINCRBY scores N <userId>                                    ← Redis Sorted Set (mirror)
  └── ZREVRANGE scores 0 9 WITHSCORES                             ← Redis (read, O(log N))
        └── broadcast top-10 via WebSocket
```

**Redis key space**

| Key | Type | Value | Purpose |
|-----|------|-------|---------|
| `scores` | Sorted Set | score → userId | Top-10 reads, O(log N) |

On service startup, the sorted set is seeded from PostgreSQL. After that, both stores are updated atomically on every write.

**What this fixes:** Top-10 reads no longer touch the database. At 1 M users, `ZREVRANGE` is ~20 in-memory ops vs a disk-backed index scan.

**What still breaks:**

- The API still waits for the PostgreSQL `UPDATE` to complete before returning. DB latency (5–20 ms) is directly exposed to the caller.
- A spike of 1,000 writes/second saturates the DB connection pool just as before.

---

### V3 — Decouple DB Writes with a Message Queue

**Problem:** API latency is bound by PostgreSQL write latency, and write spikes exhaust the connection pool.

**Fix:** The API writes *only* to Redis (fast, ~1 ms) and **enqueues a job** for the PostgreSQL write. The DB update happens asynchronously in a worker. The caller gets an immediate `200 Accepted`.

```
Client
  │  POST /scores/update
  ▼
API Server (returns in ~2 ms)
  ├── verify JWT
  ├── ZINCRBY scores N <userId>     ← Redis (score is live immediately)
  ├── enqueue { userId, delta, … }  ← Queue (Kafka / BullMQ)
  └── 200 { accepted: true }

                         ▼ (async)
                    Worker Pool
                      ├── UPDATE user_scores …   ← PostgreSQL (durable write)
                      └── emit leaderboard:update → WebSocket Hub → all clients
```

**Why this order matters:** Redis is updated first, so the leaderboard is immediately correct for broadcast. The PostgreSQL write is a durable backup that trails by milliseconds.

**Worker scaling:** Workers autoscale on queue depth, independent of API instances.

**What this fixes:** API latency is now bounded by Redis only. The connection pool is protected. PostgreSQL absorbs write spikes as a controlled queue rather than a thundering herd.

**What still breaks:**

- If there are multiple API server instances, their WebSocket rooms are in-process. Clients on instance B miss broadcasts triggered by a worker connected to instance A.
- A malicious user with a valid JWT can replay a captured request to inflate their score multiple times.

---

### V4 — Idempotency Keys + Redis Pub/Sub Fan-out

Two independent problems, solved together.

#### 4a. Replay prevention — Idempotency keys

The client generates a UUID per action and sends it as `Idempotency-Key`. The API stores it in Redis atomically on first receipt (`SET NX`, TTL 24 h). Any retry or replay with the same key is rejected with `409 Conflict` before any write occurs.

```
  Client                     API Server             Redis
    │  POST /scores/update        │                    │
    │  Idempotency-Key: <uuid>    │                    │
    │────────────────────────────►│  SET NX idem:<uuid>│
    │                             │───────────────────►│
    │                             │◄────────────────── │ OK (new key)
    │  200 { accepted: true } ◄───│  enqueue job       │
    │                             │                    │
    │           [replay attempt]  │                    │
    │────────────────────────────►│  SET NX idem:<uuid>│
    │                             │───────────────────►│
    │                             │◄─────────────────── key exists
    │  409 Conflict ◄─────────────│                    │
```

The `SET NX` is atomic — concurrent duplicates cannot both succeed.

#### 4b. Multi-instance broadcast fan-out — Redis Pub/Sub

When a worker finishes a score update, it **publishes** the new top-10 to a Redis Pub/Sub channel. Every API instance subscribes to that channel and emits to its local Socket.io room. Clients on any instance receive the broadcast.

```
  Worker
    └── PUBLISH leaderboard:updates { top10 }
                    │
                    ├──► API Instance A ──► its WebSocket clients
                    └──► API Instance B ──► its WebSocket clients
```

**Redis key space (final)**

| Key | Type | TTL | Purpose |
|-----|------|-----|---------|
| `scores` | Sorted Set | — | Live leaderboard, O(log N) reads and writes |
| `idem:<uuid>` | String | 24 h | Idempotency dedup |
| `leaderboard:updates` | Pub/Sub channel | — | Fan-out to all API instances |

---

### V5 — Broadcast Debouncing

**Problem:** 1,000 score updates/second → 1,000 WebSocket broadcasts/second to every connected client.

**Fix:** The worker debounces broadcasts. After each update it schedules a single emit after a short window (200 ms). Additional updates within the window are collapsed into one emit with the latest state.

```
t=  0 ms  score update → schedule emit at t+200 ms
t= 50 ms  score update → already scheduled, skip
t=180 ms  score update → already scheduled, skip
t=200 ms  → single emit with latest top-10 (3 updates → 1 broadcast)
```

This caps broadcast throughput at ~5 per second regardless of write rate.

---

## 3. Final Architecture

```
  Internet
      │
  ┌───▼──────────────────────────┐
  │  CDN + DDoS Protection        │
  └───┬──────────────────────────┘
      │
  ┌───▼──────────────────────────┐
  │  Load Balancer (L7)           │
  │  sticky sessions for WS       │
  └───┬──────────────┬────────────┘
      │              │
  ┌────────────┐  ┌────────────┐
  │ API Server │  │ API Server │  (horizontally scaled)
  └─────┬──────┘  └─────┬──────┘
        └───────┬───────┘
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
┌──────────┐ ┌────────────────┐ ┌──────────────┐
│  Redis   │ │ Queue          │ │  PostgreSQL  │
│ Cluster  │ │ (Kafka/BullMQ) │ │  Primary +   │
│          │ │                │ │  Replicas    │
└──────────┘ └───────┬────────┘ └──────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ Worker Pool │  (autoscales on queue depth)
              └─────────────┘
```

### Request flow summary

```
POST /scores/update
  ├── 1. Validate body                          → 400 if invalid
  ├── 2. Verify JWT, extract userId             → 401 if invalid
  ├── 3. Rate limit (Redis, 10 req/min/user)    → 429 if exceeded
  ├── 4. Idempotency check (Redis SET NX)       → 409 if duplicate
  ├── 5. ZINCRBY scores N <userId>              → Redis (score live)
  ├── 6. Enqueue { userId, delta, traceId }     → Queue
  └── 7. Return 200 { accepted: true }          ← ~2 ms total

Worker (async)
  ├── UPDATE user_scores SET score = score + N  → PostgreSQL
  ├── debounce(200 ms)
  └── PUBLISH leaderboard:updates { top10 }     → Redis Pub/Sub
                                                    → all API instances
                                                    → all WS clients
```

---

## 4. API Reference

### `POST /scores/update`

| | |
|--|--|
| Auth | `Authorization: Bearer <jwt>` |
| Dedup | `Idempotency-Key: <uuid-v4>` |
| Body | `{ "scoreDelta": number }` (max delta enforced server-side) |

| Code | Status | Meaning |
|------|--------|---------|
| 200 | `ACCEPTED` | Enqueued successfully |
| 400 | `VALIDATION_ERROR` | Invalid body or missing header |
| 401 | `INVALID_JWT` | JWT missing / expired / invalid |
| 409 | `DUPLICATE_REQUEST` | Idempotency key already seen |
| 429 | `RATE_LIMITED` | Too many requests |

Response: `{ "accepted": true }`

---

### `GET /scores/leaderboard`

REST fallback for clients that do not support WebSocket.

Auth: `Authorization: Bearer <jwt>`

Response `200`:
```json
{
  "leaderboard": [{ "rank": 1, "userId": "…", "username": "…", "score": 0 }],
  "updatedAt": "ISO8601"
}
```

---

### `WS /scores/live`

Connect: `wss://host/scores/live?token=<jwt>`

```
  Client                              Server
    │  connect + token=<jwt>              │
    │────────────────────────────────────►│  verify JWT
    │◄────────────────────────────────────│  401 or join leaderboard room
    │                                     │
    │◄────────────────────────────────────│  leaderboard:update  (debounced)
    │◄────────────────────────────────────│  leaderboard:update  ...
    │                                     │
    │  disconnect ───────────────────────►│  removed from room
```

Server pushes `leaderboard:update` event:
```json
{
  "leaderboard": [{ "rank": 1, "userId": "…", "username": "…", "score": 0 }],
  "updatedAt": "ISO8601"
}
```

---

## 5. Security

| Threat | Mitigation |
|--------|------------|
| Replay a captured valid request | Idempotency key (Redis `SET NX`, TTL 24 h) |
| Forge a request without completing an action | JWT signature verification |
| Brute-force / bot traffic | Rate limit: 10 requests/min per user |
| Inflate score with large delta | Server-side max delta per action type in config |

---

## 6. Deployment & Scaling

| Service | Scaling trigger |
|---------|-----------------|
| API | CPU > 70% or RPS threshold |
| Worker | Queue depth > 1,000 jobs |
| Redis | Manual — stateful 3-node cluster |
| PostgreSQL | Manual — primary + read replicas |

Secrets (JWT signing key, DB credentials, Redis password) are injected via environment variables at runtime. Never stored in images or source code.

---

## 7. Monitoring

### Key Metrics & Alerts

| Metric | Alert threshold | Signal |
|--------|-----------------|--------|
| HTTP p99 latency | > 500 ms | API degradation |
| HTTP 5xx rate | > 1% | Unhandled errors or DB unreachable |
| Queue depth | > 5,000 jobs | Worker falling behind |
| Worker job failures | > 0 | Any processing error |
| Redis memory usage | > 80% | Risk of eviction |
| WebSocket broadcast latency | > 200 ms | Broadcast loop slow |
| Rate-limit hit rate | Sudden spike | Abuse / bot traffic |

### Structured Logs

Each log line is a JSON object with fields: `timestamp`, `level`, `service` (`api` / `worker` / `websocket`), `traceId` (propagated from request → queue → worker), `userId`, `event`, `durationMs`, `statusCode`.

Never log raw tokens, passwords, or full request bodies.

### Distributed Tracing (OpenTelemetry → Jaeger / Tempo)

```
HTTP request
  ├── JWT verify
  ├── Redis idempotency check
  ├── Rate limit check
  └── Queue enqueue
        └── [async] Worker
              ├── Score increment (Redis)
              └── Persist score (PostgreSQL)
```
