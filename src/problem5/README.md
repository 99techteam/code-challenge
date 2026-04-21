# Problem 5 — CRUD REST API

A backend REST API built with **ExpressJS**, **TypeORM**, and **SQLite** (via `better-sqlite3`) in TypeScript.

## Requirements

- Node.js >= 16
- Yarn (or npm)

## Setup & Run

```bash
# From the project root
yarn install

# Start the server
yarn problem5:start
```

The server starts on `http://localhost:3000` by default.
Override the port with the `PORT` environment variable:

```bash
PORT=8080 yarn problem5:start
```

The SQLite database file is created automatically at `src/problem5/database.sqlite` on first run.

---

## API Reference

### Resource schema

| Field       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| id          | number | Auto-generated primary key           |
| name        | string | Required. Name of the resource       |
| description | string | Optional description                 |
| status      | string | `active` (default) or `inactive`     |
| createdAt   | date   | Auto-set on creation                 |
| updatedAt   | date   | Auto-updated on change               |

---

### Endpoints

#### Create a resource
```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "My resource", "description": "Some info", "status": "active"}'
```
**Response:** `201 Created`
```json
{ "id": 1, "name": "My resource", "description": "Some info", "status": "active", "createdAt": "...", "updatedAt": "..." }
```

---

#### List resources
```bash
curl "http://localhost:3000/resources?name=my&status=active&page=1&size=10"
```
Query params (all optional):
- `name` — partial-match filter on name
- `status` — exact-match filter on status (`active` or `inactive`)
- `page` — page number (default: 1)
- `size` — items per page, max 100 (default: 10)

**Response:** `200 OK`
```json
{ "data": [...], "total": 42, "page": 1, "limit": 10 }
```

---

#### Get a resource
```bash
curl http://localhost:3000/resources/1
```
**Response:** `200 OK` with the resource object, or `404` if not found.

---

#### Update a resource
```bash
curl -X PUT http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated name", "status": "inactive"}'
```
All fields are optional — only provided fields are updated.
**Response:** `200 OK` with the updated resource, or `404` if not found.

---

#### Delete a resource
```bash
curl -X DELETE http://localhost:3000/resources/1
```
**Response:** `204 No Content`, or `404` if not found.

---

#### Health check
```bash
curl http://localhost:3000/health
```
**Response:** `200 OK`
```json
{ "status": "ok" }
```
