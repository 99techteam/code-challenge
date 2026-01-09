# Live Scoreboard Backend Module Specification

## Overview

This module manages user scores, ensures data integrity, and distributes real-time updates to connected clients. It is designed to prevent unauthorized score manipulation while keeping the top-10 leaderboard accurate and up-to-date.

---

## Objectives

- Accept and validate score updates triggered by user actions.
- Persist scores securely in a database.
- Provide real-time leaderboard updates to clients via WebSockets or SSE.
- Protect against replay attacks and unauthorized score changes.
- Support queries for the top-10 leaderboard or individual user scores.

---

## Module Responsibilities

### 1. API Endpoints

| Endpoint             | Method | Purpose                                           |
|---------------------|--------|-------------------------------------------------|
| `/scores/increment` | POST   | Increment a user's score after validating action authenticity. |
| `/scores/top`       | GET    | Return cached top-10 leaderboard entries.       |
| `/scores/:userId`   | GET    | Retrieve an individual user's score and rank.  |

### 2. Authentication & Authorization

- Validate short-lived signed tokens or JWTs issued alongside user actions.
- Prevent replay attacks using unique nonces per action.
- Enforce user-level permissions (e.g., only authorized users can apply bonus points).

### 3. Data Management

- Store scores in a `user_scores` table.
- Use atomic operations to prevent race conditions.
- Cache top-10 results for fast read performance (Redis or similar).

### 4. Real-Time Distribution

- Publish score changes to a message bus (`scoreboard.updates`).
- Push updates to WebSocket or SSE clients subscribed to leaderboard changes.

### 5. Observability

- Log update attempts, including success/failure and request IDs.
- Emit metrics: update rate, cache hits/misses, authorization failures.

---

### 6. Live Scoreboard Backend – Flowchart
```mermaid
flowchart TD
    A[User Completes Action] --> B[POST /scores/increment]

    B --> C{JWT Valid?}
    C -- No --> X[Reject 401]
    C -- Yes --> D{Action Token Valid?}

    D -- No --> Y[Reject 403]
    D -- Yes --> E{Nonce Unused?}

    E -- No --> Z[Reject Replay]
    E -- Yes --> F[Consume Nonce]

    F --> G[Atomic DB Score Update]
    G --> H[Persist Score Event]

    H --> I{Top-10 Impacted?}
    I -- Yes --> J[Update Cache]
    I -- No --> K[Skip Cache]

    J --> L[Publish Event]
    K --> L[Publish Event]

    L --> M[Message Broker]
    M --> N[WebSocket / SSE]
    N --> O[Live Leaderboard Update]
```
---

## Execution Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Scoreboard API
    participant Auth as Auth Service
    participant DB as Database
    participant Cache as Redis Cache
    participant Bus as Message Broker
    participant WS as WebSocket Gateway

    Client->>API: POST /scores/increment (userId, delta, actionToken, nonce)
    API->>Auth: Validate token + nonce
    Auth-->>API: Token valid
    API->>DB: Atomic increment of user score
    DB-->>API: Return updated score & rank
    API->>Cache: Update top-10 cache if necessary
    API->>Bus: Publish scoreboard update event
    Bus-->>WS: Forward update to connected clients
    WS-->>Client: Push updated leaderboard
    Client->>API: GET /scores/top (fallback)
    API->>Cache: Fetch top-10 snapshot
    Cache-->>API: Return leaderboard
    API-->>Client: Respond with leaderboard
```
## Data Model
`user_scores`
```
| Column     | Type      | Notes              |
| ---------- | --------- | ------------------ |
| user_id    | UUID (PK) | One row per user   |
| score      | INT       | Total score        |
| updated_at | TIMESTAMP | Last update        |
| version    | INT       | Optimistic locking |
```
---
`score_events`
```
| Column     | Type      | Notes        |
| ---------- | --------- | ------------ |
| id         | UUID      | Event ID     |
| user_id    | UUID      | User         |
| delta      | INT       | Score change |
| nonce      | STRING    | Anti-replay  |
| source     | STRING    | Action type  |
| created_at | TIMESTAMP | Audit trail  |
```
---
`action_nonces (Redis)`
```
| Field      | Purpose         |
| ---------- | --------------- |
| nonce      | Prevent replay  |
| user_id    | Ownership       |
| expires_at | TTL enforcement |
| consumed   | Single-use      |

```

---
## Real-Time Update Strategy
- Score changes are published to a message broker
- WebSocket / SSE gateways subscribe to updates
- Clients receive immediate leaderboard refreshes
- Polling is only a fallback
---

## Observability & Monitoring
### Logging
- Score update attempts
- Authorization failures
- Replay detection events
### Metrics
- Score update rate
- Cache hit/miss ratio
- WebSocket connected clients
- Authorization failure count

---

## API Contracts

### `POST /scores/increment`

- **Headers:** `Authorization: Bearer <JWT>`, `X-Action-Nonce`
- **Body:**
```json
{
  "userId": "uuid",
  "delta": 10,
  "actionToken": "string"
}
```
--- 

## Error Handling
```
| Scenario            | Response |
| ------------------- | -------- |
| Invalid token       | 401      |
| Invalid permissions | 403      |
| Replay detected     | 409      |
| DB failure          | 500      |
```
--- 
### Suggested Improvements (Future Work)
`These are not required for initial implementation.`
1. Rate limiting per user
2. Anti-bot heuristics
3. Shard leaderboard by region
4. Async batch leaderboard rebuilds
5. GraphQL subscription support
6. Admin audit dashboard
7. Cheat-detection ML models
---