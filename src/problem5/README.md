# Express Task API

A modern Express.js application with TypeScript, PostgreSQL, and Prisma ORM.

## Features

- ✅ **TypeScript** - Full type safety and modern JavaScript features
- ✅ **Express.js** - Fast and minimalist web framework
- ✅ **PostgreSQL** - Reliable and powerful relational database
- ✅ **Prisma ORM** - Next-generation ORM with type-safe database access
- ✅ **CORS** - Enabled for all routes
- ✅ **Input Validation** - Using Joi schema validation
- ✅ **Request Logging** - Using Morgan middleware
- ✅ **Error Handling** - Global error handling middleware
- ✅ **Soft Deletes** - Tasks can be soft deleted and restored
- ✅ **Unit Tests** - Comprehensive unit tests with Jest
- ✅ **Integration Tests** - API endpoint integration tests with Supertest
- ✅ **Swagger/OpenAPI Docs** - Interactive API documentation at `/api-docs`
- ✅ **Docker Support** - Dockerfile and docker-compose for easy deployment
- ✅ **Environment Variables** - Secure configuration with dotenv
- ✅ **Database Migrations** - Version-controlled schema changes with Prisma
- ✅ **Seeding** - Sample data seeding script

## Project Structure

```
express-task-api/
├── src/
│   ├── config/
│   │   └── database.ts           # Prisma client configuration
│   ├── controllers/
│   │   └── task.controller.ts    # Request handlers
│   ├── middlewares/
│   │   ├── error.middleware.ts   # Global error handler
│   │   └── notfound.middleware.ts # 404 handler
│   ├── routes/
│   │   └── task.routes.ts        # API routes
│   ├── services/
│   │   └── task.service.ts       # Business logic
│   ├── types/
│   │   └── task.types.ts         # TypeScript interfaces and types
│   ├── utils/
│   │   └── validation.ts         # Joi validation schemas
│   └── index.ts                  # Application entry point
├── tests/
│   ├── unit/
│   │   └── task.service.test.ts  # Unit tests
│   ├── integration/
│   │   └── task.api.test.ts      # Integration tests
│   └── setup.ts                  # Test configuration
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding script
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── .dockerignore                 # Docker ignore rules
├── Dockerfile                    # Docker image configuration
├── docker-compose.yml            # Docker compose configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest testing configuration
├── package.json                  # Project dependencies and scripts
└── README.md                     # This file
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **PostgreSQL** >= 14.x (or use Docker)
- **Docker** (optional, for containerized setup)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd express-task-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and update it with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb?schema=public"
```

### 4. Set up the database

#### Option A: Using Docker (Recommended)

Start PostgreSQL using Docker Compose:

```bash
npm run docker:up
```

This will start a PostgreSQL container with the configuration specified in `docker-compose.yml`.

#### Option B: Using Local PostgreSQL

Ensure PostgreSQL is running locally and create a database named `taskdb`.

### 5. Run database migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. (Optional) Seed the database

```bash
npm run prisma:seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will be running at `http://localhost:3000`.

## API Endpoints


### API Documentation (Swagger UI)

Interactive API docs are available at:

```
http://localhost:3000/api-docs
```

### Base URL

```
http://localhost:3000/api
```

### Health Check

```http
GET /health
```

Returns the API health status.

### Tasks

#### Get all tasks

```http
GET /api/tasks
```

Query Parameters:
- `includeDeleted` (optional): `true` to include soft-deleted tasks

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "TODO",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ],
  "count": 1
}
```

#### Get task by ID

```http
GET /api/tasks/:id
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "TODO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
}
```

#### Create a new task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "TODO"
}
```

- `title` (required): Task title (1-255 characters)
- `description` (optional): Task description (max 1000 characters)
- `status` (optional): One of `TODO`, `IN_PROGRESS`, `DONE` (default: `TODO`)

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "TODO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task created successfully"
}
```

#### Update a task

```http
PATCH /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "IN_PROGRESS"
}
```

All fields are optional. At least one field must be provided.

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "description": "Task description",
    "status": "IN_PROGRESS",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task updated successfully"
}
```

