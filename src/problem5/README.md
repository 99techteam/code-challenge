# CRUD Server

A robust Node.js REST API server built with TypeScript, Express, Prisma, and MySQL for managing items with full CRUD operations.

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, Delete items
- **Advanced Filtering**: Search, pagination, sorting, and price range filtering
- **Data Validation**: Input validation using express-validator
- **Security**: Helmet for security headers, CORS configuration
- **Logging**: Structured logging with Pino
- **Database**: MySQL with Prisma ORM
- **Dependency Injection**: Inversify for IoC container
- **Testing**: Comprehensive unit tests with Jest
- **Docker Support**: Multi-stage Docker builds with development and production modes

## 📋 Prerequisites

- **Node.js** 18+ 
- **Docker** and **Docker Compose**
- **pnpm** (preferred) or npm

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

#### Development Mode
```bash
# Clone the repository
git clone <repository-url>
cd crude-server

# Run with Docker Compose (includes MySQL)
docker-compose -f docker-compose.dev.yml up --build

# The server will be available at http://localhost:3000
```

#### Production Mode
```bash
# Run production build
docker-compose up --build

# The server will be available at http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database configuration

# Run MySQL (using Docker)
docker-compose up mysql -d

# Run database migrations
npx prisma migrate deploy

# Start development server
pnpm run dev

# The server will be available at http://localhost:3000
```

## 🐳 Docker Commands

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs app
docker-compose logs mysql

# Rebuild containers
docker-compose up --build --force-recreate
```

## 📊 Database

The project uses MySQL with Prisma ORM. The database schema includes:

```sql
model Item {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  category    String
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([price])
  @@index([description])
  @@fulltext([name, description])
}
```

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api`

### Items Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|-----------------|
| GET | `/items` | Get all items | `page`, `pageSize`, `sortBy`, `order`, `search`, `category`, `minPrice`, `maxPrice` |
| GET | `/items/:id` | Get item by ID | - |
| POST | `/items` | Create new item | - |
| PUT | `/items/:id` | Update item | - |
| DELETE | `/items/:id` | Delete item | - |

### Request/Response Examples

#### Get All Items
```bash
GET /api/items?page=1&pageSize=10&sortBy=price&order=asc&search=laptop&category=electronics&minPrice=100&maxPrice=1000

Response:
{
  "items": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

#### Create Item
```bash
POST /api/items
Content-Type: application/json

{
  "name": "MacBook Pro",
  "description": "Apple MacBook Pro 16-inch",
  "category": "electronics",
  "price": 2499.99
}

Response:
{
  "id": 1,
  "name": "MacBook Pro",
  "description": "Apple MacBook Pro 16-inch",
  "category": "electronics",
  "price": 2499.99,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Item
```bash
PUT /api/items/1
Content-Type: application/json

{
  "name": "MacBook Pro M3",
  "price": 2299.99
}
```

#### Delete Item
```bash
DELETE /api/items/1
```

## 🧪 Testing

The project includes comprehensive unit tests with Jest.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch

# View coverage report
open coverage/lcov-report/index.html
```

### Test Coverage
- **Controllers**: Full CRUD operations testing
- **Services**: Database layer with mocked Prisma
- **Middleware**: Validation, error handling, request logging
- **Integration Tests**: API endpoint testing with supertest

Target coverage: 80% (statements, branches, functions, lines)

## 🔧 Development Scripts

```bash
# Development with hot reload
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Lint code
pnpm run lint

# Run tests
pnpm test

# Generate test coverage
pnpm run test:coverage
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${MYSQL_DATABASE}"
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=crude_db
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server entry point
├── config/               # Configuration files
│   ├── config.ts         # Environment configuration
│   └── inversify.config.ts # Dependency injection setup
├── controllers/          # Route controllers
│   └── itemController.ts
├── services/             # Business logic layer
│   └── itemService.ts
├── middlewares/          # Express middlewares
│   ├── validation.ts     # Input validation
│   ├── errorHandler.ts   # Error handling
│   └── requestLogger.ts  # Request logging
├── models/               # TypeScript interfaces
│   └── item.ts
├── routes/               # Route definitions
│   └── itemRoutes.ts
├── lib/                  # Utility libraries
│   ├── prisma.ts         # Prisma client
│   └── logger.ts         # Pino logger setup
└── types/                # Type definitions
    └── types.ts

tests/                    # Unit tests
├── setupTests.ts         # Test configuration
├── itemController.test.ts
├── itemService.test.ts
├── validation.test.ts
├── errorHandler.test.ts
├── requestLogger.test.ts
└── logger.test.ts

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🔒 Security Features

- **Helmet**: Security headers (CSP, HSTS, etc.)
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request validation with express-validator
- **Error Handling**: Secure error responses without sensitive data
- **Docker Security**: Non-root user in production containers

## 📝 Logging

The application uses Pino for structured logging:

- **Development**: Pretty formatted colored logs
- **Production**: JSON structured logs
- **Request Logging**: HTTP request/response logging with duration
- **Error Logging**: Detailed error logging with stack traces

## 🚀 Deployment

### Docker Production

```bash
# Build and run production container
docker-compose up --build

# Scale application (if needed)
docker-compose up --scale app=3
```

### Manual Deployment

```bash
# Build the application
pnpm run build

# Start with PM2 (production process manager)
npm install -g pm2
pm2 start dist/server.js --name "crude-server"
```

## 🆘 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL container
   docker-compose logs mysql
   
   # Reset database
   npx prisma migrate reset
   ```

3. **Docker build issues**
   ```bash
   # Clean Docker cache
   docker system prune -af
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Module not found errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug pnpm run dev
```

### Health Checks

Check if services are running:
```bash
# API health
curl http://localhost:3000/api/items

# Database connection
docker-compose exec mysql mysql -u ${MYSQL_USER} -p ${MYSQL_DATABASE}
```
