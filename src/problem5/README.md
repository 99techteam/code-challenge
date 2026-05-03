# Problem 5 — A Crude Server

A small but production-flavoured **Express + TypeScript** CRUD service over a
**SQLite** datastore. Built to be cloned, installed, and run in under two
minutes; reviewed as if it were day-1 of a real backend project.

---

## Stack

| Concern     | Choice                 | Why                                                         |
| ----------- | ---------------------- | ----------------------------------------------------------- |
| Runtime     | Node.js ≥ 20 (ESM)     | Modern; native `fetch`, `node:` prefix imports              |
| HTTP        | `express@4`            | Required by the brief                                       |
| Validation  | `zod`                  | Single source of truth → derived TS types + runtime schemas |
| Persistence | `better-sqlite3`       | Zero-install, file-backed, `:memory:` for tests             |
| Logging     | `pino` + `pino-http`   | JSON in prod, pretty in dev, request-scoped child logger    |
| Security    | `helmet`, `cors`       | Sensible defaults out of the box                            |
| IDs         | RFC 4122 UUIDv4        | Opaque, unguessable                                         |
| Tests       | `vitest` + `supertest` | Fast, ESM-first; integration over the real Express stack    |

---

## Quick start

```bash
# from /src/problem5
pnpm install                    # or npm/yarn
cp .env.example .env            # tweak as needed
pnpm dev                        # http://127.0.0.1:3000
```

That's it. The DB file is created on first boot at `./data/resources.db`
(SQLite WAL journaling). Use `DATABASE_PATH=:memory:` for an ephemeral run.

> **better-sqlite3 is a native module.** On the very first install pnpm asks
> you to approve build scripts. Either run `pnpm approve-builds` (interactive)
> or trust the prebuilt binary that ships in the package — both work.

### Other scripts

```bash
pnpm test          # run vitest once (22 tests)
pnpm test:watch    # vitest watch
pnpm typecheck     # tsc --noEmit
pnpm build         # emit ./dist
pnpm start         # node dist/server.js
```

---

## Configuration

All config flows through `src/config.ts` and is **validated at boot** (zod).
Missing or bad values fail fast — there's no scenario where a request lands
in code reading `process.env` directly.

| Var             | Default               | Notes                                          |
| --------------- | --------------------- | ---------------------------------------------- |
| `NODE_ENV`      | `development`         | `development` / `production` / `test`          |
| `PORT`          | `3000`                | listens on `HOST:PORT`                         |
| `HOST`          | `127.0.0.1`           | use `0.0.0.0` in containers                    |
| `DATABASE_PATH` | `./data/resources.db` | path or `:memory:`                             |
| `LOG_LEVEL`     | `info`                | `trace`-`fatal`, or `silent`                   |
| `CORS_ORIGINS`  | `""`                  | comma-separated allowlist; empty disables CORS |

---

## API

All endpoints respond with a uniform envelope so clients have a single shape
to handle:

```json
// success
{ "ok": true, "data": ... }

// error
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### `Resource` shape

```jsonc
{
  "id": "9b6ad1a8-…", // server-generated uuid
  "name": "Compute Cluster A",
  "category": "infrastructure",
  "status": "active", // "active" | "archived" | "draft"
  "createdAt": "2026-05-02T22:30:00.000Z",
  "updatedAt": "2026-05-02T22:30:00.000Z",
}
```

### Endpoints

| #   | Method & Path           | Description                                                                       |
| --- | ----------------------- | --------------------------------------------------------------------------------- |
| 1   | `POST   /resources`     | Create — required: `name`, `category`; optional: `status` (defaults to `active`). |
| 2   | `GET    /resources`     | List with filters & cursor pagination.                                            |
| 3   | `GET    /resources/:id` | Fetch one.                                                                        |
| 4   | `PATCH  /resources/:id` | Partial update. ≥ 1 field required.                                               |
| 5   | `DELETE /resources/:id` | Delete.                                                                           |
|     | `GET    /health`        | Liveness — always 200.                                                            |
|     | `GET    /health/ready`  | Readiness — verifies DB.                                                          |

### List query parameters

| Param      | Type      | Notes                             |
| ---------- | --------- | --------------------------------- |
| `category` | string    | exact match                       |
| `status`   | enum      | `active` / `archived` / `draft`   |
| `q`        | string    | substring match on `name`         |
| `limit`    | int 1-100 | default `20`                      |
| `cursor`   | ISO-8601  | from previous page's `nextCursor` |

Pagination block on every list response:

```json
"pagination": { "limit": 20, "nextCursor": "2026-…Z", "hasMore": true }
```

---

## Curl recipes

```bash
# Create
curl -s -X POST http://127.0.0.1:3000/resources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Compute Cluster A","category":"infrastructure"}'

# List with filter
curl -s 'http://127.0.0.1:3000/resources?category=infrastructure&limit=5'

# Read one
curl -s http://127.0.0.1:3000/resources/<id>

# Patch
curl -s -X PATCH http://127.0.0.1:3000/resources/<id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"archived"}'

# Delete
curl -s -X DELETE -w '%{http_code}\n' http://127.0.0.1:3000/resources/<id>
```

---

## Architecture

```
HTTP request
  │
  ▼
