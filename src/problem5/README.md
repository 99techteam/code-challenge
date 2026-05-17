# Product Management API

A RESTful backend service for managing products, built as part of the 99Tech Code Challenge. The API provides full CRUD operations, query filtering, and paginated list responses with a consistent JSON envelope.

---

## Project Overview

This service exposes a **Product** resource over HTTP. Clients can create, read, update, and delete products, list products with pagination, and filter by name and price range. The codebase follows a layered architecture (routes → controllers → services → database) with centralized validation and error handling suitable for production-style review.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express 5 |
| ORM | Prisma 6 |
| Database | MySQL |
| Validation | express-validator |
| Logging | Morgan |
| CORS | cors |
| Config | dotenv |

---

## Features

- **CRUD** — Create, read, update, and delete products
- **Pagination** — `page` and `limit` on list endpoints (default: page 1, limit 10, max 100)
- **Filtering** — Filter by name (partial match) and price range (`minPrice`, `maxPrice`)
- **Validation** — Request validation on body, query, and route params before handlers run
- **Consistent API responses** — Uniform success and error JSON shape
- **Health check** — `GET /health` for uptime checks
- **Type safety** — Strict TypeScript and Prisma-generated types

---

## Project Structure

```
src/problem5/
├── prisma/
│   ├── schema.prisma          # Data model
│   └── migrations/            # SQL migration history
├── src/
│   ├── config/
│   │   ├── env.ts             # Environment variables
│   │   └── prisma.ts          # Prisma client singleton
│   ├── controllers/
│   │   └── product.controller.ts
│   ├── helpers/
│   │   ├── filter.helper.ts   # Merges query filters into Prisma where clauses
│   │   └── response.helper.ts # Standard JSON response helpers
│   ├── middlewares/
│   │   ├── asyncHandler.ts    # Wraps async route handlers
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/
│   │   ├── index.ts           # Mounts /products under /api
│   │   └── product.routes.ts
│   ├── services/
│   │   └── product.service.ts # Business logic & database access
│   ├── types/
│   │   └── express.d.ts       # Extends Request with validated data
│   ├── validators/
│   │   └── product.validators.ts
│   └── main.ts                # App entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## Environment Setup

Create a `.env` file in `src/problem5/` (this file is gitignored):

```env
PORT=3000
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string for Prisma |
| `PORT` | No | HTTP port (default: `3000`) |

**Prerequisites**

- Node.js 18+ (recommended)
- MySQL 8+ (or compatible server)
- npm

---

## Installation

From the repository root:

```bash
cd src/problem5
npm install
```

---

## Prisma Setup

1. Ensure MySQL is running and the database in `DATABASE_URL` exists (or create it):

   ```sql
   CREATE DATABASE your_database_name;
   ```

2. Generate the Prisma Client:

   ```bash
   npx prisma generate
   ```

3. Apply migrations (see below).

---

## Migration Commands

| Command | Purpose |
|---------|---------|
| `npx prisma migrate dev` | Apply pending migrations in development (creates DB if needed) |
| `npx prisma migrate deploy` | Apply migrations in production/staging |
| `npx prisma migrate status` | Show migration state |
| `npx prisma db push` | Push schema without migration files (prototyping only) |
| `npx prisma studio` | Open Prisma Studio GUI for the database |

Initial migration creates the `products` table with `id`, `name`, `description`, `price`, `createdAt`, and `updatedAt`.

---

## Running the Application

**Development** (hot reload via nodemon):

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm start
```

The server listens at `http://localhost:3000` (or your configured `PORT`).

---

## Development Commands

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with TypeScript via ts-node |
| `build` | `npm run build` | Generate Prisma client and compile TypeScript to `dist/` |
| `build:clean` | `npm run build:clean` | Remove `dist/` then run full build |
| `compile` | `npm run compile` | TypeScript compile only (`tsc`) |
| `prisma:generate` | `npm run prisma:generate` | Regenerate Prisma client |
| `start` | `npm start` | Run compiled app from `dist/main.js` |

Additional useful commands:

```bash
npx prisma generate    # Regenerate client after schema changes
npx prisma studio      # Inspect/edit data
```

---

## Build Commands

```bash
npm run build
```

The build runs `prisma generate` then `tsc`. Output is written to `dist/` with source maps and declaration files per `tsconfig.json`.

