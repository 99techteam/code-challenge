# Books API

A RESTful API for managing book resources (books), built with Express.js and MongoDB.

## Tech Stack

- Node.js (Express.js)
- MongoDB with Mongoose ODM
- Docker compose
- Postman collections: [99prob5.postman_collection.json](./99prob5.postman_collection.json)
- **API documentation is hosted at**: <https://documenter.getpostman.com/view/16604169/2sBXqFM2M9>
- Testing: unit test with `jest` and e2e test with `superrequest`

## Prerequisites

- Node.js 18+
- MongoDB (local or via Docker)

## Configuration

The application uses environment variables. Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/99problem5
PORT=3000
X_API_KEY=your-secret-api-key
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/99problem5` | MongoDB connection string |
| `PORT` | `3000` | Server port |
| `X_API_KEY` | `random-api-key` | API key for authentication |

## Running the Application

Start MongoDB container:

```bash
docker-compose up -d
```

Install dependencies and run:

```bash
yarn install
yarn dev
```

The server starts at `http://localhost:3000`.

## API Endpoints

### Base URL

```
http://localhost:3000/api/books
```

### Authentication

Some book endpoints require the `X-API-KEY` header (endpoints that will modify the resource):

```env
X-API-KEY: your-secret-api-key
```

### Endpoints

| Method | Endpoint | Description | Required Auth |
|--------|----------|-------------|---------------|
| `GET` | `/api/books` | List all books | No |
| `GET` | `/api/books/:id` | Get a book by ID | No |
| `POST` | `/api/books` | Create a new book | Yes |
| `PATCH` | `/api/books/:id` | Update a book | Yes |
| `DELETE` | `/api/books/:id` | Delete a book | Yes |

### Book Schema

```json
{
  "title": "string (required)",
  "author": "string (required)",
  "publisher": "string (required)",
  "publishedDate": "string (required)",
  "country": "string (required)"
}
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Run with nodemon (development) |
| `yarn test` | Run unit and E2E tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage |

## Testing

```
64 tests passing (unit + E2E)
```

| Test File | Description |
|-----------|-------------|
| `src/modules/books/__tests__/book.service.spec.ts` | Service layer unit tests |
| `src/modules/books/__tests__/book.validator.spec.ts` | Validator unit tests |
| `src/modules/books/__tests__/book.controller.spec.ts` | Controller unit tests |
| `src/middlewares/__tests__/auth.middleware.spec.ts` | Auth middleware tests |
| `src/middlewares/__tests__/errors-handler.middleware.spec.ts` | Error handler tests |
| `test/app.e2e.test.ts` | Full API E2E integration tests |

## Project Structure

```
src/
├── index.ts           # Application entry point
├── env.ts             # Environment configuration
├── common/
│   └── error-codes.ts # Error definitions and AppError class
├── mocks/
│   └── seeds.ts       # Database seeding
├── modules/
│   └── books/
│       ├── __tests__/ # Unit tests for books module
│       │   ├── book.controller.spec.ts
│       │   ├── book.service.spec.ts
│       │   └── book.validator.spec.ts
│       ├── book.constant.ts
│       ├── book.controller.ts
│       ├── book.schema.ts
│       ├── book.service.ts
│       ├── book.validator.ts
│       └── index.ts
├── route/
│   ├── index.ts
│   └── book.route.ts  # Book routes
└── middlewares/
    ├── __tests__/      # Middleware unit tests
    │   ├── auth.middleware.spec.ts
    │   └── errors-handler.middleware.spec.ts
    ├── errors-handler.middleware.ts
    └── auth.middleware.ts

test/
└── app.e2e.test.ts    # E2E integration tests
```

Seed data is located at [mocks/seed.ts](./src/mocks/seeds.ts). The data will be automatically renew once the server is started.

The postman collection also contains example request/response.
