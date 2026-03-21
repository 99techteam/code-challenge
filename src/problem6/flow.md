# Flow of Execution

## 1. Score Update Flow

Triggered when a user completes an action and the client calls `POST /api/actions/complete`.

```
Client                        API Server                    DB / Cache
  │                               │                              │
  │  POST /api/actions/complete   │                              │
  │  { actionToken: "abc123" }    │                              │
  │  Authorization: Bearer <JWT>  │                              │
  ├──────────────────────────────▶│                              │
  │                               │                              │
  │                               │ 1. Verify JWT                │
  │                               │    extract userId            │
  │                               │                              │
  │                               │ 2. Validate actionToken      │
  │                               │    check not used            │
  │                               │    check belongs to userId   │
  │                               ├────────────────────────────▶ │
  │                               │    SELECT action_completions │
  │                               │◀──────────────────────────── │
  │                               │                              │
  │                               │ 3. BEGIN TRANSACTION         │
  │                               │    Mark token as used        │
  │                               │    UPDATE scores             │
  │                               │    INSERT action_completions │
  │                               │    COMMIT                    │
  │                               ├────────────────────────────▶ │
  │                               │◀──────────────────────────── │
  │                               │                              │
  │                               │ 4. Fetch new top 10          │
  │                               ├────────────────────────────▶ │
  │                               │◀────── top 10 result ─────── │
  │                               │                              │
  │                               │ 5. Update Redis cache        │
  │                               ├────────────────────────────▶ │
  │                               │                              │
  │                               │ 6. If top 10 changed:        │
  │                               │    emit scoreboard:update    │
  │                               │    via WebSocket             │
  │                               │──────── broadcast ──────────▶ All WS clients
  │                               │                              │
  │  200 OK { newScore: 1250 }    │                              │
  │◀──────────────────────────────│                              │
```

---

## 2. Client Initial Load Flow

When a user first opens the scoreboard page.

```
Client                        API Server                    Redis
  │                               │                              │
  │ 1. GET /api/scoreboard        │                              │
  ├──────────────────────────────▶│                              │
  │                               │ Check Redis cache            │
  │                               ├────────────────────────────▶ │
  │                               │◀────── top 10 (cache hit) ── │
  │  200 OK { scoreboard: [...] } │                              │
  │◀──────────────────────────────│                              │
  │                               │                              │
  │ 2. Connect WebSocket          │                              │
  │    ws://server/scoreboard     │                              │
  ├──────────────────────────────▶│                              │
  │  (stays open for live updates)│                              │
```

---

## 3. Error Flow — Invalid Token

```
Client                        API Server
  │                               │
  │  POST /api/actions/complete   │
  │  { actionToken: "used-token"} │
  ├──────────────────────────────▶│
  │                               │ Token found but already used
  │  409 Conflict                 │
  │  { "error": "Action token     │
  │    already used" }            │
  │◀──────────────────────────────│
```
