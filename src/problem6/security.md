# Security Design

## 1. Authentication (JWT)

Every score update request must carry a valid JWT in the `Authorization: Bearer` header.

The server verifies:
- Signature is valid (using the server's secret key)
- Token has not expired (`exp` claim)
- User extracted from the token exists and is active

Requests without a valid token receive `401 Unauthorized` immediately, before any business logic runs.

---

## 2. Action Token — Replay Attack Prevention

This is the core mechanism preventing users from inflating scores fraudulently.

### How it works

1. When a user **starts** an action, the server issues a **one-time `actionToken`** (UUID) stored in the DB with status `pending`.
2. The client submits this token when the action is completed.
3. The server verifies:
   - Token exists in the DB and is `pending` (not already used or expired)
   - Token belongs to the authenticated user (cannot use someone else's token)
   - Token has not passed its TTL (e.g. 5-minute expiry)
4. The token is marked `used` **atomically** inside the same DB transaction as the score update — making double-spend impossible.

### What this prevents

| Attack | Why it fails |
|---|---|
| Client sends a fake token | Token must pre-exist in DB — cannot be fabricated |
| Client replays a completed token | Token is single-use, marked `used` atomically |
| Client steals another user's token | JWT `userId` must match token's `user_id` |
| Client sends arbitrary score value | Score delta is looked up server-side per action — never client-provided |

---

## 3. Rate Limiting

Applied per-user on `POST /api/actions/complete`:

- **Limit:** 10 requests per minute per user
- **Response on breach:** `429 Too Many Requests` with `Retry-After` header

This prevents automated scripts from flooding the endpoint even if they somehow obtain valid tokens.

---

## 4. Threat Model Summary

| Threat | Mitigation |
|---|---|
| Unauthenticated score update | JWT required on every request |
| User updates another user's score | JWT `userId` must match `actionToken` owner |
| Replay the same action twice | One-time token, marked `used` in same DB transaction |
| Client sends arbitrary score value | Score delta is server-defined per action |
| Brute-force / spam | Per-user rate limiting |
| Token interception | HTTPS enforced + short token TTL |
