# Live Leaderboard API — Implementation improvements & notes

This file collects **additional comments for improvement**: optional enhancements, trade-offs, and testing guidance. It is **not** part of the normative software requirements. For requirements, flows, and diagrams, see [README.md](./README.md).

Nothing here replaces the hard security requirements in [README §6 — Security and authorisation](./README.md#6-security-and-authorisation).

---

## Security and integrity

- Prefer **deriving `user_id` from the auth token** instead of trusting request body fields.
- If the action is validated elsewhere, treat this API as a **reward sink**: only accept **signed, short-lived, one-use** proofs of completion.
- Add **audit logging** (who gained points, when, source IP, correlation id) for dispute handling and fraud investigation.

## Performance and scale

- Use a **sorted set** (e.g. Redis) for O(log N) rank updates if write volume is high; snapshot top 10 to a durable store periodically if needed.
- **Debounce** or **coalesce** live broadcasts if many updates arrive in the same second to reduce client churn.

## Live transport

- **SSE** is simpler for read-only push; **WebSocket** if bidirectional ping/pong or future features are needed.
- Consider **segmented channels** (e.g. per tournament or namespace) if the product grows beyond a single global board.

## API design

- Expose **ETag** or `Last-Modified` on **GET /leaderboard** for HTTP caching where appropriate.
- Document **versioning** (`/v1/...`) early to avoid breaking mobile or third-party clients later.

## Fairness and abuse

- Server-side **ceilings** on points per action type once action types are modelled.
- Optional **manual moderation** hooks (freeze user, rollback score) for support and operations.

## Testing guidance

- Contract tests for **auth failure**, **cross-user tampering**, **replay**, and **idempotent retry**.
- Load tests on **live fan-out** (many viewers, frequent updates).

## Operational extras (optional)

- **Alerting** on spikes in `401`/`403` or score-update rate (possible abuse or misconfiguration).
- **Feature flags** to disable increments or switch to read-only mode during incidents.
