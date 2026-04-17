# Problem 6 Improvements

This document describes how to evolve the base architecture in `README.md` and `ARCHITECTURE.md` after the first correct implementation is in place.

The main principle is:

- do not compromise correctness on the write path
- add scale and operational sophistication in stages
- introduce complexity only when the product actually needs it

---

## 1. Improvement Strategy Overview

The proposed architecture is already strong, but it should not be shipped as "everything on day one" unless the product really needs it.

### Improvement roadmap

```text
Stage 1: Correctness Core
  PostgreSQL + idempotent API + append-only ledger + outbox + Redis live projection + simple live fanout

Stage 2: Replayable Streaming Read Side
  CDC + Kafka + projection workers + Redis event-id dedupe + durable PG materialization + replay tooling

Stage 3: Operational Maturity
  multi-node socket fanout + richer fraud scoring + admin workflows + DR / archival
```

### Decision rule

```text
If product traffic is modest and the team is small:
  start with Stage 1

If multiple read-side consumers or rebuildability matter:
  add Stage 2

If uptime, compliance, moderation, and global scale matter:
  add Stage 3
```

---

## 2. Stage 1 Improvements: Correctness First

Stage 1 is the minimum strong production shape for a real scoreboard system.

### What Stage 1 should include

- PostgreSQL as source of truth
- `POST /v1/actions/complete` with idempotency keys
- immutable `score_events` ledger
- transactional outbox table
- Redis live leaderboard projection and per-user score cache
- single-region socket fanout

### Why this stage matters

- prevents score duplication on retries
- keeps the write path append-only and light
- creates a durable audit trail
- leaves room to add streaming later without redesigning the core write path

### Example: retry-safe request behavior

Client sends:

```json
{
  "actionId": "daily-login",
  "idempotencyKey": "0f83c365-f1c5-4f1c-a17d-4227e9433f89"
}
```

If the client times out and retries with the same key:

- the API must not add score twice
- the API should return the original accepted response body

### Stage 1 flow

```text
Client
  |
  v
score-command-api
  |
  +--> validate token
  +--> validate action
  +--> INSERT request(idempotency key)
  +--> INSERT score_events
  +--> INSERT outbox_events
  +--> COMMIT
  |
  +--> projection catches up asynchronously
  |
  +--> emit single-region live update
```

### Suggested Stage 1 additions

- add deterministic tie-breakers early
- store the accepted response body on the request table
- record `deviceId`, `sessionId`, and `ip` with every accepted score change

---

## 3. Stage 2 Improvements: Replayable Read Side

Stage 2 is where the system becomes much easier to recover and evolve.

### What Stage 2 should include

- CDC from PostgreSQL outbox into Kafka
- dedicated projection consumers
- Redis dedupe checks using `last_applied_event_id`
- durable PostgreSQL materialized totals for replay seeding and degraded fallback
- replay/backfill tooling
- dead-letter handling for poison events

### Why this stage matters

- separates the write path from read-side failures
- allows Redis rebuild without re-accepting writes
- supports more than one downstream consumer
- supports richer analytics and fraud consumers later

### Example: projection idempotency

Kafka delivers the same event twice:

```json
{
  "eventId": 9455331,
  "userId": "user-123",
  "scoreDelta": 50
}
```

If Redis already stores `lastAppliedEventId = 9455331` for that user, the consumer should:

- skip the duplicate
- not re-emit a visible leaderboard update
- commit the Kafka offset after the check

### Stage 2 flow

```text
PostgreSQL commit
  |
  v
outbox row committed
  |
  v
CDC connector
  |
  v
Kafka topic score-events
  |
  v
projection service
  |
  +--> compare eventId with Redis last_applied_event_id
  +--> ZINCRBY leaderboard keys
  +--> update user score document
  +--> optionally upsert PostgreSQL materialized totals
  +--> emit socket update if visible state changed
  +--> commit offset
```

### Recommended Stage 2 operational additions

- dead-letter topic for malformed or poison events
- replay command that rebuilds one scope at a time
- freshness metric for projected leaderboard lag

### Example replay command shape

```text
rebuild leaderboard scope:
  source = Kafka retained topic
  target = Redis keys for global leaderboard only
  mode   = stop writes? no
  result = rebuild derived state without touching PostgreSQL truth
```

---

## 4. Stage 3 Improvements: Operational Maturity

Stage 3 is appropriate when the scoreboard becomes a business-critical or abuse-sensitive system.

