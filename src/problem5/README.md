# Problem 5: Resource CRUD API

A TypeScript REST API built with Express and PGlite, an embedded PostgreSQL build that runs inside Node. No Docker or separate database server is required. Data is persisted to a local directory, and the `resources` table is created automatically on startup.

## Requirements

- Node.js 20 or newer
- npm

## Setup and run

From this directory (`src/problem5`):

```sh
npm install
cp .env.example .env
npm run dev
```

The server listens on `http://localhost:3000`. For a normal run, use `npm start`.

Configuration is loaded from `.env` when the app starts. The file is git-ignored; shell environment variables take precedence over values in `.env`.

Database files are stored in `data/pglite` by default. Delete that directory to reset the database.

`npm run typecheck` checks the TypeScript source.

## Source structure

- `src/server.ts` initializes the database and optional local PostgreSQL-compatible socket, starts HTTP, and handles shutdown.
- `src/app.ts` configures Express middleware and mounts application routes.
- `src/routes/` maps HTTP paths and methods to controller functions.
- `src/controllers/` handles request/response flow and calls the service layer.
- `src/services/` contains resource persistence and database query logic.
- `src/validations/` parses and validates request bodies, route IDs, and list query parameters.
- `src/errors/` defines HTTP-aware errors and central JSON error/not-found handlers.
- `src/types/` contains shared resource, database-row, and API response declarations.
- `src/database.ts` creates the PGlite connection and initializes the schema.

## Automated endpoint tests

Run the API tests with:

```sh
npm test
```

The tests cover the health check and a full resource CRUD flow, including name/category filtering and common validation and not-found responses. They use an in-memory PGlite database, so they do not read or modify the persistent `data/pglite` database.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port |
| `PGLITE_DATA_DIR` | `data/pglite` | Directory for persistent database files |
| `PGLITE_SOCKET_PORT` | unset | Optional local PostgreSQL socket port for GUI clients such as TablePlus |

For a temporary in-memory database, set this in `.env`:

```dotenv
PGLITE_DATA_DIR=memory://
```

Or override it for one run:

```sh
PGLITE_DATA_DIR=memory:// npm run dev
```

The `resources` table and its category index are created with `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` when the server starts.

## Connect with TablePlus

PGlite is embedded, so it does not listen on a network port by default. To inspect the database with TablePlus, enable the local PostgreSQL-compatible socket in `.env`:

```dotenv
PGLITE_SOCKET_PORT=5544
```

Then restart the API with `npm run dev`. The socket is enabled automatically on startup.

Create a PostgreSQL connection in TablePlus:

| Setting | Value |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `5544` |
| User | `postgres` |
| Password | leave blank |
| Database | `postgres` |
| SSL mode | disabled |

Open the `public` schema and the `resources` table.

The socket is bound to `127.0.0.1`, is disabled unless `PGLITE_SOCKET_PORT` is set, and is intended for local development only.

## Resource shape

```json
{
  "id": 1,
  "name": "Example",
  "description": "A sample resource",
  "category": "demo",
  "created_at": "2026-10-30T07:40:36.123Z",
  "updated_at": "2026-10-30T07:40:36.123Z"
}
```

## Endpoints

### Health check

`GET /health` checks that the server is running.

### Create a resource

`POST /api/resources`

Required field: `name`. Optional fields: `description`, `category`.

```json
{
  "name": "Notebook",
  "description": "Meeting notes",
  "category": "office"
}
```

Returns the created resource with status `201`.

### List resources

`GET /api/resources`

Optional query parameters:

- `name`: case-insensitive substring match.
- `category`: exact match.
- `limit`: number of results from 1 to 100 (default `50`).
- `offset`: number of results to skip (default `0`).

For example: `GET /api/resources?category=office&limit=10`.

### Get a resource

`GET /api/resources/:id` returns one resource by its numeric ID.

### Update a resource

`PATCH /api/resources/:id` updates one or more of `name`, `description`, or `category`. Send only the fields to change.

```json
{
  "description": "Project notes"
}
```

### Delete a resource

`DELETE /api/resources/:id` deletes a resource and returns status `204` with an empty response body.

### Errors

Errors return JSON in the form `{ "error": "..." }`. Invalid input or invalid `limit`/`offset` values return `400`; a missing resource or unknown route returns `404`; request bodies larger than 32 kB return `413`.

## Try the endpoints with `data.rest`

The [`data.rest`](./data.rest) file contains ready-to-run requests for the health check and each CRUD endpoint, plus name and category filters. Start the server, open the file in VS Code with the REST Client extension, then select **Send Request** above each request. The sample creates a `Notebook` resource; update `@resourceId = 1` in the file to match the ID returned by the create request if needed.

## Example

```sh
curl -X POST http://localhost:3000/api/resources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Notebook","description":"Meeting notes","category":"office"}'

curl 'http://localhost:3000/api/resources?category=office&limit=10'
curl http://localhost:3000/api/resources/1
curl -X PATCH http://localhost:3000/api/resources/1 \
  -H 'Content-Type: application/json' \
  -d '{"description":"Project notes"}'
curl -X DELETE http://localhost:3000/api/resources/1
```