┌──────────────────────────┐
│  middleware (request-id, │  ← cross-cutting concerns
│  pino-http, helmet, cors,│    each in its own file
│  json body parser)       │
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│  routes/resource.routes  │  ← URL ↔ controller
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│  resource.controller     │  ← zod parse → call service
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│  resource.service        │  ← business logic, errors
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│  resource.repo           │  ← parametrised SQL only
└──────────────────────────┘
  │
  ▼
┌──────────────────────────┐
│  better-sqlite3          │
└──────────────────────────┘

errors  ──►  middleware/error-handler  ──►  envelope
```

**Why four layers** instead of fat handlers:

- Service is reusable from a CLI / job / queue consumer.
- Repo is the only file that touches SQL — swappable to Postgres without
  changing routes or controllers.
- Validation lives at the boundary; service & repo trust their inputs.

---

## Cross-cutting concerns

- **Request ID** — accepts inbound `X-Request-Id` (LB friendly), mints UUIDv4
  otherwise. Attached to `req.requestId` and echoed on the response.
- **Structured logs** — every line is JSON in production, pretty in dev. Each
  log carries the `requestId` so traces stitch together. `Authorization`,
  `Cookie`, and any `*.password` / `*.token` fields are redacted at the
  logger layer (rule: data-privacy.md).
- **Validation** — every controller starts with a `zod.parse()` on body / query
  / params. Failure → 422 with field-level details.
- **Errors** — operational errors (`AppError` subclasses) are mapped to the
  intended HTTP status; programmer errors surface as a generic 500 with a
  full server-side stack trace, never leaked to the client.
- **Health checks** — `/health` is liveness (cheap, always 200), `/health/ready`
  validates DB connectivity for k8s readiness probes.
- **Graceful shutdown** — SIGTERM/SIGINT → stop accepting connections, drain
  in-flight (10 s budget), close SQLite handle, exit 0. Matches the
  Kubernetes preStop → terminationGracePeriod model.
- **Helmet + CORS** — sensible HTTP-security headers; CORS allowlist driven
  by `CORS_ORIGINS`. The wildcard `*` is rejected at boot — the service
  sends `credentials: true`, and the spec forbids that pairing.
- **Rate limit** — `express-rate-limit` applies per-IP quotas. Reads get
  300/min; writes get 60/min (writes serialise on the SQLite writer, so
  it's the right axis to clamp). Disabled in `NODE_ENV=test` so the test
  suite can fire 25+ requests in one tick.
- **JSON body limit** — capped at 100 KB to deter slow-loris / DoS.
- **`x-powered-by` disabled** — small but standard hardening.

> ⚠ **No auth layer.** This challenge brief asks for a CRUD service, not
> an authenticated one. The endpoints are intentionally open. In a real
> deployment, drop a JWT or session middleware between `helmet()` and the
> rate-limiter. The error envelope, request-id, and structured logs are
> already shaped to make that addition a one-file change.

---

## Tests

```bash
pnpm test
```

22 integration tests (real Express app, in-memory SQLite) cover:

- happy path for every endpoint
- 422 (zod) on missing / invalid / empty / over-limit fields
- 404 on unknown UUID and non-UUID id
- pagination across multiple pages
- multi-filter `(category, status, q)` queries
- request-id propagation
- health & readiness

---

## What I'd add for production

> Out of scope for this challenge but flagged here so reviewers see the trail.

- **AuthN/AuthZ** — JWT bearer or session cookie + RBAC. Right now the API is
  open; trivially front it with `add-jwt-auth`.
- **Rate limiting** — `express-rate-limit` + Redis on auth + write paths.
- **Migrations tool** — replace inline `CREATE TABLE IF NOT EXISTS` with a
  versioned migration directory (e.g. `umzug`, `sqlx migrate`).
- **OpenAPI / Swagger** — generate from the zod schemas (`zod-to-openapi`).
- **Observability** — Prometheus `/metrics`, OpenTelemetry traces, error rate
  alerting against an SLO.
- **Container** — multi-stage Dockerfile + non-root user, healthcheck baked in.
- **CI** — GitHub Actions running `pnpm test`, `pnpm typecheck`, audit scan.
- **Postgres swap** — replace `better-sqlite3` repository with `pg` /
  `drizzle` — the rest of the stack is unaffected because the repo interface
  is the only seam.
- **Idempotency-Key** for `POST /resources` to make retries safe (especially
  if a future create costs money or sends notifications).

---

## File map

```
src/problem5/
├── src/
│   ├── server.ts                     # process entrypoint + graceful shutdown
│   ├── app.ts                        # express factory (used by server + tests)
│   ├── config.ts                     # zod-validated env loader
│   ├── logger.ts                     # pino + redaction
│   ├── errors.ts                     # AppError hierarchy
│   ├── middleware/
│   │   ├── request-id.ts
│   │   ├── error-handler.ts
│   │   └── not-found.ts
│   ├── db/
│   │   ├── connection.ts             # better-sqlite3 + pragmas
│   │   └── migrate.ts                # idempotent schema bootstrap
│   ├── resources/
│   │   ├── resource.schema.ts        # zod DTOs (single source of truth)
│   │   ├── resource.repo.ts          # SQL only
│   │   ├── resource.service.ts       # business logic
│   │   ├── resource.controller.ts    # HTTP ↔ service
│   │   └── resource.routes.ts        # URL ↔ controller
│   └── types/
│       └── express.d.ts              # Request augmentation (requestId)
├── tests/
│   └── resources.test.ts             # 22 integration tests
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
├── .gitignore
└── README.md
```