### What Stage 3 should include

- multi-node socket fanout with Redis or broker-backed adapter
- richer fraud scoring model
- admin correction and reversal workflows
- long-retention archival for rebuilds
- disaster recovery and region failover planning

### Why this stage matters

- scaling live connections is a different problem from scaling writes
- moderation and support teams eventually need safe correction tools
- retention and recovery matter more once the leaderboard becomes user-visible business state

### Stage 3 maturity ladder

```text
Single node live updates
  ->
multiple socket nodes with shared fanout bus
  ->
admin score review and reversal tooling
  ->
long-retention replay support
  ->
regional failover / DR plan
```

---

## 5. Product and Ranking Improvements

The initial problem only asks for top 10 live scores. Real products usually need more.

### 5.1 Deterministic tie-breakers

Do not leave equal scores unordered.

Recommended order:

1. `total_score DESC`
2. `reached_score_at ASC`
3. `action_count DESC`
4. `user_id ASC`

### Example

```text
User A score = 5000, reached at 10:00, action_count = 70
User B score = 5000, reached at 10:05, action_count = 80

Result:
  User A ranks higher because the same score was reached earlier.
```

### 5.2 Scoped leaderboards

Recommended future scopes:

- daily leaderboard
- weekly leaderboard
- monthly leaderboard
- friend leaderboard
- region leaderboard

### Example API shapes

```text
GET /v1/leaderboard/top10?period=day
GET /v1/leaderboard/top10?period=week
GET /v1/leaderboard/top10?scope=friends
GET /v1/leaderboard/rank-neighbors?userId=user-123&window=5
```

### Scoped leaderboard model

```text
global leaderboard
  |
  +--> all-time
  +--> daily
  +--> weekly
  +--> monthly
  +--> friends
  +--> region
```

### 5.3 Rank-neighbor queries

Top 10 is not enough for most users.

Example:

```text
User rank = 248
Need to show:
  ranks 243-253
instead of only the global top 10
```

This reduces the product problem where most users never see themselves.

---

## 6. Admin Correction and Reversal Workflow

Eventually the team needs a safe way to correct bad score state.

### Recommended model

- never silently overwrite score history
- create immutable reversal or adjustment events
- restrict adjustment endpoints to admin roles
- always log the reason and operator identity

### Example use cases

- fraud investigation confirms a boosted account
- a production bug double-awarded points
- a moderator restores score after incorrect abuse enforcement

### Recommended workflow

```text
Admin identifies incorrect score event
  |
  v
Create adjustment / reversal request
  |
  v
Admin API validates permissions
  |
  v
PostgreSQL transaction
  |
  +--> append adjustment event
  +--> write outbox event
  +--> write audit trail
  |
  v
CDC -> Kafka -> projection update -> clients see corrected leaderboard
                        |
                        +--> async PostgreSQL materialized totals catch up too
```

### Example adjustment payload

```json
{
  "userId": "user-123",
  "adjustmentType": "reversal",
  "scoreDelta": -50,
  "reason": "duplicate daily-login event from incident INC-1042"
}
```

---

## 7. Operational Improvements

### 7.1 Monitoring additions

Track at minimum:

- command API latency
- PostgreSQL transaction latency
- idempotency replay rate
- outbox backlog
- CDC lag
- Kafka consumer lag
- Redis update latency
- socket fanout latency
- fraud flag rate

### 7.2 Alert examples

| Problem | Example symptom | Possible action |
| --- | --- | --- |
| Outbox stuck | `outbox_events` pending rows keep growing | inspect CDC connector and connector offsets |
| Projection lag | top-10 snapshot is 2 minutes behind | scale consumers or inspect Redis slowdown |
| Redis pressure | p95 Redis write latency spikes | reduce batch size churn, inspect hot keys |
| Socket overload | client reconnects spike | scale socket gateways, inspect pub/sub bus |

### 7.3 Replay/backfill tooling

The team should be able to rebuild:

- entire global leaderboard
- one scoped leaderboard only
- one user projection only

### Replay tooling flow

```text
Need rebuild?
  |
  +--> one user only
  |      |
  |      +--> read score_events for that user
  |      +--> rebuild Redis user document
  |
  +--> one leaderboard scope
  |      |
  |      +--> replay relevant Kafka events or PostgreSQL backfill job
  |      +--> refresh snapshot keys only for that scope
  |
  +--> full rebuild
         |
         +--> stream historical events
         +--> rebuild all derived Redis state
```

