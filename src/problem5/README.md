# Problem 5 - A Crude Server

This solution implements a TypeScript ExpressJS backend with CRUD endpoints for
a `resource` entity. Data is persisted in a small JSON database file so records
remain available after the server restarts.

## Requirements Covered

- Create a resource.
- List resources with basic filters.
- Get details of one resource.
- Update resource details.
- Delete a resource.
- Persist data through a simple file-backed database.

## Configuration

The server supports these environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port used by the Express server. |
| `DATABASE_FILE` | `dist/problem5/database.json` | JSON database file path. |

## Run The Application

Install dependencies:

```bash
npm install
```

Build and start Problem 5:

```bash
npm run start:problem5
```

The server will run at:

```text
http://localhost:3000
```

Use a custom port or database file:

```bash
PORT=4000 DATABASE_FILE=./problem5-db.json npm run start:problem5
```

## Project Structure

```text
src/problem5/
  index.ts                 # Server entrypoint and public exports
  app.ts                   # Express app and route handlers
  json-resource-database.ts # File-backed resource repository
  validation.ts            # Request and database validation helpers
  errors.ts                # HTTP error and centralized error middleware
  types.ts                 # Shared resource and repository types
  constants.ts             # Shared constants
  index.test.ts            # CRUD and validation tests
```

## API Endpoints

### API Home

```http
GET /
```

Shows a simple browser-friendly page confirming the API is running and linking
to useful endpoints.

### Health Check

```http
GET /health
```

### Create Resource

```http
POST /resources
Content-Type: application/json
```

```json
{
  "title": "Interview preparation notes",
  "description": "Backend CRUD practice task",
  "category": "study",
  "status": "active",
  "tags": ["typescript", "express"]
}
```

Required fields:

- `title`
- `category`

Optional fields:

- `description`
- `status`: `active` or `archived`
- `tags`: array of strings

### List Resources

```http
GET /resources
```

Basic filters:

```http
GET /resources?category=study
GET /resources?status=active
GET /resources?tag=typescript
GET /resources?search=backend
```

Filters can be combined:

```http
GET /resources?category=study&status=active&tag=typescript
```

### Get Resource Details

```http
GET /resources/:id
```

### Update Resource

```http
PATCH /resources/:id
Content-Type: application/json
```

```json
{
  "title": "Updated interview notes",
  "status": "archived"
}
```

### Delete Resource

```http
DELETE /resources/:id
```

Successful deletion returns `204 No Content`.

## Example Curl Flow

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"Interview preparation notes","category":"study","tags":["typescript","express"]}'

curl http://localhost:3000/resources

curl "http://localhost:3000/resources?category=study&tag=typescript"

curl -X PATCH http://localhost:3000/resources/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"archived"}'

curl -X DELETE http://localhost:3000/resources/<id>
```