---

## API Base URL

```
http://localhost:3000
```

| Scope | Base path |
|-------|-----------|
| Health | `http://localhost:3000/health` |
| API | `http://localhost:3000/api` |
| Products | `http://localhost:3000/api/products` |

---

## Example API Endpoints

### Health check

```http
GET /health
```

**Response (200)**

```json
{
  "success": true,
  "message": "API is running",
  "data": null
}
```

---

### Create product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99
}
```

**Response (201)**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": "29.99",
    "createdAt": "2026-05-17T15:30:00.000Z",
    "updatedAt": "2026-05-17T15:30:00.000Z"
  }
}
```

---

### List products (pagination & filters)

```http
GET /api/products?page=1&limit=10
GET /api/products?name=mouse&minPrice=10&maxPrice=50
```

| Query param | Type | Description |
|-------------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page, 1–100 (default: 10) |
| `name` | string | Partial name match |
| `minPrice` | number | Minimum price (inclusive) |
| `maxPrice` | number | Maximum price (inclusive) |

**Response (200)**

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPage": 3
  },
  "data": [ /* array of products */ ]
}
```

---

### Get product by ID

```http
GET /api/products/1
```

**Response (200)** — single product in `data`.  
**Response (404)** — if not found.

---

### Update product

```http
PUT /api/products/1
Content-Type: application/json

{
  "name": "Wireless Mouse Pro",
  "price": 34.99
}
```

All body fields are optional; at least one should be sent for a meaningful update.

**Response (200)** — updated product in `data`.

---

### Delete product

```http
DELETE /api/products/1
```

**Response (200)**

```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

---

### Error response format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Name is required",
    "price": "Price must be numeric"
  }
}
```

| Status | Typical cause |
|--------|----------------|
| 400 | Validation failure |
| 404 | Product not found |
| 409 | Duplicate record (Prisma unique constraint) |
| 500 | Unexpected server error |

---

## Validation Approach

Validation uses **express-validator** chains defined in `src/validators/product.validators.ts` and applied via the `validate` middleware.

1. **Route-level chains** — Each endpoint declares rules for `body`, `query`, or `params` (e.g. required `name` on create, positive integer `id` on `:id` routes).
2. **Middleware execution** — `validate()` runs all chains, collects failures, and returns `400` with a field → message map if invalid.
3. **Sanitized data** — On success, `matchedData()` is attached to `req.validated` so controllers receive typed, coerced values (e.g. `toInt()`, `toFloat()`).
4. **Query filters** — List filters use `customSanitizer` to map query strings into Prisma-compatible where fragments (e.g. `name` → `{ name: { contains: "..." } }`).

Controllers read only from `req.validated`, keeping handlers free of manual parsing.

---

## Architecture

The application uses a **layered (N-tier) architecture**:

```
HTTP Request
    ↓
Routes          → URL mapping, middleware stack
    ↓
validate        → Input validation & coercion
    ↓
asyncHandler    → Forwards rejected promises to error middleware
    ↓
Controller      → HTTP status codes & response formatting
    ↓
Service         → Business rules, Prisma queries, AppError for domain cases
    ↓
Prisma Client   → MySQL persistence
```

**Design choices**

- **Thin controllers** — Delegate logic to services; use `successResponse` for output.
- **Services own data access** — All Prisma calls live in `product.service.ts`.
- **Shared filter helper** — `buildWhere()` merges sanitized query fragments into a single Prisma `where` object.
- **Single Prisma instance** — Exported from `config/prisma.ts` for connection reuse.

---

## Error Handling

Errors are handled centrally in `error.middleware.ts`:

| Error type | Behavior |
|------------|----------|
| `AppError` | Returns `message`, `statusCode`, and optional `errors` (e.g. 404 "Product not found") |
| `PrismaClientKnownRequestError` | Maps known codes: `P2025` → 404, `P2002` → 409 |
| Other errors | Logged to console; client receives generic 500 |

**Async errors** — Route handlers are wrapped with `asyncHandler`, which catches promise rejections and passes them to `next(err)` so the error middleware always runs.

**Operational vs programmer errors** — Expected cases (not found, validation) use `AppError` with explicit status codes; unexpected failures fall through to the 500 handler.

---

## Author

Ye Htet San — [99Tech Code Challenge](https://github.com/Kikijake/code-challenge)
