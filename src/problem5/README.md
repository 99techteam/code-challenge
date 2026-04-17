# Problem 5: Resource Management API

A RESTful API for managing resources built with Express, TypeORM, and PostgreSQL.

This solution satisfies the CRUD requirement and intentionally highlights database skills by adding a concurrency-safe increment endpoint implemented with a transaction and PostgreSQL row locking.

## Overview

This backend provides:

- resource creation
- resource listing with basic filters
- resource detail lookup
- resource updates
- resource deletion
- a concurrency-safe quantity increment operation

The implementation uses:

- **Framework**: Express
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Runtime DB Setup**: Docker Compose
- **Concurrency Control**: PostgreSQL `SELECT ... FOR UPDATE` via TypeORM `pessimistic_write`

## Why This Design

The original problem only requires CRUD plus persistence. I intentionally used PostgreSQL instead of SQLite to demonstrate stronger backend engineering around:

- transaction boundaries
- row-level locking
- lost-update prevention
- real integration testing against a real database

The extra endpoint `POST /resources/:id/increment` is the clearest way to show that skill in a coding test.

## Project Structure

```text
problem5/
  ├─ .env.example
  ├─ docker-compose.yml
  ├─ docker/
  │  └─ init/
  │     └─ 01-create-test-db.sql
  ├─ src/
  │  ├─ app.ts
  │  ├─ server.ts
  │  ├─ config/
  │  ├─ controllers/
  │  ├─ db/
  │  ├─ entities/
  │  ├─ middleware/
  │  ├─ repositories/
  │  ├─ routes/
  │  ├─ services/
  │  ├─ types/
  │  ├─ utils/
  │  └─ validators/
  └─ tests/
     └─ integration/
```

## Resource Model

Each resource has:

- `id`: auto-generated primary key
- `code`: required business identifier, unique per resource
- `name`: required string
- `description`: optional string, nullable
- `quantity`: integer field used for CRUD and concurrency-safe increments
- `createdAt`: timestamp
- `updatedAt`: timestamp

Example persisted row:

```json
{
  "id": 1,
  "code": "SKU-001",
  "name": "Warehouse Item",
  "description": "Primary stock item",
  "quantity": 10,
  "createdAt": "2026-04-17T03:17:11.245Z",
  "updatedAt": "2026-04-17T03:17:11.245Z"
}
```

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop or a working Docker daemon

## Setup

### 1. Install dependencies

From the repository root:

```bash
cd my-challenge
npm install
```

### 2. Start PostgreSQL in Docker

From the Problem 5 directory:

```bash
cd my-challenge/src/problem5
docker compose up -d
```

What this does:

- starts PostgreSQL in a container
- exposes it on `127.0.0.1:5433`
- creates the main DB `my_challenge`
- creates the test DB `my_challenge_test`

Check container status:

```bash
docker compose ps
```

Expected healthy output shape:

```text
NAME                             IMAGE                STATUS                    PORTS
my-challenge-problem5-postgres   postgres:16-alpine   Up (healthy)              0.0.0.0:5433->5432/tcp
```

### 3. Configure environment

You can rely on the built-in defaults, or create a local `.env`.

Example:

```bash
PORT=3000
DATABASE_URL=postgres://app:app@127.0.0.1:5433/my_challenge
TEST_DATABASE_URL=postgres://app:app@127.0.0.1:5433/my_challenge_test
```

There is also a ready-made example file:

```bash
cd my-challenge
cp src/problem5/.env.example .env
```

## Running the Application

From the repository root:

```bash
cd my-challenge
npm run dev:problem5
```

Expected startup output:

```text
Problem 5 server listening on http://localhost:3000
```

## API Base URL

All examples below use:

```text
http://localhost:3000
```

Resource routes live under:

```text
http://localhost:3000/resources
```

## API Endpoints

### 1. Create a Resource

- **Method**: `POST`
- **URL**: `http://localhost:3000/resources`

#### Example Request

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SKU-001",
    "name": "Warehouse Item",
    "description": "Primary stock item",
    "quantity": 10
  }'
```

#### Example Response `201 Created`

```json
{
  "id": 1,
  "code": "SKU-001",
  "name": "Warehouse Item",
  "description": "Primary stock item",
  "quantity": 10,
  "createdAt": "2026-04-17T03:17:11.245Z",
  "updatedAt": "2026-04-17T03:17:11.245Z"
}
```

#### Example Validation Error `400 Bad Request`

```json
{
  "error": "Field 'code' is required"
}
```

#### Example Duplicate Code Error `409 Conflict`

```json
{
  "error": "Resource code already exists"
}
```

### 2. List Resources

- **Method**: `GET`
- **URL**: `http://localhost:3000/resources`

#### Example Request: list all

```bash
curl http://localhost:3000/resources
```

#### Example Response `200 OK`

```json
[
  {
    "id": 1,
    "code": "SKU-001",
    "name": "Warehouse Item",
    "description": "Primary stock item",
    "quantity": 10,
    "createdAt": "2026-04-17T03:17:11.245Z",
    "updatedAt": "2026-04-17T03:17:11.245Z"
  },
  {
    "id": 2,
    "code": "SKU-002",
    "name": "Overflow Item",
    "description": "Stored in secondary area",
    "quantity": 3,
    "createdAt": "2026-04-17T03:17:32.001Z",
    "updatedAt": "2026-04-17T03:17:32.001Z"
  }
]
```

#### Example Request: filter by name

