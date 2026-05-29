# Express CRUD Backend Server

A Express backend with TypeScript that provides RESTful CRUD operations for resource management.
The server uses SQLite for data persistence.

## Features

- **CRUD Operations**: Create, Read, Update, Delete resources
- **TypeScript**: Full type safety with TypeScript
- **SQLite Database**: Persistent data storage
- **Filtering & Search**: Filter resources by category, status, and search by name/description
- **Pagination**: Limit and offset support for listing resources
- **Error Handling**: Comprehensive error handling and validation
- **CORS Support**: Cross-Origin Resource Sharing enabled
- **RESTful API**: Standard REST conventions

## Project Structure

``` graph
problem5/
├── src/
│   ├── server.ts                 # Main Express server
│   ├── controllers/
│   │   └── resourceController.ts # CRUD operations logic
│   ├── database/
│   │   └── index.ts              # SQLite database configuration
│   ├── middlewares/
│   │   └── errorHandler.ts       # Error handling middleware
│   ├── repositories/
│   │   └── resourceRepository.ts # Repositories to run sql command
│   ├── routes/
│   │   └── resourceRoutes.ts     # API route definitions
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Configuration

Set environment variables by creating a `.env` file or exporting them before running the server.

The server uses environment variables for configuration:

- `PORT`: Server port (default: `3000`)

## Installation

1. Navigate to the problem5 folder:

   ```bash
   cd src/problem5
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Building & Running

### Development Mode

Start the server with hot-reload using ts-node:

```bash
npm run dev
```

This will start the server at `http://localhost:3000`.

### Production Mode

First, build the TypeScript to JavaScript:

```bash
npm run build
```

Then start the compiled server:

```bash
npm start
```

## API Endpoints

### Base URL

```url
http://localhost:3000/api/resource
```

### 1. Create a Resource

**Endpoint**: `POST /api/resource`

**Request Body**:

```json
{
  "name": "Resource Name",
  "description": "Resource Description",
  "category": "Category Name",
  "status": "active"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "data": {
      "id": 1,
      "name": "Resource Name",
      "description": "Resource Description",
      "category": "Category Name",
      "status": "active",
      "createdAt": "2024-05-28T10:00:00.000Z",
      "updatedAt": "2024-05-28T10:00:00.000Z"
    }
  },
  "message": "Resource created successfully"
}
```

### 2. List Resources with Filters

**Endpoint**: `GET /api/resource`

**Query Parameters**:

- `category` (optional): Filter by category
- `status` (optional): Filter by status (`active` or `inactive`)
- `search` (optional): Search in name and description
- `limit` (optional, default: 10): Number of results per page
- `offset` (optional, default: 0): Pagination offset

**Example**:

```url
GET /api/resource?category=electronics&status=active&search=laptop&limit=20&offset=0
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "total": 1,
    "data": [
      {
        "id": 1,
        "name": "Laptop",
        "description": "High-performance laptop",
        "category": "electronics",
        "status": "active",
        "createdAt": "2024-05-28T10:00:00.000Z",
        "updatedAt": "2024-05-28T10:00:00.000Z"
      }
    ]
  }
  "message": "Retrieved 1 resources"
}
```

### 3. Get Resource Details

**Endpoint**: `GET /api/resource/:id`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "data": {
      "id": 1,
      "name": "Resource Name",
      "description": "Resource Description",
      "category": "Category Name",
      "status": "active",
      "createdAt": "2024-05-28T10:00:00.000Z",
      "updatedAt": "2024-05-28T10:00:00.000Z"
    }
  },
  "message": "Resource retrieved successfully"
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 4. Update Resource

**Endpoint**: `PUT /api/resource/:id`

**Request Body** (all fields optional):

```json
{
  "name": "Updated Name",
  "description": "Updated Description",
  "category": "Updated Category",
  "status": "inactive"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "data": {
      "id": 1,
      "name": "Updated Name",
      "description": "Updated Description",
      "category": "Updated Category",
      "status": "inactive",
      "createdAt": "2024-05-28T10:00:00.000Z",
      "updatedAt": "2024-05-28T10:30:00.000Z"
    }
  },
  "message": "Resource updated successfully"
}
```

### 5. Delete Resource

**Endpoint**: `DELETE /api/resource/:id`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

**Error Response** (404 Not Found):

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-05-28T10:00:00.000Z"
}
```

## Testing the API

### Using cURL

**Create a resource**:

```bash
curl -X POST http://localhost:3000/api/resource \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "electronics",
    "status": "active"
  }'
```

**List all resources**:

```bash
curl http://localhost:3000/api/resource
```

**Filter resources by category**:

```bash
curl "http://localhost:3000/api/resource?category=electronics"
```

**Search resources**:

```bash
curl "http://localhost:3000/api/resource?search=laptop"
```

**Get a specific resource**:

```bash
curl http://localhost:3000/api/resource/1
```

**Update a resource**:

```bash
curl -X PUT http://localhost:3000/api/resource/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

**Delete a resource**:

```bash
curl -X DELETE http://localhost:3000/api/resource/1
```

### Using Postman

#### Create a Postman collection by below steps

1. Import the endpoints listed above into Postman
2. Set the request type (GET, POST, PUT, DELETE)
3. Add appropriate headers (Content-Type: application/json for POST/PUT)
4. Add request body where needed
5. Send the request and view the response

#### Import from my example Postman collection

```url
https://speeding-trinity-9694.postman.co/workspace/My-Workspace~8a74d211-49df-43f3-808f-d866d7ad7556/folder/4360852-a4714a13-ed3d-4766-b44e-236f481dcd92?action=share&creator=4360852&ctx=documentation&active-environment=4360852-c5ccdcc2-640a-4d8f-a662-0640f14b1e60
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Invalid input or missing required fields
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

All error responses follow this format, includes error code above:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Database

The server uses SQLite with the following schema:

**resources table**:

```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

The database file (`resources.db`) is automatically created on the first run in the project root.

## Troubleshooting

### Port already in use

If port 3000 is already in use, set a different PORT:

```bash
PORT=3001 npm run dev
```

### Database locked

If you get a database locked error:

1. Ensure only one server instance is running
2. Delete `resources.db` and restart (this will clear all data)
