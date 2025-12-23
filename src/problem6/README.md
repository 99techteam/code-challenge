# Real-Time Scoreboard API – Requirements Document

## Business Overview
### 1. Purpose

This document defines the requirements for a backend API service that manages a real-time scoreboard displaying the top 10 user scores on a website. The service is responsible for securely updating user scores, maintaining leaderboard rankings, and broadcasting updates to connected clients in real time.

The document is intended for a backend engineering team responsible for designing and implementing the service.

### 2. Objectives

The system must:
- Display the top 10 users by score on a website
- Update the scoreboard in real time when scores change
- Increase a user’s score when a valid action is completed
- Accept score update requests only from authorized and authenticated sources
- Prevent malicious or unauthorized score manipulation

## 3. Functional Requirements
### 3.1. Score Update Handling

#### Description
The system must process score increases when a valid action is completed.

#### Requirements
- The backend must expose an API endpoint to handle score-increase requests.
- Each request must:
  - Identify the user whose score is being updated
  - Represent a single completed action
- The backend must:
  - Validate the request’s authenticity
  - Verify that the action is permitted
  - Increase the user’s score by a server-defined amount
- The backend must not accept client-supplied score values.

Behavioral Rules
- Concurrent updates to the same user must not result in lost or duplicated increments.
- A single action must not be processed more than once.

### 3.2. Leaderboard
#### Description
The system provides access to the top 10 leaderboard via both an HTTP API and WebSockets.
HTTP is used for state retrieval, while WebSockets are used for real-time updates.

#### HTTP Leaderboard Retrieval
- The backend must expose an API endpoint to retrieve the leaderboard.
- This endpoint is used for:
  - Initial client load
  - Recovery and reconciliation if WebSocket updates are missed
- The response must include:
  - User identifier
  - Score
  - Rank (1–10)
- The response represents a complete snapshot of the current leaderboard state.

#### WebSocket Leaderboard Updates
- The backend must support WebSocket connections for real-time leaderboard updates.
- Clients subscribe to leaderboard updates by `resource_id`.
- Updates are sent only when the top 10 changes.
- Each update message contains a full snapshot of the top 10 leaderboard.
- Clients must be able to recover missed updates by calling the HTTP leaderboard API.

### 4. Non-Functional Requirements
#### 4.1. Performance
- Score update requests should complete within 200 ms under normal load.
- Leaderboard read requests should complete within 100 ms.
- Real-time update delivery should occur immediately after the score update is committed.

### 4.2. Scalability
- The system must support:
  - A high volume of score update requests
  - A large number of concurrent connected clients
  - Leaderboard computation must remain efficient as the total number of users grows.

### 4.3. Reliability & Consistency
- Score updates must be durable once acknowledged.
- Leaderboard rankings must be consistent with stored scores.
- Temporary failures in real-time delivery must not affect score correctness.

## Technical Design

### 1. Goals
This technical design aims to:
- Enable real-time leaderboard updates
- Provide fast retrieval of the top 10 leaderboard entries
- Avoid expensive full-table scans or ranking queries
- Support future score categorization (e.g. per resource, mode, event)
- Ensure data durability and recoverability
- Prevent unauthorized or malicious score manipulation

### 2. Data Storage Strategy

The system uses a hybrid storage model:

|Layer|Purpose|Technology|
|:---|:---|:---|
|Persistent storage|Source of truth for user scores|Relational Database (PostgreSQL)|
|In-memory ranking|Fast leaderboard computation|Redis Sorted Sets|

Redis is treated as a rebuildable ranking cache, while the database remains the authoritative source of data.

### 3. Data Design
- Table `users`
```schema
id: UUID (Primary Key)
username: String (Unique)
email: String (Unique)
created_at: Timestamp
updated_at: Timestamp
```

- Table `leaderboard_entries`
```schema
id: UUID (Primary Key)
user_id: UUID (Foreign Key to users.id)
resource_id: UUID (Score category or type)
score: Integer
created_at: Timestamp
updated_at: Timestamp
```

**Indexes**
- Composite index on (user_id, resource_id)
  - Enables fast lookup of a user’s score for a specific resource
  - Useful for:
    - Score validation
    - Recovery operations
    - Future features (user-specific leaderboard views)

### 4. Redis Design
**Data Structure**
- Use Redis Sorted Sets to maintain real-time rankings.
- Key format: `leaderboard:{resource_id}`

*Examples:*
  - `leaderboard:global` for overall scores
  - `leaderboard:event123` for event-specific scores

**ZSET Mapping**
|Redis Component|Value|
|:---|:---|
|Member|`user_id` (UUID)|
|Score|User's current score (Integer)|

*Examples:* `ZADD leaderboard:global 1500 user-uuid-1`

**Write operations**
- On score update:
  - Increment score in the database
  - Update Redis ZSET using `ZINCRBY`

*Example:* `ZINCRBY leaderboard:global 10 user-uuid-1`

- On score reset or correction:
  - Update database
  - Use `ZADD` to set the new score in Redis

*Example:* `ZADD leaderboard:global 1200 user-uuid-1`

**Read operations**
- Retrieve top 10 users using `ZRANGE` with `WITHSCORES` option

*Example:* `ZRANGE leaderboard:global 0 9 WITHSCORES`

**Performance Characteristics**
- Time complexity: O(log N + K) where K = 10
- No database joins
- No ranking recalculation
- Suitable for high-traffic read scenarios

### 5 Real-Time Update Mechanism
- The system uses WebSockets to deliver real-time leaderboard updates to connected clients.
- Clients subscribe to leaderboard updates by resource_id.
- A leaderboard update is pushed only when the visible top 10 changes, including:
  - A user entering or leaving the top 10
  - A rank or score change within the top 10
- After each score update, the backend:
  - Reads the current top 10 from Redis
  - Compares it with the previously cached snapshot
  - Broadcasts the updated leaderboard if a change is detected
- Each WebSocket message contains a full snapshot of the top 10 leaderboard for the affected resource_id.
- Real-time delivery is best-effort:
  - Missed messages do not affect score correctness
  - Clients can always recover by calling the leaderboard read API

### 6. Security & Abuse Prevention
#### 6.1. Authentication
- All score update requests must be authenticated.
- Unauthenticated requests must be rejected.

#### 6.2. Authorization
- The backend must ensure that score updates are applied only in response to valid actions.
- The backend must never trust:
  - Client-calculated scores
  - Client-asserted permissions

#### 6.3. Anti-Abuse Measures
The system must include safeguards against malicious behavior, including but not limited to:
- Rate limiting score update requests
- Preventing replayed or duplicated action submissions
- Ensuring idempotency for action-based score updates
- Server-side validation of all action-related requests

### 7. Future Improvements & Considerations
The following items are explicitly out of scope for the initial implementation, but may be considered in future iterations:

#### 7.1. Time-Based Leaderboards
The system may support leaderboards scoped to specific time periods, such as:
- Top 10 users of the current month
- Top 10 users of the current year
- Top 10 users of all time

Considerations:
- Scores may need to be aggregated or reset based on time boundaries.
- Time-based leaderboards may require separate storage or indexing strategies.

#### 7.2. Extended Leaderboard Rankings
The system may support leaderboard rankings beyond the top 10, such as:
  - Top 50 users
  - Top 100 users
  - Paginated leaderboard views

Considerations:
- Pagination strategies for large leaderboards
- Performance impact of deeper ranking queries
- Caching strategies for frequently accessed leaderboard ranges
