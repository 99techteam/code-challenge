# Problem 5: A Crude Server

A RESTful CRUD API server built with Express.js and TypeScript, using MongoDB for persistence and Bearer token authentication for protected endpoints.

## Features

- CRUD operations for resource creation, listing, detail lookup, update, and deletion.
- Basic filtering with `name` and `status` query parameters.
- MongoDB persistence through Mongoose.
- Bearer token authentication controlled by environment configuration.
- Interactive Swagger/OpenAPI documentation for browser-based testing.
- TypeScript-based codebase with integration tests for the API flow.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Documentation**: Swagger/OpenAPI 3.0 with Swagger UI
- **Testing**: Node test runner, Supertest, mongodb-memory-server

## Resource Model

```json
{
  "id": "ObjectId",
  "name": "Test Resource",
  "value": "xxxxx",
  "description": "A test resource",
  "status": 1,
  "createdAt": "2026-01-25T10:00:00.000Z",
  "updatedAt": "2026-01-25T10:00:00.000Z",
  "detail": {}
}
```

## Endpoints

- `POST /resources` creates a resource.
- `GET /resources?name=abc&status=1` lists resources with basic filters.
- `GET /resources/:id` returns a resource detail.
- `PUT /resources/:id` updates a resource.
- `DELETE /resources/:id` deletes a resource.

All endpoints require `Authorization: Bearer <AUTH_TOKEN>`.

## Installation

1. Move into the problem folder:

```bash
cd src/problem5
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Update the values in `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/code_challenge_problem5
AUTH_TOKEN=replace-with-a-strong-token
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

If you want to start the compiled output manually:

```bash
node dist/src/server.js
```

The server starts on `http://localhost:3000` by default.

## API Documentation

### Swagger UI

Once the server is running, open:

- [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Swagger is public for convenience, but the actual CRUD endpoints still require Bearer authentication.

How to test in Swagger UI:

1. Open the Swagger page.
2. Expand any `/resources` endpoint.
3. Click `Authorize`.
4. Enter the token as plain text from `AUTH_TOKEN`.
5. Run requests directly from the browser.

Useful supporting endpoint:

- [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json) exposes the raw OpenAPI document.

## API Endpoints

- `POST /resources` creates a resource.
- `GET /resources?name=abc&status=1` lists resources with basic filters.
- `GET /resources/:id` returns a resource detail.
- `PUT /resources/:id` updates a resource.
- `DELETE /resources/:id` deletes a resource.

## Testing with cURL

All examples below assume:

```bash
set TOKEN=replace-with-a-strong-token
```

If you are using PowerShell, use:

```powershell
$TOKEN = "replace-with-a-strong-token"
```

### 1. Create a resource

```bash
curl -X POST http://localhost:3000/resources \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Resource\",\"value\":\"xxxxx\",\"description\":\"A test resource\",\"status\":1,\"detail\":{\"source\":\"curl\"}}"
```

PowerShell example:

```powershell
curl.exe -X POST http://localhost:3000/resources `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Test Resource\",\"value\":\"xxxxx\",\"description\":\"A test resource\",\"status\":1,\"detail\":{\"source\":\"powershell\"}}"
```

### 2. List resources

```bash
curl "http://localhost:3000/resources?name=Test&status=1" \
  -H "Authorization: Bearer %TOKEN%"
```

### 3. Get resource detail

```bash
curl http://localhost:3000/resources/<resource_id> \
  -H "Authorization: Bearer %TOKEN%"
```

### 4. Update a resource

```bash
curl -X PUT http://localhost:3000/resources/<resource_id> \
  -H "Authorization: Bearer %TOKEN%" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Updated description\",\"status\":0}"
```

### 5. Delete a resource

```bash
curl -X DELETE http://localhost:3000/resources/<resource_id> \
  -H "Authorization: Bearer %TOKEN%"
```

## Test

```bash
npm test
```

## Project Structure

```text
src/problem5/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── swagger.ts
│   ├── controllers/
│   │   └── resource-controller.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   └── resource.ts
│   ├── routes/
│   │   └── resource-routes.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── app.ts
│   └── server.ts
├── test/
│   └── resource-api.test.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```
