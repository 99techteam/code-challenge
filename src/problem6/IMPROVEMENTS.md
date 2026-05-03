# Problem 6 — Improvements & Comments for the Implementing Team

This file expands on the "improvements" section of `README.md` with
suggestions, open questions, and review-time comments. None of these are
blockers — the spec in `README.md` is implementable as-is. They are
prioritised so the implementing team can tackle the highest-value items
first.

---

## A. Tighten the security model

### A.1 Switch action tokens from HS256 to RS256/EdDSA when verifiers diverge

**Current.** Tokens signed `HS256` with a shared HMAC secret.

**Why change.** The moment a verifier other than the issuer (e.g. a separate analytics service or a downstream microservice that wants to
cross-check) needs to validate tokens, every additional verifier holds
the _signing_ secret. A leak in any one of them lets an attacker forge
tokens.

**Suggestion.** Move to `EdDSA` (preferred) or `RS256`. Verifiers hold
only the public key. JWKS endpoint at `/.well-known/jwks.json` for
rotation. Keep `kid` so multiple keys can be live during rotation.

**Effort.** ~1 day including key rotation runbook.

---

### A.2 Per-action signing key via HKDF

**Current.** Single HMAC key signs every action token regardless of
`act` claim.

**Why change.** A leak of the signing key compromises _all_ actions. For
high-value actions (e.g. championship-final completions worth 10× normal
points) you want blast-radius isolation.

**Suggestion.**

```
key_for(action_type) = HKDF(master_key,
                            salt = "scoreboard-v1",
                            info = action_type)
```

Issuer derives the key on the fly per action; verifier does the same.
Master key never leaves the issuer.

**Effort.** Half a day. No data-model change.

---

### A.3 Bound `pts` at the database layer

**Current.** `actions.points CHECK (points > 0)`.

**Why change.** If the signing key is ever compromised, an attacker can
mint tokens with arbitrarily large `pts`. A DB-level cap turns a key
compromise from "leaderboard owned" into "leaderboard inflated by at
most MAX_PTS per action".

**Suggestion.**

```sql
ALTER TABLE actions
  ADD CONSTRAINT actions_points_sane
  CHECK (points > 0 AND points <= 10000);
```

Set the constant generously (10× highest legitimate action) so it never
fires in practice. It's defence in depth, not throttling.

**Effort.** A migration. 30 minutes.

---

### A.4 Anomaly-detection feedback loop into the rate limiter

**Current.** Rate limiter is static (e.g. 30/min). Anomaly detection (§7.5
of `README.md`) shadow-bans outliers separately.

**Why change.** Static limits are tuned for honest users. Bots probe just
under the limit. A dynamic limit that _tightens_ for users with
suspicious cadence catches probing attacks earlier.

**Suggestion.** Anomaly detector emits a `risk_score ∈ [0, 1]` per user;
the rate limiter divides its quota by `1 + 9·risk_score`. A user at
risk 1.0 gets 1/10 the normal quota — enough to tell them apart from
the noise without locking them out hard.

**Effort.** 1 sprint (model + plumbing).

---

## B. Sharpen the consistency model

### B.1 Move from leader-elected outbox publisher to per-shard publishers

**Current.** Single leader-elected publisher drains the outbox.

**Why change.** Single publisher is a bottleneck at ≥ 5 000 updates/sec
sustained. Failover takes seconds during which lag grows.

**Suggestion.** Shard `scoreboard_outbox` by `hash(user_id) % N`. Run N
publishers, each owning one shard. A shard publisher lock is held per
shard, not per service. `INCR scoreboard:version` becomes a sharded
counter (`scoreboard:version:{shard}`); WS gateway concatenates per
delta.

**Trade-off.** More moving parts. Only worth it if the load
projections in §1.2 are firm.

**Effort.** 1–2 sprints.

---

### B.2 Replace the `scoreboard:version` counter with vector-style versioning

**Current.** Single monotonic counter.

**Why change.** Couples deltas to a single writer. Doesn't survive a
multi-region active/active topology cleanly.

**Suggestion.** Use `(region, lsn)` pairs and let the WS gateway present
each region's stream independently to the client. The client merges by
`(region, lsn)`. Painful to add later — easier if you start with it.

**Effort.** ~1 sprint, mostly client code.

---

### B.3 Materialise the top-10 separately from the full ZSET

**Current.** WS gateway computes top-10 on every delta from
`ZRANGE scores:global REV LIMIT 0 10`.

**Why change.** At scale, this hits Redis on every score change
regardless of whether top-10 actually moved.

**Suggestion.** Maintain a parallel `scores:top10` list that the publisher
updates only when the rank-displacement check fires. WS gateway reads
that list directly. Trade-off: extra Redis write on top-10 transitions
in exchange for skipping a `ZRANGE` on every delta.

**Effort.** Half a day.

---

## C. Operational hygiene

### C.1 Action-token TTL is not configurable per action

**Current.** All action tokens expire 60 s after issuance.

**Why change.** A puzzle that takes 5 minutes to complete needs longer
than 60 s. A click-to-redeem reward needs much less.

**Suggestion.** Make `exp` a function of `action_type`, controlled by a
config table. Default 60 s; the action-issuance handler looks up
`action_types.token_ttl_seconds` at mint time. Document a cap (e.g.
≤ 15 min) so operators can't accidentally weaken the replay window.

**Effort.** Half a day plus DB migration.

---

### C.2 Idempotency-Key cache eviction policy

