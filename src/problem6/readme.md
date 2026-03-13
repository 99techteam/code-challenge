# Scoreboard Live Update Module

## Overview
This module manages user score updates and real-time leaderboard broadcasting for the top 10 users.
Responsibilities:
  - Receive score update requests from authenticated users
  - Validate the action and prevent malicious score manipulation
  - Persist score updates
  - Update the leaderboard
  - Broadcast real-time updates to connected clients
  - User can access to see leaderboard

## High Level Architecture
```
                +-------------+
                |   Client    |
                +-------------+
                       |
                       | HTTP Request
                       ▼
               +---------------+
               |   API Server  |
               +---------------+
                       |
                       | Validate + Publish Event
                       ▼
                    Kafka
                       |
                       ▼
               +---------------+
               | Score Worker  |
               +---------------+
                       |
                       ▼
                  PostgreSQL          ← commit first (source of truth)
                       |
                       ▼
                     Redis            ← only after Postgres commit
                       |
                       ▼
               WebSocket Gateway      ← only after Postgres commit
                       |
                       ▼
                     Clients
```

## API list

### Update score
```
POST /api/v1/score/update
```
Headers
```
Authorization: Bearer <JWT>
```
Request
```json
{
  "action_id": "string"
}
```
Response `202 Accepted` — the request is acknowledged; the actual score update is processed asynchronously via the worker. The client receives the updated leaderboard through the WebSocket `leaderboard_update` event.
```json
{
  "success": true
}
```

Error responses

| Status | Scenario |
|--------|----------|
| 401 | Missing or invalid JWT |
| 409 | `action_id` already processed (duplicate/replay) |
| 422 | `action_id` references an unknown or disabled action type |
| 500 | Internal server error |

### Get leaderboard
```
GET /api/v1/leaderboard
```
Auth: None (public endpoint)

Response
```json
{
  "data": [
    {
        "id": 1,
        "username": "logan",
        "rank": 1,
        "score": 1200
    },
    {
        "id": 2,
        "username": "alex",
        "rank": 2,
        "score": 1000
    }
  ]
}
```

## Flow

### Step 1: User completes an action

Client sends: `POST /api/v1/score/update` with the `action_id` that identifies which action was completed.

### Step 2: API Service

1. Authenticate user via JWT Bearer token
2. Look up `action_id` type in `action_types` table — reject (422) if unknown or disabled
3. Check `score_actions` for duplicate `action_id` — reject (409) if already processed
4. Publish event `{ user_id, action_id }` to Kafka
5. Return `202 Accepted`

The score delta is **not** supplied by the client. It is resolved server-side by the worker from the `action_types` table.

### Step 3: Kafka Event Consumer

Kafka acts as a buffer and event bus.

Benefits:
 - Decouples API from score processing
 - Prevents API overload
 - Enables horizontal scaling

Partition key:
```
user_id
```
Partitioning by `user_id` guarantees per-user event ordering, preventing race conditions on a single user's score.

### Step 4: Score Worker

```
Kafka Event { user_id, action_id }
     │
     ▼
Look up score_delta from action_types table
     │
     ▼
BEGIN TRANSACTION
  Insert into score_actions (ON CONFLICT action_id DO NOTHING)
    → if 0 rows inserted: ROLLBACK, discard event (duplicate)
  UPDATE users SET score = score + score_delta WHERE id = user_id
COMMIT  ← source of truth is now updated
     │
     │  Postgres commit failed → do NOT ack Kafka → retry
     ▼
ZINCRBY leaderboard:global <score_delta> <user_id>
DEL leaderboard:top10
     │
     ▼
Publish WebSocket event: leaderboard_update
```
Redis and WebSocket are only reached after a successful Postgres commit. If either fails at this stage it is non-fatal — Redis can be rebuilt from Postgres, and WebSocket clients will receive the next broadcast or can call `GET /api/v1/leaderboard`.

## Database schema

### Users
```
users
------
id           BIGSERIAL  PK
username     VARCHAR    UNIQUE NOT NULL
password     VARCHAR    NOT NULL
score        INT        NOT NULL DEFAULT 0
created_at   TIMESTAMPTZ
```

### Action Types
```
action_types
-------------
action_type  VARCHAR  PK
score_delta  INT      NOT NULL
enabled      BOOLEAN  NOT NULL DEFAULT true
```
Server-controlled table that defines how much each action is worth. Workers resolve `score_delta` from here — clients never supply it.

