# Problem 5 — A Crude Server

A CRUD backend built with **ExpressJS**, **TypeScript**, and **SQLite**.

The resource is a task. Audit and trouble logs are persisted in the same
SQLite database and exposed through read-only endpoints.

## Requirements

```text
Node.js >= 22.18.0
npm
```

The application uses Node.js `node:sqlite`; no external database server is
required.

## Install and run

```bat
cd /d D:\99\code-challenge\src\problem5

copy .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm test
npm run dev
```

Server:

```text
http://localhost:3000
```

## Task CRUD endpoints

```text
POST   /api/v1/tasks
GET    /api/v1/tasks
GET    /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

List filters:

```text
search
status
priority
dueAfter
dueBefore
sortBy
order
limit
offset
```

## Audit log

Every successful `CREATE`, `UPDATE`, and `DELETE` is written inside the same
database transaction as the task mutation.

SQLite table:

```text
task_audit_logs
```

List audit records:

```http
GET /api/v1/audit-logs
```

Filters:

```text
taskId
traceId
action=CREATE|UPDATE|DELETE
limit
offset
```

Example:

```http
GET /api/v1/audit-logs?taskId=<TASK_ID>&limit=20
```

Details:

```http
GET /api/v1/audit-logs/:id
```

Audit response contains:

```json
{
  "id": 3,
  "traceId": "manual-delete-001",
  "action": "DELETE",
  "taskId": "task-id",
  "before": {
    "title": "Build Problem 5"
  },
  "after": null,
  "createdAt": "2026-08-03T15:00:00.000Z"
}
```

## Trouble log

Validation errors, invalid JSON, resource-not-found errors, unknown routes,
and unexpected server errors are persisted automatically.

SQLite table:

```text
trouble_logs
```

List trouble records:

```http
GET /api/v1/trouble-logs
```

Filters:

```text
requestId
method
errorCode
statusCode
limit
offset
```

Examples:

```http
GET /api/v1/trouble-logs?errorCode=VALIDATION_ERROR
GET /api/v1/trouble-logs?statusCode=404
GET /api/v1/trouble-logs?requestId=manual-invalid-001
```

Details:

```http
GET /api/v1/trouble-logs/:id
```

Trouble response contains:

```json
{
  "id": 1,
  "requestId": "manual-invalid-001",
  "method": "POST",
  "path": "/api/v1/tasks",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "title must contain between 1 and 120 characters",
  "details": null,
  "stack": "...",
  "durationMs": 2,
  "createdAt": "2026-08-03T15:00:00.000Z"
}
```

The stack is stored for review but is never returned in normal API error
responses.

## Database migrations

Tables:

```text
schema_migrations
tasks
task_audit_logs
trouble_logs
```

`npm run db:migrate` applies migration 2 to an existing database created by the
previous version, so the current `data/problem5.sqlite` does not need to be
deleted.

## Tests

```bat
npm test
```

The tests verify:

```text
CRUD persistence
3 audit records for create/update/delete
validation trouble logging
unknown-route trouble logging
audit-log API
trouble-log API
```

## Stress test

```bat
npm run stress
```

Expected counters:

```text
creates=250
updates=100
deletes=50
auditRecords=400
troubleRecords=50
```

## Request collection

Use:

```text
requests.http
```

It includes CRUD, audit-log, trouble-log, and error-generation requests.

## Exact source locations

```text
src/problem5/src/database.ts
src/problem5/src/http/middleware.ts
src/problem5/src/http/observability.routes.ts
src/problem5/src/http/observability.validation.ts
src/problem5/src/repositories/observability.repository.ts
src/problem5/src/services/observability.service.ts
src/problem5/src/domain/observability.ts
```
