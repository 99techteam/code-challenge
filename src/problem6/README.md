# Problem 6: Live Scoreboard — Module Specification

## Overview

This document specifies the **Score Update & Live Scoreboard** module for the backend API service. The module handles:

1. Receiving score-update requests from authenticated users.
2. Persisting scores to the database.
3. Broadcasting live scoreboard updates (top 10) to all connected clients.
4. Preventing unauthorised score manipulation.

---

## Table of Contents

- [Requirements](#requirements)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorisation](#authentication--authorisation)
- [Data Model](#data-model)
- [Execution Flow](#execution-flow)
- [Live Update Mechanism](#live-update-mechanism)
- [Security Considerations](#security-considerations)
- [Scalability Notes](#scalability-notes)
- [Improvements & Future Work](#improvements--future-work)

---

## Requirements

| # | Requirement |
|---|-------------|
| R1 | The website displays the **top 10 users by score** on a scoreboard. |
| R2 | The scoreboard **updates in real time** as scores change. |
| R3 | A user completes an action → the client dispatches an API call to increment their score. |
| R4 | **Unauthorised score increases must be prevented** (malicious users must not be able to inflate scores). |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                  │
│   ┌──────────────┐    POST /scores/increment    ┌─────────────┐ │
│   │  Action UI   │ ─────────────────────────►  │  WebSocket  │ │
│   │  (triggers   │                              │  listener   │ │
│   │   action)    │ ◄── scoreboard:update ──────  │  (receives  │ │
│   └──────────────┘                              │  top-10)    │ │
│                                                 └─────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │  HTTPS + JWT
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API SERVER (Node.js)                        │
│                                                                  │
│  ┌─────────────────┐   ┌──────────────────┐  ┌───────────────┐  │
│  │  Auth Middleware │   │  Score Controller│  │  WS Gateway   │  │
│  │  (JWT verify)   │──►│  (validate +     │  │  (broadcasts  │  │
│  └─────────────────┘   │   update score)  │  │   top-10)     │  │
│                        └────────┬─────────┘  └───────┬───────┘  │
│                                 │                    │           │
│                        ┌────────▼─────────┐          │           │
│                        │  Score Service   │──────────┘           │
│                        │  (business logic)│                      │
│                        └────────┬─────────┘                      │
│                                 │                                 │
│                        ┌────────▼─────────┐                      │
│                        │  Cache (Redis)   │                      │
│                        │  sorted set for  │                      │
│                        │  top-10 ranking  │                      │
│                        └────────┬─────────┘                      │
│                                 │                                 │
│                        ┌────────▼─────────┐                      │
│                        │  Database (SQL)  │                      │
│                        │  users + scores  │                      │
│                        └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### `POST /scores/increment`

Increments the authenticated user's score by a fixed amount upon completing an action.

**Authentication:** Required — Bearer JWT token in `Authorization` header.

**Request headers:**
```
Authorization: Bearer <jwt_token>
```

**Request body:**
```json
{
  "action_id": "string"
}
```

> `action_id` is a unique, single-use token issued by the server when the action was started. It prevents replay attacks (see [Security](#security-considerations)).

**Response `200 OK`:**
```json
{
  "user_id": "usr_abc123",
  "new_score": 1050,
  "rank": 3
}
```

**Error responses:**

| Status | Code | Reason |
|--------|------|--------|
| `401` | `unauthorized` | Missing or invalid JWT |
| `403` | `forbidden` | `action_id` already used or not issued to this user |
| `422` | `invalid_action` | `action_id` not found or expired |
| `429` | `rate_limited` | Too many requests from this user |

---

### `GET /scores/top`

Returns the current top 10 scoreboard. Served from Redis cache.

**Authentication:** Optional (public endpoint).

**Response `200 OK`:**
```json
{
  "scoreboard": [
    { "rank": 1, "user_id": "usr_xyz", "username": "alice", "score": 9800 },
    { "rank": 2, "user_id": "usr_abc", "username": "bob",   "score": 9200 }
  ],
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### `GET /scores/me`

Returns the authenticated user's current score and rank.

**Authentication:** Required.

---

## Authentication & Authorisation

### JWT Authentication

Every `POST /scores/increment` request must include a valid **JWT** signed with the server's secret key (`HS256` or `RS256`). The middleware:

1. Extracts the token from the `Authorization: Bearer <token>` header.
2. Verifies the signature and expiry.
3. Attaches `req.user = { user_id, ... }` to the request context.
4. Rejects with `401` if the token is missing, expired, or tampered.

### Action ID (One-Time Token)

To prevent a user from calling `POST /scores/increment` arbitrarily without completing a real action:

1. When the user **starts** an action, the server issues a short-lived, single-use `action_id` (UUID stored in Redis with a TTL of e.g. 60 seconds).
2. On completion, the client submits this `action_id` with the score request.
3. The server **atomically checks and deletes** the `action_id` from Redis. If it doesn't exist (already used or expired), the request is rejected with `403`.

This ensures each action can only be rewarded once.

### Rate Limiting

A per-user rate limit (e.g. 10 requests/minute) is enforced at the API gateway or middleware level to prevent brute-force score inflation even with valid tokens.

---

## Data Model

### `users` table

| Column       | Type    | Notes                  |
|--------------|---------|------------------------|
| `id`         | UUID PK |                        |
| `username`   | TEXT    | unique                 |
| `score`      | INTEGER | default 0              |
| `created_at` | TIMESTAMP |                      |
| `updated_at` | TIMESTAMP |                      |

### `action_log` table

| Column        | Type      | Notes                                  |
|---------------|-----------|----------------------------------------|
| `id`          | UUID PK   |                                        |
| `user_id`     | UUID FK   | references `users.id`                  |
| `action_id`   | UUID      | the one-time token used                |
| `score_delta` | INTEGER   | points awarded                         |
| `created_at`  | TIMESTAMP |                                        |

Logging every score event provides an audit trail for detecting abuse.

### Redis: Sorted Set `scoreboard:top`

```
ZADD scoreboard:top <score> <user_id>
ZREVRANGE scoreboard:top 0 9 WITHSCORES  → top 10
```

The sorted set is updated atomically on every score increment and serves as the live cache for the scoreboard.

---

## Execution Flow

```
User completes action
        │
        ▼
Client sends POST /scores/increment
  { action_id: "uuid-xyz" }
  Authorization: Bearer <jwt>
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Auth Middleware                                          │
│    • Verify JWT signature & expiry                          │
│    • Extract user_id from claims                            │
│    • Reject 401 if invalid                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Rate Limit Check                                         │
│    • Check per-user request count in Redis                  │
│    • Reject 429 if exceeded                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Action ID Validation (atomic Redis operation)            │
│    • GET action:{action_id} → must equal user_id            │
│    • DEL action:{action_id} (consume it)                    │
│    • Reject 403 if not found or user mismatch               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Score Update (database transaction)                      │
│    • UPDATE users SET score = score + delta,                │
│             updated_at = now() WHERE id = user_id           │
│    • INSERT INTO action_log (user_id, action_id, delta)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Cache Update                                             │
│    • ZINCRBY scoreboard:top <delta> <user_id>               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Live Broadcast                                           │
│    • ZREVRANGE scoreboard:top 0 9 WITHSCORES                │
│    • Emit "scoreboard:update" event via WebSocket to all    │
│      connected clients                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        Return 200 { new_score, rank }
```

---

## Live Update Mechanism

### WebSocket (recommended)

- Clients connect to `wss://api.example.com/ws` on page load.
- The server maintains a pool of connected WebSocket clients.
- After every successful score update, the server pushes a `scoreboard:update` message to **all** connected clients with the new top-10 payload.
- No polling required — updates are pushed within milliseconds.

### Alternative: Server-Sent Events (SSE)

If WebSocket infrastructure is not available, SSE (`GET /scores/stream`) can be used. SSE is unidirectional (server → client) and simpler to implement, but does not support bidirectional communication.

### Scalability: Pub/Sub with Redis

In a multi-instance deployment, each API server instance subscribes to a Redis Pub/Sub channel `scoreboard:updates`. When any instance processes a score update, it publishes to the channel. All instances receive the message and broadcast to their own connected WebSocket clients.

```
Instance A (handles score update)
  → PUBLISH scoreboard:updates <top10_json>

Instance B, C (subscribed)
  → receive message
  → broadcast to their WS clients
```

---

## Security Considerations

| Threat | Mitigation |
|--------|------------|
| Unauthenticated score inflation | JWT required on every increment request |
| Replay attack (reuse same action_id) | action_id is single-use, atomically deleted on first use |
| Forged action_id | action_id is server-issued and stored in Redis; client cannot fabricate one |
| Brute-force / flooding | Per-user rate limiting (Redis counter with TTL) |
| JWT tampering | Signed with server secret; verified on every request |
| Score manipulation via direct DB access | Only the API service has DB write access; no direct client DB connection |
| Audit trail gaps | Every score event logged in `action_log` table |

---

## Scalability Notes

- **Redis sorted set** provides O(log N) score updates and O(log N + K) top-K queries — highly efficient even with millions of users.
- **Database writes** are the bottleneck at scale. Consider batching score updates or using an append-only event log with periodic aggregation.
- **WebSocket connections** are stateful. Use a load balancer with sticky sessions, or use Redis Pub/Sub to fan out across instances (described above).
- **Read scaling**: `GET /scores/top` is served entirely from Redis — no DB read required.

---

## Improvements & Future Work

1. **Action server-side validation**: Instead of a simple one-time token, the server could verify that the action was genuinely completed (e.g. by checking game state or a cryptographic proof), making it harder to fake completions.

2. **Score delta flexibility**: Currently a fixed delta per action. A configurable delta per action type would allow different actions to award different point values.

3. **Anti-cheat analytics**: Log client metadata (IP, user-agent, timing) with each action and run anomaly detection to flag suspicious patterns (e.g. completing actions faster than humanly possible).

4. **Leaderboard segments**: Support time-windowed leaderboards (daily, weekly, all-time) using separate Redis sorted sets with TTL-based expiry.

5. **Optimistic UI**: The client can optimistically update the local score display before the server confirms, then reconcile on the server response.

6. **Graceful WebSocket reconnection**: Clients should implement exponential backoff reconnection and re-fetch the current scoreboard on reconnect to avoid stale state.
