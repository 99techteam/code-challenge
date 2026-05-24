# Problem 5 - Resource CRUD Service

Resource CRUD service built with TypeScript, Express, Prisma, and PostgreSQL.

The service follows a controller/service/repository structure and includes:

- Create resource
- List resources with filters and pagination
- Fetch resource detail
- Update resource
- Soft delete by default
- Hard delete as an explicit opt-in
- Batch update
- Batch delete
- Prisma migrations and seed script

## Tech Stack

- Node.js 18+
- Express 4
- TypeScript
- Prisma ORM 5
- PostgreSQL 16
- Docker Compose

## Repository Layout

- `src/server.ts`: application bootstrap, Prisma connect/disconnect, graceful shutdown
- `src/app.ts`: Express app factory, routes, health check, and error middleware
- `src/routes/`: route registration
- `src/controllers/`: HTTP layer and request/response mapping
- `src/services/`: validation and business rules
- `src/repositories/`: Prisma data access and transactions
- `src/dto/`: request/response DTOs
- `src/models/`: domain models
- `src/enums/`: shared enum definitions
- `src/exceptions/`: typed HTTP errors
- `src/prisma.ts`: Prisma client singleton
- `prisma/schema.prisma`: Prisma schema and mappings
- `prisma/migrations/`: database migrations
- `prisma/seed.js`: seed script
- `docker-compose.yml`: local PostgreSQL container

## Configuration

Create your environment file from the template:

```bash
cp .env.example .env
```

Default values:

```bash
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resources_db?schema=public"
```

## Setup and Run

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with database `resources_db`.

### 2. Install Dependencies

```bash
npm install
```

### 3. Apply Prisma Migrations

Generate the Prisma client and apply the local migration history:

```bash
npm run prisma:generate
npx prisma migrate dev
```

For environments where the migrations already exist and should only be applied:

```bash
npx prisma migrate deploy
```

This repository includes migrations for:

- the initial `Resource` table and enum
- soft-delete columns: `is_archived` and `deleted_at`

### 4. Seed the Database

Seed sample data directly with the provided script:

```bash
node prisma/seed.js
```

The seed script inserts a curated sample dataset into the `resources` table.

### 5. Run the API

Development:

```bash
npm run dev
```

Production-like:

```bash
npm run build
npm run start
```

Default URL:

```bash
http://localhost:3000
```

## API Contract

### Health

- `GET /health`

Returns:

```json
{ "ok": true }
```

This endpoint also performs a simple Prisma query to verify the database connection.

### Root

- `GET /`

Returns a lightweight service summary:

```json
{
  "ok": true,
  "service": "resource-service",
  "routes": ["/health", "/resources"]
}
```

### Create Resource

- `POST /resources`

Request body:

```json
{
  "name": "My Resource",
  "description": "Optional description",
  "status": "active"
}
```

Rules:

- `name` is required and trimmed in the service layer
- `status` defaults to `active`
- allowed values are `active` and `inactive`

Response shape:

```json
{
  "id": 1,
  "name": "My Resource",
  "description": "Optional description",
  "status": "active",
  "is_archived": false,
  "deleted_at": null,
  "created_at": "2026-05-21T00:00:00.000Z",
  "updated_at": "2026-05-21T00:00:00.000Z"
}
```

### List Resources

- `GET /resources`

Query params:

- `status=active|inactive`
- `name=<substring search>`
- `limit=<number>` default `20`, capped at `100`
- `offset=<number>` default `0`

Implementation notes:

- archived rows are excluded from the list
- name filtering uses case-insensitive substring matching
- pagination is offset-based

Example:

```bash
curl "http://localhost:3000/resources?status=active&name=my&limit=10&offset=0"
```

Response shape:

```json
{
  "data": [],
  "count": 0
}
```

### Get Resource Detail

- `GET /resources/:id`

Rules:

- `id` must be a positive integer
- archived resources are not returned

### Update Resource

- `PATCH /resources/:id`

Request body can include any of:

```json
{
  "name": "Updated Name",
  "description": "Updated desc",
  "status": "inactive"
}
```

Rules:

- at least one field must be provided
- empty names are rejected
- updates are executed atomically

### Delete Resource

- `DELETE /resources/:id`

Default behavior is soft delete.

Soft delete:

- sets `is_archived` to `true`
- sets `deleted_at` to the current timestamp
- keeps the row in the database for audit/history

Hard delete:

```bash
curl -X DELETE "http://localhost:3000/resources/1?hard=true"
```

Hard delete permanently removes the row.

### Batch Update

- `PATCH /resources/batch`

Request body:

```json
{
  "ids": [1, 2, 3],
  "patch": {
    "status": "inactive"
  }
}
```

Rules:

- `ids` must be a non-empty array of positive integers
- `patch` must contain at least one valid field
- the operation is transactional

Response shape:

```json
{
  "updated": 3,
  "data": []
}
```

### Batch Delete

- `DELETE /resources/batch`

Request body:

```json
{
  "ids": [4, 5, 6]
}
```

Soft delete is the default batch behavior.

Hard batch delete:

```json
{
  "ids": [4, 5, 6],
  "hard": true
}
```

Response shape:

```json
{
  "deleted": 3,
  "ids": [4, 5, 6]
}
```

## Error Handling

The app uses typed HTTP exceptions:

- `400` for validation errors
- `404` when a resource is not found
- `500` for unexpected server errors

In production, unexpected errors return a generic message. In non-production environments, the error details are included in the response for debugging.

## Implementation Notes for Reviewers

- Repository operations use Prisma transactions for atomic updates and batch operations.
- Prisma enum values are mapped into a local domain enum so the service layer stays independent from Prisma types.
- Soft delete is implemented in the repository and exposed through the API as the default delete mode.
- Hard delete is opt-in via `?hard=true` on single delete and `"hard": true` on batch delete.
- The response DTO uses snake_case audit fields: `is_archived`, `deleted_at`, `created_at`, and `updated_at`.
- The health check confirms both the app and database are reachable.

## Example cURL Flow

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Alpha","description":"first","status":"active"}'

curl http://localhost:3000/resources

curl http://localhost:3000/resources/1

curl -X PATCH http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alpha Updated"}'

curl -X DELETE http://localhost:3000/resources/1

curl -X DELETE "http://localhost:3000/resources/1?hard=true"
```

## Stop PostgreSQL

```bash
docker compose down
```
