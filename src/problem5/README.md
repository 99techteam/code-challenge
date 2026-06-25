# Problem 5: Express.js CRUD Backend

This folder contains the implementation for Problem 5: a TypeScript backend service built with Express.js, TypeORM, and SQLite.

## Overview

The service exposes a CRUD interface for a `Resource` entity.

Supported operations:
- Create a resource
- List resources with optional filters
- Retrieve a specific resource by ID
- Update resource details
- Delete a resource

Data persistence is provided by SQLite through TypeORM.

## Project structure

- `src/problem5/index.ts` — application entry point and database initialization
- `src/problem5/app.ts` — Express application setup and route registration
- `src/problem5/data-source.ts` — TypeORM data source configuration for SQLite
- `src/problem5/entity/Resource.ts` — resource entity definition
- `src/problem5/controller/resourceController.ts` — controller logic for CRUD operations
- `src/problem5/controller/resourceController.test.ts` — backend route tests
- `src/problem5/routes/resourceRoutes.ts` — CRUD route definitions

## Installation

From the project root:

```bash
cd d:/Personal/Project/test/hiepvo-code-challenge
npm install
```

## Build

Compile the TypeScript sources:

```bash
npm run build
```

## Run

Start the backend service:

```bash
npm start:problem5
```

By default, the server listens on `http://localhost:3000`.

## Configuration

The SQLite database is configured in `src/problem5/data-source.ts`.
The file path is:

```ts
database: './data/database.sqlite'
```

TypeORM is set to automatically synchronize the database schema.

## API Reference

### Create a resource

- Method: `POST`
- URL: `/resources`
- Body:
  - `name` (string, required)
  - `description` (string, optional)

Example payload:

```json
{
  "name": "Example Resource",
  "description": "A sample item"
}
```

Response: `201 Created`

### List resources

- Method: `GET`
- URL: `/resources`
- Query parameters (optional):
  - `name`
  - `description`

Response: `200 OK`

### Get resource details

- Method: `GET`
- URL: `/resources/:id`

Response: `200 OK` or `404 Not Found`

### Update resource details

- Method: `PUT`
- URL: `/resources/:id`
- Body may include:
  - `name`
  - `description`

Response: `200 OK` or `404 Not Found`

### Delete a resource

- Method: `DELETE`
- URL: `/resources/:id`

Response: `204 No Content` or `404 Not Found`

## Testing

Run the project tests from the root:

```bash
npm run test:problem5
```

Or run both together:

```bash
npm test
```

## Notes

The backend is designed to be simple and easy to extend. The current implementation uses one entity and a small controller layer to keep the CRUD flow clean.
