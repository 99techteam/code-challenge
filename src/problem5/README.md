# Book CRUD API Server

A RESTful API server built with ExpressJS, TypeScript, MikroORM, and PostgreSQL for managing books with full CRUD operations.

## Tech Stack & Libraries

### Core Framework
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript

### Database & ORM
- **PostgreSQL** - Relational database
- **MikroORM** - TypeScript ORM with decorators

### Validation & Documentation
- **Zod** - TypeScript-first schema validation
- **@asteasolutions/zod-to-openapi** - OpenAPI documentation generation
- **Swagger UI Express** - API documentation interface

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **Morgan** - HTTP request logger

### Utilities
- **Winston** - Logging library
- **UUID** - Unique identifier generation
- **reflect-metadata** - Metadata reflection for decorators
- **dotenv** - Environment variable management

### Development Tools
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **ESLint** - Code linting
- **ts-node-dev** - Development server with hot reload

## Scripts

### Development
```bash
yarn dev              # Start development server with hot reload
yarn dev:nodemon      # Start with nodemon
```

### Production
```bash
yarn build            # Build TypeScript to JavaScript
yarn start            # Start production server
```

### Testing
```bash
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage
yarn test:ci          # Run tests for CI/CD
yarn test:unit        # Run unit tests only
yarn test:integration # Run integration tests only
```

### Database Operations
```bash
yarn migration:create # Create a new migration
yarn migration:up     # Run pending migrations
yarn migration:down   # Revert last migration
yarn schema:create    # Create database schema
yarn schema:drop      # Drop database schema
yarn schema:update    # Update database schema
```

### Code Quality
```bash
yarn lint             # Check for linting issues
yarn lint:fix         # Fix linting issues automatically
```

## Environment Configuration

The application uses a centralized environment configuration system with TypeScript types and Zod validation.

### Environment Variables
Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

The application uses these environment variables:
- `NODE_ENV` - Application environment (development/production/test)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host (default: localhost, use 'postgres' for Docker)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (required)
- `DB_NAME` - Database name (default: crud_server)
- `LOG_LEVEL` - Logging level (default: info)
- `ENABLE_OPENAPI` - Enable OpenAPI JSON endpoint (default: true)
- `ENABLE_SWAGGER_UI` - Enable Swagger UI documentation (default: true)

### Configuration Usage

```typescript
import { ENV, getServerConfig, getDatabaseConfig, getApiDocsConfig } from './config/env';

// Access environment constants
const port = ENV.port;
const dbHost = ENV.db.host;
const isOpenApiEnabled = ENV.features.openapiEnabled;

// Use helper functions
const serverConfig = getServerConfig();
const dbConfig = getDatabaseConfig();
const apiDocsConfig = getApiDocsConfig();
```

## Start Locally with Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Quick Start
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **API Server**: http://localhost:3000
- **Database**: localhost:5432
- **Health Check**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api-docs (if enabled)
- **OpenAPI Spec**: http://localhost:3000/openapi.json (if enabled)

## Features

- **Full CRUD Operations** for books
- **Advanced Filtering** by title, author, ISBN, genre, year, price
- **Pagination** with limit and offset
- **Input Validation** with Zod schemas
- **Auto-generated API Documentation**
- **Type Safety** throughout the application
- **Security** with Helmet, CORS, and rate limiting
- **Comprehensive Testing** with Jest and Supertest
- **Environment Configuration** with TypeScript types and validation 