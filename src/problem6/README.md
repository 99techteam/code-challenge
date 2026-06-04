# Scoreboard Module Specification

## Overview

This document specifies the backend module responsible for managing a real-time scoreboard system. The module handles score updates, maintains a live top-10 leaderboard, and prevents unauthorized score manipulation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM FLOW DIAGRAM                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐         ┌──────────────┐         ┌─────────────────┐
│  Client  │         │  API Gateway │         │  Auth Middleware │
│ (Browser)│────────▶│   (HTTPS)    │────────▶│  (JWT Verify)   │
└──────────┘         └──────────────┘         └────────┬────────┘
     ▲                                                  │
     │                                                  ▼
     │                                        ┌─────────────────┐
     │                                        │ Rate Limiter     │
     │                                        │ (per-user)       │
     │                                        └────────┬────────┘
     │                                                  │
     │                                                  ▼
     │                                        ┌─────────────────┐
     │                                        │ Score Controller │
     │                                        │ - validate action│
     │                                        │ - idempotency    │
     │                                        └────────┬────────┘
     │                                                  │
     │                                                  ▼
     │                                        ┌─────────────────┐
     │                                        │ Score Service    │
     │                                        │ - update score   │
     │                                        │ - recalc top 10  │
     │                                        └────────┬────────┘
     │                                                  │
     │                              ┌───────────────────┼───────────────────┐
     │                              ▼                   ▼                   ▼
     │                    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │                    │  Database    │    │    Cache      │    │  WebSocket   │
     │                    │ (PostgreSQL) │    │   (Redis)     │    │   Server     │
     │                    │ - scores     │    │ - top 10 cache│    │              │
     │                    │ - actions    │    │ - sorted set  │    │              │
     │                    └──────────────┘    └──────────────┘    └──────┬───────┘
     │                                                                    │
     │◀───────────────────────────────────────────────────────────────────┘
     │                         (real-time broadcast: top 10 update)
     │
```

---

## Execution Flow

### 1. Score Update Flow

```
User completes action
        │
        ▼
POST /api/scores/actions
(Authorization: Bearer <JWT>)
(Body: { action_id, action_type, payload })
        │
        ▼
┌───────────────────┐
│ Auth Middleware    │──── Invalid token ──▶ 401 Unauthorized
│ - Verify JWT      │
│ - Extract user_id │
└───────┬───────────┘
        │ valid
        ▼
┌───────────────────┐
│ Rate Limiter      │──── Exceeded ──▶ 429 Too Many Requests
│ - Max N actions   │
│   per minute      │
└───────┬───────────┘
        │ allowed
        ▼
┌───────────────────┐
│ Score Controller  │──── Duplicate action_id ──▶ 409 Conflict
│ - Validate input  │
│ - Check idempotency│
│   (action_id)     │
└───────┬───────────┘
        │ valid & new
        ▼
┌───────────────────┐
│ Score Service     │
│ - Record action   │
│ - Increment score │
│ - Update Redis    │
│   sorted set      │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│ Check: Did top 10 │──── No change ──▶ 200 OK (return new score)
│ change?           │
└───────┬───────────┘
        │ yes
        ▼
┌───────────────────┐
│ WebSocket Broadcast│
│ - Emit "scoreboard│
│   _update" event  │
│ - Payload: top 10 │
└───────────────────┘
        │
        ▼
    200 OK (return new score)
```

### 2. Scoreboard Read Flow

```
GET /api/scores/top
        │
        ▼
┌───────────────────┐
│ Cache Lookup      │──── Cache hit ──▶ 200 OK (return cached top 10)
│ (Redis sorted set)│
└───────┬───────────┘
        │ cache miss
        ▼
┌───────────────────┐
│ Database Query    │
│ - SELECT top 10   │
│ - Populate cache  │
└───────────────────┘
        │
        ▼
    200 OK (return top 10)
```

### 3. WebSocket Connection Flow

```
Client connects to ws://host/scoreboard
        │
        ▼
┌───────────────────┐
│ Authenticate      │──── Invalid ──▶ Close connection
│ (token in query   │
│  or first message)│
└───────┬───────────┘
        │ valid
        ▼
┌───────────────────┐
│ Subscribe to      │
│ "scoreboard_update"│
│ channel           │
└───────────────────┘
        │
        ▼
    Send current top 10 snapshot
    Listen for future broadcasts
