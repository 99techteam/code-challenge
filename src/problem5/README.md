# Task Management API

A RESTful CRUD API for managing tasks, built with **Express.js**, **TypeScript**, **TypeORM**, and **SQLite (sql.js)**.

## Overview

Backend service that allows clients to create, read, update, and delete tasks. Supports full-text search across title and description, filtering by status and priority, sorting, and pagination.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | TypeORM |
| Database | SQLite via sql.js (zero native dependency) |
| Validation | class-validator + class-transformer |
| Testing | Jest + Supertest (39 tests) |

### Architecture

Layered structure: **routes → controllers → services → repository**. Controllers handle HTTP concerns only; business logic lives in `TaskService` which implements `ITaskService`. This interface makes the service trivially mockable in tests. DTOs validated with decorators at the middleware layer before requests reach the controller.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Start dev server (auto-seeds 10 sample tasks on first run)
npm run dev
```

Server starts at **http://localhost:3000**. SQLite database file is created at `./data/tasks.sqlite`.

| URL | Description |
|-----|-------------|
| `http://localhost:3000/api` | REST API base |
| `http://localhost:3000/docs` | Swagger UI |
| `http://localhost:3000/docs.json` | Raw OpenAPI 3.0 spec (JSON) |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run all 39 tests |
| `npm run test:coverage` | Tests with coverage report |

## API Reference

**Base URL:** `http://localhost:3000/api`

---

### Health Check

```http
GET /api/health
```

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

---

### Create a Task

```http
POST /api/tasks
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Max 200 characters |
| description | string | No | Free text |
| status | enum | No | Default: `TODO` |
| priority | enum | No | Default: `MEDIUM` |
| dueDate | string | No | ISO 8601 date string (e.g. `2025-12-31`) |

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Set up CI/CD pipeline",
  "description": null,
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-06-30",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up CI/CD pipeline","priority":"HIGH","dueDate":"2025-06-30"}'
```

---

### List Tasks

```http
GET /api/tasks
```

**Query Parameters (all optional):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | — | Case-insensitive search across title and description |
| status | enum | — | Filter: `TODO`, `IN_PROGRESS`, `DONE` |
| priority | enum | — | Filter: `LOW`, `MEDIUM`, `HIGH` |
| sort_by | enum | `createdAt` | `title`, `status`, `priority`, `dueDate`, `createdAt` |
| sort_order | enum | `DESC` | `ASC` or `DESC` |
| page | integer | `1` | Min: 1 |
| limit | integer | `10` | Min: 1, Max: 100 |

**Response 200:**
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

```bash
# All tasks
curl http://localhost:3000/api/tasks

# Search
curl "http://localhost:3000/api/tasks?search=CI"

# Filter by status and priority
curl "http://localhost:3000/api/tasks?status=TODO&priority=HIGH"

# Sorted + paginated
curl "http://localhost:3000/api/tasks?sort_by=priority&sort_order=ASC&page=1&limit=5"
```

---

### Get Task by ID

```http
GET /api/tasks/:id
```

**Response 200:** Task object.

**Response 404:**
```json
{ "status": "error", "message": "Task not found" }
```

---

### Update a Task

```http
PUT /api/tasks/:id
Content-Type: application/json
```

All fields are optional. Only provided fields are updated.

```bash
curl -X PUT http://localhost:3000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```

---

### Delete a Task

```http
DELETE /api/tasks/:id
```

**Response 200:**
```json
{
  "message": "Task deleted successfully",
  "task": { "id": "...", "title": "...", ... }
}
```

---

### Enum Values

**TaskStatus:** `TODO` | `IN_PROGRESS` | `DONE`

**TaskPriority:** `LOW` | `MEDIUM` | `HIGH`

### Error Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": ["title must be shorter than or equal to 200 characters"]
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Validation error |
| 404 | Resource not found |
| 500 | Internal server error |

## Project Structure

```
src/problem5/
├── src/
│   ├── app.ts                    # Express app factory
│   ├── server.ts                 # Entry point (init DB, seed, start)
│   ├── config/
│   │   └── database.ts           # TypeORM DataSource
│   ├── entities/
│   │   └── Task.ts               # Task entity + enums
│   ├── controllers/
│   │   ├── taskController.ts     # HTTP handlers
│   │   └── healthController.ts
│   ├── services/
│   │   ├── ITaskService.ts       # Service interface
│   │   └── taskService.ts        # Business logic
│   ├── dto/
│   │   ├── createTask.dto.ts
│   │   ├── updateTask.dto.ts
│   │   └── queryTask.dto.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   └── validateDto.ts
│   └── routes/
│       ├── taskRoutes.ts
│       └── index.ts
├── __tests__/
│   ├── unit/taskService.test.ts       # 17 unit tests
│   ├── integration/task.api.test.ts   # 22 integration tests
│   └── setup.ts
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **sql.js** over better-sqlite3 | Pure JS/WASM — no native compilation, runs on any Node version |
| **Service interface** | `ITaskService` enables clean unit tests without hitting the database |
| **In-memory SQLite for tests** | Each test suite starts with a fresh database, no cleanup state to manage |
| **Factory functions for app** | `createApp(service)` and `createRouter(service)` allow injecting a mock or real service |
| **Query builder** | Used for `findAll` to compose dynamic filters/sorts cleanly without string concatenation |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `DB_PATH` | `./data/tasks.sqlite` | SQLite file path (ignored in test mode) |
