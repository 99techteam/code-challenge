# Problem 6 — Flow of Execution

This document illustrates the flow of execution for the Live Scoreboard
module. It complements `README.md` (the full specification) by isolating
the runtime flows so an implementing engineer can keep the diagrams open
on a second screen while writing code.

The diagrams use [Mermaid](https://mermaid.js.org). Render in any
Mermaid-aware viewer (GitHub, GitLab, VS Code preview).

---

## 1. End-to-end: action start → score credited → live update

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web client
  participant LB as Load balancer
  participant API as API service
  participant R as Redis
  participant PG as Postgres
  participant OB as Outbox publisher
  participant WSG as WebSocket gateway
  participant V as Other viewers

  Note over U,W: --- Phase 1 — start the action ---
  U->>W: starts action
  W->>LB: POST /v1/actions/start (Bearer + Idempotency-Key)
  LB->>API: forward
  API->>API: verify session JWT (sig, exp, sub)
  API->>R: GET score:idem:{userId}:{key}
  alt cached response present
    R-->>API: cached body
    API-->>W: 200 (replayed)
  else fresh request
    API->>R: rate-check (sliding window)
    API->>API: mint action token<br/>{sub, act, pts, jti, exp=now+60s, kid}
    API->>R: SETEX score:idem:{userId}:{key} 24h <body>
    API-->>W: 200 { actionToken, expiresAt }
  end

  Note over U,W: --- Phase 2 — complete the action ---
  U->>W: completes action
  W->>LB: POST /v1/scores/complete (Bearer + Idempotency-Key, actionToken)
  LB->>API: forward
  API->>API: verify session JWT + verify action token<br/>(sig, kid, exp, sub == bearer)
  API->>R: SETNX score:redeemed:{jti} (TTL ~ tokenExp + 30s)
  alt jti already redeemed
    R-->>API: 0
    API-->>W: 409 TOKEN_REPLAYED
  else first redemption
    R-->>API: 1
    API->>R: rate-check (sliding window)
    API->>PG: BEGIN
    API->>PG: INSERT INTO actions (id=jti, user_id, action_type, points, idempotency_key)<br/>-- UNIQUE(user_id, idempotency_key) defends double-credit
    API->>PG: UPDATE user_scores<br/>   SET score=score+pts, updated_at=now()<br/>   WHERE user_id=$1<br/>RETURNING score AS new_total
    API->>PG: INSERT INTO scoreboard_outbox (user_id, points, new_total)
    API->>PG: COMMIT
    API->>R: SETEX score:idem:{userId}:{key} 24h <body>
    API-->>W: 200 { newTotal, rank }
  end

  Note over OB,V: --- Phase 3 — broadcast (asynchronous, ≤ 1 s after commit) ---
  loop every 200 ms
    OB->>PG: SELECT seq, user_id, new_total<br/>FROM scoreboard_outbox<br/>WHERE published_at IS NULL<br/>ORDER BY seq LIMIT N
    PG-->>OB: rows
    OB->>R: pipeline:<br/>  ZADD scores:global new_total userId  (idempotent — absolute score)<br/>  INCR scoreboard:version<br/>  PUBLISH pub:scoreboard {userId, new_total, version}
    R-->>WSG: pub:scoreboard delta
    WSG->>WSG: diff prev vs current top-10
    WSG-->>V: WS push { type: "delta", changes: [...] }
    OB->>PG: UPDATE scoreboard_outbox<br/>SET published_at=now()<br/>WHERE seq IN (...)
  end
```

### Crash safety summary

| Crash point                                          | Effect                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Before PG `COMMIT`                                   | Nothing happened. Client retries with the same Idempotency-Key — safe.                     |
| After PG `COMMIT`, before publisher reads            | Outbox row is durable. Publisher picks it up on next tick (≤ 1 s).                         |
| Publisher wrote Redis but didn't flag `published_at` | Re-publish on next tick. `ZADD <new_total>` is idempotent (absolute, not increment). Safe. |

---

## 2. Live channel lifecycle (WebSocket)

```mermaid
sequenceDiagram
  autonumber
  actor U as Viewer
  participant W as Web client
  participant API as API service
  participant WSG as WebSocket gateway
  participant R as Redis
  participant PS as Redis Pub/Sub

  U->>W: opens scoreboard page
  W->>API: POST /v1/scoreboard/ws-ticket (Bearer)
  API->>API: mint single-use ticket JWT (TTL 30s)
  API-->>W: 200 { ticket }

  W->>WSG: WS upgrade /v1/scoreboard/live?ticket=...
  WSG->>WSG: verify ticket, mark consumed
  WSG-->>W: 101 Switching Protocols

  W->>WSG: { "type": "subscribe", "since": <version?> }
  WSG->>R: ZRANGE scores:global REV LIMIT 0 10 + GET scoreboard:version
  WSG-->>W: { "type": "snapshot", version, top10 }

  WSG->>PS: SUBSCRIBE pub:scoreboard

  loop while connected
    PS-->>WSG: delta {userId, new_total, version}
    WSG->>WSG: project to top-10 diff (enter / leave / reorder)
    alt affects top-10
      WSG-->>W: { "type": "delta", version, changes: [...] }
    else no top-10 change
      WSG->>WSG: drop (client doesn't need re-render)
    end
  end

  loop every 30s
    WSG-->>W: { "type": "ping", ts }
    W-->>WSG: pong
  end

  alt missed pong > 60s
    WSG-xW: close 1011
    W->>WSG: reconnect with last seen `version`
  end
```

---

## 3. Component interaction (deployment view)

```mermaid
flowchart TB
  subgraph "Client tier"
    Web[Web app<br/>React/Vue/Vanilla]
  end

  subgraph "Edge / Ingress"
    LB[L7 LB / TLS termination]
    CDN[CDN<br/>cacheable GETs only]
  end

  subgraph "API tier (stateless, HPA on RPS)"
    API1[API pod 1]
    API2[API pod 2]
    APIn[API pod N]
  end

  subgraph "Realtime tier (stateless, sticky on userId)"
    WS1[WS gateway 1]
    WS2[WS gateway 2]
  end

  subgraph "Async workers"
    OB[Outbox publisher<br/>leader-elected]
    Recon[Reconciler<br/>cold-start / drift repair]
  end

  subgraph "Stateful tier"
    R[(Redis primary + replica<br/>scores:global ZSET<br/>idem / replay / rate keys)]
    PG[(Postgres primary + replicas<br/>users, actions,<br/>user_scores, scoreboard_outbox)]
  end

  subgraph "Observability"
    Prom[Prometheus]
    OTel[OpenTelemetry collector]
    Logs[Log pipeline]
  end

  Web -->|HTTPS| LB
  Web -.->|WSS| LB
  LB --> API1 & API2 & APIn
  LB --> WS1 & WS2
  CDN -.-> Web

  API1 & API2 & APIn --> R
  API1 & API2 & APIn --> PG

  OB --> PG
  OB --> R
  Recon --> PG
  Recon --> R

  WS1 & WS2 -->|SUBSCRIBE pub:scoreboard| R
  WS1 & WS2 --> R

  API1 & API2 & APIn -.->|metrics, traces, logs| Prom & OTel & Logs
  WS1 & WS2 -.-> Prom & OTel & Logs
  OB -.-> Prom & OTel & Logs
```

---

## 4. Authentication & anti-cheat decision flow

```mermaid
flowchart TD
  Start([POST /v1/scores/complete]) --> A{Bearer JWT<br/>valid?}
  A -- no --> R401([401 UNAUTHENTICATED])
  A -- yes --> B{Idempotency-Key<br/>cached?}
  B -- yes --> Replay([200 IDEMPOTENT_REPLAY<br/>return cached body])
  B -- no --> C{Action token<br/>signature + kid valid?}
  C -- no --> R401b([401 TOKEN_INVALID])
  C -- yes --> D{Token<br/>not expired?}
  D -- no --> R401c([401 TOKEN_EXPIRED])
  D -- yes --> E{token.sub == bearer.sub?}
  E -- no --> R401d([401 TOKEN_INVALID])
  E -- yes --> F{SETNX<br/>score:redeemed:jti}
  F -- 0 already set --> R409([409 TOKEN_REPLAYED])
  F -- 1 fresh --> G{Sliding-window<br/>rate limit ok?}
  G -- no --> R429([429 RATE_LIMITED])
  G -- yes --> H[PG transaction:<br/>INSERT actions<br/>UPDATE user_scores RETURNING<br/>INSERT scoreboard_outbox]
  H --> I[Cache idempotency response 24h]
  I --> Ok([200 OK<br/>newTotal, rank])

  classDef err fill:#f99,stroke:#900;
  classDef ok fill:#9f9,stroke:#090;
  class R401,R401b,R401c,R401d,R409,R429 err
  class Ok,Replay ok
```

---

## 5. Outbox publisher state machine

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Polling: tick (every 200ms)
  Polling --> Idle: no rows
  Polling --> Publishing: rows fetched
  Publishing --> Marking: Redis pipeline succeeded
  Publishing --> Backoff: Redis error
  Marking --> Idle: published_at set
  Marking --> Backoff: PG error
  Backoff --> Polling: exponential backoff (1s → 30s cap)
  Backoff --> Alerting: backlog > 1000 rows OR lag > 5s
  Alerting --> Polling: keep trying; humans paged
```

Key invariants:

- The publisher is **leader-elected** (e.g. via Postgres advisory lock or
  Kubernetes Lease). Exactly one publisher writes Redis at a time so
  `INCR scoreboard:version` produces a strict monotonic sequence.
- Re-publishing a row before `published_at` is set is **always safe** —
  the Redis side uses absolute `ZADD`, not `ZINCRBY`.
- The publisher never blocks the API write path. API latency is decoupled
  from Redis health.
