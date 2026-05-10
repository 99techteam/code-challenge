# Problem 4 — Express CRUD API (TypeScript)

REST API for **items** with create, list (filters + pagination), read, update, and delete. Data persists in **SQLite** using `better-sqlite3`.

## Stack

| Piece | Role |
| ----- | ---- |
| [Express](https://expressjs.com/) | HTTP server |
| TypeScript (`tsx` dev, `tsc` prod) | Typed source |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | SQLite driver |
| [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) | `/docs` OpenAPI UI |
| [cors](https://github.com/expressjs/cors) | Cross-origin requests |

## Requirements

- Node.js 20+ (LTS recommended)
- npm

`better-sqlite3` ships prebuilt binaries for common platforms; if install fails, use a supported Node version or follow the driver’s [install notes](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

## Configuration

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | HTTP listen port | `3000` |
| `DATABASE_PATH` | SQLite file path | `data/app.db` resolved from the app’s `src` or `dist` folder (sibling `data/` next to compiled `db.js`) |

If `DATABASE_PATH` is set, its parent directory is created when the app starts. Relative paths are resolved from the **current working directory** of the process.

## Install and run

```bash
cd src/problem4
npm install
```

**Development** (watch + `tsx`):

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm start
```

The process logs: `Server listening on http://localhost:<PORT>`.

## API documentation

- **Swagger UI:** `GET /docs` — interactive explorer and “Try it out” for all routes.
- **OpenAPI document:** defined in `src/openapi.ts` (same contract the UI renders).

Use the same host and port as the API (for example `http://localhost:3000/docs` when `PORT` is unset).

## Base URL

`http://localhost:<PORT>` (replace `<PORT>` with `PORT` or `3000`).

## Endpoints

### `GET /health`

Liveness: `{ "status": "ok" }`.

### Items — `/api/items`

| Method | Path | Success | Notes |
| ------ | ---- | ------- | ----- |
| `POST` | `/api/items` | `201` + item JSON | Body: `name` (required), `description`, `category` (default `general`) |
| `GET` | `/api/items` | `200` + array | Query: `category`, `search`, `limit` (default 50, max 200), `offset` |
| `GET` | `/api/items/:id` | `200` + item | `404` if missing |
| `PATCH` | `/api/items/:id` | `200` + item | Partial body; at least one of `name`, `description`, `category`. `400` / `404` as appropriate |
| `DELETE` | `/api/items/:id` | `204` empty body | `404` if missing |

**Item JSON shape:** `id`, `name`, `description`, `category`, `createdAt`, `updatedAt` (ISO 8601 strings).

**Errors:** `{ "error": "..." }` with `400`, `404`, or generic `404` on unknown routes.

### curl examples

Replace `3000` with your `PORT` if needed. Replace `<id>` with a real UUID from a create response.

```bash
# Create
curl -s -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alpha\",\"description\":\"First item\",\"category\":\"demo\"}"

# List with filters
curl -s "http://localhost:3000/api/items?category=demo&search=Alpha&limit=10&offset=0"

# Get by id
curl -s http://localhost:3000/api/items/<id>

# Update
curl -s -X PATCH http://localhost:3000/api/items/<id> \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Updated text\"}"

# Delete (show HTTP status)
curl -s -o NUL -w "%{http_code}" -X DELETE http://localhost:3000/api/items/<id>
```

On macOS/Linux, use `-o /dev/null` instead of `-o NUL` for the delete example.

## Project layout

| Path | Purpose |
| ---- | ------- |
| `src/index.ts` | Bootstraps server, `PORT` |
| `src/app.ts` | Express app: CORS, JSON, `/health`, `/docs`, `/api/items`, 404 |
| `src/openapi.ts` | OpenAPI 3 document for Swagger UI |
| `src/db.ts` | SQLite file, schema, WAL |
| `src/repositories/itemsRepository.ts` | CRUD + list filters |
| `src/routes/items.ts` | Item route handlers |
| `src/types/item.ts` | Row ↔ API field mapping |

Build output goes to `dist/` (gitignored at repo root and under this package).

## npm scripts

| Script | Command |
| ------ | ------- |
| `dev` | `tsx watch src/index.ts` |
| `build` | `tsc` |
| `start` | `node dist/index.js` (run after `build`) |
