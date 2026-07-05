# Problem 5: Product CRUD API

A RESTful API for managing products, built with **ExpressJS**, **TypeScript**, and **PostgreSQL**.

## Overview

This is a production-ready Product CRUD API following ExpressJS best practices with layered architecture. The API supports creating, listing (with filters), retrieving, updating, and deleting products with soft delete functionality.

**Tech Stack:**
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Validation:** Zod
- **Database:** PostgreSQL
- **Logging:** pino
- **Testing:** Vitest + Supertest
- **Containerization:** Docker + Docker Compose

## Prerequisites

- Node.js LTS (v18 or higher)
- Docker & Docker Compose (recommended)
- OR PostgreSQL 16+ (for local development without Docker)

## Quick Start with Docker

```bash
# Copy environment variables
cp .env.example .env

# Start PostgreSQL and the app
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop everything
docker-compose down
```

The API will be available at `http://localhost:3000/v1/products`

## Local Development (without Docker)

```bash
# Install dependencies
npm install

# Set up PostgreSQL (ensure it's running)
createdb products_db

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Development (with hot reload)
npm run dev

# Run tests
npm test

# Build (type check + compile)
npm run build
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_NAME` | `products_db` | PostgreSQL database name |
| `DB_MAX_CONNECTIONS` | `10` | Max pool connections |
| `DB_CONNECTION_TIMEOUT_MS` | `5000` | Connection timeout in milliseconds |
| `DB_QUERY_TIMEOUT_MS` | `10000` | Query timeout in milliseconds |
| `NODE_ENV` | `development` | Environment (development/production/test) |
| `LOG_LEVEL` | `info` | Pino log level (debug/info/warn/error) |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Graceful shutdown timeout in milliseconds |

## API Documentation

Base URL: `http://localhost:3000/v1/products`

### Health Check

```bash
curl http://localhost:3000/health/liveness
curl http://localhost:3000/health/readiness
```

**Response (200 OK):**
```json
{ "status": "ok" }
```

### Create Product

```bash
curl -X POST http://localhost:3000/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget",
    "description": "A useful widget",
    "price": 29.99,
    "category": "gadgets",
    "sku": "WDG-003",
    "isActive": true,
    "metadata": {"color": "red"}
  }'
```

**Response (201 Created):**
```json
{
  "code": "success",
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "name": "Widget",
    "description": "A useful widget",
    "price": 29.99,
    "category": "gadgets",
    "sku": "WDG-003",
    "isActive": true
  }
}
```

### List Products

```bash
curl "http://localhost:3000/v1/products?category=gadgets&minPrice=10&maxPrice=50&search=widget&page=1&limit=20"
```

**Query Parameters:**
- `category` (optional): Filter by exact category match
- `minPrice` (optional): Filter products with price >= minPrice
- `maxPrice` (optional): Filter products with price <= maxPrice
- `search` (optional): Partial match on product name (case-insensitive)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page

**Response (200 OK):**
```json
{
  "code": "success",
  "data": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "name": "Widget",
      "description": "A useful widget",
      "price": 29.99,
      "category": "gadgets",
      "sku": "WDG-001",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### Get Product by ID

```bash
curl http://localhost:3000/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV
```

**Response (200 OK):**
```json
{
  "code": "success",
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "name": "Widget",
    "description": "A useful widget",
    "price": 29.99,
    "category": "gadgets",
    "sku": "WDG-001",
    "isActive": true
  }
}
```

### Update Product (Partial)

```bash
curl -X PATCH http://localhost:3000/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Widget",
    "price": 39.99
  }'
```

**Response (200 OK):**
```json
{
  "code": "success",
  "data": {
    "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "name": "Updated Widget",
    "description": "A useful widget",
    "price": 39.99,
    "category": "gadgets",
    "sku": "WDG-001",
    "isActive": true
  }
}
```

### Delete Product (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV
```

**Response (204 No Content)**

## Architecture

### ExpressJS Layered Architecture

```
Request → Router → Middleware → Controller → Service → Repository → PostgreSQL
             ↓       (Validation)
         Validation   (Zod)
```