### 7.4 Backpressure controls

If Redis becomes slow:

- reduce socket emission frequency
- enlarge micro-batch window temporarily
- prioritize leaderboard snapshots over lower-priority auxiliary keys
- if PostgreSQL materialized totals are updated in the same worker pool, batch them separately from latency-sensitive Redis work
- pause or isolate non-critical derived consumers

---

## 8. Security Improvements

### 8.1 Signed action grants

If the client is not fully trusted, the server can issue a short-lived action grant before completion.

Flow:

```text
Server issues action grant
  |
  v
Client completes work and submits grant
  |
  v
Command API verifies:
  - signature
  - expiry
  - userId match
  - actionId match
```

This makes arbitrary client-crafted score requests harder.

### 8.2 Session and device correlation

Keep the following with accepted actions:

- `sessionId`
- `deviceId`
- `ip`
- `userAgent`

### Example fraud use

```text
Five accounts
  |
  +--> same IP
  +--> same device fingerprint
  +--> same high-value action every 3 seconds

Result:
  cluster should be flagged for analyst review
```

### 8.3 Permission separation

Separate:

- player permissions
- moderator review permissions
- admin score-adjust permissions

Do not reuse the normal player write path for administrative changes.

---

## 9. Data Lifecycle Improvements

### 9.1 Table partitioning

Good partition candidates:

- `score_events`
- `fraud_flags`
- possibly `outbox_events` if volume is very high

### Example lifecycle

```text
Current month partitions
  |
  +--> score_events_2026_04
  +--> score_events_2026_05
  +--> score_events_2026_06

Older partitions
  |
  +--> compressed / archived
  +--> still queryable for audits if required
```

### 9.2 Retention policy

- keep short-term request dedupe rows long enough for retry windows
- keep ledger data much longer than cache data
- do not treat Redis as long-term storage

### 9.3 Compliance-sensitive storage

Only store what Redis needs for realtime decisions.

Prefer PostgreSQL for:

- durable review data
- operator actions
- security-sensitive metadata

---

## 10. Realtime Delivery Improvements

### 10.1 Multi-node socket fanout

Single-node sockets work early, but not forever.

Recommended evolution:

```text
Clients
  |
  v
Socket Gateway 1 ----\
Socket Gateway 2 -----+--> shared fanout bus (Redis adapter / broker)
Socket Gateway N ----/
```

This ensures a projection update can reach clients connected to any gateway instance.

### 10.2 Coalesced update strategy

Instead of one socket message per raw score event:

- buffer for 100-250ms
- combine changes by user or by top-10 diff
- emit one coalesced update

### Example

```text
Without coalescing:
  300 score events in 1 second
  -> 300 Redis writes
  -> 300 socket pushes

With coalescing:
  300 score events in 1 second
  -> 20-40 projection batches
  -> 20-40 socket pushes
```

### 10.3 SSE vs WebSocket

If the product only needs one-way live scoreboard updates, SSE may be simpler.

Use WebSockets when:

- bidirectional client/server realtime traffic is needed
- the team already has socket infrastructure
- reconnect, rooms, or richer event semantics are already expected

Use SSE when:

- only server-to-client streaming is needed
- simplicity is more valuable than socket flexibility

---

## 11. Anti-Fraud Evolution Path

Fraud systems usually evolve in stages too.

### Maturity ladder

```text
Stage A: rule-based checks
  - rate limits
  - duplicate detection
  - impossible cooldown checks

Stage B: clustered signals
  - IP clusters
  - device reuse
  - score velocity groups

Stage C: analyst-assisted models
  - review queue
  - operator tooling
  - model feedback from confirmed incidents
```

### Practical recommendation

Start with clear, explainable rules. Only add more advanced scoring once you have:

- enough volume
- enough labeled abuse cases
- operator processes to review and act on flags

---

## 12. Recommended Priority Order

If the team can only do a few things next, prioritize in this order:

1. Store and replay original idempotent responses.
2. Add deterministic tie-breakers.
3. Add replay/backfill tooling for derived Redis state.
4. Add admin adjustment and reversal workflow.
5. Add multi-node socket fanout and richer fraud tooling only when the product needs them.

### Final recommendation

The best improvement philosophy for this system is:

- correctness first
- replayability second
- operational maturity third

That keeps the architecture strong without turning it into unnecessary platform complexity too early.
