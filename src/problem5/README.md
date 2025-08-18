# Problem 5: Modern ExpressJS v5 CRUD API

A production-ready RESTful API built with ExpressJS v5, TypeScript, Sequelize ORM, and PostgreSQL following 2025 best practices.

## 🚀 Features

- **Modern ExpressJS v5** with TypeScript
- **Sequelize ORM** with PostgreSQL database
- **Complete CRUD operations** for resource management
- **Input validation** with Joi schemas
- **Comprehensive error handling** with custom error classes
- **Structured logging** with Pino
- **Security** with Helmet and CORS
- **Docker** containerization for easy deployment
- **Automatic database initialization** with migrations and seeding
- **Health checks** and monitoring endpoints
- **Full type safety** with zero `any` types

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose (recommended)
- PostgreSQL (if running without Docker)

## ⚡ One-Command Quick Start

**Start the entire application with one command:**

```bash
cd src/problem5 && docker compose up -d
```

That's it! The API will be available at `http://localhost:3000/api` with:

- Database automatically initialized with tables and sample data
- All services running in containers
- Ready for testing immediately

**Verify it's working:**

```bash
curl http://localhost:3000/api/health
```

## 🔧 Local Development Setup

If you prefer to run without Docker:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start PostgreSQL database:**

   ```bash
   # Using Docker for database only
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=problem5_db -p 5432:5432 -d postgres:16-alpine
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The database will be automatically initialized on first startup with tables and sample data.

## 🗄️ Database Information

- **ORM**: Sequelize with PostgreSQL
- **Auto-initialization**: Database tables and sample data are created automatically on startup
- **Sample data**: 5 pre-loaded resources for testing
- **Type safety**: Full TypeScript integration with Sequelize models

### Manual Database Commands

```bash
# Build the project first
npm run build

# Run migrations only
npm run db:migrate

# Seed sample data only
npm run db:seed

# Complete setup (migrate + seed)
npm run db:setup

# Force reset (drop all tables, then migrate + seed)
npm run db:setup:force
```

## 📚 API Documentation

### Base URL: `http://localhost:3000/api`

### Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string
}
```

### Endpoints

| Method | Endpoint         | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| GET    | `/health`        | Health check                                 |
| GET    | `/resources`     | List all resources with pagination/filtering |
| GET    | `/resources/:id` | Get specific resource                        |
| POST   | `/resources`     | Create new resource                          |
| PUT    | `/resources/:id` | Update resource                              |
| DELETE | `/resources/:id` | Delete resource                              |

### Quick Examples

**Health Check:**

```bash
curl http://localhost:3000/api/health
```

**Create Resource:**

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Resource",
    "description": "A test resource",
    "category": "software",
    "status": "active"
  }'
```

**List Resources:**

```bash
curl "http://localhost:3000/api/resources?page=1&limit=10"
```

**Update Resource:**

```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

**Delete Resource:**

```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

### Query Parameters for GET /resources

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and description
- `category` (string): Filter by category
- `status` (string): Filter by status (active, inactive)
- `sort_by` (string): Sort field (name, created_at, updated_at)
- `sort_order` (string): Sort order (asc, desc)

## 🗄️ Database Schema

The API uses a single `resources` table with the following structure:

```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data**: 5 pre-loaded resources including User Management System, Conference Room A, Development Server, Legacy CRM System, and Training Materials.

## 🐳 Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f api

# Stop all services
docker compose down

# Rebuild and start
docker compose up --build -d
```

## 🔧 Environment Variables

The application uses sensible defaults. Key variables:

| Variable      | Default       | Description       |
| ------------- | ------------- | ----------------- |
| `PORT`        | `3000`        | Server port       |
| `DB_HOST`     | `localhost`   | Database host     |
| `DB_NAME`     | `problem5_db` | Database name     |
| `DB_USER`     | `postgres`    | Database user     |
| `DB_PASSWORD` | `postgres`    | Database password |

All environment variables can be configured via `.env` file or Docker environment.

## 🏗️ Project Structure

```
src/problem5/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers (resource.controller.ts)
│   ├── middleware/       # Error handling, validation
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes (resource.routes.ts)
│   ├── services/         # Business logic (resource.service.ts)
│   ├── scripts/          # Database migration/seeding scripts
│   ├── types/            # TypeScript type definitions
│   └── server.ts         # Main application entry
├── docker-compose.yml    # Docker services configuration
├── Dockerfile           # Container definition
├── package.json         # Dependencies and scripts
└── README.md           # This documentation
```

## 🧪 Testing

Use the included `api-test.http` file for easy testing with REST clients, or test manually:

```bash
# Health check
curl http://localhost:3000/api/health

# Create resource
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Resource", "description": "Test", "category": "test", "status": "active"}'

# List resources
curl "http://localhost:3000/api/resources?page=1&limit=10"
```

## 🚀 Production Deployment

For production deployment:

1. Set environment variables for your database
2. Use a managed PostgreSQL service
3. Configure HTTPS and security headers
4. Set up monitoring and logging
5. Configure automated backups

```bash
# Build production image
docker build --target production -t problem5-api .

# Deploy with production settings
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-prod-db \
  problem5-api
```

---

**Built with**: ExpressJS v5, TypeScript, Sequelize ORM, PostgreSQL, Docker
