# Scoreboard Module — API Service Specification

**Module:** `scoreboard`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [Data Model](#data-model)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Security](#authentication--security)
6. [Real-Time Updates (WebSocket)](#real-time-updates)
7. [Execution Flow](#execution-flow)
8. [Write-Behind Caching Strategy](#write-behind-caching-strategy)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Improvement Notes](./IMPROVEMENT.md) — separate file

---

## Overview

The **Scoreboard Module** is responsible for:

- Receiving user action executions via a single secure endpoint and internally resolving any score changes — the client never references scores or point values directly.
- Maintaining a live ranked leaderboard in Redis as the primary read source, with periodic write-behind flushing to the persistent database.
- Broadcasting real-time leaderboard updates to all connected clients over WebSocket.
- Writing an immutable audit log to the database immediately (write-ahead) on every action execution, independently of the deferred score flush.
- Defending against unauthorised, fabricated, or anomalously frequent action submissions.

---

## Architecture Summary

```
Client (Browser)
    │
    ├── HTTP POST /api/action/execute    ← authenticated action execution
    ├── GET      /api/scores/top         ← initial leaderboard fetch (Redis)
    └── WS       /api/scores/live        ← real-time leaderboard stream
            │
       ┌────▼──────────────────────────────────┐
       │          API Application Server        │
       │                                        │
       │  ┌──────────────────────────────┐      │
       │  │   Auth Middleware (JWT)      │      │
       │  └─────────────┬────────────────┘      │
       │                │                       │
       │  ┌─────────────▼────────────────┐      │
       │  │   Rate Limit Middleware      │      │
       │  └─────────────┬────────────────┘      │
       │                │                       │
       │  ┌─────────────▼────────────────┐      │
       │  │   ActionController           │      │
       │  │   ActionService              │      │
       │  └──────┬──────────────┬────────┘      │
       │         │              │               │
       │  ┌──────▼──────┐ ┌────▼───────────┐    │
       │  │ ActionLog   │ │ ScoreService   │    │
       │  │ Repository  │ │ (write-behind) │    │
       │  │(write-ahead)│ └────────────────┘    │
       │  └─────────────┘                       │
       └────────────────────────────────────────┘
                        │
           ┌────────────┴────────────┐
           │                         │
      ┌────▼────┐             ┌──────▼────────────────────────┐
      │   DB    │             │  Redis                         │
      │(Postgres│             │  ├─ Sorted set (scores)        │
      │  / etc) │             │  ├─ Top-10 snapshot cache      │
      │         │             │  ├─ Write-behind buffer        │
      │         │             │  ├─ Pub/Sub channel            │
      └────┬────┘             │  └─ Rate limit counters        │
           │                  └────────────────────────────────┘
           │                            │
      ┌────▼──────────────┐    ┌────────▼────────┐
      │  action_log table │    │  Flush Worker   │
      │  (append-only)    │    │  (every 5 min)  │
      └───────────────────┘    └────────┬────────┘
                                        │
                               ┌────────▼────────┐
                               │  scores table   │
                               │  (DB, durable)  │
                               └─────────────────┘
```

---

## Data Model

### `users` table (pre-existing — reference only)

| Column       | Type        | Notes       |
|--------------|-------------|-------------|
| `id`         | UUID (PK)   |             |
| `username`   | VARCHAR(64) |             |
| `created_at` | TIMESTAMP   |             |

---

### `actions` table

Stores every legitimate action type. The server resolves all score awards from this table — the client never sends point values.

| Column          | Type         | Notes                                                                 |
|-----------------|--------------|-----------------------------------------------------------------------|
| `id`            | UUID (PK)    | Stable identifier referenced in `action_log.action_id`               |
| `action_name`   | VARCHAR(64)  | Unique, URL-safe slug (e.g. `quiz_complete`, `challenge_win`)         |
| `description`   | TEXT         | Human-readable description for admin tooling                          |
| `points_awarded`| INT          | Points credited to the user on successful execution; must be > 0      |
| `is_active`     | BOOLEAN      | Soft-disable an action without deleting it; inactive actions are rejected with 422 |
| `created_at`    | TIMESTAMP    |                                                                       |
| `updated_at`    | TIMESTAMP    |                                                                       |

> **Index:** Unique index on `action_name` for fast lookup during request processing.

> **Note to team:** `points_awarded` is the canonical field name for the score value granted by an action. Avoid aliases like `delta`, `score_value`, or `reward` elsewhere in the codebase — use `points_awarded` consistently throughout.

---

### `scores` table

The durable, persistent record of each user's cumulative score. **This table is not written to on every action.** It is updated by the flush worker on a write-behind schedule (see [Write-Behind Caching Strategy](#write-behind-caching-strategy)).

| Column             | Type      | Notes                                                               |
|--------------------|-----------|--------------------------------------------------------------------|
| `id`               | UUID (PK) |                                                                     |
| `user_id`          | UUID (FK) | References `users.id`; unique constraint (one row per user)         |
| `score`            | BIGINT    | Cumulative score; default 0; only ever written by the flush worker  |
| `score_attained_at`| TIMESTAMP | The earliest moment the user's cumulative log sum first reached the current `score` value; set by the flush worker alongside each score update; used as the second tie-breaking key on the leaderboard |
| `updated_at`       | TIMESTAMP | Set by the flush worker on each write                               |

> **Index:** Index on `(score DESC, score_attained_at ASC, updated_at ASC)` for tie-breaking queries and rollback verification.

---

### `action_log` table (immutable audit log)

Records every action execution at the moment it occurs — written synchronously (write-ahead) before the HTTP response is returned. This table must never be updated or deleted from; it is append-only by policy and, where the database supports it, by explicit permission grant.

| Column          | Type      | Notes                                                                  |
|-----------------|-----------|------------------------------------------------------------------------|
| `id`            | UUID (PK) | Auto-generated                                                         |
| `user_id`       | UUID (FK) | References `users.id`                                                  |
| `action_id`     | UUID (FK) | References `actions.id`                                                |
| `points_gained` | INT       | Snapshot of `actions.points_awarded` at execution time; preserves history if the action's value is later changed |
| `created_at`    | TIMESTAMP | Set at insert time; never updated                                      |

> **Immutability enforcement:** The application DB user must be granted `INSERT` only on this table — no `UPDATE` or `DELETE`. A database trigger or row-level security policy should reject any modification attempt, making the log tamper-evident.

> **Rollback use:** A user's correct score can be recomputed at any point in time by summing `points_gained` from `action_log` for that `user_id`. This is the basis for the admin rollback endpoint described in [`IMPROVEMENT.md`](./IMPROVEMENT.md) §3.

---

## API Endpoints

### 1. `POST /api/action/execute`

Executes a named action on behalf of the authenticated user. The server internally resolves `points_awarded` for that action and applies it to the user's score in Redis. The client supplies only the action identifier — it has no input into how many points are awarded.

**Authentication:** Required — Bearer JWT  
**Rate Limit:** 60 requests / minute per user

#### Request Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "action_name": "quiz_complete"
}
```

`action_name` must match a row in the `actions` table where `is_active = true`. Max 64 characters.

#### Success Response — `200 OK`

```json
{
  "user_id": "uuid",
  "action_name": "quiz_complete",
  "points_awarded": 10,
  "new_score": 1420,
  "rank": 3
}
```

> `new_score` and `rank` are read directly from Redis immediately after the increment, reflecting the live state.

#### Error Responses

| Status | Code                  | Meaning                                                    |
|--------|-----------------------|------------------------------------------------------------|
| 401    | `UNAUTHORIZED`        | Missing or invalid JWT                                     |
| 422    | `INVALID_ACTION`      | `action_name` missing, unknown, or `is_active = false`     |
| 429    | `RATE_LIMIT_EXCEEDED` | Too many requests                                          |
| 500    | `INTERNAL_ERROR`      | Unexpected server fault                                    |

---

### 2. `GET /api/scores/top`

Returns the current top-10 leaderboard snapshot, read directly from the Redis sorted set. No database query is made on this path.

**Authentication:** Optional

#### Query Parameters

| Parameter | Type | Default | Description                           |
|-----------|------|---------|---------------------------------------|
| `limit`   | INT  | 10      | Number of entries to return; max 100  |
| `offset`  | INT  | 0       | Enables full leaderboard pagination   |

#### Success Response — `200 OK`

```json
{
  "leaderboard": [
    { "rank": 1, "user_id": "uuid", "username": "alice", "score": 9800 },
    { "rank": 2, "user_id": "uuid", "username": "bob",   "score": 9400 }
  ],
  "generated_at": "2026-05-17T10:00:00Z"
}
```

---

### 3. `WS /api/scores/live` — WebSocket

Establishes a persistent WebSocket connection. The server pushes a new leaderboard payload to all connected clients whenever the top-10 changes.

**Authentication:** Optional — pass JWT as query parameter `?token=<jwt>` if rank context is needed  
**Protocol:** `wss://` in all non-local environments

#### Server → Client: leaderboard update

```json
{
  "type": "leaderboard_update",
  "leaderboard": [
    { "rank": 1, "user_id": "uuid", "username": "alice", "score": 9800 }
  ],
  "generated_at": "2026-05-17T10:00:00Z"
}
```

#### Server → Client: heartbeat ping (every 30 seconds)

```json
{ "type": "ping", "ts": "2026-05-17T10:00:30Z" }
```

#### Client → Server: pong

```json
{ "type": "pong" }
```

Connections that do not respond to two consecutive pings are closed by the server and removed from the active connection registry.

#### Connection Lifecycle

- On connect: the server immediately sends the current leaderboard snapshot so the client can render without waiting for the next action.
- On disconnect: the connection is removed from the registry silently.
- Clients are responsible for reconnection with exponential backoff (suggested: initial delay 1s, max 30s, ±20% jitter).

---

## Authentication & Security

### JWT Validation

Every `POST /api/action/execute` request must carry a valid signed JWT:

1. Verify signature using the application's public key (RS256 or HS256).
2. Validate `exp` (expiry) and `iat` (issued-at) claims.
3. Extract `sub` (subject = `user_id`) from the token payload.
4. The `user_id` from the token is the authoritative identity — the request body must never accept a `user_id` field. This prevents submission on behalf of another user.

### No Client-Controlled Score Values

The endpoint accepts only `action_name`. All score logic — point values, active status, eligibility — is resolved exclusively server-side by looking up the `actions` table. A tampered or fabricated request cannot influence how many points are awarded.

### HTTPS / WSS Only

All HTTP endpoints must be served over TLS. The WebSocket endpoint must use `wss://`. Plain `ws://` is acceptable in local development only and must be disabled in staging and production.

### CORS

Restrict `Access-Control-Allow-Origin` to the application's known frontend domains. Wildcards (`*`) are not permitted on authenticated endpoints.

---

## Real-Time Updates

### WebSocket Broadcast Flow

See [DIAGRAM.md → Action Execute Flow](./DIAGRAM.md#1-action-execute-flow) for the full request-path diagram, including the Redis Pub/Sub side-channel that drives this broadcast. The semantics below define the diff rule that decides whether a broadcast is published.

#### Diff Logic

Two top-10 snapshots are considered **equal** if and only if, for every position 0–9, both the `user_id` and the `score` are identical. Any of the following constitutes a change and must trigger a broadcast:

- A new `user_id` enters the top 10 (displacing another).
- An existing top-10 member's `score` increases.
- The relative ordering of any two members changes (a score overtake).

The diff is a shallow ordered comparison of the `[(user_id, score)]` pairs returned by `ZREVRANGE`. It requires no deep equality check — mismatched pair at any index means changed. The comparison should be performed in the application layer immediately after the `ZINCRBY`, before deciding whether to publish.

### Redis Sorted Set

The sorted set `scoreboard:scores` is the primary data source for all leaderboard operations. Each **member** is the `user_id` string; the **score** is the cumulative point total. Storing `user_id` as the member is what makes every entry independently identifiable — without it, scores are anonymous values that cannot be attributed to a user, diffed across snapshots, or used to determine rank.

- **Increment:** `ZINCRBY scoreboard:scores <points_awarded> <user_id>`
- **Top-N read:** `ZREVRANGE scoreboard:scores 0 9 WITHSCORES` → returns `[(user_id, score), ...]`
- **User rank:** `ZREVRANK scoreboard:scores <user_id>` (0-indexed; add 1 for display)
- **User score:** `ZSCORE scoreboard:scores <user_id>`

This gives O(log N) writes and O(log N + K) reads for top-K with no database round-trip on the hot path.

### Top-10 Snapshot Cache

After each `ZINCRBY`, the service recomputes the top-10 list and stores it as a serialised snapshot in a separate Redis key:

```
SET scoreboard:top10:snapshot <json_payload>
```

This snapshot is what `GET /api/scores/top` serves directly, and it is what the broadcaster diffs against before deciding whether to push a WebSocket message (see broadcast flow above). The key has no TTL — it is invalidated and rewritten on every action execution that changes the sorted set.

---

## Write-Behind Caching Strategy

Redis is the live source of truth for scores. The `scores` table in the database is a durable replica updated asynchronously by a background flush worker every 5 minutes.

### Design

See [DIAGRAM.md → Async Score Flush](./DIAGRAM.md#2-async-score-flush) for the flush-worker diagram. In short: every action immediately writes to both `scoreboard:scores` (sorted set) and `scoreboard:pending:<user_id>` (write-behind buffer); a background worker drains the pending buffer into the `scores` table every 5 minutes and deletes each pending key only after its DB write succeeds.

### Guarantees and Trade-offs

| Property               | Behaviour                                                                       |
|------------------------|---------------------------------------------------------------------------------|
| Leaderboard accuracy   | Always current — all reads come from the Redis sorted set                       |
| DB consistency         | Eventually consistent; lags up to 5 minutes behind Redis                        |
| Data durability        | `action_log` is written synchronously; any score lost on Redis failure is fully recoverable by replaying the audit log |
| Flush atomicity        | Each user's pending key is cleared only after a confirmed DB write; partial flush is safe |
| Audit log integrity    | Written write-ahead, independently of the flush cycle — always present          |

### Redis Failure Recovery

If Redis becomes unavailable:

1. Incoming action requests should fail fast with 503.
2. On Redis recovery, reseed `scoreboard:scores` from the `scores` table as a baseline, then replay `action_log` entries where `created_at > scores.updated_at` for each user.

This recovery procedure must be documented as a runbook and tested in staging before launch.

### Flush Worker Configuration

| Setting              | Default   | Notes                                               |
|----------------------|-----------|-----------------------------------------------------|
| `FLUSH_INTERVAL`     | 5 minutes | How often the worker runs                           |
| `FLUSH_BATCH_SIZE`   | 500 users | Max pending entries processed per cycle             |
| `FLUSH_RETRY_MAX`    | 3         | Retries per entry before alerting and moving on     |
| `FLUSH_RETRY_DELAY`  | 10s (exp.)| Exponential backoff between retries                 |

---

## Execution Flow

The numbered steps correspond to the accompanying flow diagram.

1. User completes an action in the browser.
2. Client sends `POST /api/action/execute` with `{ action_name }` and `Authorization` header.
3. **Auth Middleware** validates the JWT; rejects with 401 on failure.
4. **Rate Limit Middleware** checks the per-user counter in Redis; rejects with 429 if exceeded.
5. **ActionController** extracts `user_id` from the token and `action_name` from the body.
6. **ActionService** looks up `action_name` in the `actions` table (or warm in-memory cache). Returns 422 if not found or `is_active = false`.
7. **ActionLogRepository** inserts a row into `action_log` synchronously. If this fails, the request returns 500 and no score update is applied — the audit log and score increment are never decoupled.
8. **ScoreService** calls `ZINCRBY scoreboard:scores <points_awarded> <user_id>` in Redis (member = `user_id`, score = cumulative total) and writes the new total to the pending buffer key `scoreboard:pending:<user_id>`.
9. **ScoreService** reads the new top-10 via `ZREVRANGE scoreboard:scores 0 9 WITHSCORES` and compares the ordered `[(user_id, score)]` pairs against the stored snapshot at `scoreboard:top10:snapshot`.
10. If the top-10 **has changed**: overwrite `scoreboard:top10:snapshot` with the new payload and publish a `leaderboard:update` event to the Redis Pub/Sub channel. If it **has not changed**: skip — no publish, no broadcast.
11. **WebSocket Broadcaster** (subscribed to the channel) fans the event out to all active WebSocket connections.
12. Each connected browser receives `leaderboard_update` and re-renders the scoreboard.
13. The HTTP response `200 OK` is returned with `{ user_id, action_name, points_awarded, new_score, rank }`.
14. *(Async, every 5 minutes)* **Flush Worker** drains `scoreboard:pending:*` into the `scores` table.

---

## Error Handling

All errors return a consistent JSON envelope:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many action executions. Please wait before trying again.",
    "retry_after": 42
  }
}
```

Additional conventions:

- If the `action_log` INSERT (step 7) fails, return 500 immediately and do not proceed to the Redis update. A score increment must never exist without a corresponding audit entry.
- Transient DB failures on the audit write should be retried once with a 200ms delay before returning 500.
- Pub/Sub publish failures must not block the HTTP response. Log the failure; the leaderboard self-corrects when the channel recovers or on the next action execution.
- WebSocket clients that miss a push will receive a fresh snapshot on their next reconnect — no leaderboard state is permanently lost.
- Flush worker failures increment `scoreboard.flush.errors` and trigger an alert after `FLUSH_RETRY_MAX` consecutive failures for the same user entry.

---

## Rate Limiting

| Scope                     | Limit        | Window     | Storage       |
|---------------------------|--------------|------------|---------------|
| Per authenticated user    | 60 requests  | 60 seconds | Redis counter |
| Per IP (unauthenticated)  | 20 requests  | 60 seconds | Redis counter |

Rate limit counters use the Redis `INCR` + `EXPIRE` pattern, or a sliding window via sorted sets for higher accuracy. All 429 responses include a `Retry-After` header.

---

## Improvement Notes

Recommendations beyond the baseline — idempotency keys, velocity anomaly detection, score rollback, Redis failure runbook, action management admin API, WebSocket graceful degradation, action log hash chain, score tie-breaking, and observability — live in [`IMPROVEMENT.md`](./IMPROVEMENT.md).