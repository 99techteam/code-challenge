# Backend CRUD Server

A complete backend server project built with ExpressJS, TypeORM, SQLite, Swagger, and TypeScript. This project provides a fully functional CRUD API for managing books with proper validation, error handling, and API documentation.

## 🚀 Tech Stack

- **Express.js** - Fast, minimalist web framework for Node.js
- **TypeScript** - Typed superset of JavaScript
- **TypeORM** - Object-Relational Mapping for TypeScript/JavaScript
- **SQLite** - Lightweight, file-based database
- **Swagger** - API documentation and testing interface
- **Jest** - Testing framework
- **Token Bucket Rate Limiting** - Industry-standard rate limiting algorithm

## 📁 Project Structure

```
src/
├── config/
│   ├── data-source.ts      # TypeORM database configuration
│   └── swagger.ts          # Swagger documentation setup
├── controllers/
│   ├── bookController.ts   # Request handlers for book operations
│   └── metricsController.ts # Metrics and monitoring endpoints
├── entity/
│   └── Book.ts            # Book entity/model definition
├── middleware/
│   ├── errorHandler.ts    # Global error handling middleware
│   ├── validation.ts      # Request validation middleware
│   ├── rateLimiter.ts     # Token Bucket rate limiting implementation
│   └── rateLimitMiddleware.ts # Express rate limiting middleware
├── routes/
│   ├── bookRoutes.ts      # Book-related routes
│   ├── metricsRoutes.ts   # Metrics and monitoring routes
│   └── index.ts           # Main router configuration
├── services/
│   └── bookService.ts     # Business logic for book operations
├── types/
│   └── index.ts           # TypeScript type definitions
└── index.ts               # Application entry point
```

## 🛠️ Installation

1. **Clone the repository** (if needed):
   ```bash
   cd src/problem5
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file if needed (default values should work for development).

## 🏃‍♂️ Running the Project

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using `ts-node-dev`.

### Production Mode
```bash
# Build the project
npm run build

# Start the production server
npm start
```

### 🐳 Docker Deployment

We provide complete Docker support for both development and production environments:

#### Quick Start with Docker
```bash
# Production deployment
docker-compose up -d

# Development with hot-reload
npm run docker:up:dev
```

#### Docker Commands
```bash
# Build production image
npm run docker:build

# Build development image  
npm run docker:build:dev

# Run production container
npm run docker:run

# Stop all containers
npm run docker:down

# View logs
npm run docker:logs
```

📖 **For complete Docker deployment guide, see [DOCKER.md](./DOCKER.md)**

### Testing
```bash
npm test
```

## 📚 Additional Documentation

- **[Scalability Report](SCALABILITY_REPORT.md)** - Comprehensive infrastructure planning and scaling guide
- **[Scalability Monitoring Guide](SCALABILITY_MONITORING_GUIDE.md)** - Real-time monitoring implementation
- **[Docker Deployment Guide](DOCKER.md)** - Complete containerization setup
- **[Rate Limiting Guide](RATE_LIMITING_GUIDE.md)** - Detailed rate limiting implementation
- **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- **[Project Summary](PROJECT_SUMMARY.md)** - Technical overview and architecture
- **[API Documentation](http://localhost:3000/api-docs)** - Interactive Swagger UI (when running)

## 🔗 API Endpoints

### Health Check
- **GET** `/health` - Check if the server is running (includes rate limit status)

### Metrics & Monitoring
- **GET** `/api/metrics` - Get application metrics in JSON format
- **GET** `/api/metrics/prometheus` - Get metrics in Prometheus format
- **POST** `/api/metrics/reset` - Reset metrics (development only)

### Scalability Monitoring
- **GET** `/api/metrics/scalability` - Get comprehensive scalability metrics
- **GET** `/api/metrics/scalability/assessment` - Get scalability assessment with recommendations
- **GET** `/api/metrics/scalability/prometheus` - Get scalability metrics in Prometheus format

### Books API

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/books` | Create a new book | Write operations: 50/min |
| GET | `/api/books` | Get all books with optional filters | Standard: 100/min |
| GET | `/api/books/search` | Search books by title, author, or description | Standard: 100/min |
| GET | `/api/books/:id` | Get a specific book by ID | Standard: 100/min |
| PUT | `/api/books/:id` | Update a book | Write operations: 50/min |
| DELETE | `/api/books/:id` | Delete a book | Write operations: 50/min |

