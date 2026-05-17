# problem5

A small CRUD API for a generic `resource` entity, built with **ExpressJS + TypeScript** on the **Bun** runtime and backed by **SQLite** (via Bun's built-in `bun:sqlite`). Input is validated with **Zod**.

## Resource model

| field         | type                                       | notes                                  |
| ------------- | ------------------------------------------ | -------------------------------------- |
| `id`          | string (UUID)                              | generated server-side                  |
| `name`        | string (1–200)                             | required                               |
| `description` | string (≤ 2000) \| null                    | optional                               |
| `status`      | `"active"` \| `"inactive"` \| `"archived"` | defaults to `"active"` on create       |
| `createdAt`   | ISO-8601 string                            | set on create                          |
| `updatedAt`   | ISO-8601 string                            | refreshed on every successful `PATCH`  |

## Endpoints

| method | path              | description                                  |
| ------ | ----------------- | -------------------------------------------- |
| GET    | `/health`         | liveness probe                               |
| POST   | `/resources`      | create a resource                            |
| GET    | `/resources`      | list resources with filters (see below)      |
| GET    | `/resources/:id`  | get a single resource                        |
| PATCH  | `/resources/:id`  | partially update a resource                  |
| DELETE | `/resources/:id`  | delete a resource                            |

### List filters

`GET /resources` accepts the following query parameters:

- `status` — exact match against `active` / `inactive` / `archived`
- `q` — case-insensitive substring search on `name` and `description`
- `limit` — page size, 1–100 (default `20`)
- `offset` — pagination offset (default `0`)

Response shape:

```json
{ "items": [...], "total": 0, "limit": 20, "offset": 0 }
```

## Configuration

Environment variables (see `.env.example`):

| variable                | default         | description                                       |
| ----------------------- | --------------- | ------------------------------------------------- |
| `PORT`                  | `8000`          | port the HTTP server binds to                     |
| `HOST`                  | `0.0.0.0`       | interface to bind                                 |
| `DB_PATH`               | `./data/app.db` | SQLite file path (created on first boot)          |
| `RATE_LIMIT_WINDOW_MS`  | `900000`        | rate-limit window in milliseconds (15 minutes)    |
| `RATE_LIMIT_MAX`        | `200`           | max requests per IP per window (excluding `/health`) |
| `IDEMPOTENCY_TTL_MS`    | `86400000`      | how long stored `Idempotency-Key` results are replayable (24h) |

## Run with Docker

The simplest path — the SQLite file is persisted to `./data` on the host via a bind mount.

```bash
docker compose -f ./src/problem5/docker-compose.yml up --build
```

The API is then reachable at `http://localhost:8000`.

To stop:

```bash
docker compose -f ./src/problem5/docker-compose.yml down
```

### Plain Docker (without Compose)

```bash
docker build -t problem5 ./src/problem5
docker run --rm -p 8000:8000 -v "$PWD/src/problem5/data:/app/data" problem5
```

## Run locally (without Docker)

Requires [Bun](https://bun.com) ≥ 1.3.

```bash
cd src/problem5
bun install
bun run src/index.ts          # or: bun --watch run src/index.ts
```

Then in another terminal:

```bash
curl -s http://localhost:8000/health
```

## Quick smoke test

```bash
# create
curl -s -X POST http://localhost:8000/resources \
  -H 'content-type: application/json' \
  -d '{"name":"first","description":"hello"}'

# list
curl -s 'http://localhost:8000/resources?status=active&q=fir'

# get / update / delete (replace :id with the value returned above)
curl -s http://localhost:8000/resources/:id
curl -s -X PATCH http://localhost:8000/resources/:id \
  -H 'content-type: application/json' -d '{"status":"archived"}'
curl -s -X DELETE http://localhost:8000/resources/:id -o /dev/null -w '%{http_code}\n'
```

### Idempotency

`POST /resources` honours the `Idempotency-Key` header. Replaying the same key with the same body returns the original response (with an `Idempotent-Replayed: true` header) instead of creating a duplicate row. Replaying with a different body returns `422`. Keys are kept for `IDEMPOTENCY_TTL_MS` (default 24h) and must match `^[A-Za-z0-9_-]{1,255}$`.

```bash
KEY="demo-$(uuidgen)" # Run this first

# 1st call — creates the resource, returns 201
curl -si -X POST http://localhost:8000/resources \
  -H 'content-type: application/json' \
  -H "Idempotency-Key: $KEY" \
  -d '{"name":"keyed","description":"hello"}' | head -n 12

# 2nd call, same key + body — replays the original 201, NO new row
curl -si -X POST http://localhost:8000/resources \
  -H 'content-type: application/json' \
  -H "Idempotency-Key: $KEY" \
  -d '{"name":"keyed","description":"hello"}' | head -n 14
# look for: Idempotent-Replayed: true

# 3rd call, same key + DIFFERENT body — 422 mismatch
curl -si -X POST http://localhost:8000/resources \
  -H 'content-type: application/json' \
  -H "Idempotency-Key: $KEY" \
  -d '{"name":"changed"}' | head -n 6

# confirm only one "keyed" row exists
curl -s 'http://localhost:8000/resources?q=keyed' | grep -o '"id"' | wc -l
```

### Rate limiting

The limiter is in front of `/resources` (the `/health` probe is excluded) and is configured via `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`. The easiest way to exercise it is to start the server with a tiny budget so a single burst trips it:

```bash
# in one terminal — 5 requests / 10s window
RATE_LIMIT_MAX=5 RATE_LIMIT_WINDOW_MS=10000 bun run src/index.ts
```

```bash
# in another terminal — fire 8 requests, expect the first 5 to be 200 and the rest 429
for i in $(seq 1 8); do
  curl -s -o /dev/null -w "req $i -> %{http_code}\n" http://localhost:8000/resources
done

# inspect the rate-limit headers on a single request
curl -si http://localhost:8000/resources | grep -i ratelimit
# RateLimit-Policy: 5;w=10
# RateLimit: limit=5, remaining=4, reset=10

# /health is exempt — keeps returning 200 even after the limit trips
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/health
```

## Tests

Unit tests cover every `/resources` route plus the idempotency middleware (28 cases in `tests/resources.test.ts`). They use [supertest](https://github.com/ladjs/supertest) against an in-process Express app.

### Database isolation

Tests **never** touch the dev/prod SQLite file. `bun test` sets `NODE_ENV=test` automatically; `src/db/index.ts` checks that flag and forces an in-memory database, ignoring any `DB_PATH` from the environment (with a warning). The preload at `tests/setup.ts` also overrides `DB_PATH=:memory:` as a belt-and-suspenders measure.

### Run locally

```bash
cd src/problem5
bun install
bun test
```

### Run in Docker

The test container uses a separate Dockerfile and does not bind-mount the `data/` directory, so the host SQLite file is never touched.

```bash
docker compose -f ./src/problem5/docker-compose.test.yml up --build --abort-on-container-exit
docker compose -f ./src/problem5/docker-compose.test.yml down --rmi local
```

Or without compose:

```bash
docker build -f ./src/problem5/Dockerfile.test -t problem5-test ./src/problem5
docker run --rm problem5-test
```

## Project layout

```
src/problem5
├── Dockerfile                  # runtime image
├── Dockerfile.test             # test image (runs `bun test`)
├── docker-compose.yml          # runtime compose
├── docker-compose.test.yml     # test compose (no host volumes)
├── bunfig.toml                 # bun config (test preload)
├── package.json
├── tsconfig.json
├── data/                       # SQLite file lives here (gitignored, runtime only)
├── src
│   ├── index.ts                # server entrypoint
│   ├── app.ts                  # express app wiring
│   ├── db/index.ts             # bun:sqlite + schema bootstrap (forces :memory: under NODE_ENV=test)
│   ├── middleware/errorHandler.ts
│   ├── middleware/rateLimit.ts
│   ├── middleware/idempotency.ts
│   ├── routes/resources.ts     # REST routes (Controller)
│   ├── schemas/resource.ts     # Zod input schemas
│   └── services/resources.ts   # DB CRUD layer
└── tests
    ├── setup.ts                # preloaded by bun test (in-memory DB, generous limits)
    └── resources.test.ts       # route + idempotency coverage
```

## Error handling

- Zod validation failures return `400` with `{ error, details }`.
- Unknown resources return `404 { error: "Resource not found" }`.
- Unhandled errors return `500 { error: "Internal Server Error" }` and are logged to stderr.

## Request logging

Every request (except `/health`) is logged to stdout via [`morgan`](https://github.com/expressjs/morgan) in this format:

```
[<ISO datetime>] <client IP> <METHOD> <URL> <status> <response time> ms
```

For example:

```
[2026-05-17T06:14:15.538Z] 127.0.0.1 POST /resources 201 30.239 ms
[2026-05-17T06:14:15.556Z] 127.0.0.1 GET /resources?status=active 200 2.150 ms
```

Logging is silenced automatically under `NODE_ENV=test`. If the service runs behind a reverse proxy, set Express's `trust proxy` so `req.ip` is the real client address.

## Graceful shutdown

`src/index.ts` listens for `SIGTERM` and `SIGINT` and:

1. Stops accepting new connections (`server.close()`).
2. Lets in-flight requests finish.
3. Closes the SQLite database handle.
4. Exits 0.

A hard-coded 10-second deadline kicks in if any of those stages hangs — the process force-exits with code 1 so an orchestrator (Docker, Kubernetes, systemd) doesn't end up waiting forever. Shutdown is idempotent: a second signal during draining is ignored.

Sample output:

```
[server] SIGTERM received, draining in-flight requests…
[server] shutdown complete
```

## Future Considerations & Note

**Why Bun.** Bun is chosen as the runtime for its raw performance, its batteries-included standard library (`bun:sqlite`, `Bun.CryptoHasher`, the built-in test runner, native TypeScript execution — no separate `ts-node`/`tsc` build step), and its near-total Node.js compatibility, which keeps the migration path open if the team ever needs to fall back to Node. The same source tree runs unchanged on either runtime with only minor adapter swaps (e.g. `bun:sqlite` → `better-sqlite3`).

**Storage — move to PostgreSQL.** SQLite is a great fit for a single-node demo and keeps the dev loop frictionless, but it doesn't scale past one writer and can't be shared across horizontally-scaled API instances. In production, this service should be backed by **PostgreSQL** — proper concurrent writers, indexes that survive larger row counts, transactional `SELECT … FOR UPDATE` semantics for the idempotency check, and managed offerings (RDS / Cloud SQL / Neon) with backups and PITR out of the box. The data access layer in `src/services/resources.ts` is small and parameterised, so the swap is mostly a driver change.

**Shared in-memory state — move to Redis.** Two pieces of state currently live in the API process and would become inconsistent the moment we run more than one replica:

- The `express-rate-limit` store (per-process counters → users can multiply their quota by the number of replicas).
- The idempotency-key cache (a retry hitting a different replica could create a duplicate).

Both should move behind **Redis** — `rate-limit-redis` for the limiter and a `SET key value NX PX <ttl>` pattern (or a small `EVAL` script) for the idempotency lock and stored response. Redis also gives us first-class TTL handling, so the periodic prune sweep in `src/middleware/idempotency.ts` can go away.

**Security — CORS and Authorization.** The service currently runs without any cross-origin policy or auth layer, which is fine for a local demo but unacceptable for anything user-facing:

- **CORS.** Mount the [`cors`](https://github.com/expressjs/cors) middleware with an explicit allow-list of origins (driven by an env var like `CORS_ORIGINS`), restrict methods to the ones the API actually serves, and only enable `credentials: true` when cookie-based sessions are in play. Avoid the `*` wildcard in production.
- **Authorization.** Put every private `/resources` route behind an auth middleware — JWT bearer tokens (verified with a library like `jose`) or an OAuth2/OIDC introspection call against the org's IdP. Pair that with a coarse RBAC check (e.g. `resource:read` / `resource:write` scopes) and scope the data layer to the authenticated principal so users can only see their own rows. Secrets (`JWT_PUBLIC_KEY`, client IDs) belong in env vars, never in the repo.

Other follow-ups worth flagging: production-grade reliable structured logging with request IDs (e.g. `winston` can determine log severity and have exporters for most database servers), and an OpenAPI spec derived from the Zod schemas.
