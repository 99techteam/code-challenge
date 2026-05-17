# Scoreboard Module — Improvement Notes

**Companion to:** `README.md`

> Recommendations to the engineering team beyond the baseline specification. These items are deliberately scoped **out** of `README.md` to keep the baseline focused on what must ship in v1. They should be planned as follow-up work once the core module is in production.

---

## Table of Contents

1. [Idempotency Keys](#1-idempotency-keys)
2. [Velocity Anomaly Detection with Alerting](#2-velocity-anomaly-detection-with-alerting)
3. [Score Rollback Capability](#3-score-rollback-capability)
4. [Redis Failure Runbook](#4-redis-failure-runbook)
5. [Action Management Admin API](#5-action-management-admin-api)
6. [WebSocket Graceful Degradation](#6-websocket-graceful-degradation)
7. [Action Log Integrity via Hash Chain](#7-action-log-integrity-via-hash-chain)
8. [Score Tie-Breaking](#8-score-tie-breaking)
9. [Observability](#9-observability)

---

## 1. Idempotency Keys
Accept an `Idempotency-Key` header on `POST /api/action/execute`. Store seen keys with a short TTL (e.g. 60 seconds) in Redis. If a duplicate key arrives within the window, return the cached response without re-executing the action. This prevents double-increments from client retries or network errors.

## 2. Velocity Anomaly Detection with Alerting
Track per-user action rates in Redis using a sliding window counter (`velocity:<user_id>`). If a user exceeds a configurable threshold — for example, more than 100 executions within an hour — flag the account and immediately dispatch an alert to the audit or admin team via **Slack** (or another configured channel such as PagerDuty or email). The alert payload should include: `user_id`, `username`, observed rate, threshold breached, and a deep link to that user's `action_log` entries. Optionally, queue subsequent increments from flagged accounts for manual review rather than applying them in real time.

## 3. Score Rollback Capability
Implement an admin endpoint `POST /api/admin/scores/rollback` that accepts a `user_id` and an optional `before` timestamp. It recomputes the correct score by summing `points_gained` from `action_log` up to that point and writes the result back through the normal Redis + pending buffer path. This relies entirely on the append-only `action_log` and requires no direct edits to the `scores` table.

## 4. Redis Failure Runbook
Document a formal recovery procedure: on Redis restart or data loss, reseed `scoreboard:scores` from the `scores` table, then replay any `action_log` entries where `created_at > scores.updated_at` per user. Test this procedure in staging at least once before the first production deployment.

## 5. Action Management Admin API
Expose a small internal API (`GET/POST/PATCH /api/admin/actions`) to manage the `actions` table — creating new action types, toggling `is_active`, and adjusting `points_awarded`. Gate it behind an admin role claim in the JWT. This allows the product team to tune scoring rules without requiring a code deployment.

## 6. WebSocket Graceful Degradation
If the Redis Pub/Sub subscription drops, the WebSocket broadcaster should fall back to polling the sorted set on a short interval (e.g. every 3 seconds) and pushing diffs to connected clients. Clients experience marginally higher latency but no disconnection or stale data.

## 7. Action Log Integrity via Hash Chain

To make tampering with `action_log` detectable — even by someone with direct database access — each row should carry a cryptographic hash chain, in the style of a blockchain but without decentralisation or a Merkle tree. The result is a linear linked sequence where any mutation, deletion, or insertion of a historical row breaks the chain and is immediately detectable by a verification pass.

### Schema addition

Add one column to `action_log`:

| Column       | Type        | Notes                                                                 |
|--------------|-------------|-----------------------------------------------------------------------|
| `entry_hash` | CHAR(64)    | SHA-256 hex digest of this row's content combined with the previous row's hash |

### Hash computation

When inserting a new `action_log` row, compute its `entry_hash` as:

```
entry_hash = SHA-256(
  prev_entry_hash          // hex string of the immediately preceding row's entry_hash;
                           // use a known constant (e.g. 64 zero chars) for the first row
  || action_log.id         // UUID of this row
  || action_log.user_id
  || action_log.action_id
  || action_log.points_gained  // stored as string
  || action_log.created_at     // ISO-8601, microsecond precision
)
```

All fields are concatenated as UTF-8 strings with a fixed delimiter (e.g. `|`) to prevent boundary ambiguity. The previous row is the one with the highest `created_at` (or, to handle clock skew safely, the highest auto-incremented sequence number if one is added). The hash is computed in the application layer immediately before the INSERT, within the same write-ahead transaction.

### Verification

An audit or admin process can verify the entire chain at any time:

1. Fetch all `action_log` rows in insertion order.
2. For each row, recompute the expected hash from its fields and the previous row's `entry_hash`.
3. Compare the recomputed hash against the stored `entry_hash`.
4. Any mismatch indicates that the row — or a predecessor — was mutated, deleted, or a row was inserted between two existing ones.

This verification can be run as a scheduled job (e.g. nightly) and its result exposed as an admin endpoint `GET /api/admin/action-log/verify`, returning the index and `id` of the first broken link if one is found.

### What this detects

| Tampering attempt                              | Detected? |
|------------------------------------------------|-----------|
| Updating a field on an existing row            | Yes — that row's hash no longer matches |
| Deleting a row                                 | Yes — the next row's `prev_entry_hash` is now orphaned |
| Inserting a fabricated historical row          | Yes — all subsequent hashes break |
| Appending a fabricated future row              | Only if the server's insertion path is bypassed; legitimate inserts always use the application layer which enforces the chain |
| Replacing an entire contiguous tail of rows with consistent fake hashes | Not detectable by the chain alone — mitigate by storing a periodic checkpoint hash in a separate, independently-controlled system (e.g. an append-only external log or an admin-held signed checkpoint) |

### Implementation notes

- The hash must be computed **inside the same database transaction** as the INSERT so that a concurrent insert cannot slip between the `prev_hash` read and the write.
- Use `SELECT entry_hash FROM action_log ORDER BY created_at DESC LIMIT 1 FOR UPDATE` (or equivalent row-locking) to serialise concurrent inserts and guarantee a stable chain tail.
- The delimiter and field ordering must be frozen in a version-controlled constant. Any future schema change to `action_log` requires a new chain segment starting with a documented genesis hash for that segment.
- The `entry_hash` column should be exposed in the verification API but never in any user-facing or general application response.

## 8. Score Tie-Breaking

The Redis sorted set `scoreboard:scores` stores only a single numeric score per member. When two users hold the same score, Redis has no built-in concept of ordering between them — the relative position is undefined and may shift arbitrarily between reads. A deterministic tie-breaking policy must be applied in the application layer every time the leaderboard is constructed or diffed.

### Tie-breaking rules, in priority order

1. **Higher score wins.** Primary sort, descending.
2. **If scores are equal — earlier score attainment wins.** The user who reached that score value first is ranked higher, rewarding faster progression.
3. **If score attainment time is also equal — older account wins.** The user with the earlier `users.created_at` is ranked higher, favouring long-standing members of the platform.

### Implementation

Redis cannot enforce this ordering natively, so the top-N slice must be post-sorted in application code after `ZREVRANGE scoreboard:scores 0 N WITHSCORES` is fetched. For any group of users sharing the same score, their relative order is resolved by the rules above.

**Data needed to sort:**

| Field                  | Source                                                    |
|------------------------|-----------------------------------------------------------|
| `score`                | Redis sorted set member score                             |
| `score_attained_at`    | Derived from `action_log` — see below                     |
| `users.created_at`     | Looked up from the `users` table (or a warm cache)        |

**Deriving `score_attained_at`:** This is the `created_at` of the earliest `action_log` row at which the user's cumulative `points_gained` first reached or exceeded their current score. It is not a field that can be trivially maintained in Redis because it depends on the full log history. Two practical approaches:

- **Precomputed column on `scores` table:** Add a `score_attained_at TIMESTAMP` column to the `scores` table, updated by the flush worker whenever the score increases. The flush worker, which already holds the new score value, can query `action_log` to find the first row at which the cumulative sum reached that value and write the timestamp alongside the score. This is the recommended approach — the computation happens offline in the flush cycle, not in the hot request path.

- **On-demand query:** At ranking time, for each tied user run `SELECT MIN(created_at) FROM ... WHERE cumulative_sum >= target_score` using a window function over `action_log`. Acceptable for low-concurrency admin views or batch jobs, but too expensive for the real-time leaderboard hot path.

**`users.created_at` caching:** Account creation timestamps are immutable. They can be cached in Redis with no TTL and lazily populated on first leaderboard appearance (`GET users:created_at:<user_id>`, fallback to DB read + cache set).

### Snapshot diff impact

The tie-breaking sort must be applied **before** the diff comparison against `scoreboard:top10:snapshot`. Two snapshots where the only difference is the resolution of a tie among users already in the top 10 (due to a score change that didn't alter their raw score) should be considered changed and trigger a broadcast, since the visible rank order has shifted.

### Composite sort key (alternative Redis approach)

If the team prefers to keep all ranking logic inside Redis and avoid post-sorting, a composite floating-point score can encode both the real score and a fixed tiebreaker offset:

```
composite_score = points_gained * SCORE_SCALE
                  - (score_attained_at_unix_ms / ATTAINED_SCALE)
                  - (account_created_at_unix_ms / ACCOUNT_SCALE)
```

Choose scale constants such that the fractional portion can never overflow into the integer portion (i.e. the tiebreaker offsets are always smaller than the smallest possible `points_gained` increment). This makes `ZREVRANGE` return the correct order natively. The tradeoff is that composite scores are opaque to anyone inspecting Redis directly, and updating `score_attained_at` after the flush requires a `ZADD XX` to rewrite the composite score — adding a Redis write to every flush cycle.

The application-layer post-sort approach is recommended unless Redis-native ordering is a firm requirement.

## 9. Observability
Instrument the following metrics from day one:

- `action.execute.latency_ms` — histogram of end-to-end action execution time
- `action.execute.errors` — counter of failed executions, tagged by `error_code`
- `action.log.write_latency_ms` — histogram of the audit log INSERT time (tracks write-ahead DB performance in isolation)
- `scoreboard.active_ws_connections` — gauge of live WebSocket connections
- `scoreboard.flush.latency_ms` — histogram of flush worker cycle duration
- `scoreboard.flush.errors` — counter of flush failures, tagged by failure type
- `scoreboard.redis.zincrby_latency_ms` — histogram of sorted set write time

Trace IDs should be propagated through all layers. The `action_log.id` should be emitted as a span attribute so any alert or anomaly can be traced back to the exact audit entry.
