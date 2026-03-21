# Suggested Improvements

## 1. Action Token Issuance Endpoint

The current spec only covers `POST /api/actions/complete` but does not define how action tokens are issued in the first place. A dedicated endpoint is required:

**`POST /api/actions/start`** — called before a user begins an action. Returns a one-time `actionToken` tied to that user and action type.

Without this, there is no secure origin for tokens, and the security model cannot work.

---

## 2. WebSocket Authentication

The current design allows anonymous WebSocket connections (the scoreboard is public). If the scoreboard ever needs to be restricted to authenticated users, add JWT-based auth on connection:

```
ws://server/scoreboard?token=<JWT>
```

The server validates the token on the `connection` event and disconnects unauthorized clients.

---

## 3. Optimistic Top-10 Change Detection

After every score update, querying the full top 10 from DB is wasteful under high traffic. Optimize with:

- Cache the **minimum score** in the current top 10 in Redis.
- After updating a user's score, only query DB and broadcast if:
  - `newScore > cachedMinimumScore` (user may enter top 10), or
  - The updated user was already in the top 10 (their score change affects rankings).
- All other updates can skip the DB query and broadcast entirely.

This significantly reduces DB load and WebSocket noise at scale.

---

## 4. Horizontal Scaling — WebSocket Broadcast

When running multiple API server instances behind a load balancer, a WebSocket event emitted on instance A will not reach clients connected to instance B.

**Solution:** Use Redis Pub/Sub as the broadcast bus:

```
Instance A (processes score update)
    │
    └─▶ Publish to Redis channel: scoreboard:updates
            │
            ├─▶ Instance A receives → forwards to its WS clients
            ├─▶ Instance B receives → forwards to its WS clients
            └─▶ Instance C receives → forwards to its WS clients
```

All instances subscribe to the `scoreboard:updates` channel on startup. The publishing instance is also a subscriber, so it broadcasts to its own clients too.

---

## 5. Score History / Audit Log Endpoint

The `action_completions` table already stores a full audit trail. Expose it via:

```
GET /api/users/:id/score-history
```

This enables transparency, dispute resolution, and anomaly investigation without needing direct DB access.

---

## 6. Soft Anomaly Detection

Rather than blocking suspicious users outright (which can cause false positives), flag patterns for manual review:

- A user completing actions faster than humanly possible (e.g. > 1 per second sustained).
- Score spikes that are statistical outliers compared to the user's historical rate.
- The same IP submitting for multiple user accounts simultaneously.

Flagged accounts can be queued for human review while continuing to operate normally, avoiding disruption to legitimate users.
