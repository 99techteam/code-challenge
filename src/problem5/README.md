# Product CRUD API

A comprehensive NestJS-based REST API for managing products with full CRUD operations, advanced filtering, pagination, and search capabilities. Built with Clean Architecture principles for maintainability and scalability.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [cURL Examples](#curl-examples)
- [Query Parameters](#query-parameters)
- [Response Formats](#response-formats)
- [Development](#development)
- [Testing](#testing)

## Overview

This Product API provides a robust backend service for e-commerce applications, supporting:

- **CRUD Operations**: Create, read, update, and delete products
- **Advanced Filtering**: Filter by category, active status, price range, and search terms
- **Pagination**: Efficient pagination with customizable page sizes
- **Sorting**: Sort products by name, price, or creation date
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Type Safety**: Full TypeScript implementation with Zod validation

### Architecture

The application follows Clean Architecture principles:

- **Domain Layer**: Core business entities and interfaces
- **Application Layer**: Use cases and DTOs
- **Infrastructure Layer**: Database repositories and external services
- **Presentation Layer**: Controllers and API responses

## Technology Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas with nestjs-zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with comprehensive unit tests
- **Language**: TypeScript 5.x

## Prerequisites

- Node.js 22+
- PostgreSQL 12+
- Yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd problem5
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or simply:
   yarn
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/product_db"
   PORT=3000
   ```

## Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb product_db
   ```

2. **Run database migrations**
   ```bash
   yarn migrate:dev
   ```

3. **Generate Prisma client**
   ```bash
   yarn prisma:generate
   ```

4. **Seed example data** (Optional)
   ```bash
   psql -d product_db -f example_products.sql
   ```

## Running the Application

### Development Mode
```bash
yarn start
```

### Build for Production
```bash
yarn build
```

The API will be available at `http://localhost:3000`

**API Documentation**: `http://localhost:3000/api`

## API Documentation

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create a new product |
| GET | `/products` | List products with filtering/pagination |
| GET | `/products/:id` | Get a single product by ID |
| PATCH | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |

## cURL Examples

### 1. Create Product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop RTX 4070",
    "description": "High-performance gaming laptop with RTX 4070 GPU and 16GB RAM",
    "price": 1599.99,
    "sku": "GAMING-RTX4070-16GB",
    "category": "electronics",
    "isActive": true
  }'
```

**Response:**
```json
{
  "id": 17,
  "name": "Gaming Laptop RTX 4070",
  "description": "High-performance gaming laptop with RTX 4070 GPU and 16GB RAM",
  "price": 1599.99,
  "sku": "GAMING-RTX4070-16GB",
  "category": "electronics",
  "isActive": true,
  "createdAt": "2025-09-03T10:30:00Z",
  "updatedAt": "2025-09-03T10:30:00Z"
}
```

### 2. List Products (Basic)

```bash
curl "http://localhost:3000/products?page=1&limit=5"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "description": "Latest flagship smartphone with A17 Pro chip, titanium build, and advanced camera system",
      "price": 1199.99,
      "sku": "APPLE-IP15PM-256",
      "category": "electronics",
      "isActive": true,
      "createdAt": "2025-08-04T00:00:00Z",
      "updatedAt": "2025-08-04T00:00:00Z"
    }
  ],
  "paging": {
    "total": 16,
    "page": 1,
    "limit": 5,
    "pages": 4
  }
}
```

### 3. Filter by Category

```bash
curl "http://localhost:3000/products?category=electronics&page=1&limit=10"
```

### 4. Filter by Price Range

```bash
curl "http://localhost:3000/products?price_min=50&price_max=500&page=1&limit=10"
```

### 5. Search Products

```bash
curl "http://localhost:3000/products?search=laptop&page=1&limit=10"
```

### 6. Complex Filtering

```bash
curl "http://localhost:3000/products?category=electronics&is_active=true&price_min=100&price_max=2000&search=phone&sort=price&order=asc&page=1&limit=5"
```

### 7. Get Single Product

```bash
curl "http://localhost:3000/products/1"
```

**Response:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "description": "Latest flagship smartphone with A17 Pro chip, titanium build, and advanced camera system",
  "price": 1199.99,
  "sku": "APPLE-IP15PM-256",
  "category": "electronics",
  "isActive": true,
  "createdAt": "2025-08-04T00:00:00Z",
  "updatedAt": "2025-08-04T00:00:00Z"
}
```

### 8. Update Product

```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1099.99,
    "description": "Latest flagship smartphone with A17 Pro chip, titanium build, and advanced camera system - Special Discount!"
  }'
```

**Response:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "description": "Latest flagship smartphone with A17 Pro chip, titanium build, and advanced camera system - Special Discount!",
  "price": 1099.99,
  "sku": "APPLE-IP15PM-256",
  "category": "electronics",
  "isActive": true,
  "createdAt": "2025-08-04T00:00:00Z",
  "updatedAt": "2025-09-03T10:45:00Z"
}
```

### 9. Delete Product

```bash
curl -X DELETE http://localhost:3000/products/16
```

**Response:**
```json
{
  "success": true
}
```

## Query Parameters

### List Products Endpoint (`GET /products`)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (minimum: 1) |
| `limit` | number | No | 10 | Items per page (1-100) |
| `category` | string | No | - | Filter by category (`electronics`, `clothing`, `books`, `home`, `sports`) |
| `is_active` | boolean | No | - | Filter by active status |
| `search` | string | No | - | Search in name, description, or SKU |
| `price_min` | number | No | - | Minimum price filter |
| `price_max` | number | No | - | Maximum price filter |
| `sort` | string | No | `createdAt` | Sort field (`name`, `price`, `createdAt`) |
| `order` | string | No | `desc` | Sort order (`asc`, `desc`) |

### Example Product Categories

The API supports these predefined categories:
- `electronics` - Smartphones, laptops, TVs, headphones
- `clothing` - Jeans, shoes, jackets, apparel
- `books` - Programming books, fiction, educational materials
- `home` - Appliances, furniture, home improvement
- `sports` - Sports equipment, fitness gear, outdoor items

## Response Formats

### Success Responses

#### Single Product
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "sku": "PRODUCT-SKU-001",
  "category": "electronics",
  "isActive": true,
  "createdAt": "2025-09-03T10:30:00Z",
  "updatedAt": "2025-09-03T10:30:00Z"
}
```

