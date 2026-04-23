# Problem 5: Resource Management API

This project exposes resource management functionalities through a CRUD REST API, built with Express.js, TypeORM, and SQLite.

Stack:

- `express`
- `typeorm`
- `sqlite3`
- `cors`
- `dotenv`
- `reflect-metadata`
- `typescript`
- `ts-node`

Main features:

- Create resource
- List resources
- Get resource by id
- Update resource
- Delete resource
- Filter by `isFinish`
- Search by `name` or `description`

## Project Structure

```text
src/
  app.ts                         # Express app and middleware
  server.ts                      # Server bootstrap
  controllers/
    resourceController.ts        # Request handlers
  db/
    dbConfig.ts                  # TypeORM DataSource config
  entities/
    ResourceEntity.ts            # TypeORM entity
  errors/
    httpError.ts                 # Custom HTTP error
  middleware/
    errorHandler.ts              # Global error handler
  repositories/
    resourceRepository.ts        # DB access layer
  routes/
    resourceRoutes.ts            # Route definitions
  types/
    resource.ts                  # Shared resource types
  validators/
    resourceSchemas.ts           # Request validation helpers

test/
  e2e/
    resource.e2e.test.ts         # End-to-end tests
```

## Prerequisites

- Node.js `>= 22.5.0`
- npm

## Installation

1. Go to the project:

```bash
cd src/problem5
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env`:

```bash
echo "PORT=3000" > .env
```

## Configuration

Current runtime behavior:

- Server port is read from `.env`
- Default port is `3000`
- Main database file is `challengeDb.sqlite`
- E2E test database file is `challengeDbTest.sqlite`
- TypeORM runs with `synchronize: true`
- JSON parsing uses `express.json()`
- CORS is enabled

## Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Expected startup log:

```text
Server listening on port 3000
```

## API Endpoints

Base URL:

```text
http://localhost:3000/resources
```

### Response Format

Success:

```json
{
    "data": {}
}
```

Error:

```json
{
    "error": "message"
}
```

### 1. Create Resource

- Method: `POST`
- URL: `/resources`

Body:

```json
{
    "name": "Write docs",
    "description": "Prepare README for the project",
    "isFinish": false
}
```

Response: `201 Created`

```json
{
    "data": {
        "id": 1,
        "name": "Write docs",
        "description": "Prepare README for the project",
        "isFinish": false,
        "createdAt": "2026-04-21T10:00:00.000Z",
        "updatedAt": "2026-04-21T10:00:00.000Z"
    }
}
```

### 2. List Resources

- Method: `GET`
- URL: `/resources`

Optional query params:

- `isFinish=true|false`
- `search=<keyword>`

Example:

```text
/resources?isFinish=false&search=docs
```

Response: `200 OK`

```json
{
    "data": [
        {
            "id": 1,
            "name": "Write docs",
            "description": "Prepare README for the project",
            "isFinish": false,
            "createdAt": "2026-04-21T10:00:00.000Z",
            "updatedAt": "2026-04-21T10:00:00.000Z"
        }
    ]
}
```

### 3. Get Resource By Id

- Method: `GET`
- URL: `/resources/:id`

Response: `200 OK`

```json
{
    "data": {
        "id": 1,
        "name": "Write docs",
        "description": "Prepare README for the project",
        "isFinish": false,
        "createdAt": "2026-04-21T10:00:00.000Z",
        "updatedAt": "2026-04-21T10:00:00.000Z"
    }
}
```

Not found:

```json
{
    "error": "Resource not found"
}
```

### 4. Update Resource

- Method: `PUT`
- URL: `/resources/:id`

Body:

```json
{
    "description": "Prepare README and API examples",
    "isFinish": true
}
```

Response: `200 OK`

```json
{
    "data": {
        "id": 1,
        "name": "Write docs",
        "description": "Prepare README and API examples",
        "isFinish": true,
        "createdAt": "2026-04-21T10:00:00.000Z",
        "updatedAt": "2026-04-21T10:05:00.000Z"
    }
}
```

### 5. Delete Resource

- Method: `DELETE`
- URL: `/resources/:id`

Response: `204 No Content`

## Validation Rules

Validation logic: `src/problem5/src/validators/resourceSchemas.ts`

Rules:

- `name` is required on create
- `name` must be a non-empty string
- `name` max length is `255`
- `description` is required on create
- `description` must be a non-empty string
- `isFinish` must be boolean when provided
- update body must contain at least one valid field
- route `id` must be a positive integer
- `search` must not be empty
- `isFinish` query must be `true` or `false`

## Database

- Type: SQLite
- Driver: `sqlite3`
- Main file: `./challengeDb.sqlite`
- Test database file: `./challengeDbTest.sqlite`

This project uses SQLite because it is small and simple. In a real-world project, you could use a database such as PostgreSQL or MSSQL and manage schema changes with migrations.

Entity fields:

- `id`
- `name`
- `description`
- `isFinish`
- `createdAt`
- `updatedAt`

## Testing

Run e2e tests:

```bash
npm run test:e2e
```

Current test behavior:

- sets `PORT=3001`
- sets `APP_ENV=test`
- uses `challengeDbTest.sqlite`
- removes test DB files before and after test run

E2E test file: `src/problem5/test/e2e/resource.e2e.test.ts`

## Manual Testing

Create:

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"A test resource","isFinish":false}'
```

List:

```bash
curl -X GET http://localhost:3000/resources
```

Filter:

```bash
curl -X GET "http://localhost:3000/resources?isFinish=false&search=test"
```

Get by id:

```bash
curl -X GET http://localhost:3000/resources/1
```

Update:

```bash
curl -X PUT http://localhost:3000/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated resource","isFinish":true}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/resources/1
```

## Troubleshooting

### Port already in use

Change `PORT` in `.env`:

```env
PORT=3001
```

### Database file cannot be created

Ensure the app can write in the project root directory.

### Dependency issue

Reinstall dependencies:

```bash
npm install
```

### Build issue

Verify build:

```bash
npm run build
```

## Notes

- The app currently uses `synchronize: true`, so schema is auto-created from the entity.
- The API returns JSON for success and error cases, except `DELETE /resources/:id`, which returns `204 No Content`.
- Health check endpoint: `GET /health`
