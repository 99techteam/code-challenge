# Problem 5 – A CRUD server (Task Management API)

A small ExpressJS + TypeScript backend for managing tasks. It supports task CRUD operations, filtering, task tags, and task event logging with SQLite persistence.

## Features

* Create, list, retrieve, update, and delete tasks
* Filter tasks by status, priority, and tags
* Add, list, and remove tags for a task
* Record task lifecycle events
* SQLite database persistence
* Foreign key relationships and cascade cleanup
* Parameterized SQL queries
* Runtime urgency score calculation

## Tech Stack

* TypeScript
* ExpressJS
* SQLite via `better-sqlite3`
* `tsx` for development
* `tsc-alias` for resolving TypeScript path aliases after build

## Requirements

* Node.js 18 or later
* npm

## Installation

```bash
npm install
```

## Database

The SQLite database file is intentionally tracked in this repository for assessment purposes.

No environment variables are required. The project uses internal defaults.

To initialize or rebuild the database schema:

```bash
npm run db
```

This executes:

```bash
tsx src/db.ts
```

> Running the database script may reset existing local data, depending on the implementation in `src/db.ts`.

## Running the Application

Start the development server with file watching:

```bash
npm run dev
```

Build and start the production version:

```bash
npm run build
npm start
```

The API is available at:

```text
http://localhost:3000
```

## Postman Collection

A Postman collection is included and tracked in the repository:

```text
/src/problem5/code-challenge_Problem5.postman_collection.json
```

To use it:

1. Start the API with `npm run dev`.
2. Open Postman.
3. Select **Import**.
4. Choose `/src/problem5/code-challenge_Problem5.postman_collection.json`.
5. Set the collection variable `baseURL` to:

```text
http://localhost:3000
```

The collection covers task creation, retrieval, filtering, updates, deletion, and task tag operations.

## API Endpoints

### Tasks

| Method   | Endpoint            | Description                      |
| -------- | ------------------- | -------------------------------- |
| `POST`   | `/tasks`            | Create a task                    |
| `GET`    | `/tasks`            | List tasks with optional filters |
| `GET`    | `/tasks/:id`        | Get one task                     |
| `PATCH`  | `/tasks/:id`        | Update task details              |
| `PATCH`  | `/tasks/:id/status` | Update task status               |
| `DELETE` | `/tasks/:id`        | Delete a task                    |

### Task Tags

| Method   | Endpoint                     | Description                 |
| -------- | ---------------------------- | --------------------------- |
| `POST`   | `/tasks/:taskId/tags`        | Add a tag to a task         |
| `GET`    | `/tasks/:taskId/tags`        | Get tags assigned to a task |
| `DELETE` | `/tasks/:taskId/tags/:tagId` | Remove a tag from a task    |

## Request Examples

### Create a Task

```http
POST /tasks
Content-Type: application/json
```

```json
{
  "title": "Implement task API",
  "description": "Complete CRUD endpoints",
  "priority": 8,
  "due_at": "2026-07-10"
}
```

`title` is required. `priority` is optional and defaults to `5`.

### Update a Task

```http
PATCH /tasks/1
Content-Type: application/json
```

```json
{
  "title": "Implement task API documentation",
  "priority": 9,
  "due_at": "2026-07-12"
}
```

Only supplied fields are updated.

### Update Task Status

```http
PATCH /tasks/1/status
Content-Type: application/json
```

```json
{
  "status": "in_progress"
}
```

Allowed status values:

* `pending`
* `in_progress`
* `done`

### Add a Tag

```http
POST /tasks/1/tags
Content-Type: application/json
```

```json
{
  "name": "backend"
}
```

Tags are created only when they are assigned to an existing task.

## Filtering Tasks

`GET /tasks` supports the following optional query parameters:

| Parameter  | Example          | Description                     |
| ---------- | ---------------- | ------------------------------- |
| `status`   | `pending`        | Filter by task status           |
| `priority` | `8`              | Filter by priority from 1 to 10 |
| `tags`     | `backend,urgent` | Filter by one or more tag names |

Examples:

```http
GET /tasks?status=pending
GET /tasks?priority=8
GET /tasks?tags=backend,urgent
GET /tasks?status=in_progress&priority=7
```

## Validation Rules

* Task title must be a non-empty string.
* Priority must be an integer from `1` to `10`.
* Status must be `pending`, `in_progress`, or `done`.
* Task IDs and tag IDs must be positive numeric values.
* A tag cannot be added to a task that does not exist.
* Duplicate task-tag relationships are ignored.
* Invalid input returns `400 Bad Request`.
* Missing resources return `404 Not Found`.

## Database Structure

The application uses four SQLite tables:

| Table         | Purpose                          |
| ------------- | -------------------------------- |
| `tasks`       | Stores task details              |
| `tags`        | Stores reusable tag names        |
| `task_tags`   | Stores task-to-tag relationships |
| `task_events` | Stores task lifecycle events     |

Task events include:

* `TASK_CREATED`
* `TASK_UPDATED`
* `STATUS_CHANGED`
* `TASK_DELETED`

Foreign key constraints ensure task-tag relationships remain valid. Deleting a task removes related task-tag records and task events through cascading deletes.

## Project Structure

```text
src/
├── controllers/
│   ├── task.controller.ts
│   └── task_tag.controller.ts
├── services/
│   ├── task.service.ts
│   ├── tag.service.ts
│   └── task_tag.service.ts
├── routes/
│   ├── task.route.ts
│   └── task_tag.route.ts
├── validations/
│   └── task.validation.ts
├── interfaces/
├── db.ts
├── server.ts
└── utils.ts
```

## Available Scripts

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Run the API in development mode with watch mode |
| `npm run build` | Compile TypeScript and resolve aliases          |
| `npm start`     | Rebuild and run the compiled application        |
| `npm run db`    | Initialize or rebuild the SQLite schema         |

## Notes

* The API uses parameterized SQL statements to prevent SQL injection.
* The task list enriches tasks with their assigned tags and calculated urgency score.
* The database file is intentionally committed for the coding challenge.
* No external services or environment configuration are required.
* This project was created for a technical assessment.
