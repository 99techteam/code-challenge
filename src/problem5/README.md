# CRUD Server

A simple CRUD (Create, Read, Update, Delete) server built with ExpressJS and TypeScript. This server provides a complete REST API for managing user resources with SQLite database persistence.

## Features

- ✅ **Complete CRUD Operations**: Create, Read, Update, Delete users
- ✅ **TypeScript**: Full type safety and better development experience
- ✅ **SQLite Database**: Lightweight database for data persistence
- ✅ **Input Validation**: Joi validation for request data
- ✅ **Error Handling**: Comprehensive error handling and responses
- ✅ **Pagination**: Built-in pagination for listing resources
- ✅ **Filtering**: Advanced filtering options for user queries
- ✅ **Security**: Helmet for security headers and CORS support
- ✅ **Logging**: Morgan for request logging
- ✅ **API Documentation**: Self-documenting API endpoints

## Project Structure

```
src/problem5/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── UserController.ts
│   ├── services/            # Business logic
│   │   └── UserService.ts
│   ├── models/              # Database models
│   │   └── Database.ts
│   ├── routes/              # API routes
│   │   ├── index.ts
│   │   └── userRoutes.ts
│   ├── middleware/          # Express middleware
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── validation.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── config/              # Configuration
│   │   └── index.ts
│   └── server.ts            # Main server file
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd code-challenge/src/problem5
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your preferred settings:

   ```env
   PORT=3000
   NODE_ENV=development
   DB_PATH=./database.sqlite
   API_VERSION=v1
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Other Commands

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
```

## API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### User Management

#### 1. Create User

```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Get All Users

```http
GET /api/v1/users
```

**Query Parameters:**

- `name` (string): Filter by name (partial match)
- `email` (string): Filter by email (partial match)
- `minAge` (number): Minimum age filter
- `maxAge` (number): Maximum age filter
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Example:**

```http
GET /api/v1/users?name=John&minAge=25&page=1&limit=5
```

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

#### 3. Get User by ID

```http
GET /api/v1/users/:id
```

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Update User

```http
PUT /api/v1/users/:id
Content-Type: application/json

{
  "name": "John Smith",
  "age": 31
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "age": 31,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 5. Delete User

```http
DELETE /api/v1/users/:id
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "v1"
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Validation Rules

### Create User

- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `age`: Required, integer, 1-120

### Update User

- `name`: Optional, 2-50 characters
- `email`: Optional, valid email format, unique
- `age`: Optional, integer, 1-120

## Testing the API

### Using curl

1. **Create a user:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/users \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","age":30}'
   ```

2. **Get all users:**

   ```bash
   curl http://localhost:3000/api/v1/users
   ```

3. **Get user by ID:**

   ```bash
   curl http://localhost:3000/api/v1/users/1
   ```

4. **Update user:**

   ```bash
   curl -X PUT http://localhost:3000/api/v1/users/1 \
     -H "Content-Type: application/json" \
     -d '{"name":"John Smith","age":31}'
   ```

5. **Delete user:**
   ```bash
   curl -X DELETE http://localhost:3000/api/v1/users/1
   ```

### Using Postman

Import the following collection or create requests manually:

1. **Base URL:** `http://localhost:3000/api/v1`
2. **Create User:** `POST /users`
3. **Get Users:** `GET /users`
4. **Get User:** `GET /users/:id`
5. **Update User:** `PUT /users/:id`
6. **Delete User:** `DELETE /users/:id`

## Configuration

### Environment Variables

| Variable      | Default           | Description               |
| ------------- | ----------------- | ------------------------- |
| `PORT`        | 3000              | Server port               |
| `NODE_ENV`    | development       | Environment mode          |
| `DB_PATH`     | ./database.sqlite | SQLite database file path |
| `API_VERSION` | v1                | API version               |

### Development vs Production

- **Development**: Detailed error messages, request logging
- **Production**: Generic error messages, minimal logging

## Dependencies

### Production Dependencies

- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Security headers
- `morgan` - HTTP request logger
- `sqlite3` - SQLite database driver
- `joi` - Data validation
- `dotenv` - Environment variables

### Development Dependencies

- `typescript` - TypeScript compiler
- `@types/*` - TypeScript type definitions
- `ts-node-dev` - Development server
- `eslint` - Code linting
- `jest` - Testing framework

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Change port in .env file
   PORT=3001
   ```

2. **Database file permissions:**

   ```bash
   # Ensure write permissions for database directory
   chmod 755 .
   ```

3. **TypeScript compilation errors:**

   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

4. **Module not found errors:**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## License

MIT License - feel free to use this project for learning and development purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For questions or issues, please create an issue in the repository or contact the development team.