### Query Parameters for GET `/api/books`

- `author` - Filter by author name (partial match)
- `publishedYear` - Filter by publication year (exact match)
- `genre` - Filter by genre (partial match)
- `limit` - Number of results per page (default: 10)
- `offset` - Number of results to skip (default: 0)

## 🚀 Rate Limiting & Security

This project implements industry-standard rate limiting using the **Token Bucket algorithm**, following best practices from Amazon, Google, and Stripe.

### Rate Limiting Features

- **Token Bucket Algorithm**: Allows burst traffic while maintaining average rate limits
- **Per-IP Rate Limiting**: Each client IP has its own token bucket
- **Multiple Rate Profiles**: Different limits for different types of operations
- **Standard Headers**: RFC-compliant rate limit headers in responses
- **Metrics Integration**: Real-time monitoring of rate limiting effectiveness
- **Graceful Degradation**: Proper error responses with retry information

### Rate Limit Profiles

| Profile | Capacity | Refill Rate | Applied To |
|---------|----------|-------------|------------|
| Standard | 100 requests | 100/minute | Read operations (GET endpoints) |
| Write Operations | 50 requests | 50/minute | Write operations (POST, PUT, DELETE) |
| Burst | 200 requests | 150/minute | Health checks and metrics |

### Environment Configuration

Rate limiting can be configured through environment variables:

```env
# Rate Limiting Configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STANDARD_CAPACITY=100
RATE_LIMIT_STANDARD_REFILL_RATE=100
RATE_LIMIT_WRITE_CAPACITY=50
RATE_LIMIT_WRITE_REFILL_RATE=50
RATE_LIMIT_BURST_CAPACITY=200
RATE_LIMIT_BURST_REFILL_RATE=150
```

### Rate Limit Headers

All API responses include standard rate limit headers:

```http
X-RateLimit-Limit: 100          # Maximum requests allowed
X-RateLimit-Remaining: 95        # Requests remaining in current window
X-RateLimit-Reset: 1704067200    # Unix timestamp when limit resets
X-RateLimit-Policy: 100;w=60     # Rate limit policy in standard format
```

When rate limit is exceeded:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067230
```

### Monitoring Rate Limits

Monitor rate limiting through the metrics endpoints:

```bash
# Get current rate limiting metrics
curl http://localhost:3000/api/metrics

# Response includes:
{
  "rateLimiting": {
    "totalRequests": 1250,
    "allowedRequests": 1180,
    "blockedRequests": 70,
    "blockRate": 0.056,
    "activeClients": 25
  }
}
```

## 📊 Monitoring & Observability

### Metrics Collection

The application provides comprehensive metrics through multiple endpoints:

- **JSON Metrics**: `/api/metrics` - Human-readable metrics in JSON format
- **Prometheus Format**: `/api/metrics/prometheus` - Prometheus-compatible metrics
- **Rate Limit Status**: Included in health check endpoint

### Available Metrics

| Metric Category | Description | Key Metrics |
|----------------|-------------|-------------|
| Rate Limiting | Token bucket and rate limit statistics | Total/allowed/blocked requests, active clients |
| Application | General application health | Uptime, memory usage, response times |
| Database | Database connection and query metrics | Connection pool, query count, errors |
| HTTP | Request/response statistics | Status codes, response times, throughput |

### Integration with Monitoring Tools

**Prometheus Integration:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'books-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics/prometheus'
    scrape_interval: 15s
```

**Grafana Dashboard:**
Import the provided dashboard configuration to visualize:
- Request rate and response times
- Rate limiting effectiveness
- Error rates and status code distribution
- Database performance metrics

## 📖 Example Usage

### 1. Create a Book

**Request:**
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "publishedYear": 1925,
    "description": "A classic American novel",
    "genre": "Fiction"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "publishedYear": 1925,
    "description": "A classic American novel",
    "genre": "Fiction",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Books

**Request:**
```bash
curl http://localhost:3000/api/books
```