```bash
curl "http://localhost:3000/resources?name=Warehouse"
```

#### Example Request: filter by minimum quantity

```bash
curl "http://localhost:3000/resources?minQuantity=5"
```

#### Example Request: combined filters

```bash
curl "http://localhost:3000/resources?name=Item&minQuantity=5"
```

#### Example Validation Error `400 Bad Request`

```json
{
  "error": "Query parameter 'minQuantity' must be an integer"
}
```

### 3. Get Resource Details

- **Method**: `GET`
- **URL**: `http://localhost:3000/resources/:id`

#### Example Request

```bash
curl http://localhost:3000/resources/1
```

#### Example Response `200 OK`

```json
{
  "id": 1,
  "code": "SKU-001",
  "name": "Warehouse Item",
  "description": "Primary stock item",
  "quantity": 10,
  "createdAt": "2026-04-17T03:17:11.245Z",
  "updatedAt": "2026-04-17T03:17:11.245Z"
}
```

#### Example Not Found `404 Not Found`

```json
{
  "error": "Resource not found"
}
```

### 4. Update a Resource

- **Method**: `PUT`
- **URL**: `http://localhost:3000/resources/:id`

Partial update is supported. You can update any combination of:

- `code`
- `name`
- `description`
- `quantity`

#### Example Request

```bash
curl -X PUT http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SKU-001-A",
    "name": "Warehouse Item - Updated",
    "description": "Updated stock label",
    "quantity": 25
  }'
```

#### Example Response `200 OK`

```json
{
  "id": 1,
  "code": "SKU-001-A",
  "name": "Warehouse Item - Updated",
  "description": "Updated stock label",
  "quantity": 25,
  "createdAt": "2026-04-17T03:17:11.245Z",
  "updatedAt": "2026-04-17T03:20:42.552Z"
}
```

#### Example Validation Error `400 Bad Request`

```json
{
  "error": "At least one updatable field is required"
}
```

#### Example Duplicate Code Error `409 Conflict`

```json
{
  "error": "Resource code already exists"
}
```

### 5. Increment Resource Quantity Safely

- **Method**: `POST`
- **URL**: `http://localhost:3000/resources/:id/increment`

This endpoint exists to demonstrate database correctness under concurrency.

Internally, the service:

1. opens a transaction
2. reads the target row with a pessimistic write lock
3. calculates the new quantity while holding the lock
4. writes the updated quantity
5. commits the transaction

In PostgreSQL, that maps to `SELECT ... FOR UPDATE`.

#### Example Request

```bash
curl -X POST http://localhost:3000/resources/1/increment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5
  }'
```

#### Example Response `200 OK`

```json
{
  "id": 1,
  "code": "SKU-001-A",
  "name": "Warehouse Item - Updated",
  "description": "Updated stock label",
  "quantity": 30,
  "createdAt": "2026-04-17T03:17:11.245Z",
  "updatedAt": "2026-04-17T03:21:03.044Z"
}
```

#### Example Validation Error `400 Bad Request`

```json
{
  "error": "Field 'amount' must be a non-zero integer"
}
```

#### Why this matters

If 20 parallel requests increment the same row by `5`, the final value should be:

```text
initial_quantity + (20 * 5)
```

The integration test proves this behavior using a real PostgreSQL database.

### 6. Delete a Resource

- **Method**: `DELETE`
- **URL**: `http://localhost:3000/resources/:id`

#### Example Request

```bash
curl -X DELETE http://localhost:3000/resources/1
```

#### Example Response `200 OK`

```json
{
  "message": "Resource deleted successfully"
}
```

#### Example Not Found `404 Not Found`

```json
{
  "error": "Resource not found"
}
```

## End-to-End Example Flow

### Create

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DEMO-001",
    "name": "Demo Item",
    "description": "Created during README walkthrough",
    "quantity": 12
  }'
```

### List

```bash
curl http://localhost:3000/resources
```

### Get by ID

```bash
curl http://localhost:3000/resources/1
```

### Update

```bash
curl -X PUT http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 20
  }'
```

### Increment with lock

```bash
curl -X POST http://localhost:3000/resources/1/increment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 7
  }'
```

### Delete

```bash
curl -X DELETE http://localhost:3000/resources/1
```

## Integration Testing

The integration test suite uses:

- a real PostgreSQL database
- real HTTP requests against the Express app
- setup hooks
- cleanup hooks
- a concurrency test for the row-locking path

Run from the repository root:

```bash
cd my-challenge
npm run test:problem5
```

### What the tests cover

1. create and retrieve a resource
2. run many parallel increment requests against the same row
3. verify that the final quantity is exact and no update is lost

## Troubleshooting

### API cannot connect to PostgreSQL

Check the Docker container:

```bash
cd my-challenge/src/problem5
docker compose ps
```

### Port 3000 is already in use

Set a different `PORT` in `.env`:

```bash
PORT=3001
```

### Port 5433 is already in use

Change the host-side port mapping in `docker-compose.yml` and update `DATABASE_URL` / `TEST_DATABASE_URL`.

### Node modules missing

From the repository root:

```bash
npm install
```

## Notes

- `synchronize: true` is enabled for speed in a coding exercise.
- In production, I would replace that with migrations.
- The Docker database setup makes the project reproducible on another machine.
- The increment endpoint is beyond the minimum CRUD requirement, but it is included deliberately to showcase transaction handling and lost-update prevention in a senior backend interview.
