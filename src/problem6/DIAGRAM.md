# Scoreboard Module — Flow Diagrams

These diagrams trace the baseline flows of the Scoreboard Module:

1. **Action execute** — the synchronous request path from a user action to the live scoreboard broadcast.
2. **Async score flush** — the write-behind worker that drains Redis into the durable `scores` table.

> Scope: this file reflects **only the core specification** in `ARCHITECTURE.md` §§Overview through Rate Limiting. The features in §Improvement Notes (hash chain, tie-breaking, idempotency keys, velocity detection, rollback, admin APIs, WS graceful degradation, observability) are intentionally **excluded** to keep these diagrams scoped to baseline functionality.

---

## 1. Action Execute Flow

The happy path runs top-to-bottom. Each check that can fail terminates the request with an HTTP error (401 · 429 · 422 · 500). The WebSocket broadcast runs off Redis Pub/Sub on a separate thread and does **not** block the HTTP response.

```
POST /api/action/execute   { action_name } + Bearer JWT
        │
        ▼
  Auth Middleware
        │
        ├── Validate JWT (signature · exp · iat · sub)
        │     ├── invalid → 401 Unauthorized            [terminate]
        │     └── valid   → extract user_id from sub
        │
        ▼
  Rate Limit Middleware
        │
        ├── INCR ratelimit:<user_id>                    ← 60 req / 60s per user
        │     ├── over limit → 429 Too Many Requests    [terminate; Retry-After header]
        │     └── within     → continue
        │
        ▼
  ActionService.execute(user_id, action_name)
        │
        ├── SELECT * FROM actions
        │     WHERE action_name = ? AND is_active = true
        │     ├── not found / inactive → 422 Invalid Action   [terminate]
        │     └── found               → resolve points_awarded server-side
        │
        ├── (write-ahead) INSERT into action_log        ← synchronous; blocks on failure
        │     (user_id, action_id, points_gained)
        │     ├── transient failure → retry once after 200ms
        │     │     ├── retry ok    → proceed to Redis update
        │     │     └── retry fails → 500 Internal Error  [terminate; no score change applied]
        │     ├── hard failure      → 500 Internal Error  [terminate; no score change applied]
        │     └── insert ok         → proceed to Redis update
        │
        ├── ZINCRBY scoreboard:scores <points_awarded> <user_id>
        ├── HSET   scoreboard:pending:<user_id> score <new_total>
        │
        ├── Recompute new top-10:
        │     new_top10 = ZREVRANGE scoreboard:scores 0 9 WITHSCORES
        │
        ├── GET scoreboard:top10:snapshot  →  prev_top10
        │
        ├── Diff check: has the ordered set of (user_id, score) pairs changed?
        │     ├── YES → SET scoreboard:top10:snapshot <new_top10>
        │     │         PUBLISH "leaderboard:update" <new_top10> → Redis Pub/Sub
        │     └── NO  → skip publish (no broadcast, no snapshot write)
        │
        ▼
  200 OK { user_id, action_name, points_awarded, new_score, rank }
        (response returned immediately; not gated on the broadcast)


  ─────────────────── Pub/Sub side-channel (async, off-thread) ───────────────────

  Redis channel "leaderboard:update"
        │
        ▼
  WebSocket Broadcaster (subscribed to the channel)
        │
        └── ws.send(leaderboard_update) → all active WS connections
              │
              └── browsers re-render the live scoreboard
```

### Notes

- **Write-ahead audit log.** `INSERT action_log` runs synchronously **before** any Redis state change. If it fails, the request returns 500 and no score is applied — the audit log and the score increment are never decoupled.
- **Top-10 diff.** Two snapshots are equal iff for every position 0–9 both `user_id` and `score` match. Any mismatch triggers a broadcast.
- **Response is not gated on the broadcast.** `PUBLISH` is fire-and-forget; a Pub/Sub failure must not block the HTTP response. The leaderboard self-corrects on the next action execution or on WS reconnect.

---

## 2. Async Score Flush

Independent of the request path. The flush worker runs every 5 minutes, drains the pending buffer in Redis, and writes accumulated scores to the durable `scores` table.

```
Every 5 minutes (flush worker tick)
        │
        ▼
  HGETALL scoreboard:pending:*
        │
        ├── For each user_id with a pending score (batch size 500):
        │     ├── UPDATE scores
        │     │     SET score = <value>, updated_at = NOW
        │     │     WHERE user_id = <user_id>
        │     │     ├── DB write failed → retry (max 3, exp backoff)
        │     │     │                     leave pending key for next cycle
        │     │     └── DB write ok     → DEL scoreboard:pending:<user_id>
        │     └── (next user)
        │
        ▼
  Cycle complete; sleep until next tick
```

### Notes

- **Source of truth.** Redis `scoreboard:scores` is the live source for leaderboard reads. The `scores` table is a durable replica, eventually consistent within one flush interval.
- **Atomicity per user.** Each pending key is deleted **only after** its DB write succeeds. A partial flush is safe: entries that failed to write remain queued for the next cycle.
- **Recoverability.** If Redis is lost, the live state is rebuilt by reseeding `scoreboard:scores` from the `scores` table, then replaying `action_log` rows where `created_at > scores.updated_at`. Because the audit log is written synchronously on every execute, no score is permanently lost.
