# Problem 5: A Crude Server

A RESTful CRUD API server built with Express.js and TypeScript, featuring a simple file-based database for data persistence.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, Delete resources
- 🔍 **Filtering**: List resources with type, status, and search filters
- 💾 **Data Persistence**: JSON file-based database
- 🔒 **TypeScript**: Fully typed for better development experience
- 🚀 **Express.js**: Fast and minimal web framework
- 🔄 **Hot Reload**: Development mode with automatic restart
- 📚 **Swagger Documentation**: Interactive API documentation with Swagger UI

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: JSON file-based storage
- **Documentation**: Swagger/OpenAPI 3.0 with Swagger UI

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. (Optional) Modify `.env` to change port:
```env
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
# Build TypeScript to JavaScript
npm run build

# Start the server
npm start
```

The server will start at `http://localhost:3000`

## API Documentation

### Swagger UI
Once the server is running, access the interactive API documentation at:

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The Swagger documentation provides:
- 📖 Complete API reference with all endpoints
- 🧪 Interactive testing interface - try API calls directly from the browser
- 📋 Request/response schemas with example values
- ✅ Validation rules and required fields
- 🎯 Query parameters and filters documentation

## API Endpoints

### Base URL
```
http://localhost:3000
```

### 1. List All Resources
```http
GET /api/resources
```

**Query Parameters** (optional):
- `type` - Filter by resource type
- `status` - Filter by status (active/inactive)
- `search` - Search in name and description

**Example:**
```bash
curl http://localhost:3000/api/resources
curl http://localhost:3000/api/resources?type=server&status=active
curl http://localhost:3000/api/resources?search=test
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "resource_1234567890_abc123",
      "name": "Test Resource",
      "description": "A test resource",
      "type": "server",
      "status": "active",
      "createdAt": "2026-01-25T10:00:00.000Z",
      "updatedAt": "2026-01-25T10:00:00.000Z",
      "metadata": {}
    }
  ]
}
```

### 2. Get Resource by ID
```http
GET /api/resources/:id
```

**Example:**
```bash
curl http://localhost:3000/api/resources/resource_1234567890_abc123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resource_1234567890_abc123",
    "name": "Test Resource",
    "description": "A test resource",
    "type": "server",
    "status": "active",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z",
    "metadata": {}
  }
}
```

### 3. Create a Resource
```http
POST /api/resources
Content-Type: application/json
```

**Required Fields:**
- `name` (string)
- `description` (string)
- `type` (string)

**Optional Fields:**
- `status` ("active" | "inactive") - defaults to "active"
- `metadata` (object)

**Example:**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Server",
    "description": "Production server instance",
    "type": "server",
    "status": "active",
    "metadata": {
      "cpu": "4 cores",
      "ram": "16GB"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "resource_1234567890_abc123",
    "name": "New Server",
    "description": "Production server instance",
    "type": "server",
    "status": "active",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z",
    "metadata": {
      "cpu": "4 cores",
      "ram": "16GB"
    }
  }
}
```

### 4. Update a Resource
```http
PUT /api/resources/:id
Content-Type: application/json
```

**All fields are optional:**
- `name` (string)
- `description` (string)
- `type` (string)
- `status` ("active" | "inactive")
- `metadata` (object)

**Example:**
```bash
curl -X PUT http://localhost:3000/api/resources/resource_1234567890_abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "metadata": {
      "cpu": "8 cores",
      "ram": "32GB"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "data": {
    "id": "resource_1234567890_abc123",
    "name": "New Server",
    "description": "Production server instance",
    "type": "server",
    "status": "inactive",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:30:00.000Z",
    "metadata": {
      "cpu": "8 cores",
      "ram": "32GB"
    }
  }
}
```

### 5. Delete a Resource
```http
DELETE /api/resources/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/resources/resource_1234567890_abc123
```

**Response:**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: name, description, type"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource with ID 'xyz' not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development mode only)"
}
```

## Project Structure

```
src/problem5/
├── src/
│   ├── config/
│   │   └── swagger.ts         # Swagger/OpenAPI configuration
│   ├── types/
│   │   └── resource.ts        # TypeScript interfaces
│   ├── database/
│   │   └── db.ts              # File-based database operations
│   ├── routes/
│   │   └── resources.ts       # CRUD route handlers with Swagger annotation
│   │   └── resources.ts       # CRUD route handlers
│   └── middleware/
│       └── errorHandler.ts    # Error handling middleware
├── data/
│   └── resources.json         # JSON database file (auto-created)
├── dist/                      # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Database

The application uses a simple JSON file-based database stored in `data/resources.json`. The file is automatically created on first run.

**Data Structure:**
```json
[
  {
    "id": "resource_1234567890_abc123",
    "name": "Resource Name",
    "description": "Resource Description",
    "type": "resource-type",
    "status": "active",
    "createdAt": "2026-01-25T10:00:00.000Z",
    "updatedAt": "2026-01-25T10:00:00.000Z",
    "metadata": {}
  }
]
```

## Testing with cURL

### Create a few test resources:
```bash
# Create resource 1
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Web Server","description":"Main production server","type":"server","status":"active"}'

# Create resource 2
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Database","description":"PostgreSQL instance","type":"database","status":"active"}'

# List all resources
curl http://localhost:3000/api/resources

# Filter by type
curl http://localhost:3000/api/resources?type=server

# Search
curl http://localhost:3000/api/resources?search=database
```

## Development

The server uses `ts-node-dev` for development, which provides:
- Automatic TypeScript compilation
- Hot reload on file changes
- Fast restart times

## Notes

- The database is stored in a JSON file for simplicity
- For production use, consider using a proper database (PostgreSQL, MongoDB, etc.)
- The server includes basic error handling and validation
- CORS is enabled for cross-origin requests

## License

ISC
