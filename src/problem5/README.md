# CRUD API Server

A production-ready RESTful API server built with Express.js, TypeScript, and SQLite.

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to customize settings if needed.

### Running the Application

**Development Mode** (with auto-reload):

```bash
npm run dev
```

**Production Mode**:

```bash
npm run build
npm start
```

The server will start at `http://localhost:3000`

## Testing

### Unit & Integration Tests

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

**Test Coverage:** 82.79% (46 tests passing)

### API Testing Script

Test all CRUD operations with a comprehensive script:

```bash
# Make the script executable (first time only)
chmod +x test-api.sh

# Run the API test script
./test-api.sh
```

**What it tests:**
- Health check endpoint
- Create, Read, Update, Delete operations
- Filtering (by name, category, status)
- Pagination (limit & offset)
- Field validation (missing required fields, invalid enum values)
- Authentication (missing API key, invalid API key)

**Requirements:**
- Server must be running (`npm run dev`)
- `jq` command-line JSON processor (install: `sudo apt install jq` or `brew install jq`)

### Security Testing Script

Test security features with automated checks:

```bash
# Make the script executable (first time only)
chmod +x test-security.sh

# Run the security test script
./test-security.sh
```

**What it tests:**
- ✅ HTTP Security Headers (Content-Security-Policy, HSTS, X-Frame-Options, etc.)
- ✅ XSS Attack Prevention (script tags, event handlers)
- ✅ NoSQL Injection Prevention (sanitization of $ and . characters)
- ✅ Request Size Limits (100KB max payload)
- ✅ API Key Authentication (missing, invalid, valid keys)

**Requirements:**
- Server must be running (`npm run dev`)

**Example output:**

```text
==========================================
Test 1: Checking Security Headers
==========================================

✓ Content-Security-Policy header present
✓ Strict-Transport-Security header present
✓ X-Frame-Options: DENY header present
✓ X-Content-Type-Options: nosniff header present
✓ X-XSS-Protection header present
✓ Referrer-Policy header present
✓ Permissions-Policy header present
✓ X-Powered-By header hidden
```

### Interactive API Testing (VS Code REST Client)

For interactive API testing with a GUI, use the `api-examples.http` file:

**Setup:**

1. Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension in VS Code
2. Open `api-examples.http` file
3. Make sure the server is running (`npm run dev`)

**Usage:**

Click on "Send Request" above any request to execute it. The response will appear in a new panel.

**What's included:**

- ✅ **CRUD Operations**: Create, Read, Update, Delete examples
- ✅ **Filtering**: By name, category, status with pagination
- ✅ **Validation Examples**: All error scenarios (missing fields, invalid values)
- ✅ **Authentication**: Valid, missing, and invalid API key examples
- ✅ **Edge Cases**: Empty values, too long values, non-existent IDs

**Features:**

- Variables for base URL and API key (easy to change)
- Organized sections with comments
- Ready-to-use examples for all endpoints
- Error scenario demonstrations

**Quick example:**

```http
### Create a new resource
POST {{apiUrl}}
Content-Type: application/json
x-api-key: {{apiKey}}

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "category": "electronics",
  "status": "active"
}
```

Just click "Send Request" above the `POST` line!

## API Endpoints

Base URL: `http://localhost:3000/api/resources`

All API requests require the `x-api-key` header:

```bash
x-api-key: test-api-key-12345
```

### Health Check

```bash
GET /health
```

### Create Resource

```bash
POST /api/resources
Content-Type: application/json

{
  "name": "Resource Name",
  "description": "Optional description",
  "category": "optional-category",
  "status": "active"
}
```

### List Resources

```bash
GET /api/resources?category=test&status=active&limit=10&offset=0
```

### Get Resource

```bash
GET /api/resources/:id
```

### Update Resource

```bash
PUT /api/resources/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive"
}
```

### Delete Resource

```bash
DELETE /api/resources/:id
```

## Quick Test

Create a resource:

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -H "x-api-key: test-api-key-12345" \
  -d '{"name":"Test Resource","category":"test","status":"active"}'
```

List all resources:

```bash
curl http://localhost:3000/api/resources \
  -H "x-api-key: test-api-key-12345"
```

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Request validation with Zod
- ✅ Filtering and pagination
- ✅ Security headers (Helmet.js)
- ✅ XSS and NoSQL injection protection
- ✅ Request logging (Winston)
- ✅ API key authentication
- ✅ Comprehensive test suite (Jest + Supertest)
- ✅ TypeScript for type safety

## Project Structure

```
src/
├── config/          # Database and logger configuration
├── controllers/     # Request handlers
├── middleware/      # Security, auth, validation, logging
├── models/          # Database operations
├── routes/          # API routes
├── schemas/         # Zod validation schemas
├── types/           # TypeScript types
└── app.ts           # Express app configuration
tests/               # Test suites
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `DB_PATH` | `./database.sqlite` | SQLite database path |
| `API_KEY` | `test-api-key-12345` | API authentication key |
| `ENABLE_FILE_LOGGING` | `true` | Enable file-based logging |

## Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **SQLite3** - Database
- **Zod** - Schema validation
- **Winston** - Logging
- **Helmet.js** - Security headers
- **Jest + Supertest** - Testing

## License

MIT
