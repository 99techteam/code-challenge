# Express CRUD Backend Server

A minimal backend server built with **TypeScript**, **Express.js**, and **Prisma ORM** that provides a complete CRUD API for managing items stored in a SQLite database.

## Features

- ✅ **TypeScript** for type safety
- ✅ **Express.js** web framework
- ✅ **Prisma ORM** with SQLite database
- ✅ **Zod** for input validation
- ✅ **Clean Architecture** (routes, controllers, services)
- ✅ **Error handling** with proper HTTP status codes
- ✅ **Filtering, pagination, and sorting**
- ✅ **CORS** support

## Project Structure

```
src/
├── controllers/      # Request handlers
├── services/         # Business logic
├── routes/          # API routes
├── middleware/      # Custom middleware
├── types/           # TypeScript types and validation schemas
├── app.ts           # Express app configuration
├── server.ts        # Server entry point
└── prisma.ts        # Prisma client configuration
prisma/
└── schema.prisma    # Database schema
```

## Requirements

- Node.js 18+ 
- npm or yarn

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Endpoints

### Base URL: `http://localhost:3000/api`

### Health Check
```http
GET /api/health
```

### Items CRUD Operations

#### 1. Create Item
```http
POST /api/items
Content-Type: application/json

{
  "name": "Laptop",
  "category": "Electronics",
  "price": 999.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "category": "Electronics",
    "price": 999.99,
    "createdAt": "2023-10-01T10:00:00.000Z",
    "updatedAt": "2023-10-01T10:00:00.000Z"
  },
  "message": "Item created successfully"
}
```

#### 2. Get All Items (with filtering, pagination, sorting)
```http
GET /api/items?search=laptop&category=Electronics&minPrice=500&maxPrice=2000&page=1&limit=10&sortBy=price&order=asc
```

**Query Parameters:**
- `search` - Search by name (case-insensitive)
- `category` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter  
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field: `createdAt`, `price`, `name` (default: `createdAt`)
- `order` - Sort order: `asc`, `desc` (default: `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Laptop",
        "category": "Electronics",
        "price": 999.99,
        "createdAt": "2023-10-01T10:00:00.000Z",
        "updatedAt": "2023-10-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "message": "Items retrieved successfully"
}
```

#### 3. Get Item by ID
```http
GET /api/items/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "category": "Electronics",
    "price": 999.99,
    "createdAt": "2023-10-01T10:00:00.000Z",
    "updatedAt": "2023-10-01T10:00:00.000Z"
  },
  "message": "Item retrieved successfully"
}
```

#### 4. Update Item
```http
PUT /api/items/1
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 1299.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gaming Laptop",
    "category": "Electronics",
    "price": 1299.99,
    "createdAt": "2023-10-01T10:00:00.000Z",
    "updatedAt": "2023-10-01T11:00:00.000Z"
  },
  "message": "Item updated successfully"
}
```

#### 5. Delete Item
```http
DELETE /api/items/1
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

## Example curl Commands

### Create an item:
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "category": "Electronics", 
    "price": 29.99
  }'
```

### Get all items with filters:
```bash
curl "http://localhost:3000/api/items?search=mouse&category=Electronics&minPrice=20&maxPrice=50&page=1&limit=5&sortBy=price&order=asc"
```

### Get specific item:
```bash
curl http://localhost:3000/api/items/1
```

### Update an item:
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Gaming Mouse",
    "price": 39.99
  }'
```

### Delete an item:
```bash
curl -X DELETE http://localhost:3000/api/items/1
```

## Database Schema

The `Item` model has the following fields:

```prisma
model Item {
  id        Int      @id @default(autoincrement())
  name      String
  category  String?
  price     Float    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Database Management

View your data using Prisma Studio:
```bash
npm run db:studio
```

Reset the database:
```bash
npx prisma migrate reset
```

### Production Build

Build the application:
```bash
npm run build
```

Start in production mode:
```bash
npm start
```

## License

MIT