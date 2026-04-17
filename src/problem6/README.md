# Problem 6: Real-Time Scoreboard System

This package implements the requested Problem 6 deliverable as an implementation-ready backend specification for a secure, real-time scoreboard.

The design is intentionally centered on PostgreSQL correctness first, with Kafka and Redis used as downstream infrastructure for replayable read models and low-latency leaderboard delivery.

This version uses an append-only write model:

- the authoritative write path stores accepted score events
- Redis maintains the live query model
- PostgreSQL can keep an asynchronous durable materialized total for warm starts and degraded fallback
- the write path does not synchronously update a current-total aggregate row

Related documents:

- `ARCHITECTURE.md` for flow diagrams
- `IMPROVEMENTS.md` for rollout and follow-up ideas
- `REVIEW.md` for plan review, best-practice assessment, and company-pattern research
- `schema.sql` for a concrete PostgreSQL schema draft

## Goals

- Keep score writes correct under retries and concurrency.
- Keep the write path append-only and lightweight under heavy score traffic.
- Deliver near-real-time top-10 leaderboard updates.
- Prevent unauthorized or replayed score inflation.
- Make the read model disposable and rebuildable.
- Show clear database engineering depth: locking, idempotency, auditability, and recovery.

## Non-Goals

- Defining the product-specific action catalog or game rules in detail.
- Requiring exactly-once delivery end to end. The design targets at-least-once delivery with idempotent consumers.
- Making Redis or WebSocket state authoritative.

## System Topology

### Command side

- `score-command-api`
  - Authenticates the caller.
  - Validates the requested action.
  - Appends the authoritative accepted score event in PostgreSQL.
  - Writes an outbox event in the same transaction.

### Data platform

- `postgres`
  - Source of truth for users, sessions, action requests, score ledger, fraud flags, outbox rows, and optional durable materialized totals.
- `cdc-connector`
  - Debezium or equivalent connector that reads committed outbox rows.
- `kafka`
  - Durable event transport and replay source for projection services.

### Read side

- `score-projection-service`
  - Consumes score events from Kafka.
  - Updates Redis leaderboard and score projections.
  - Serves read APIs directly or powers a thin query API layer.
  - Triggers live leaderboard fanout only when the visible top-10 payload actually changes.
- `score-materialization-worker`
  - Periodically or continuously persists durable PostgreSQL materialized totals from the event stream for warm starts, bounded replay, or degraded read fallback.
- `redis`
  - Read-optimized cache and ranking store.
- `socket gateway`
  - Fanout layer for clients subscribed to leaderboard updates.

## Write API Contract

### `POST /v1/actions/complete`

Records a completed action and increases the user score if the request is valid and not already processed.

#### Request

```json
{
  "actionId": "daily-login",
  "idempotencyKey": "45e31d35-4db2-40ae-9a7b-b63f6b151a11",
  "actionInstanceId": "quest-run-2026-04-17-001",
  "deviceId": "ios-14f02be",
  "clientTimestamp": "2026-04-17T11:12:03.122Z"
}
```

#### Authentication

- Access token must identify the authenticated user.
- Refresh token or session state should be revocable server-side through `user_sessions` in PostgreSQL.
- The API must reject requests where the caller is not allowed to claim the requested action.

#### Command-side steps

1. Authenticate the caller and resolve `userId`.
2. Validate request shape and action eligibility.
3. Begin a PostgreSQL transaction.
4. Insert into `score_action_requests` using `(user_id, idempotency_key)` uniqueness.
5. If the key already exists:
   - return the previously saved response body
   - do not mutate score again
6. Insert an immutable ledger row into `score_events` and return its `event_id`.
7. Insert one or more `outbox_events` rows in the same transaction.
8. Insert `fraud_flags` if the request trips suspicious heuristics.
9. Persist the accepted API response back onto the request row.
10. Commit and return acceptance of the event.

Important consequence:

- the command API acknowledges the accepted score event
- it does not depend on Redis being updated first
- it does not synchronously compute the final query-side total score

#### Success response

```json
{
  "requestId": "8d2d0f2c-6026-4c3e-9da1-91d42221f31c",
  "acceptedEventId": 9455331,
  "userId": "user-123",
  "actionId": "daily-login",
  "scoreDelta": 50,
  "acceptedAt": "2026-04-17T11:12:03.240Z",
  "projectionStatus": "pending",
  "consistency": "event_accepted"
}
```

This response confirms that the score event is durably accepted. The projected total score might appear slightly later in Redis and WebSocket updates.

#### Error contract

- `400 Bad Request`
  - malformed body
  - invalid idempotency key
  - unsupported action
- `401 Unauthorized`
  - missing or invalid access token
