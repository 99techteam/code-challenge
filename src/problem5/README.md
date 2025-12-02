# Problem 5 – Task API Backend

A lightweight Express + TypeScript service that exposes CRUD endpoints for managing task items backed by a persisted SQLite database (via `sql.js`). The database file (`data/tasks.sqlite`) lives alongside the source so the API keeps its state across restarts without requiring any native SQLite bindings.

## Features

- Strict TypeScript project (ES2020 target, exact optional property types)
- Express 5 server with JSON body parsing, CORS, request logging (morgan)
- Validation powered by Zod for payloads and query parameters
- SQLite storage handled by `sql.js`, persisted to disk for durability
- RESTful CRUD endpoints with pagination, filtering, and search support

## Project Structure

```
src/problem5/
├─ src/
│  ├─ db.ts          # SQLite wrapper with persistence helpers
│  ├─ routes.ts      # Express router + validation
│  ├─ server.ts      # App bootstrap and middleware wiring
│  └─ types.ts       # Shared Task and query types
├─ data/
│  └─ .keep          # Folder that stores tasks.sqlite at runtime
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Prerequisites

- Node.js 20+ (or 18+ with fetch/CJS compatibility)
- npm 9+

## Setup & Scripts

```bash
cd src/problem5
npm install

# Start the API with auto-reload (ts-node + nodemon)
npm run dev

# Type-check and emit JS to dist/
npm run build

# Compile then run the production build
npm start

# Type-check only
npm run lint
```

The server listens on `PORT` (defaults to `4000`). Override it by exporting `PORT=5000` (PowerShell: `$env:PORT=5000; npm run dev`).

## Database Persistence

`sql.js` runs SQLite inside WebAssembly, so no native binaries are required. After each write operation the in-memory DB is exported to `data/tasks.sqlite`. Delete this file if you want a clean slate.

## API Reference

| Method | Path          | Description |
|--------|---------------|-------------|
| GET    | `/`           | Health check + doc hint |
| GET    | `/api/tasks`  | List tasks (supports `status`, `priority`, `search`, `limit`, `offset`) |
| GET    | `/api/tasks/:id` | Fetch a single task |
| POST   | `/api/tasks`  | Create a task |
| PATCH  | `/api/tasks/:id` | Update partial fields |
| DELETE | `/api/tasks/:id` | Remove a task |

### Task Shape

```json
{
  "id": "cku6...",
  "title": "Write documentation",
  "description": "Add README for problem5",
  "status": "todo",                 // todo | in_progress | done
  "priority": "medium",             // low | medium | high
  "dueDate": "2025-11-30T00:00:00.000Z",
  "createdAt": "2025-11-26T04:12:08.123Z",
  "updatedAt": "2025-11-26T04:12:08.123Z"
}
```

### Sample Requests

Create a task:

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write docs",
    "description": "Finish README",
    "status": "todo",
    "priority": "high",
    "dueDate": "2025-12-01T00:00:00.000Z"
  }'
```

List tasks with filters:

```bash
curl "http://localhost:4000/api/tasks?status=todo&limit=10&offset=0"
```

Update a task:

```bash
curl -X PATCH http://localhost:4000/api/tasks/<taskId> \
  -H "Content-Type: application/json" \
  -d '{ "status": "done" }'
```

Delete a task:

```bash
curl -X DELETE http://localhost:4000/api/tasks/<taskId>
```

### Error Handling

Validation failures return `400` with Zod issue details. Missing or unknown task IDs respond with `404`. All other unhandled issues surface as `500` with a generic message and `detail`.

## Next Steps

- Extend validation/tests (`npm run lint` already type-checks) or wire up automated integration tests.
- Plug the API into a frontend client (Problem 2 UI or a new dashboard) by calling the `/api/tasks` endpoints.
