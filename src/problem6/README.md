# Problem 6: Live Scoreboard Module Specification

## Purpose

This document specifies a backend module that:

- stores and updates user scores
- exposes the top 10 leaderboard
- pushes live leaderboard updates to connected clients
- prevents unauthorized or replayed score increases.

The intended audience is the backend engineering team that will implement the
module inside the API service.

## Scope

### In scope

- API contract for score updates and leaderboard reads
- realtime update flow
- authorization and anti-abuse controls
- persistence model

## Requirements Mapping

| Product requirement               | Module responsibility                                                 |
| --------------------------------- | --------------------------------------------------------------------- |
| Show top 10 scores                | Provide `GET /v1/scoreboard`                                          |
| Live updates                      | Push leaderboard changes over SSE                                     |
| Action completion increases score | Accept score-award requests from a trusted workflow                   |
| API call updates score            | Provide `POST /v1/score-events`                                       |
| Prevent cheating score increases  | Require auth, validate action proof, avoid cheating api, audit events |

## Design Summary

The client is never allowed to submit a score directly. The client only
submits proof that a server-recognized action was completed. The API service
validates the caller, validates that the action belongs to that caller and is
eligible for scoring, writes a single immutable score event, updates the user's
total score in a transaction, recomputes the top 10 leaderboard, and publishes a
realtime update to subscribers.

Deduplication happens at two different levels:

- retry safety via `Idempotency-Key`,
- business-level exactly-once scoring via unique `actionCompletionId`.

For the first implementation:

- use HTTP + JSON for command and query APIs
- use Server-Sent Events for one-way live updates
- use a relational database as the source of truth
- use Redis Pub/Sub only when the API runs on multiple instances.

## Architecture

### Module boundary

The module owns:

- score-award request handling
- score event deduplication
- user score mutation
- leaderboard query
- realtime leaderboard publication.

The module depends on:

- authentication middleware
- a trusted action validation source
- the primary SQL database
- an optional cross-instance pub/sub layer.

### Components

#### 1. Score Event API

Receives score-award requests from authenticated users or trusted internal
callers, validates request shape, and delegates to the application service.

#### 2. Score Application Service

Core orchestration layer. It:

- verifies the action proof
- resolves the reward amount from server-side rules
- enforces idempotency
- writes the score event
- updates the aggregate user score
- fetches the latest top 10
- emits a leaderboard-updated event.

#### 3. Action Validation Gateway

Reads from the trusted action system and answers:

- did this action completion exist
- does it belong to this user
- is it eligible for score award
- has it already been consumed for scoring.

This can be implemented by reading an internal table, calling another internal
service, or validating a server-signed completion token.

#### 4. Leaderboard Query Service

Reads the current top 10 ranking from persisted score totals.

#### 5. Realtime Publisher

Pushes `scoreboard.updated` events to connected clients through SSE. In a
multi-instance deployment, each API node subscribes to a shared pub/sub topic
and fans out the same event to its own clients.

## Execution Flow

Mermaid source: [scoreboard-flow-flow.png](../problem6/scoreboard-flow.png)

## API Contract

### 1. Submit score event

```http
POST /v1/score-events
Authorization: Bearer <token>
Idempotency-Key: <uuid>
Content-Type: application/json
```

Request body:

```json
{
  "actionCompletionId": "act_01JXYZ..."
}
```

Rules:

- caller must be authenticated
- `Idempotency-Key` is required and is an opaque client-generated retry token
- `actionCompletionId` must reference a trusted completed action
- the action must belong to the authenticated user
- the action must not have been scored before
- the server resolves the score delta; the client never sends it.

Successful response:

```http
201 Created
```

```json
{
  "eventId": "evt_01JXYZ...",
  "user": {
    "id": "usr_123",
    "score": 1250
  },
  "scoreAdded": 10,
  "scoreboard": [
    {
      "rank": 1,
      "userId": "usr_123",
      "displayName": "Alice",
      "score": 1250
    }
  ],
  "processedAt": "2026-04-17T00:00:00.000Z"
}
```

Idempotency behavior:

- `Idempotency-Key` is not a payload hash; it identifies one logical mutation
  attempt so safe retries return the same result
- server should persist a canonical `request_hash` alongside the
  `Idempotency-Key` to detect the same key being reused with a different payload
- same `Idempotency-Key` + same payload for the same user must return the
  original success response
