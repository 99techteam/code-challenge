# Problem 5 – Crude Server

A production-quality REST API built with **Express.js**, **TypeScript**, **TypeORM**, and **SQLite**.

## Stack

| Layer | Technology |
|---|---|
| Framework | Express.js |
| Language | TypeScript |
| ORM | TypeORM |
| Database | SQLite (via sqlite3) |
| Validation | Zod |
| Testing | Jest + ts-jest |

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Entry point
├── config/
│   ├── env.ts                      # Environment variables
│   └── database.ts                 # TypeORM DataSource
├── modules/
│   └── resource/
│       ├── resource.model.ts       # TypeORM entity
│       ├── resource.dto.ts         # Types / interfaces
│       ├── resource.validation.ts  # Zod schemas
│       ├── resource.repository.ts  # Database queries
│       ├── resource.service.ts     # Business logic
│       ├── resource.controller.ts  # Request / response handling
│       └── resource.routes.ts      # Express router
├── common/
│   ├── middleware/
│   │   ├── error.middleware.ts     # Centralized error handler
│   │   └── validate.middleware.ts  # Zod validation middleware
│   ├── utils/logger.ts
│   ├── types/express.d.ts
│   └── constants/httpStatus.ts
├── routes/
│   └── index.ts                    # Combines all routes
└── database/
    └── seed/index.ts               # Seed data
```

## Prerequisites

- Node.js >= 18
- npm

## Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment |
| `DB_PATH` | `./data/dev.db` | SQLite file path |

## Running

### Development

```bash
npm install
npm run dev
```

The database tables are created automatically on first start (`synchronize: true`).

### Production

```bash
npm run build
npm start
```

### Seed (optional)

```bash
npm run db:seed
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

### Test coverage

| File | What is tested |
|---|---|
| `resource.validation.ts` | All Zod schemas — valid input, edge cases, cross-field rules (`minPrice ≤ maxPrice`) |
| `resource.service.ts` | All service methods with mocked repository — happy path and 404 error cases |

Tests are located in `src/modules/resource/__tests__/`.

## API Reference

Base URL: `http://localhost:3000/api`

### List resources

```
GET /resources
```

Query parameters:

| Param | Type | Description |
|---|---|---|
| `name` | string | Partial name match |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `page` | number | Page number (default: 1) |
| `limit` | number | Page size (default: 20, max: 100) |

**Response**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### Get resource

```
GET /resources/:id
```

### Create resource

```
POST /resources
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High performance laptop",
  "price": 999.99
}
```

**Response:** `201 Created`

### Update resource

```
PATCH /resources/:id
Content-Type: application/json

{
  "price": 899.99
}
```

### Delete resource

```
DELETE /resources/:id
```

**Response:** `204 No Content`

## Example curl commands

```bash
# Create
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Gaming laptop","price":999.99}'

# List with filters
curl "http://localhost:3000/api/resources?minPrice=100&maxPrice=1000&page=1&limit=10"

# Get by id
curl http://localhost:3000/api/resources/1

# Update
curl -X PATCH http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"price":899.99}'

# Delete
curl -X DELETE http://localhost:3000/api/resources/1
```
