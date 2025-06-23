# Problem 5: Express.js CRUD API Service

A robust backend service built with Express.js and TypeScript that provides a complete CRUD (Create, Read, Update, Delete) interface for resource management. The service includes database persistence, comprehensive API documentation, and testing capabilities.

## Features

### Core Functionality
- **Create Resource**: Add new resources to the system
- **List Resources**: Retrieve resources with filtering and pagination
- **Get Resource Details**: Fetch specific resource information
- **Update Resource**: Modify existing resource data
- **Delete Resource**: Remove resources from the system

### Technical Features
- **TypeScript**: Fully typed codebase for better development experience
- **Database Integration**: PostgreSQL with TypeORM for robust data persistence
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Testing**: Unit and integration tests included
- **Logging**: Structured logging for debugging and monitoring

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM 0.3.x
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest
- **Validation**: Express-validator
- **Environment**: dotenv

## Project Structure

```
src/problem5/
├── app.ts                      # Main application entry point
├── config/                     # Configuration files
│   ├── data-source.ts         # TypeORM data source configuration
│   └── db.ts                  # Database connection setup
├── controller/                 # Request handlers
│   └── resource.controller.ts # Resource CRUD operations
├── model/                      # Data models and interfaces
│   └── resource.model.ts      # Resource model definition
├── route/                      # API route definitions
│   └── resource.route.ts      # Resource API routes
├── tests/                      # Test files
│   └── resource.controller.test.ts # Controller tests
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # This documentation
```

## Prerequisites

Before running the application, ensure you have:

- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 14 or higher
- **npm**: Version 8 or higher (comes with Node.js)

## Installation & Setup

### 1. Clone and Navigate

```bash
cd src/problem5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database for the application:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE crud_api_db;

-- Create user (optional)
CREATE USER crud_api_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crud_api_db TO crud_api_user;
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=crud_api_user
DB_PASSWORD=your_password
DB_NAME=crud_api_db

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### 5. Database Migration

The application uses TypeORM with `synchronize: true` for development, which automatically creates tables based on your entities.

For production, you should use proper migrations:

```bash
# Generate migration
npm run migration:generate -- --name InitialMigration

# Run migrations
npm run migration:run
```

## Running the Application

### Development Mode

```bash
# Start with auto-reload
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Using Docker (Optional)

```bash
# Build Docker image
docker build -t crud-api .

# Run with Docker Compose
docker-compose up -d
```

## API Documentation

Once the server is running, you can access:

- **API Base URL**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## API Endpoints

### Resource Management

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/resources` | List all resources | - |
| `GET` | `/api/resources/:id` | Get resource by ID | - |
| `POST` | `/api/resources` | Create new resource | `{ name, description }` |
| `PUT` | `/api/resources/:id` | Update resource | `{ name, description }` |
| `DELETE` | `/api/resources/:id` | Delete resource | - |

### Request/Response Examples

#### Create Resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Resource",
    "description": "This is a sample resource"
  }'
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Sample Resource",
  "description": "This is a sample resource",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

#### List Resources
```bash
curl http://localhost:3000/api/resources
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Sample Resource",
    "description": "This is a sample resource",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Resource by ID
```bash
curl http://localhost:3000/api/resources/1
```

#### Update Resource
```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Resource",
    "description": "Updated description"
  }'
```

#### Delete Resource
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

## Database Schema

### Resources Table

```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```typescript
// Example test case
describe('Resource Controller', () => {
  it('should create a new resource', async () => {
    const resourceData = {
      name: 'Test Resource',
      description: 'Test Description'
    };

    const response = await request(app)
      .post('/api/resources')
      .send(resourceData)
      .expect(201);

    expect(response.body.name).toBe(resourceData.name);
    expect(response.body.id).toBeDefined();
  });
});
```

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

```json
{
  "error": "Resource not found",
  "status": 404,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Available Scripts

```bash
# Development
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Database
npm run migration:generate  # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_PORT` | Database port | `5432` | Yes |
| `DB_USER` | Database username | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | - | Yes |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

## Deployment

### Production Checklist

1. **Environment Variables**: Set production values
2. **Database Migrations**: Run `npm run migration:run`
3. **Build Application**: Run `npm run build`
4. **Process Manager**: Use PM2 or similar for process management
5. **Reverse Proxy**: Configure NGINX for production
6. **Monitoring**: Set up logging and monitoring

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=crud_api_db
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=crud_api_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Monitoring & Logging

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Logging

The application uses structured logging with different levels:

- `error`: Error messages
- `warn`: Warning messages
- `info`: General information
- `debug`: Debugging information

## Security Considerations

### Input Validation
- All inputs are validated using express-validator
- SQL injection prevention through parameterized queries
- XSS protection with proper sanitization

### Best Practices
- Use environment variables for sensitive data
- Implement rate limiting for production
- Add authentication/authorization as needed
- Regular security audits with `npm audit`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U your_user -d your_database
```

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**TypeScript Compilation Errors:**
```bash
# Clear TypeScript cache
npm run build -- --force

# Check TypeScript configuration
npx tsc --showConfig
```

## License

This project is part of a coding challenge and is for educational purposes.

## Support

For questions or issues:
- Check the [API Documentation](http://localhost:3000/api-docs)
- Review the test files for usage examples
- Create an issue in the repository
