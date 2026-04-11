# Problem 5: A Crude Server

A RESTful CRUD API built with **ExpressJS**, **TypeScript**, and **SQLite** (via `better-sqlite3`).

## Tech Stack

| Layer      | Choice                                      |
|------------|---------------------------------------------|
| Runtime    | Node.js ≥ 18                                |
| Framework  | Express 4                                   |
| Language   | TypeScript 5                                |
| Database   | SQLite (better-sqlite3) — file `data.db`    |
| Validation | Zod                                         |

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Setup & Run

```bash
# 1. install dependencies
npm install

# 2a. development (auto-restart on file change)
npm run dev

# 2b. production build + start
npm run build
npm start
```

The server starts on **http://localhost:3000** by default.  
Override the port with the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## API Reference

### Health check

```
GET /health
```

### Resources

| Method   | Path              | Description                        |
|----------|-------------------|------------------------------------|
| `POST`   | `/resources`      | Create a resource                  |
| `GET`    | `/resources`      | List resources (with filters)      |
| `GET`    | `/resources/:id`  | Get a single resource              |
| `PATCH`  | `/resources/:id`  | Update a resource (partial update) |
| `DELETE` | `/resources/:id`  | Delete a resource                  |

### Resource schema

```json
{
  "id":          1,
  "name":        "My Resource",
  "description": "An optional description",
  "status":      "active",
  "created_at":  "2024-01-01 12:00:00",
  "updated_at":  "2024-01-01 12:00:00"
}
```

`status` must be one of: `active` | `inactive` | `archived`

### Create a resource

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "Widget A", "description": "A sample widget", "status": "active"}'
```

Response `201`:
```json
{
  "data": {
    "id": 1,
    "name": "Widget A",
    "description": "A sample widget",
    "status": "active",
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
  }
}
```

### List resources

```bash
# all resources
curl http://localhost:3000/resources

# filter by status
curl "http://localhost:3000/resources?status=active"

# filter by name (partial match)
curl "http://localhost:3000/resources?name=widget"

# pagination
curl "http://localhost:3000/resources?page=2&limit=10"
```

Response `200`:
```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### Get a resource

```bash
curl http://localhost:3000/resources/1
```

### Update a resource

```bash
curl -X PATCH http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

### Delete a resource

```bash
curl -X DELETE http://localhost:3000/resources/1
# returns 204 No Content
```

## Project Structure

```
src/
  index.ts            — app entry point, Express setup
  db.ts               — SQLite connection and schema migration
  types.ts            — shared TypeScript interfaces
  schemas.ts          — Zod validation schemas
  resources.router.ts — CRUD route handlers
```
