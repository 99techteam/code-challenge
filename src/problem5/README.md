# Express CRUD API (TypeScript)

Backend service built with **Express** and **TypeScript**. Resources are stored in **SQLite** via `better-sqlite3`.

## Prerequisites

- **Node.js** 18+ (recommended: current LTS)
- npm (comes with Node.js)

On Windows, native addons such as `better-sqlite3` may require [build tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if prebuilt binaries are not available for your Node version.

## Configuration

1. Copy the example environment file and adjust if needed:

   ```bash
   copy .env.example .env
   ```

   On Unix-like shells:

   ```bash
   cp .env.example .env
   ```

2. Environment variables:

   | Variable        | Description                                    | Default         |
   | --------------- | ---------------------------------------------- | --------------- |
   | `PORT`          | HTTP port                                      | `3000`          |
   | `DATABASE_PATH` | Path to the SQLite file (relative or absolute) | `./data/app.db` |

   The `data` directory is created automatically when the server starts.

## Install and run

```bash
cd problem5
npm install
```

**Development** (auto-reload on file changes):

```bash
npm run dev
```

**Production build**:

```bash
npm run build
npm start
```

The server listens on `http://localhost:<PORT>` (default `3000`). A health check is available at `GET /health`.

## API: resources CRUD

Base path: `/api/resources`

| Method   | Path                 | Description                    |
| -------- | -------------------- | ------------------------------ |
| `POST`   | `/api/resources`     | Create a resource              |
| `GET`    | `/api/resources`     | List resources (filters below) |
| `GET`    | `/api/resources/:id` | Get one resource by id         |
| `PUT`    | `/api/resources/:id` | Update a resource (partial)    |
| `DELETE` | `/api/resources/:id` | Delete a resource              |

### List filters (query string)

| Query    | Description                                                 |
| -------- | ----------------------------------------------------------- |
| `status` | `draft`, `active`, or `archived`                            |
| `q`      | Case-sensitive substring match on `title` and `description` |
| `limit`  | Page size (default `50`, max `200`)                         |
| `offset` | Offset for pagination (default `0`)                         |

Example: `GET /api/resources?status=active&q=report&limit=10&offset=0`

### Resource JSON shape

```json
{
  "id": 1,
  "title": "Example",
  "description": "Optional text",
  "status": "draft",
  "createdAt": "2026-05-02T12:00:00",
  "updatedAt": "2026-05-02T12:00:00"
}
```

### Create (`POST /api/resources`)

Body:

```json
{
  "title": "Required title",
  "description": "Optional",
  "status": "draft"
}
```

`status` is optional (defaults to `draft`). `description` may be omitted, a string, or `null`.

### Update (`PUT /api/resources/:id`)

Send any subset of `title`, `description`, `status`. At least one field is required.

### Delete (`DELETE /api/resources/:id`)

Returns `204 No Content` on success.

## Example (curl)

```bash
# Create
curl -s -X POST http://localhost:3000/api/resources ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"My item\",\"status\":\"active\"}"

# List with filter
curl -s "http://localhost:3000/api/resources?status=active"

# Get by id
curl -s http://localhost:3000/api/resources/1

# Update
curl -s -X PUT http://localhost:3000/api/resources/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Updated\"}"

# Delete
curl -s -X DELETE http://localhost:3000/api/resources/1
```

On macOS/Linux, use `\` instead of `^` for line continuation, or single-line commands.

## Project layout

- `src/index.ts` — entry, HTTP server, graceful shutdown
- `src/app.ts` — Express app and routes
- `src/db.ts` — SQLite connection and schema
- `src/repository.ts` — data access
- `src/routes/resources.ts` — REST handlers and validation
- `src/types.ts` — shared types

The SQLite database file is gitignored; only schema is applied at startup.
