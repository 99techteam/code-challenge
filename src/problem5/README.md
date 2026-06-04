# Problem 5 - Todo CRUD API

A RESTful CRUD API for managing todos, built with **Express.js** and **TypeScript**, using a **JSON file-based database** for data persistence.

## Architecture

The project follows a **layered architecture** for maintainability and scalability:

```
Request → Routes → Controllers → Services → Repositories → Database
```

| Layer          | Responsibility                                                 |
| -------------- | -------------------------------------------------------------- |
| **Routes**     | HTTP verb → controller method mapping (no logic)               |
| **Controllers**| Parse HTTP request, delegate to service, send HTTP response    |
| **Services**   | Business logic, validation rules, orchestration                |
| **Repositories** | Data access abstraction (swap DB by implementing interface)  |
| **Middleware** | Cross-cutting concerns (error handling, auth, logging)         |

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

## Installation

```bash
cd src/problem5
npm install
```

## Running the Application

### Development mode (with ts-node)

```bash
npm run dev
```

### Production mode (compile and run)

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## Database

The application uses a **JSON file-based database** for simplicity and zero external dependencies. The database file is automatically created at `data/todos.json` on first run. No external database setup is required.

To swap to a real database (e.g. PostgreSQL, MongoDB), implement the `ITodoRepository` interface in `src/repositories/todo.repository.ts` and inject it in `src/routes/index.ts`.

## API Endpoints

### Health Check

```
GET /
```

### Create a Todo

```
POST /todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response:** `201 Created`

### List Todos (with filters)

```
GET /todos
```

**Query Parameters:**

| Parameter   | Type    | Description                                |
| ----------- | ------- | ------------------------------------------ |
| `completed` | boolean | Filter by completion status                |
| `search`    | string  | Search in title and description            |
| `limit`     | number  | Number of results per page (default: 20, max: 100) |
| `offset`    | number  | Offset for pagination (default: 0)         |

**Examples:**

```
GET /todos?completed=true
GET /todos?search=groceries
GET /todos?limit=10&offset=0
```

**Response:** `200 OK`

```json
{
  "data": [...],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Todo Details

```
GET /todos/:id
```

**Response:** `200 OK` or `404 Not Found`

### Update a Todo

```
PUT /todos/:id
Content-Type: application/json

{
  "title": "Buy groceries (updated)",
  "completed": true
}
```

All fields are optional. Only provided fields will be updated.

**Response:** `200 OK` or `404 Not Found`

### Delete a Todo

```
DELETE /todos/:id
```

**Response:** `200 OK` or `404 Not Found`

## Project Structure

```
src/problem5/
├── package.json
├── tsconfig.json
├── README.md
├── data/                        # Auto-created at runtime
│   └── todos.json
└── src/
    ├── index.ts                 # App bootstrap & middleware registration
    ├── config/
    │   └── index.ts             # Centralized configuration
    ├── errors/
    │   └── index.ts             # Custom error classes (AppError, NotFoundError, etc.)
    ├── middleware/
    │   └── errorHandler.ts      # Global error handling middleware
    ├── types/
    │   └── todo.types.ts        # Shared TypeScript interfaces & DTOs
    ├── repositories/
    │   └── todo.repository.ts   # Data access layer (ITodoRepository interface + JSON impl)
    ├── services/
    │   └── todo.service.ts      # Business logic layer
    ├── controllers/
    │   └── todo.controller.ts   # HTTP request/response handling
    └── routes/
        ├── index.ts             # Central route registration & dependency wiring
        └── todo.routes.ts       # Route definitions (verb → controller)
```