```

---

## API Endpoints

### `POST /api/scores/actions`

Submit a completed action to update the user's score.

**Headers:**
```
Authorization: Bearer <JWT>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action_id": "550e8400-e29b-41d4-a716-446655440000",
  "action_type": "task_complete",
  "metadata": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action_id` | UUID | Yes | Client-generated unique ID for idempotency |
| `action_type` | string | Yes | Type of action performed |
| `metadata` | object | No | Action-specific data for audit purposes |

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Score updated successfully |
| 401 | Invalid or missing authentication token |
| 409 | Duplicate action_id (already processed) |
| 422 | Invalid request body |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

**Success Response:**
```json
{
  "user_id": "user-123",
  "new_score": 150,
  "rank": 7
}
```

---

### `GET /api/scores/top`

Retrieve the current top 10 scoreboard.

**Responses:**

| Status | Description |
|--------|-------------|
| 200 | Scoreboard returned |
| 500 | Internal server error |

**Success Response:**
```json
{
  "data": [
    { "rank": 1, "user_id": "user-456", "username": "alice", "score": 980 },
    { "rank": 2, "user_id": "user-789", "username": "bob", "score": 870 }
  ],
  "updated_at": "2026-06-04T12:00:00Z"
}
```

---

### `WebSocket /ws/scoreboard`

Real-time scoreboard updates pushed to connected clients.

**Event: `scoreboard_update`**
```json
{
  "event": "scoreboard_update",
  "data": [
    { "rank": 1, "user_id": "user-456", "username": "alice", "score": 985 },
    { "rank": 2, "user_id": "user-789", "username": "bob", "score": 870 }
  ],
  "updated_at": "2026-06-04T12:00:05Z"
}
```

---

## Database Schema

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | User identifier |
| username | VARCHAR(50) | Display name |
| score | INTEGER | Current total score |
| updated_at | TIMESTAMP | Last score update time |

### `score_actions` table (audit log)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Internal record ID |
| action_id | UUID (UNIQUE) | Client-provided idempotency key |
| user_id | UUID (FK) | User who performed the action |
| action_type | VARCHAR(50) | Type of action |
| points | INTEGER | Points awarded |
| created_at | TIMESTAMP | When the action was recorded |

**Indexes:**
- `score_actions.action_id` — UNIQUE index (idempotency lookups)
- `users.score` — DESC index (fast top-10 queries)

---

## Security Measures

| Threat | Mitigation |
|--------|-----------|
| Unauthorized score updates | JWT authentication on all write endpoints |
| Token replay / stolen tokens | Short-lived tokens (15 min) + refresh token rotation |
| Rapid-fire fake actions | Per-user rate limiting (e.g., max 10 actions/minute) |
| Duplicate action submission | Idempotency key (`action_id`) — reject duplicates with 409 |
| Score manipulation via API replay | Signed action payloads (HMAC) from the client application |
| Direct DB manipulation | Application-layer validation; no direct DB access exposed |

---

## Technology Recommendations

| Component | Technology | Rationale |
|-----------|-----|-----------|
| Server | Node.js + Express/Fastify | Efficient for I/O-bound real-time workloads |
| Database | PostgreSQL | Reliable, supports indexes for leaderboard queries |
| Cache | Redis (Sorted Sets) | O(log N) score updates, O(1) top-K retrieval |
| Real-time | WebSocket (Socket.IO or ws) | Bi-directional, low-latency push |
| Auth | JWT | Stateless, verifiable tokens |
| Rate Limiting | Redis-based sliding window | Distributed, consistent across instances |

---

## Additional Comments & Improvements

### 1. Horizontal Scalability
- Use Redis Pub/Sub to fan out WebSocket broadcasts across multiple server instances.
- Stateless API servers behind a load balancer; session state lives in Redis.

### 2. Action Verification (Server-Side Validation)
- If actions can be verified (e.g., a quiz answer), validate the action server-side before awarding points. Never trust the client to determine the score increment.
- Consider a **signed action token** pattern: the server issues a challenge token when the action starts, and the client must return it upon completion. This prevents users from calling the score endpoint without actually performing the action.

### 3. Batching & Debouncing
- If the top-10 changes frequently under high load, debounce WebSocket broadcasts (e.g., emit at most once per 500ms) to reduce client re-renders and network overhead.

### 4. Audit Trail & Anomaly Detection
- Log all score actions for audit. Run periodic anomaly detection (e.g., flag users with score velocity > 3σ from mean).
- Implement a moderation dashboard for manual review of flagged accounts.

### 5. Graceful Degradation
- If Redis is down, fall back to direct DB queries for the top-10.
- If WebSocket delivery fails, clients should poll `/api/scores/top` as a fallback (e.g., every 30s).

### 6. Pagination & Extended Leaderboard
- While the requirement is top 10, design the sorted set and API to support arbitrary ranges (`?offset=0&limit=10`) for future expansion (e.g., "show my position and nearby players").

### 7. Score Atomicity
- Use Redis `ZINCRBY` for atomic score increments in the sorted set.
- Wrap DB score update + action insert in a transaction to prevent partial writes.

### 8. Testing Strategy
- **Unit tests**: Service layer logic (score calculation, validation).
- **Integration tests**: API endpoints with test DB.
- **Load tests**: Simulate concurrent score submissions to validate rate limiting and sorted set performance.




