# `PROJECT_PLAN.md`

*(Timeline + engineering breakdown)*

## Goal

Build a backend service that supports:

* secure score updates
* real-time leaderboard
* scalable read/write separation

---

## Assumptions

* small team (1–3 engineers)
* no existing infra constraints
* we can use Redis + Postgres
* WebSocket or SSE available

---

## Phase 1 — Core Backend (Day 1–2)

### Deliverables

* Express/Node or Go API skeleton
* `/scores/increment` endpoint
* Postgres schema setup
* basic validation layer

### Tasks

* setup project structure
* implement DB models
* implement HMAC verification
* implement idempotency check

---

## Phase 2 — Leaderboard System (Day 2–3)

### Deliverables

* Redis sorted set leaderboard
* `/leaderboard/top` endpoint

### Tasks

* integrate Redis client
* implement ZINCRBY logic
* implement top 10 retrieval
* sync DB → Redis updates

---

## Phase 3 — Real-time Updates (Day 3–4)

### Deliverables

* WebSocket server OR SSE stream
* live leaderboard push

### Tasks

* pub/sub channel setup
* event emitter on score update
* client broadcast logic

---

## Phase 4 — Security Hardening (Day 4–5)

### Deliverables

* abuse protection layer
* logging + audit trail

### Tasks

* rate limiting middleware
* replay protection (timestamp + nonce)
* structured logs for score changes

---

## Phase 5 — Load & Stability (Day 5–6)

### Deliverables

* stress-tested endpoints
* basic monitoring hooks

### Tasks

* simulate high write load
* validate Redis behavior under pressure
* ensure DB remains stable
* add retry queue (optional)

---

## Architecture Milestones

| Stage | Focus                |
| ----- | -------------------- |
| MVP   | score updates + DB   |
| v1    | Redis leaderboard    |
| v2    | real-time updates    |
| v3    | anti-cheat + scaling |

---

## Risks

### 1. Fake score injection

Mitigated via:

* HMAC signing
* timestamp validation

---

### 2. Redis desync

Mitigated via:

* DB as source of truth
* periodic rebuild job (optional)

---

### 3. High write traffic

Mitigated via:

* Redis-first leaderboard
* async event pipeline (future upgrade)

---

## Optional Future Improvements

* Kafka event bus
* multi-region leaderboard
* anomaly detection layer
* per-user score caps

---

## Final Note

If this were production, I’d expect:

* DB is never bypassed
* Redis is rebuildable anytime
* all writes are idempotent
* security is enforced at request boundary, not business logic

---