- same `Idempotency-Key` + different payload must return `409`
- separate idempotency keys for the same `actionCompletionId` must still be
  blocked by a database uniqueness rule.

Example:

- first request: `Idempotency-Key = k1`, `actionCompletionId = act_123` ->
  score awarded
- retry request with `k1` and the same payload -> return the original success
  response, do not award score again
- request with `k1` but a different `actionCompletionId` -> return `409`
- request with a new key `k2` but the same `actionCompletionId = act_123` ->
  reject because that business action has already been consumed.

### 2. Get leaderboard

```http
GET /v1/scoreboard?limit=10
```

Successful response:

```json
{
  "items": [
    {
      "rank": 1,
      "userId": "usr_123",
      "displayName": "Alice",
      "score": 1250
    }
  ],
  "updatedAt": "2026-04-17T00:00:00.000Z"
}
```

Rules:

- default `limit` is `10`,
- maximum supported `limit` is `100`,
- website scoreboard should always request `10`.

### 3. Subscribe to live leaderboard

```http
GET /v1/scoreboard/stream
Accept: text/event-stream
Authorization: Bearer <token>
```

SSE event:

```text
event: scoreboard.updated
data: {"items":[{"rank":1,"userId":"usr_123","displayName":"Alice","score":1250}],"updatedAt":"2026-04-17T00:00:00.000Z"}
```

Realtime rules:

- send current leaderboard immediately after subscribe,
- push only after a committed score update,
- clients should reconnect automatically,
- if an event is missed, client recovers by refetching `GET /v1/scoreboard`.

## Data Model

### `users`

| Column         | Type          | Notes                               |
| -------------- | ------------- | ----------------------------------- |
| `id`           | uuid / string | primary key                         |
| `display_name` | varchar       | leaderboard-safe public name        |
| `score`        | bigint        | current total score                 |
| `created_at`   | timestamp     | record creation time                |
| `updated_at`   | timestamp     | last score change or profile change |

Indexes:

- primary key on `id`
- leaderboard index on `(score DESC, updated_at ASC, id ASC)`

### `score_events`

Immutable audit log of every accepted score increase.

| Column                 | Type          | Notes                                             |
| ---------------------- | ------------- | ------------------------------------------------- |
| `id`                   | uuid / string | primary key                                       |
| `user_id`              | uuid / string | target user                                       |
| `action_completion_id` | string        | trusted action reference                          |
| `idempotency_key`      | string        | client-generated retry token                      |
| `score_delta`          | integer       | awarded score                                     |
| `request_hash`         | string        | server-computed hash of canonical request payload |
| `created_at`           | timestamp     | insertion time                                    |

Constraints:

- unique `(user_id, action_completion_id)`
- unique `(user_id, idempotency_key)`
- `score_delta > 0`

Notes:

- `idempotency_key` protects against duplicate processing caused by retries,
- `action_completion_id` protects the business rule that one completed action
  can award score only once,
- `request_hash` is optional but strongly recommended to detect misuse of the
  same `idempotency_key` for different payloads.

### `action_rewards`

| Column        | Type      | Notes                   |
| ------------- | --------- | ----------------------- |
| `action_type` | string    | reward rule key         |
| `score_delta` | integer   | points awarded          |
| `is_active`   | boolean   | operational kill switch |
| `updated_at`  | timestamp | config change time      |

## Transaction and Consistency Rules

The score mutation path must be transactionally safe.

Required sequence:

1. validate auth outside the transaction,
2. resolve action validity and reward amount,
3. begin database transaction
4. insert into `score_events`
5. update `users.score`
6. read the top 10 leaderboard
7. commit
8. publish realtime event after commit.

Hard requirements:

- no score change without a persisted `score_events` row
- duplicate action processing must fail even under concurrent requests
- leaderboard responses must reflect only committed score updates
- publish failure must not roll back the committed score update.

## Security Requirements

### Trust model

The client is untrusted. The server must treat all score-related user input as
claims to be verified, never as facts.

### Required controls

- require authenticated access for score updates
- get `userId` from auth context only
- validate action completion against a trusted source
- enforce one-time consumption of each action completion
- require idempotency keys on mutating requests
- rate limit by user ID and by IP address

## Additional Comments and Improvements

- Should leaderboard reads be public or require authentication?
- If users have the same score in the leaderboard, how do we do?
- In the future, the leaderboard maybe more than 10.