**Response:**
```json
{
  "success": true,
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "publishedYear": 1925,
      "description": "A classic American novel",
      "genre": "Fiction",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 3. Filter Books by Author

**Request:**
```bash
curl "http://localhost:3000/api/books?author=Fitzgerald"
```

### 4. Get Book by ID

**Request:**
```bash
curl http://localhost:3000/api/books/1
```

### 5. Update a Book

**Request:**
```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "An updated description of this classic novel"
  }'
```

### 6. Search Books

**Request:**
```bash
curl "http://localhost:3000/api/books/search?q=Gatsby"
```

### 7. Delete a Book

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/books/1
```

## 🗃️ Database Schema

### Book Entity

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| title | VARCHAR(255) | Book title (required) |
| author | VARCHAR(255) | Author name (required) |
| publishedYear | INTEGER | Year of publication (required) |
| description | TEXT | Book description (optional) |
| genre | VARCHAR(50) | Book genre (optional) |
| createdAt | DATETIME | Record creation timestamp |
| updatedAt | DATETIME | Record last update timestamp |

## 🛡️ Validation Rules

### Creating a Book
- **title**: Required, 1-255 characters
- **author**: Required, 1-255 characters
- **publishedYear**: Required, integer between 1000 and current year
- **description**: Optional, max 1000 characters
- **genre**: Optional, max 50 characters

### Updating a Book
- All fields are optional
- Same validation rules apply when fields are provided

## 🚨 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

The project includes Jest for testing. Test files should be placed alongside source files with `.test.ts` extension.

Run tests:
```bash
npm test
```

## 🔧 Configuration

### Environment Variables

**Basic Configuration:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_TYPE` - Database type (sqlite)
- `DB_NAME` - Database file name

**Rate Limiting Configuration:**
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (default: true)
- `RATE_LIMIT_STANDARD_CAPACITY` - Standard profile token capacity (default: 100)
- `RATE_LIMIT_STANDARD_REFILL_RATE` - Standard profile refill rate per minute (default: 100)
- `RATE_LIMIT_WRITE_CAPACITY` - Write operations token capacity (default: 50)
- `RATE_LIMIT_WRITE_REFILL_RATE` - Write operations refill rate per minute (default: 50)
- `RATE_LIMIT_BURST_CAPACITY` - Burst profile token capacity (default: 200)
- `RATE_LIMIT_BURST_REFILL_RATE` - Burst profile refill rate per minute (default: 150)

### TypeORM Configuration
The database configuration is in `src/config/data-source.ts`. In production, make sure to:
- Set `synchronize: false`
- Use proper database credentials
- Set up migrations

## 📦 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run seed` - Populate database with sample data

### 🐳 Docker Scripts
- `npm run docker:build` - Build production Docker image
- `npm run docker:build:dev` - Build development Docker image
- `npm run docker:run` - Run production container
- `npm run docker:run:dev` - Run development container with hot reload
- `npm run docker:up` - Start with Docker Compose (production)
- `npm run docker:up:dev` - Start with Docker Compose (development)
- `npm run docker:down` - Stop Docker containers
- `npm run docker:logs` - View container logs

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper type definitions
3. Include tests for new features
4. Update documentation as needed
5. Follow existing code style and patterns

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in `.env` file
2. **Database connection issues**: Ensure SQLite permissions and disk space
3. **Module not found errors**: Run `npm install` to install dependencies
4. **TypeScript compilation errors**: Check `tsconfig.json` configuration

### Development Tips

- Use the Swagger UI at `/api-docs` for testing API endpoints
- Check the `/health` endpoint to verify server status
- Monitor console logs for debugging information
- Use `npm run dev` for development with auto-reload

## 🔮 Future Enhancements

- Authentication and authorization
- Rate limiting
- Caching with Redis
- Database migrations
- Docker containerization ✅ **IMPLEMENTED**
- Logging with Winston
- API versioning
- Unit and integration tests

## 🐳 Docker Support

This project includes complete Docker support for easy deployment:

- **Multi-stage Dockerfile** for optimized production builds
- **Development Dockerfile** with hot-reload support
- **Docker Compose** configuration for easy orchestration
- **Health checks** and security best practices
- **Volume mounting** for database persistence

See [DOCKER.md](./DOCKER.md) for complete deployment instructions.

test