- `403 Forbidden`
  - user is not allowed to claim the action
- `409 Conflict`
  - conflicting idempotency key reuse with different parameters
- `422 Unprocessable Entity`
  - action already consumed or business rule violated
- `429 Too Many Requests`
  - abuse or rate limit enforcement

## Query API Contract

### `GET /v1/leaderboard/top10`

Returns the latest projected leaderboard snapshot from Redis.

```json
{
  "lastAppliedEventId": 99122,
  "generatedAt": "2026-04-17T11:12:03.390Z",
  "isProjectionStale": false,
  "entries": [
    {
      "rank": 1,
      "userId": "user-742",
      "displayName": "Sam",
      "score": 21250
    }
  ]
}
```

### `GET /v1/users/:userId/score`

Returns the user-facing projected score state.

```json
{
  "userId": "user-123",
  "score": 1500,
  "rank": 18,
  "lastAppliedEventId": 9455331,
  "updatedAt": "2026-04-17T11:12:03.390Z"
}
```

## Realtime Contract

### `wss://api.scoreboard.service/v1/leaderboard/live`

Clients subscribe to push updates after projection, not directly from the command transaction.

#### Initial payload

```json
{
  "event": "leaderboard:initial",
  "data": {
    "lastAppliedEventId": 99122,
    "generatedAt": "2026-04-17T11:12:03.390Z",
    "entries": []
  }
}
```

#### Incremental update payload

```json
{
  "event": "leaderboard:update",
  "data": {
    "leaderboardEventId": 99123,
    "lastAppliedEventId": 9455331,
    "generatedAt": "2026-04-17T11:12:03.440Z",
    "entries": [
      {
        "rank": 1,
        "userId": "user-742",
        "displayName": "Sam",
        "score": 21250
      }
    ]
  }
}
```

Recommended delivery semantics:

- `leaderboard:update` should represent the latest visible top-10 snapshot after projection.
- The projection service may use rank-10 boundary checks as a cheap prefilter, but the publish decision should come from diffing the visible snapshot against the last published snapshot or snapshot hash.

## Consistency Model

- PostgreSQL is authoritative for accepted writes.
- Redis is eventually consistent and may lag behind accepted writes.
- Clients should treat the `POST /v1/actions/complete` response as authoritative confirmation that the event was accepted.
- Clients should treat total score, rank, and top-10 membership as projection-based state.
- Leaderboard queries and socket updates are projection-based and may trail by milliseconds to seconds under load.
- If the product needs an immediate UI update, it should use optimistic rendering from `scoreDelta` until the projection catches up.

## PostgreSQL Data Model

Core tables:

- `users`
- `actions`
- `user_sessions`
- `score_action_requests`
- `score_events`
- `outbox_events`
- `fraud_flags`
- `user_score_materialized_totals`
- `projection_checkpoints`

Important database decisions:

- Idempotency is enforced with a unique constraint, not only application logic.
- If `actionInstanceId` is supplied, a per-user/per-action uniqueness rule can also prevent double-claiming the same action occurrence with a different idempotency key.
- `score_events` is immutable and append-only.
- `score_events.score_delta` is constrained to positive values in the current additive-only design.
- `outbox_events` is written in the same transaction as the authoritative mutation.
- `user_score_materialized_totals` is asynchronous and should not be part of the write transaction.
- Durable fallback totals are a materialized view, not the authoritative write model.
- Fraud review state is durable in PostgreSQL even if Redis windows are lost.

Important design distinction:

- `score_events` is the source of truth
- Redis is the live query model
- `user_score_materialized_totals` is a durable asynchronous materialized view for warm starts, bounded replay, or degraded fallback
- if aggregate replay ever becomes expensive, snapshot events or snapshot rows can be added later as an optimization

## Why No Synchronous Total Row

For a write-heavy scoreboard, continuously updating a per-user total row can create unnecessary write amplification and contention on a hot aggregate.

This design instead prefers:

- append-only `score_events` on the write path
- Redis materialized views for live totals and rankings
- asynchronous PostgreSQL materialized totals for replay seeding or degraded fallback

This is a better fit when:

- score updates are additive
- the product accepts eventual consistency for rank and total reads
- the API can acknowledge event acceptance without promising that the projection is already caught up

See `schema.sql` for a concrete table/index draft.

## Kafka Event Model

Topic:

- `score-events`

Partition key:

- `user_id`

Event example:

```json
{
  "eventId": 9455331,
  "eventType": "score.user_score_updated.v1",
  "userId": "user-123",
  "actionId": "daily-login",
  "scoreDelta": 50,
  "occurredAt": "2026-04-17T11:12:03.240Z",
  "request": {
    "idempotencyKey": "45e31d35-4db2-40ae-9a7b-b63f6b151a11",
    "sessionId": "c9ecdd67-c52a-4d30-bb41-0bf613fd27da",
    "deviceId": "ios-14f02be",
    "ip": "203.0.113.10"
  }
}
```

