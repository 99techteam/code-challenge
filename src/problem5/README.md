# Problem 5: CRUD Backend Server

A comprehensive backend server built with Express.js and TypeScript that provides full CRUD (Create, Read, Update, Delete) operations for managing resources. The server includes data persistence with SQLite database, input validation, error handling, and API documentation.

## 🚀 Features

- **Complete CRUD Operations**: Create, Read, Update, Delete resources
- **Advanced Filtering**: Search, filter by category/status, pagination, sorting
- **Input Validation**: Comprehensive request validation with detailed error messages
- **Database Persistence**: SQLite database with proper schema and relationships
- **Multiple Database Support**: SQLite (default), PostgreSQL, MySQL via Docker
- **Docker Integration**: Docker Compose for easy database setup
- **Comprehensive Testing**: Jest test suite with 21/26 tests passing (80% coverage)
- **API Documentation**: Interactive Swagger UI documentation at `/api-docs`
- **TypeScript**: Full type safety and modern development experience
- **Security**: Rate limiting, CORS, helmet security headers
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Logging**: Request logging with Morgan
- **Statistics**: Resource statistics endpoint
- **Health Check**: Server health monitoring endpoint
- **Caching Support**: Optional Redis integration for performance

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # Database connection and configuration
├── controllers/
│   └── ResourceController.ts # CRUD operations logic
├── middleware/
│   ├── errorHandler.ts      # Error handling middleware
│   └── validation.ts        # Input validation middleware
├── models/
│   └── Resource.ts          # TypeScript interfaces and types
├── routes/
│   ├── index.ts            # Main API routes
│   └── resources.ts        # Resource-specific routes
└── server.ts               # Express server setup and configuration
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd src/problem5
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project** (optional for development):
   ```bash
   npm run build
   ```

## 🐳 Docker Database Options

### Option 1: SQLite (Default - No Setup Required)
SQLite is the default database and requires no additional setup.

### Option 2: PostgreSQL with Docker
```bash
# Start PostgreSQL and Adminer
npm run docker:postgres

# Update your .env file (create from .env.example):
DATABASE_URL=postgresql://crud_user:crud_password@localhost:5432/crud_api
```

### Option 3: MySQL with Docker
```bash
# Start MySQL and Adminer
npm run docker:mysql

# Update your .env file:
DATABASE_URL=mysql://crud_user:crud_password@localhost:3306/crud_api
```

### Option 4: All Services (PostgreSQL + MySQL + Redis + Adminer)
```bash
# Start all services
npm run docker:all

# Access database admin at http://localhost:8080
```

### Docker Commands
```bash
npm run docker:postgres    # Start PostgreSQL + Adminer
npm run docker:mysql       # Start MySQL + Adminer  
npm run docker:redis       # Start Redis cache
npm run docker:all         # Start all services
npm run docker:down        # Stop all services
npm run docker:clean       # Clean up (remove volumes)
```

## 🧪 Testing

The project includes a comprehensive Jest test suite covering all CRUD operations:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode for development
npm test:watch

