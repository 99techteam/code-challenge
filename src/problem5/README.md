# Resource CRUD API

REST API built with Express, TypeScript, TypeORM, and PostgreSQL.

## Stack

- **Runtime**: Node.js 22
- **Framework**: Express 5
- **ORM**: TypeORM 0.3
- **Database**: PostgreSQL 16
- **Language**: TypeScript 5

## Project Structure

```
src/
├── controllers/     # Route handlers, input validation
├── services/        # Business logic
├── repositories/    # Database queries
├── entities/        # TypeORM entities
├── dtos/            # Request/response data transfer objects
├── routes/          # Express routers
├── database/        # DataSource configuration and migrations
├── utils/           # Snowflake ID generator, response helpers
└── swagger.ts       # OpenAPI 3.0 spec
```

---

## Setup

### Prerequisites

- Node.js 22+
- PostgreSQL 16+ (or Docker)

### Install dependencies

```sh
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
```

### Run locally

```sh
npm run build
npm run migration:run
npm start
```

Or in watch mode during development:

```sh
npm run dev
```

---

## Docker

### Run with Docker Compose

```sh
docker compose up --build
```

This starts two services:

| Service    | Port   |
|------------|--------|
| `api`      | `3000` |
| `postgres` | `5432` |

The API waits for PostgreSQL to pass its healthcheck before starting.

### Stop

```sh
docker compose down
```

To also remove the database volume:

```sh
docker compose down -v
```

---

## API Documentation (Swagger)

Interactive API docs are available via Swagger UI once the server is running.

```
http://localhost:3000/docs
```

You can explore all endpoints, view request/response schemas, and execute requests directly from the browser.

---

## API Endpoints

Base URL: `http://localhost:3000`

### Create a resource

```
POST /resources
```

**Body**

```json
{
  "name": "my-resource",
  "status": "active"
}
```

`status` is optional, defaults to `active`.

**Response** `201`

```json
{
  "id": "7318309505701888001",
  "name": "my-resource",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### List resources

```
GET /resources?page=1&limit=20&status=active
```

**Query parameters**

| Param    | Type     | Default  | Description                      |
|----------|----------|----------|----------------------------------|
| `page`   | integer  | `1`      | Page number                      |
| `limit`  | integer  | `20`     | Items per page (max `100`)       |
| `status` | `active` \| `inactive` | —  | Filter by status    |

**Response** `200`

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### Get a resource

```
GET /resources/:id
```

**Response** `200`

```json
{
  "id": "7318309505701888001",
  "name": "my-resource",
  "status": "active",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

### Update a resource

```
PATCH /resources/:id
```

**Body** (all fields optional)

```json
{
  "name": "updated-name",
  "status": "inactive"
}
```

**Response** `200` — updated resource object.

---

### Delete a resource

```
DELETE /resources/:id
```

**Response** `204 No Content`

---

## Error Responses

| Status | Description                        |
|--------|------------------------------------|
| `400`  | Validation error                   |
| `404`  | Resource not found                 |
| `500`  | Internal server error              |

```json
{
  "message": "Resource with id 123 not found"
}
```
