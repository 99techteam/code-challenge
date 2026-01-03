# Problem 5 - ExpressJS Backend with TypeScript

A RESTful API backend built with ExpressJS and TypeScript, providing CRUD operations for managing items with database persistence.

## Features

- ✅ **Create** - Add new items
- ✅ **Read** - List items with filters and get item details
- ✅ **Update** - Modify existing items
- ✅ **Delete** - Remove items
- ✅ **Filtering** - Search and filter items by status, name, or description
- ✅ **Database** - SQLite database for data persistence

## Tech Stack

- **ExpressJS** - Web framework
- **TypeScript** - Type-safe JavaScript
- **SQLite** (better-sqlite3) - Lightweight database
- **CORS** - Cross-origin resource sharing

## Project Structure

```
src/problem5/
├── src/
│   ├── main.ts              # Main application entry point
│   ├── database/
│   │   └── db.ts              # Database connection and schema
│   ├── types/
│   │   └── item.ts           # TypeScript interfaces
│   ├── models/
│   │   └── itemModel.ts      # Data access layer
│   ├── controllers/
│   │   └── itemController.ts # Business logic
│   └── routes/
│       └── itemRoutes.ts     # API routes
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the problem5 directory:

```bash
cd src/problem5
```

2. Install dependencies:

```bash
npm install
```

## Configuration

The application uses the following default configuration:

- **Port**: 3000 (can be overridden with `PORT` environment variable)
- **Database**: SQLite database file (`data.db`) will be created automatically in the project root

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Base URL

```
http://localhost:3000/api/items
```

### 1. Create Item

**POST** `/api/items`

Request body:

```json
{
  "name": "Item Name",
  "description": "Item description (optional)",
  "status": "active" // optional, defaults to "active"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "name": "Item Name",
  "description": "Item description",
  "status": "active",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 12:00:00"
}
```

### 2. List Items (with filters)

**GET** `/api/items`

Query parameters:

- `status` (optional) - Filter by status (e.g., `?status=active`)
- `search` (optional) - Search in name and description (e.g., `?search=keyword`)
- `limit` (optional) - Limit number of results (e.g., `?limit=10`)
- `offset` (optional) - Pagination offset (e.g., `?offset=0`)

Examples:

- Get all items: `GET /api/items`
- Filter by status: `GET /api/items?status=active`
- Search items: `GET /api/items?search=keyword`
- Pagination: `GET /api/items?limit=10&offset=0`
- Combined filters: `GET /api/items?status=active&search=test&limit=5`

Response: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
  }
]
```

### 3. Get Item Details

**GET** `/api/items/:id`

Response: `200 OK`

```json
{
  "id": 1,
  "name": "Item Name",
  "description": "Item description",
  "status": "active",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 12:00:00"
}
```

Error: `404 Not Found` if item doesn't exist

### 4. Update Item

**PUT** `/api/items/:id`

Request body (all fields optional):

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "inactive"
}
```

Response: `200 OK`

```json
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated description",
  "status": "inactive",
  "created_at": "2024-01-01 12:00:00",
  "updated_at": "2024-01-01 12:30:00"
}
```

Error: `404 Not Found` if item doesn't exist

### 5. Delete Item

**DELETE** `/api/items/:id`

Response: `204 No Content`

Error: `404 Not Found` if item doesn't exist

### Health Check

**GET** `/health`

Response: `200 OK`

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Example Usage

### Using cURL

```bash
# Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test"}'

# List all items
curl http://localhost:3000/api/items

# Get item by ID
curl http://localhost:3000/api/items/1

# Update item
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "status": "inactive"}'

# Delete item
curl -X DELETE http://localhost:3000/api/items/1

# Search items
curl "http://localhost:3000/api/items?search=test&status=active"
```

### Using JavaScript/TypeScript

```typescript
// Create item
const response = await fetch('http://localhost:3000/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Item',
    description: 'This is a test',
  }),
});
const item = await response.json();

// List items with filters
const items = await fetch(
  'http://localhost:3000/api/items?status=active&limit=10'
).then((res) => res.json());
```

## Database

The application uses SQLite for data persistence. The database file (`data.db`) is automatically created in the project root when the server starts for the first time.

### Schema

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

The `updated_at` timestamp is automatically updated when an item is modified.

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message"
}
```

## Development

### TypeScript Compilation

Watch mode for automatic compilation:

```bash
npm run watch
```

### Project Structure

The codebase follows a layered architecture:

- **Routes** - Define API endpoints
- **Controllers** - Handle HTTP requests/responses and validation
- **Models** - Data access layer (database operations)
- **Types** - TypeScript type definitions
- **Database** - Database connection and schema setup

## Notes

- The database file (`data.db`) is included in `.gitignore` and should not be committed to version control
- The server includes CORS middleware to allow cross-origin requests
- All timestamps are automatically managed by the database
