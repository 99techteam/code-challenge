# Problem 5 — A Crude Server

Express + TypeScript CRUD API backed by a SQLite file. Requires **Node.js 24+** (for the built-in `node:sqlite` module).

## Run

```sh
cd src/problem5
npm install
npm run dev
```

The server listens on http://localhost:3000. Data is persisted to `./data/tasks.sqlite` relative to the current working directory. Set `PORT` and `DATABASE_PATH` in the environment to override them (see `.env.example`; environment variables are read directly, not automatically loaded from a file). The table is created on first start.

```sh
npm test
npm run build
```

For a compiled run, use `node dist/server.js` after building.

## Resource and endpoints

Each task has an integer `id`, `title` (1–120 characters), `description` (up to 2000), `status` (`todo`, `in_progress`, `done`), and ISO timestamps. IDs and timestamps are server-managed.

| Method | Path | Behavior |
| --- | --- | --- |
| POST | `/api/tasks` | Create, returns 201 and `{ data: task }` |
| GET | `/api/tasks` | List newest first; optional `status`, case-insensitive title `q`, `page` (default 1), `limit` (default 20, max 100) |
| GET | `/api/tasks/:id` | Detail or 404 |
| PATCH | `/api/tasks/:id` | Partial update with at least one field |
| DELETE | `/api/tasks/:id` | Delete, returns 204 or 404 |

```sh
curl -X POST http://localhost:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"Write API docs","status":"todo"}'
curl 'http://localhost:3000/api/tasks?status=todo&q=docs&page=1&limit=10'
curl -X PATCH http://localhost:3000/api/tasks/1 -H 'Content-Type: application/json' -d '{"status":"done"}'
```

List responses contain `{ data: [...], pagination: { page, limit, total, totalPages } }`. Invalid input returns 400 with `VALIDATION_ERROR` (and field details) or `INVALID_JSON`; absent tasks return 404 `NOT_FOUND`. SQL parameters protect user-supplied values. Pagination uses offset/limit, adequate for this small sample service; for a large dataset, add indexes and keyset pagination. This challenge did not require authentication, so the server is intended for local demonstration, not public deployment.
