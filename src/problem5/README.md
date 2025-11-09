# Problem 5: CRUD API Backend Server

A RESTful CRUD API backend server built with **Express.js** and **TypeScript**, featuring complete resource management with data persistence using SQLite database.

## 🌟 Features

- ✅ **Full CRUD Operations**: Create, Read, List, Update, and Delete resources
- ✅ **TypeScript**: Fully typed codebase for better development experience
- ✅ **Database Persistence**: SQLite database for reliable data storage
- ✅ **Advanced Filtering**: List resources with category, status, and search filters
- ✅ **Pagination**: Support for limit and offset parameters
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **REST API**: RESTful API design following best practices
- ✅ **CORS Enabled**: Cross-Origin Resource Sharing support

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

## 🚀 Installation

1. **Install dependencies:**

```bash
cd src/problem5
npm install
```

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```

### Quick Start (no build required)

```bash
npm run start:dev
```

The server will start at **http://localhost:3000**

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Test Results

The test suite includes **22 comprehensive tests** covering:
- ✅ POST - Create resources with validation
- ✅ GET - List resources with filters and pagination
- ✅ GET - Fetch individual resources
- ✅ PUT - Update resources
- ✅ DELETE - Remove resources
- ✅ Error handling and edge cases
- ✅ Response format consistency

**Coverage:**
- Controllers: 81.42%
- Services: 92.75%
- Routes: 100%
- Overall: 77.34%

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. **Health Check**
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "message": "CRUD API Server is running",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

---

#### 2. **Create a Resource**
```http
POST /api/resources
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Product A",
  "description": "This is a sample product",
  "category": "electronics",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product A",
    "description": "This is a sample product",
    "category": "electronics",
    "status": "active",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
  },
  "message": "Resource created successfully"
}
```

**Validation:**
- `name` (required): Non-empty string
- `description` (optional): String
- `category` (optional): String
- `status` (optional): String (default: "active")

---

#### 3. **List Resources with Filters**
```http
GET /api/resources?category=electronics&status=active&search=product&limit=10&offset=0
```

**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `search` (optional): Search in name and description
- `limit` (optional): Number of results per page
- `offset` (optional): Starting position (for pagination)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": 1,
        "name": "Product A",
        "description": "This is a sample product",
        "category": "electronics",
        "status": "active",
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-01-15 10:30:00"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### 4. **Get a Single Resource**
```http
GET /api/resources/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product A",
    "description": "This is a sample product",
    "category": "electronics",
    "status": "active",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

---

#### 5. **Update a Resource**
```http
PUT /api/resources/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Product A",
  "description": "Updated description",
  "category": "gadgets",
  "status": "inactive"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Product A",
    "description": "Updated description",
    "category": "gadgets",
    "status": "inactive",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 11:45:00"
  },
  "message": "Resource updated successfully"
}
```

---

#### 6. **Delete a Resource**
```http
DELETE /api/resources/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

---

## 🗄️ Database

The application uses **SQLite** for data persistence with the following schema:

### Resources Table

| Column       | Type     | Description                    |
|-------------|----------|--------------------------------|
| id          | INTEGER  | Primary key (auto-increment)   |
| name        | TEXT     | Resource name (required)       |
| description | TEXT     | Resource description           |
| category    | TEXT     | Resource category              |
| status      | TEXT     | Resource status (default: 'active') |
| created_at  | DATETIME | Creation timestamp             |
| updated_at  | DATETIME | Last update timestamp          |

**Database file:** `database.sqlite` (created automatically in the project root)

**Indexes:**
- `idx_category` on `category` column
- `idx_status` on `status` column

---

## 🧪 Testing with cURL

### Create a resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "electronics",
    "status": "active"
  }'
```

### List all resources
```bash
curl http://localhost:3000/api/resources
```

### List with filters
```bash
curl "http://localhost:3000/api/resources?category=electronics&status=active&limit=10"
```

### Get a specific resource
```bash
curl http://localhost:3000/api/resources/1
```

### Update a resource
```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "status": "inactive"
  }'
```

### Delete a resource
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

---

## 📁 Project Structure

```
src/problem5/
├── src/
│   ├── controllers/
│   │   └── resourceController.ts    # Request handlers
│   ├── routes/
│   │   └── resourceRoutes.ts        # API route definitions
│   ├── services/
│   │   └── resourceService.ts       # Business logic & DB operations
│   ├── database.ts                  # Database initialization
│   ├── types.ts                     # TypeScript interfaces
│   └── index.ts                     # Express app setup
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── database.sqlite                  # SQLite database file (auto-created)
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 🛠️ Configuration

### Environment Variables

You can configure the server using environment variables:

```bash
# Server port (default: 3000)
PORT=3000

# Node environment
NODE_ENV=development
```

Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
```

---

## 🔍 Error Handling

The API returns consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Name is required and must be a non-empty string"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📝 TypeScript Types

```typescript
interface Resource {
  id?: number;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface ResourceFilters {
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

---

## 🚦 Development

### Build the project
```bash
npm run build
```

### Watch mode (auto-reload)
```bash
npm run dev
```

### View database
```bash
sqlite3 database.sqlite
.tables
SELECT * FROM resources;
```

---

## 📦 Dependencies

### Production
- **express**: Web framework
- **better-sqlite3**: SQLite database driver
- **cors**: CORS middleware

### Development
- **typescript**: TypeScript compiler
- **tsx**: TypeScript execution
- **@types/express**: Express type definitions
- **@types/better-sqlite3**: SQLite type definitions
- **@types/cors**: CORS type definitions
- **@types/node**: Node.js type definitions

---

## ✅ Features Implemented

- [x] Create a resource (POST)
- [x] List resources with filters (GET)
- [x] Get resource details (GET)
- [x] Update resource (PUT)
- [x] Delete resource (DELETE)
- [x] Database persistence (SQLite)
- [x] TypeScript implementation
- [x] Input validation
- [x] Error handling
- [x] Pagination support
- [x] Search functionality
- [x] CORS support
- [x] Request logging

---

## 📄 License

ISC

---

## 👨‍💻 Author

Built with ❤️ using Express.js and TypeScript