### Score Actions
```
score_actions
--------------
id           BIGSERIAL    PK
user_id      BIGINT       NOT NULL  REFERENCES users(id)
action_id    VARCHAR      NOT NULL
action_type  VARCHAR      NOT NULL  REFERENCES action_types(action_type)
score_delta  INT          NOT NULL
created_at   TIMESTAMPTZ
--------------
Constraint: UNIQUE(action_id)
```
`UNIQUE(action_id)` prevents replay attacks and duplicate processing. The worker uses `INSERT ... ON CONFLICT DO NOTHING` and checks affected rows to detect duplicates idempotently.

## Redis Leaderboard

Leaderboard stored as a Redis Sorted Set.

Key
```
leaderboard:global
```

Increase score (in worker, after DB update)
```
ZINCRBY leaderboard:global <score_delta> <user_id>
```

Fetch top 10 (Redis 6.2+)
```
ZRANGE leaderboard:global 0 9 REV WITHSCORES
```

## Redis Cache Strategy

Cache the computed top 10 to reduce sorted set reads on `GET /api/v1/leaderboard`.

Cache key:
```
leaderboard:top10
```

Cache TTL:
```
5 seconds
```

**Update strategy — cache invalidation (not recompute):**

After the worker updates the sorted set, it deletes `leaderboard:top10`. The next `GET /api/v1/leaderboard` request recomputes from the sorted set and repopulates the cache. This avoids race conditions that arise when multiple workers each try to recompute and overwrite the cache simultaneously.

```
Worker: ZINCRBY leaderboard:global ...
Worker: DEL leaderboard:top10
         │
         ▼ (next read)
API: GET leaderboard:top10 → cache miss
API: ZRANGE leaderboard:global 0 9 REV WITHSCORES
API: SET leaderboard:top10 <result> EX 5
```

## Real-time Leaderboard Updates

WebSocket Gateway broadcasts leaderboard changes to all connected clients.

### Initial state on connect

When a client establishes a WebSocket connection, the gateway immediately pushes the current top 10 so the client does not need to wait for the next score change:

```json
{
  "event": "leaderboard_initial",
  "data": [
    {"user_id": "1", "score": 1200, "rank": 1},
    {"user_id": "2", "score": 1180, "rank": 2}
  ]
}
```

### Live update event

Broadcast to all connected clients after each worker cycle:

Event:
```
leaderboard_update
```
Payload:
```json
{
  "event": "leaderboard_update",
  "data": [
    {"user_id": "1", "score": 1200, "rank": 1},
    {"user_id": "2", "score": 1180, "rank": 2}
  ]
}
```

## Anti-Cheat Layer

### Action type validation (server-side delta)

The `score_delta` for any action is defined in the `action_types` table, controlled by the server. Clients submit only an `action_id` string — they never supply or influence the score increment. An unknown or disabled `action_type` is rejected at the API layer before the event reaches Kafka.

### Replay and duplicate protection

`UNIQUE(action_id)` on `score_actions` ensures each action is processed at most once. The worker uses:

```sql
INSERT INTO score_actions (user_id, action_id, action_type, score_delta)
VALUES (...)
ON CONFLICT (action_id) DO NOTHING;
```

If 0 rows are inserted, the event is discarded. This makes the worker safe under Kafka's at-least-once delivery.

### Action token integrity (optional hardening)

For higher-assurance environments, the server can issue a short-lived signed token when a user begins an action. The token encodes `{ user_id, action_type, expires_at }` and is verified on submission. This prevents fabricated `action_id` values entirely.

## Failure Handling

### Worker crash
Kafka re-delivers unacknowledged messages. Idempotency via `ON CONFLICT DO NOTHING` prevents double-processing.

### Redis failure
`leaderboard:top10` cache is rebuilt on next read from `leaderboard:global`. If the sorted set is also lost, it can be rebuilt by replaying `score_actions` from PostgreSQL:

```sql
SELECT user_id, SUM(score_delta) FROM score_actions GROUP BY user_id;
```

### Postgres write failure
The worker does not acknowledge the Kafka message. Kafka re-delivers after the consumer timeout and the worker retries. Redis and WebSocket are never touched, so no inconsistency is introduced.

### Redis write failure (after Postgres commit)
Postgres is already committed — the score is safe. The sorted set will be stale until the next successful write or a manual rebuild. The WebSocket broadcast is skipped (or best-effort). Clients see a temporarily stale leaderboard but no data is lost.

### WebSocket publish failure (after Postgres + Redis commit)
Non-fatal. Affected clients miss one push event. They will receive the next broadcast or can refresh via `GET /api/v1/leaderboard`.