#### Delete a task

```http
DELETE /api/tasks/:id
```

Query Parameters:
- `hard` (optional): `true` for permanent deletion (default: soft delete)

Response:

```json
{
  "success": true,
  "message": "Task soft deleted successfully"
}
```

#### Restore a soft-deleted task

```http
POST /api/tasks/:id/restore
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "TODO",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  "message": "Task restored successfully"
}
```

## Database Schema

### Task Model

| Field       | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | UUID      | Primary key, auto-generated          |
| title       | String    | Task title (required)                |
| description | String?   | Task description (optional)          |
| status      | Enum      | TODO, IN_PROGRESS, or DONE           |
| createdAt   | DateTime  | Timestamp of creation                |
| updatedAt   | DateTime  | Timestamp of last update             |
| deletedAt   | DateTime? | Timestamp of soft deletion (nullable)|

## Testing

### Run all tests

```bash
npm test
```

### Run unit tests only

```bash
npm run test:unit
```

### Run integration tests only

```bash
npm run test:integration
```

### Run tests in watch mode

```bash
npm run test:watch
```

### View test coverage

Test coverage reports are generated in the `coverage/` directory after running tests.

## Scripts

| Script              | Description                                    |
|---------------------|------------------------------------------------|
| `npm run dev`       | Start development server with hot reload       |
| `npm run build`     | Build TypeScript to JavaScript                 |
| `npm start`         | Start production server                        |
| `npm test`          | Run all tests with coverage                    |
| `npm run test:unit` | Run unit tests only                            |
| `npm run test:integration` | Run integration tests only          |
| `npm run test:watch` | Run tests in watch mode                       |
| `npm run prisma:generate` | Generate Prisma Client                  |
| `npm run prisma:migrate` | Run database migrations              |
| `npm run prisma:studio` | Open Prisma Studio (database GUI)     |
| `npm run prisma:seed` | Seed database with sample data          |
| `npm run docker:up` | Start Docker containers                        |
| `npm run docker:down` | Stop Docker containers                       |

## Docker Deployment

### Using Docker Compose

1. Make sure Docker and Docker Compose are installed
2. Update environment variables in `docker-compose.yml` if needed
3. Run:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL container
- Build and start the API container
- Run database migrations automatically
- Expose the API on port 3000

### Stop the containers

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f app
```

## Error Handling

The API includes comprehensive error handling:

### Validation Errors (400)

```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"]
  }
}
```

### Not Found Errors (404)

```json
{
  "message": "Task not found",
  "statusCode": 404
}
```

### Server Errors (500)

```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma** - ORM and database toolkit
- **Joi** - Schema validation
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Swagger UI & swagger-jsdoc** - API documentation
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library
- **ts-node** - TypeScript execution
- **ts-node-dev** - Development server with hot reload
- **Docker** - Containerization

## Best Practices Implemented

1. **Clean Architecture** - Separation of concerns with controllers, services, and routes
2. **Type Safety** - Full TypeScript coverage with strict mode
3. **Input Validation** - Schema-based validation using Joi
4. **Error Handling** - Centralized error handling middleware
5. **Database Management** - Migrations and seeding with Prisma
6. **Testing** - Comprehensive unit and integration tests
7. **Logging** - Request logging with Morgan
8. **Security** - CORS enabled, environment variables for sensitive data
9. **Soft Deletes** - Data preservation with restore functionality
10. **Docker** - Containerized deployment for consistency
11. **API Documentation** - Automated and interactive API docs with Swagger/OpenAPI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. If you add or update API endpoints, please update the Swagger annotations in the code so the documentation stays current. You can preview the docs at `/api-docs` while running the app.
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.
