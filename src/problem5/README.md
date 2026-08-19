# Problem 5 — A Crude Server

CRUD REST API for a `Resource` entity, built with Express + TypeScript,
persisted to a JSON file on disk via [lowdb](https://github.com/typicode/lowdb)
(v1, synchronous file adapter — no native build step, just a real file that
survives restarts).

## Resource shape

```json
{
  "id": "uuid",
  "name": "string (required)",
  "description": "string",
  "category": "string",
  "price": "number >= 0",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Configuration

Environment variables (optional, both have defaults):

| Variable  | Default                | Description                          |
|-----------|-------------------------|--------------------------------------|
| `PORT`    | `3000`                  | HTTP port the server listens on      |
| `DB_FILE` | `<project root>/data.json` | Path to the JSON persistence file |

## Running

```bash
npm install
npm run dev     # ts-node-dev, auto-restarts on file change
```

or build and run compiled JS:

```bash
npm run build
npm start
```

`data.json` is created automatically on first run and gitignored.

## API

| Method | Path             | Description                                      |
|--------|------------------|---------------------------------------------------|
| POST   | `/resources`     | Create a resource                                  |
| GET    | `/resources`     | List resources, with optional filters (below)      |
| GET    | `/resources/:id` | Get one resource                                   |
| PUT    | `/resources/:id` | Update a resource (partial)                        |
| DELETE | `/resources/:id` | Delete a resource                                  |
| GET    | `/health`        | Health check                                       |

### List filters (query params, all optional, combinable)

- `category` — exact match, case-insensitive
- `search` — substring match against `name` or `description`, case-insensitive
- `minPrice`, `maxPrice` — numeric bounds on `price`

### Examples

```bash
curl -X POST localhost:3000/resources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget","category":"hardware","price":9.99}'

curl 'localhost:3000/resources?category=hardware&minPrice=5'

curl localhost:3000/resources/<id>

curl -X PUT localhost:3000/resources/<id> \
  -H 'Content-Type: application/json' \
  -d '{"price":12.5}'

curl -X DELETE localhost:3000/resources/<id>
```

`name` is required on create and, if provided, must be a non-empty string on
update; `price` must be a non-negative number when given. Invalid input
returns `400` with an `{ "error": "..." }` body; a missing resource returns
`404`.
