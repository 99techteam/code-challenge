# Problem 5 — CRUD API Server

This folder contains a minimal ExpressJS backend implemented in TypeScript. It exposes a CRUD interface backed by a SQLite database (using [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)) for persistence.

## Features

- Create a resource via `POST /resources`
- List resources with optional filters (`status`, full-text search via `q`, tag match via `tag`, plus pagination controls `limit` and `offset`)
- Read a single resource by id via `GET /resources/:id`
- Update resource fields via `PATCH /resources/:id`
- Delete a resource via `DELETE /resources/:id`
- Lightweight validation with helpful error responses
- SQLite persistence stored in `src/data/resources.sqlite`

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Getting Started

```bash
cd src/problem5
npm install
npm run dev
```

The development server starts on `http://localhost:3000` by default. Set a custom port with `PORT=4000 npm run dev`.

### Production build

```bash
npm run build
npm start
```

## API Summary

| Method | Endpoint            | Description                                    |
|--------|---------------------|------------------------------------------------|
| GET    | `/health`           | Health check with a timestamp                  |
| POST   | `/resources`        | Create a resource                              |
| GET    | `/resources`        | List resources (query params: `status`, `q`, `tag`, `limit`, `offset`) |
| GET    | `/resources/:id`    | Fetch a single resource                        |
| PATCH  | `/resources/:id`    | Update title, description, status, or tags     |
| DELETE | `/resources/:id`    | Remove a resource                              |

Example payload:

```json
{
  "title": "API specification draft",
  "description": "Outline initial API spec sections.",
  "status": "draft",
  "tags": ["planning", "api"]
}
```

## Folder Structure

```
src/problem5/
├── README.md         # This file
├── package.json      # npm scripts and dependencies
├── tsconfig.json     # TypeScript compiler settings
└── src/
    ├── data/         # SQLite database file (auto-created)
    ├── index.ts      # Express app entry point
    ├── repository.ts # Data access layer
    ├── types.ts      # Shared TypeScript types
    └── validation.ts # Request validation helpers
```

## Notes & Improvements

- The validation helpers are intentionally lightweight. If this API grows, consider adding `zod` or `class-validator` for richer schemas.
- Pagination defaults to 50 items. Adjust upper bounds as needed.
- Authentication/authorization is out of scope for this task; add middleware when integrating into a real product.
- Tests are not included due to challenge scope. In production, add integration tests using a runner like `vitest` or `jest`.

