# `API_SPECIFICATION.md`

*(Detailed API + contracts + security expectations)*

## Overview

This file defines the exact API behavior for the Scoreboard Service.

The goal is to make the backend implementation deterministic:

* no guessing endpoints
* no ambiguity in auth
* no confusion about hashing or validation rules

---

## Base URL

```
/api/v1
```

---

## Authentication Model

This service does NOT rely on classic session login for score updates.

Instead, each request must be **cryptographically signed**.

### Why

Because score updates are:

* client-triggered
* high abuse risk
* easy to spoof if left open

So we enforce request integrity at the API level.

---

## Signing Strategy (HMAC)

### Signature formula

```
signature = HMAC_SHA256(
  secret_key,
  userId + ":" + actionId + ":" + timestamp
)
```

---

## Headers

Every request must include:

```
X-Signature: <hmac_signature>
X-Timestamp: <unix_epoch_seconds>
Content-Type: application/json
```

Optional but recommended:

```
X-Client-Version: 1.0.0
```

---

## Endpoint: Increment Score

### POST `/scores/increment`

This is the ONLY write endpoint for score changes.

---

### Request Body

```json
{
  "userId": "uuid",
  "actionId": "string-unique-action-id",
  "points": 10
}
```

---

### Validation Rules

Backend must enforce:

* `userId` must exist
* `actionId` must be unique per user
* `points > 0`
* timestamp must be within ±300 seconds
* signature must match HMAC formula

---

### Response

```json
{
  "success": true,
  "newScore": 150,
  "rank": 4
}
```

---

## Endpoint: Get Leaderboard

### GET `/leaderboard/top`

Returns top 10 users.

---

### Response

```json
{
  "top": [
    { "userId": "u1", "score": 200 },
    { "userId": "u2", "score": 180 }
  ],
  "generatedAt": 1710000000
}
```

---

## Internal Behavior (important for reviewers)

When a score update happens:

1. validate request
2. check idempotency (`actionId`)
3. update Postgres
4. update Redis sorted set
5. emit event to pub/sub channel

---

## Failure Modes

| Case              | Behavior |
| ----------------- | -------- |
| invalid signature | 401      |
| expired timestamp | 401      |
| reused actionId   | 409      |
| invalid payload   | 400      |

---

## Notes / Tradeoffs

* Redis is eventually consistent with DB (acceptable for leaderboard UX)
* DB is source of truth
* We prioritize write safety over instant consistency

---