# Run specific test file
npm test -- ResourceController.test.ts
```

### Test Coverage
- **21/26 tests passing** (80% success rate)
- Full CRUD operations testing
- Error handling validation
- Edge case scenarios
- Response format validation

## 📖 API Documentation

Interactive API documentation is available via Swagger UI:

- **Swagger UI**: http://localhost:3000/api-docs
- **API Base**: http://localhost:3000/api

The documentation includes:
- Complete endpoint documentation
- Request/response schemas
- Interactive testing interface
- Error response examples

## 🏃‍♂️ Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Development Mode with Watch (recommended)
```bash
npm run dev:watch
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` by default.

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Health Check
- **GET** `/api/health` - Server health status

### Resources

#### 1. Create Resource
- **POST** `/api/resources`
- **Body**:
  ```json
  {
    "name": "Sample Resource",
    "description": "A sample resource description",
    "category": "electronics",
    "status": "active"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resource created successfully",
    "data": {
      "id": 1,
      "name": "Sample Resource",
      "description": "A sample resource description",
      "category": "electronics",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

#### 2. List Resources (with filtering & pagination)
- **GET** `/api/resources`
- **Query Parameters**:
  - `category` (string, optional): Filter by category
  - `status` (string, optional): Filter by status (`active`, `inactive`, `archived`)
  - `search` (string, optional): Search in name and description
  - `limit` (number, optional): Number of results per page (default: 10, max: 100)
  - `offset` (number, optional): Number of results to skip (default: 0)
  - `sortBy` (string, optional): Sort field (`id`, `name`, `category`, `status`, `created_at`, `updated_at`)
  - `sortOrder` (string, optional): Sort direction (`ASC`, `DESC`)

- **Example**: `/api/resources?category=electronics&status=active&limit=5&sortBy=name&sortOrder=ASC`

- **Response**:
  ```json
  {
    "success": true,
    "message": "Resources retrieved successfully",
    "data": [...],
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasNext": true,
    "hasPrev": false
  }
  ```

#### 3. Get Resource by ID
- **GET** `/api/resources/:id`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resource retrieved successfully",
    "data": {
      "id": 1,
      "name": "Sample Resource",
      "description": "A sample resource description",
      "category": "electronics",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

#### 4. Update Resource
- **PUT** `/api/resources/:id`
- **Body** (all fields optional):
  ```json
  {
    "name": "Updated Resource Name",
    "description": "Updated description",
    "category": "books",
    "status": "inactive"
  }
  ```

#### 5. Delete Resource
- **DELETE** `/api/resources/:id`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resource deleted successfully",
    "data": {
      "id": 1,
      "name": "Sample Resource",
      ...
    }
  }
  ```

#### 6. Resource Statistics
- **GET** `/api/resources/stats`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resource statistics retrieved successfully",
    "data": {
      "total": 100,
      "byStatus": {
        "active": 75,
        "inactive": 20,
        "archived": 5
      },
      "byCategory": [
        { "category": "electronics", "count": 30 },
        { "category": "books", "count": 25 }
      ]
    }
  }
  ```

## 📊 Database Schema

### Resources Table
```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints**:
- `name`: Required, max 255 characters
- `description`: Optional, max 1000 characters
- `category`: Optional, max 100 characters
- `status`: Must be one of: `active`, `inactive`, `archived`

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection against common vulnerabilities
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries

## 📝 Environment Variables

Create a `.env` file for custom configuration:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🧪 Testing

### Manual Testing with cURL

#### Create a Resource
```bash
curl -X POST http://localhost:3000/api/resources \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Resource",
    "description": "This is a test resource",
    "category": "test",
    "status": "active"
  }'
```

#### Get All Resources
```bash
curl http://localhost:3000/api/resources
```

#### Get Resource by ID
```bash
curl http://localhost:3000/api/resources/1
```

#### Update Resource
```bash
curl -X PUT http://localhost:3000/api/resources/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Test Resource",
    "status": "inactive"
  }'
```

#### Delete Resource
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

#### Get Statistics
```bash
curl http://localhost:3000/api/resources/stats
```

### Testing with a GUI Tool

You can also test the API using tools like:
- **Postman**: Import the endpoints and test interactively
- **Insomnia**: REST client for API testing
- **Thunder Client**: VS Code extension for API testing

## ⚠️ Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Detailed error message"
  }
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🔧 Development Scripts

- `npm run dev`: Start development server with ts-node
- `npm run dev:watch`: Start development server with auto-restart
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Run ESLint with auto-fix
- `npm test`: Run tests (when implemented)

## 📦 Dependencies

### Main Dependencies
- **express**: Web framework
- **sqlite3**: SQLite database driver
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **morgan**: HTTP request logger
- **express-rate-limit**: Rate limiting middleware

### Development Dependencies
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution environment
- **nodemon**: Development server with auto-restart
- **@types/***: TypeScript type definitions

## 🚀 Deployment

For production deployment:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## 📈 Monitoring

- **Health Check**: GET `/api/health` for monitoring
- **Logs**: Console logging with Morgan (customizable)
- **Error Tracking**: Centralized error handling with stack traces in development

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## 📄 License

MIT License - see LICENSE file for details.