#### Product List
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "sku": "PRODUCT-SKU-001",
      "category": "electronics",
      "isActive": true,
      "createdAt": "2025-09-03T10:30:00Z",
      "updatedAt": "2025-09-03T10:30:00Z"
    }
  ],
  "paging": {
    "total": 16,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Delete Response
```json
{
  "success": true
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

#### 409 Conflict (Duplicate SKU)
```json
{
  "statusCode": 409,
  "message": "Product with SKU 'DUPLICATE-SKU' already exists",
  "error": "Conflict"
}
```

#### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Development

### Project Structure

```
libs/product/
├── src/
│   ├── domain/           # Core business logic
│   │   ├── entities/     # Product entity and schemas
│   │   └── interfaces/   # Repository and service interfaces
│   ├── application/      # Use cases and DTOs
│   │   ├── services/     # Application services
│   │   └── dtos/         # Data transfer objects
│   ├── infras/          # Infrastructure layer
│   │   ├── repositories/ # Database repositories
│   │   └── di/          # Dependency injection
│   └── products.controller.ts  # API controller
```

### Available Scripts

- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn format` - Format code with Prettier
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage

### Database Scripts

- `yarn migrate:dev` - Apply database migrations
- `yarn migrate:reset` - Reset database
- `yarn prisma:studio` - Open Prisma Studio
- `yarn prisma:generate` - Generate Prisma client

## Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests for CI
yarn test:ci
```

### Test Coverage

The application maintains comprehensive test coverage including:

- **Unit Tests**: Entity validation, service logic, repository methods
- **Integration Tests**: Controller endpoints, database interactions
- **Error Handling Tests**: Validation errors, not found scenarios
- **Edge Cases**: Boundary conditions, invalid inputs

### Test Files

- `libs/product/src/domain/entities/__tests__/product.entity.spec.ts`
- `libs/product/src/application/services/__tests__/product.service.spec.ts`
- `libs/product/src/infras/repositories/__tests__/product-prisma.repository.unit.spec.ts`
- `libs/product/src/__tests__/products.controller.spec.ts`

### Example Test Data

The `example_products.sql` file contains 16 realistic products across 5 categories:

**Electronics**: iPhone, MacBook, Sony Headphones, Samsung TV
**Clothing**: Levi's Jeans, Nike Shoes, Patagonia Jacket
**Books**: Programming books, Fiction series
**Home**: Dyson Vacuum, Instant Pot, IKEA Table
**Sports**: Tennis Racquet, Yeti Tumbler, Peloton Bike

## Development Best Practices

### Code Standards
- **TypeScript**: Full type safety with strict mode
- **Zod Validation**: Runtime type validation for all inputs
- **Clean Architecture**: Clear separation of concerns
- **Error Handling**: Comprehensive try-catch blocks
- **Testing**: High coverage with meaningful tests

### API Design
- **RESTful**: Standard HTTP methods and status codes
- **Consistent**: Uniform response formats
- **Documented**: Complete OpenAPI/Swagger documentation
- **Validated**: Input validation with detailed error messages

### Performance
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading
- **Connection Pooling**: Prisma connection management