**Key Principles:**
- **Dependency Inversion**: Services depend on repository interfaces, not concrete implementations
- **Single Responsibility**: Each layer has a clear purpose
- **DRY**: Validation logic centralized in middleware

**File Structure:**
```
src/problem5/
├── index.ts              # Barrel export & server startup
├── config.ts             # Configuration management
├── logger.ts             # Pino logger instance
├── container.ts          # DI container & lifecycle management
├── router.ts             # Route definitions with validation middleware
├── controller/
│   └── product-controller.ts    # HTTP layer (orchestration only)
├── service/
│   ├── interfaces.ts            # IProductService interface
│   └── product-service.ts       # Business logic, domain rules
├── repository/
│   ├── interfaces.ts            # IProductRepository interface
│   ├── database.ts              # PostgreSQL pool & migration
│   ├── db-errors.ts             # Database error type guards
│   └── product-repository.ts    # Product data access layer
├── model/
│   ├── product.ts               # Domain types and interfaces
│   └── errors.ts                # Custom error classes
├── schema/
│   └── product.ts               # Zod validation schemas
├── dto/
│   ├── product-dto.ts           # DTO interfaces
│   └── mapper.ts                # Domain-to-DTO mapping
├── types/
│   ├── branded.ts               # ULID generation & validation
│   ├── index.ts                 # Type barrel export
│   └── express.d.ts             # Express Request augmentation
├── middleware/
│   ├── async-handler.ts         # Async error wrapper
│   ├── error-handler.ts         # Global error handler
│   ├── request-context.ts       # Request ID & child logger
│   └── validate.ts              # Zod validation middleware (assigns parsed data)
└── __tests__/
    ├── service/
    │   └── product-service.test.ts
    └── controller/
        └── product-controller.test.ts
```

## Design Decisions

For detailed design decisions and rationale, see **[DECISIONS.md](./DECISIONS.md)**.

**Key decisions summary:**

1. **Domain:** Product resource — universally understood, naturally supports filters
2. **Database:** PostgreSQL — production-grade with JSONB, full-text search, and scalability
3. **Schema:** Includes `metadata` JSONB column for extensibility, `deleted_at` for soft delete
4. **Filters:** 4 basic filters (category, minPrice, maxPrice, search) + pagination, extensible design
5. **Versioning:** URL path versioning (`/v1/products`) — industry standard, easy to test
6. **ID Type:** String in model/API, convert at repository boundary — future-proof for UUID migration
7. **Error Handling:** HTTP status codes with snake_case `code` field for machine-readable errors
8. **Validation:** Zod schemas in middleware at router level — parsed data assigned back to request
9. **Testing:** Unit tests for service (mock repo interface), integration tests for controller (mocked DB)
10. **Logging:** pino with request ID correlation
11. **Configuration:** Environment variables with sensible defaults
12. **Soft Delete:** `deleted_at` timestamp instead of hard delete — data recovery, audit trail
13. **Repository:** Self-contained `ProductRepository` — no leaky abstractions, all SQL parameterized
14. **Container:** Proper DI container with graceful shutdown hooks
15. **Middleware:** Reusable middleware for validation, async handling, request IDs
16. **Interfaces:** `IProductRepository` and `IProductService` for dependency inversion and testability
17. **Performance:** Separate COUNT query for pagination — avoids expensive window functions on large datasets

## Error Handling

All errors follow a consistent format with a machine-readable `code` field:

