# REST API Specification

Base URL: `https://<host>/api`

---

## POST /actions/complete

Called by the client when a user completes an action. Updates the user's score and triggers a live scoreboard broadcast if the top 10 changes.

### Headers

| Key | Value |
|---|---|
| `Authorization` | `Bearer <JWT access token>` |
| `Content-Type` | `application/json` |

### Request Body

```json
{
  "actionToken": "a1b2c3d4-one-time-token-issued-per-action"
}
```

> `actionToken` is a one-time token pre-issued by the server when the action began. It proves the action was server-initiated and prevents clients from fabricating score updates. The score delta is determined server-side from the action definition — the client never sends a score value.

### Success Response — `200 OK`

```json
{
  "userId": "uuid",
  "newScore": 1250,
  "scoreDelta": 10
}
```

### Error Responses

| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | JWT user does not match action token owner |
| `409 Conflict` | Action token already used (replay attack detected) |
| `422 Unprocessable Entity` | Invalid or expired action token |
| `429 Too Many Requests` | Rate limit exceeded |

---

## GET /scoreboard

Returns the current top 10 scores. Used for the **initial page load** — subsequent updates are delivered via WebSocket.

### Response — `200 OK`

```json
{
  "scoreboard": [
    { "rank": 1, "userId": "uuid", "username": "alice", "score": 5000 },
    { "rank": 2, "userId": "uuid", "username": "bob",   "score": 4800 }
  ],
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

> Response is served from the Redis cache. Falls back to a direct DB query if the cache is cold.