Event rules:

- Each consumer must treat the stream as at-least-once.
- Consumers must ignore stale or duplicate event IDs that were already applied for the same user.
- Schema evolution should use explicit versioned event types.

## Redis Read Model

Recommended keys:

- `leaderboard:global`
  - sorted set keyed by `user_id`
  - updated with `ZINCRBY` using `score_delta`
- `leaderboard:top10:snapshot`
  - optional cached JSON snapshot for fast reads
- `user:score:{userId}`
  - hash or JSON blob with score, rank, `last_applied_event_id`, and update time
- `fraud:user:{userId}:events`
  - sorted set scored by event timestamp
- `fraud:ip:{ip}:events`
  - sorted set for burst detection by IP

Recommendation:

- do not rely on TTL expiry for the core leaderboard sorted set or per-user live projection
- let the projection service keep these keys current
- if you use TTL at all, use it only on secondary convenience snapshots such as `leaderboard:top10:snapshot`

Key query patterns:

- `ZREVRANGE leaderboard:global 0 9 WITHSCORES`
- `ZREVRANK leaderboard:global {userId}`

## Projection Service

The projection service owns Redis updates and real-time fanout.

Responsibilities:

- Consume `score-events` from Kafka.
- Apply only unseen `event_id` values for each user.
- Increment the global leaderboard sorted set.
- Maintain per-user score documents with the last applied event ID.
- Use rank-10 boundary checks as a prefilter for realtime fanout work.
- Recompute and diff the visible top-10 snapshot before publishing `leaderboard:update`.
- Maintain short-lived Redis fraud windows for anomaly detection.
- Optionally feed or coordinate the durable PostgreSQL materialization worker.

Recommended broadcast rule:

- do not publish purely because one user score changed
- after applying a batch, first check whether any affected user could impact the visible top 10
- only then read the current top-10 snapshot and compare it with the last published snapshot or snapshot hash
- publish realtime updates only when the visible payload actually changed

Recommended batching:

- Buffer events per partition for `100-250ms`, or
- flush after `N` events

This avoids one Redis write plus one socket message per raw score event during spikes.

## Durable PostgreSQL Materialization

For heavy-write systems, a durable PostgreSQL fallback can exist without returning to a synchronous aggregate row on the write path.

Recommended model:

- `user_score_materialized_totals` is updated asynchronously by a separate materialization worker in the default architecture.
- Smaller deployments may choose to fold this into the projection service later, but that is an implementation simplification, not the current recommended topology.
- each row stores the latest total score, action count, and `last_event_id` included in that materialization

Use cases:

- warm-start Redis after a restart
- bound replay cost by starting from the last materialized event
- serve degraded reads if Redis is unavailable

This is not a TTL-driven cache refresh mechanism. It is a durable asynchronous materialized view.

## Fraud and Abuse Controls

Fraud protection should be layered:

- authenticated users only
- action allow-list with server-owned score values
- idempotency key requirement for every write
- session/device/IP metadata capture
- Redis sliding windows for burst and velocity detection
- durable PostgreSQL fraud flags for analyst review
- admin tools for manual freeze, reversal, or account review

Redis should provide fast signals, not final truth. Durable review actions belong in PostgreSQL.

## Recovery Model

- Kafka offsets are committed only after Redis projection succeeds.
- Redis stores the latest applied `event_id` per user.
- Replayed events with older or equal IDs are ignored for that user.
- Projection handlers should persist a checkpoint or last-seen event ID so restart/resume is exact.
- If Redis is lost, rebuild it from Kafka retention or from PostgreSQL `score_events`.
- If full replay is expensive, seed Redis from `user_score_materialized_totals` and replay only later events.
- If Kafka retention is not long enough for rebuild, back up the ledger to long-retention storage or use PostgreSQL backfill jobs.

## Operational Expectations

- Metrics
  - request success rate
  - idempotency replay rate
  - transaction latency
  - Kafka consumer lag
  - projection freshness
  - socket fanout latency
  - fraud flag rate
- Alerts
  - projection lag threshold exceeded
  - outbox growth without downstream delivery
  - Redis rebuild active
  - dead-letter queue or poison event growth

## Why This Is Strong

- The write path is correct even when downstream systems fail.
- The write path is append-only and lighter under heavy score traffic.
- The read side is fast and disposable.
- Recovery is explicit instead of implied.
- Idempotency remains first-class, while the system avoids a hot per-user total row on the write path.
- The design can start small and grow into a larger streaming platform without changing the core correctness model.
