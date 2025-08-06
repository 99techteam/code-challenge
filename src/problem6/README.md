# 📈 Scoreboard API Module Specification

## 1. Overview

This component implements a live-scoring mechanism with top 10 tracking, secure score updates, and SSE-based broadcasting to all subscribed clients.

## 2. Functional Requirements

- The scoreboard displays the top 10 users with the highest scores.
- When a user performs a predefined action, their score should increase.
- The score update should be securely handled through a backend API.
- The scoreboard must support real-time updates to reflect latest scores.

## 3. Non-Functional Requirements

- **Security**: Prevent unauthorized or forged API calls from increasing a user's score.
- **Performance**: The system should handle high frequency of score update requests and real-time read access efficiently.
- **Scalability**: Support thousands of concurrent users.
- **Maintainability**: Modular code with clear documentation and test coverage.
- **Availability**: System should be resilient to failures, with high uptime.

## 4. High-Level Architecture

![High Level Design](https://raw.githubusercontent.com/thetran-zalora/code-challenge/refs/heads/thetran-backend/src/problem6/high-level-design.drawio.svg)


| Component                     | Main Role                                                                                         |
|------------------------------|----------------------------------------------------------------------------------------------------|
| **Client (Web/Game)**        | Sends score increment requests (`POST /api/score`), opens SSE connection to receive updates       |
| **API Gateway**              | Routes requests                                                                                    |
| **Auth Service**             | Verifies user identity (JWT, OAuth token, session cookie), provides user context to API Gateway or Backend |
| **App Server (Backend)**     | Handles score update logic, protects against tampering                                            |
| **Redis Sorted Set**         | Maintains leaderboard scores (`ZINCRBY`, `ZREVRANGE`), used as fast-access cache for top users     |
| **Redis Streams**            | Acts as an event bus for score update events, enables decoupled processing |
| **Leaderboard Notifier**     | Subscribes to Redis Pub/Sub → Fetches leaderboard from Redis ZSET → Sends real-time updates to clients |
| **PostgreSQL**               | Stores audit logs, persistent user scores, detects cheating, handles long-term recovery            |
| **Background Worker (Queue)**| Consumes Redis Streams → Validates and persists score updates to DB|


## 5. Sequence diagram.

```mermaid
sequenceDiagram
    participant Client as Web Client (SSE)
    participant App as App Server (Express)
    participant Auth as Auth Service
    participant Redis as Redis SortedSet
    participant Stream as Redis Streams
    participant DB as PostgreSQL
    participant Worker as Score Worker
    participant Notifier as SSE Broadcaster

    Note over Client,App: 1. Get Leaderboard Top 10
    Client->>App: GET /leaderboard/top10
    App->>Redis: Try ZREVRANGE
    alt Cache Hit
        Redis-->>App: Return top 10
    else Cache Miss
        App->>DB: Query top 10
        DB-->>App: Return results
        App->>Redis: Sync Redis ZSET
    end
    App-->>Client: Return leaderboard data

    Note over Client,App: 2. Submit Score Update
    Client->>Auth: Validate Token
    Auth-->>App: userId info
    App->>Redis: ZINCRBY
    App->>Stream: XADD score_updated_event

    Note over Worker,DB: 3. Process Score Update
    Stream-->>Worker: Consume score_updated_event
    Worker->>DB: Persist to PostgreSQL
    Worker->>Redis: PUBLISH leaderboard_updated

    Note over Notifier,Client: 4. SSE Push to Clients
    Redis-->>Notifier: SUB leaderboard_updated
    Notifier->>Redis: ZREVRANGE top 10
    Notifier-->>Client: SSE push with new data
```

## 6. API Endpoints Summary.

### 🔹 GET `/leaderboard/top10`
Fetch the current top 10 users with the highest scores.

- **Auth Required:** ❌ No
- **Rate Limited:** ❌ No

#### ✅ Example Request
```http
GET /leaderboard/top10 HTTP/1.1
Host: live-scoreboard.example.com
```

#### ✅ Example Response
```http
[
  { "userId": "user123", "score": 950 },
  { "userId": "user456", "score": 920 },
  ...
]
```

### 🔹 POST /api/score
Submit a score increase for the currently authenticated user.

- **Auth Required:** ✅ Yes (JWT token in Authorization header)
- **Rate Limited:** ✅ Yes (per user/IP)
- **Idempotent:** 🔄 Recommended via Idempotency-Key header

#### ✅ Example Request
```http
POST /api/score HTTP/1.1
Host: live-scoreboard.example.com
Authorization: Bearer <jwt-token>
Content-Type: application/json
Idempotency-Key: abc123-unique-key

{
  "increment": 10
}
```

#### ✅ Example Response
```http
{
  "message": "Score updated successfully.",
  "newScore": 960
}
```
#### ⚠️ Error Responses
```http
// Unauthorized
{
  "error": "Invalid or missing token."
}

// Rate limited
{
  "error": "Too many requests. Please try again later."
}

```


### 🔹 GET /leaderboard/stream
Subscribe to server-sent events (SSE) for real-time leaderboard updates.

- **Auth Required:** ❌ No
- **Connection Type:**   SSE (Server-Sent Events)

#### ✅ Example Request
```http
GET /leaderboard/stream HTTP/1.1
Host: live-scoreboard.example.com
Accept: text/event-stream
```

#### ✅ Example Response (SSE Format)
```http
event: leaderboard_update
data: [{"userId":"user123","score":960},{"userId":"user456","score":920}]

```

## 7. Suggested Improvements.

### 🔧 API Enhancements
- Implement **rate limiting** per IP/user to prevent abuse.
- Add **idempotency keys** for score update requests (to prevent replay).
- **Log and alert** on suspicious activity patterns, e.g., rapid scoring from the same user/IP.

### 🔐 Security Enhancements
- Require **HMAC signatures** for high-trust clients (e.g., game servers).
- Use **nonce-based validation** for one-time score updates if applicable.

### 🔄 Resilience Enhancements
- Introduce **retry queues** for failed Redis or DB operations.
- Add **health checks** and **monitoring dashboards** for Redis, Workers, and SSE components.

### 👩‍💻 Developer Experience
- Define full **OpenAPI / Swagger spec** for `GET /leaderboard/top10` and `POST /api/score`.
- Provide **integration tests** for Redis + SSE + PostgreSQL flow.
- Use **feature flags** to enable/disable real-time updates in staging vs production.