```json
{
  "error": {
    "code": "invalid_input",
    "message": "Invalid input",
    "details": [
      { "path": ["price"], "message": "Number must be greater than 0" }
    ]
  }
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|---|---|---|
| `invalid_input` | `400` | Validation error |
| `not_found` | `404` | Resource not found |
| `duplicate_sku` | `409` | Duplicate SKU |
| `conflict` | `409` | Generic conflict |
| `internal_server_error` | `500` | Unexpected error |

**HTTP Status Codes:**
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate SKU
- `500 Internal Server Error` - Unexpected error

## Testing

**Unit Tests (Service Layer):**
- Mock repository interface to isolate business logic
- Test conflict detection, not-found handling, transaction behavior

**Integration Tests (Controller Layer):**
- Mock repository layer for fast, self-contained tests
- Test HTTP layer: request validation (via middleware), response format, status codes

**Run tests:**
```bash
npm test
```

## Extensibility

This API is designed for future enhancements:

1. **Custom Attributes:** Use the `metadata` JSONB field for category-specific attributes (queryable with PostgreSQL JSONB operators)
2. **Advanced Filtering:** Add new filter fields to `ProductFilter` interface (3-line change)
3. **New Resources:** Create new repository classes implementing the same interface pattern
4. **Relationships:** Add foreign keys to link products to categories, variants, etc.
5. **Authentication:** Add middleware for API keys or JWT tokens
6. **Rate Limiting:** Add Express middleware for request throttling
7. **UUID Migration:** Change ID generation without model changes (string IDs)
8. **Full-Text Search:** PostgreSQL native `tsvector` with GIN index

## Known Limitations & Production Considerations

**Search Performance:**
- Uses `ILIKE '%search%'` with pg_trgm GIN index for efficient trigram matching
- Requires pg_trgm PostgreSQL extension (automatically enabled in migration)
- For advanced search needs (ranking, highlighting, facets), consider:
  - PostgreSQL full-text search with `tsvector` + GIN index
  - Elasticsearch for complex search with ranking, highlighting, facets

**Database Connection:**
- Connection pool configured via `DB_MAX_CONNECTIONS`
- Monitor connection usage in production
- Consider connection pooling at infrastructure level (e.g., PgBouncer)

**Metadata Size:**
- Limited to 20 keys via Zod validation
- For large metadata, consider separate table or external storage

## Database Performance & Indexes

### Index Strategy

The database uses optimized indexes based on query patterns and data assumptions:

**Data Assumptions:**
- Most products are active (deleted_at IS NULL) - typically 90%+ of rows
- Category has moderate cardinality (10-100 distinct values)
- Price distribution is relatively uniform
- Search terms are typically 3+ characters
- Results are sorted by created_at DESC (newest first)

**Indexes:**

| Index | Purpose | Query Pattern |
|-------|---------|---------------|
| `idx_products_sku` | SKU uniqueness | `findBySku`, `findBySkuForUpdate` |
| `idx_products_active_price` | Price range filters | `WHERE price >= $1 AND price <= $2` |
| `idx_products_active_created` | Sorting by date | `ORDER BY created_at DESC` |
| `idx_products_active_category_created` | Category + sort | `WHERE category = $1 ORDER BY created_at DESC` |
| `idx_products_name_trgm` | ILIKE search | `WHERE name ILIKE '%term%'` |

**Partial Indexes:**
- All indexes (except SKU) use `WHERE deleted_at IS NULL`
- Reduces index size by ~90% (only indexes active products)
- Improves query performance for the common case

**Performance Characteristics:**

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Category filter + sort | O(log n) | Composite index scan |
| Price range filter | O(log n) | Index range scan |
| Search (ILIKE) | O(log n) | Trigram index scan |
| Pagination | O(1) | Efficient with indexes |

### Monitoring Query Performance

Use PostgreSQL's `EXPLAIN ANALYZE` to verify index usage:

```sql
-- Check if indexes are being used
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE deleted_at IS NULL 
  AND category = 'electronics' 
  AND price BETWEEN 10 AND 100
ORDER BY created_at DESC
LIMIT 20;
```

### Scaling Considerations

**Current Limits:**
- Single PostgreSQL instance with connection pooling
- Suitable for ~100k-500k products with current indexes
- Search performance degrades with very large datasets (>1M rows)

**Scaling Strategies:**
1. **Read Replicas:** Offload read queries to replicas
2. **Partitioning:** Partition by category or date range
3. **Full-Text Search:** Migrate to `tsvector` for better search ranking
4. **Elasticsearch:** For complex search with facets, highlighting
5. **Caching:** Redis for frequently accessed products

## License

MIT