**Current.** TTL 24 h on `score:idem:*`.

**Why change.** Memory grows linearly with traffic. At 5 000 RPS × 86 400
s × ~200 B/key ≈ 90 GB if every request is unique. We need an explicit
maxmemory policy.

**Suggestion.**

- Set Redis `maxmemory-policy allkeys-lru` for the idempotency
  namespace (use a dedicated logical DB or instance to avoid evicting
  hotter ZSET data).
- Document that "idempotency window" is "≥ 1 h, best-effort up to 24 h" —
  not a hard contract.

**Effort.** Configuration only.

---

### C.3 `ZADD scores:global new_total userId` requires a strict invariant

**Comment.** The outbox publisher must read `new_total` from the outbox
row, NOT recompute by adding to the existing ZSET score. Violating this
breaks idempotency under retry. Spell it out in the implementation
guide; add a unit test that asserts a duplicate publish leaves the ZSET
unchanged.

**Effort.** Test only — no code change.

---

### C.4 Reconciler should be passive, not periodic

**Current.** Reconciler ticks every 60 s comparing PG `user_scores` to
the Redis ZSET.

**Why change.** A 60 s tick wastes CPU when nothing has drifted, and
catches drift slowly when something has.

**Suggestion.** Make the reconciler **alarm-driven**: it runs when
`outbox_lag_seconds > 5` or after a Redis failover event. Otherwise it
sleeps. Keep a daily scheduled run as a fallback for slow drift.

**Effort.** Half a day.

---

## D. Developer & operator experience

### D.1 Provide a "verify scoreboard integrity" CLI

A small command that:

```
score-tool verify --since 1h
```

Recomputes the expected ZSET from `actions` for users whose scores
changed in the last hour, diffs against the live ZSET, and reports any
drift. Useful in incidents.

**Effort.** Half a day.

---

### D.2 Public OpenAPI spec for `/v1/actions/start`, `/v1/scores/complete`, `/v1/scoreboard`

Generate from the same zod / pydantic schemas the service uses. Lets
client teams generate typed SDKs without coordination.

**Effort.** 1 day; pays itself back the first time a frontend dev wires
up a new SDK.

---

### D.3 Game-day playbook entries

Add runbook entries for the four most likely failure modes:

1. Outbox publisher down → backlog grows. RTO 5 min.
2. Redis primary lost → failover; during failover writes queue, reads
   degrade.
3. Action-token signing key compromise → rotate `kid`, invalidate all
   live tokens older than now, force re-issuance.
4. WS gateway saturated → autoscale + temporarily fall back to
   long-polling at `/v1/scoreboard?since=…`.

**Effort.** 1 day to write; tested on a quarterly game day.

---

## E. Open questions to decide before implementation

These are intentionally left for the team and product owner:

1. **Score reset / seasons.** Does the scoreboard ever reset? If yes, do
   we archive `actions` per season or keep them all and filter by
   `redeemed_at`?
2. **Scoreboard scope.** Global only, or do we want regional / friend /
   team boards as a v1.1?
3. **Display name source.** Cached in Redis (§5.2) — what is the cache
   invalidation when a user changes their name? Today the spec is silent.
4. **Negative score adjustments.** Cheaters caught after the fact — do
   we credit a negative `actions` row, or "soft-delete" the offending
   actions and rebuild the ZSET? The spec assumes only positive `pts`.
5. **Tie-breaking in the ZSET.** Two users at score 9850 — alphabetical
   by `userId`? Earliest-to-reach? Document and pin.
6. **Privacy.** Do we expose `userId` to other clients in the WS deltas,
   or only an opaque rank-display id? Affects the `delta` event shape.

---

## F. Comments on the existing spec (`README.md`)

Notes for reviewers / future maintainers reading `README.md`:

- **§4.1 `expiresAt` example timestamp.** Hard-coded to a 2026 date. When
  copying the spec into the implementation, ensure code uses
  `Date.now() + ttl`, not a literal.
- **§5.2 `score:idem` is per-user but `score:redeemed` is per-jti.** Keep
  these distinct: the former is for client retries (the same logical
  request), the latter is for token redemption (one-time use of a
  signed permission). Conflating them would break either replay defence
  or idempotency depending on which side wins.
- **§6 sequence diagram.** Reviewers consistently miss step 6 — the
  `INSERT INTO scoreboard_outbox` _inside_ the same PG transaction. If
  that line is ever pulled out into a separate transaction, the entire
  consistency story collapses. Add a code-review checklist item.
- **§8.4 alerts.** `Replay attempts spike > 100 / 5 min` is intentionally
  low — a healthy system should never replay. If you see noise, look for
  a buggy client retrying without honoring the `409 TOKEN_REPLAYED`
  response, not a bot.

---

## G. Quick wins (≤ 1 day each, do these first)

| #   | Item                                                         | Section |
| --- | ------------------------------------------------------------ | ------- |
| 1   | Bound `pts` at DB level (`CHECK <= MAX_PTS`)                 | A.3     |
| 2   | Per-action signing key via HKDF                              | A.2     |
| 3   | Materialise top-10 separately from full ZSET                 | B.3     |
| 4   | Configurable per-action token TTL                            | C.1     |
| 5   | OpenAPI spec generation                                      | D.2     |
| 6   | Add code-review checklist for "outbox INSERT inside same tx" | F       |

Tackling all six closes the gap between "spec on paper" and "production
service" for an experienced backend engineer in roughly one week.
