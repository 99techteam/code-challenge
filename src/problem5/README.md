# Problem 5: Resource CRUD API

Express + TypeScript service with Prisma and SQLite persistence.

## Requirements and startup

Use Node.js 18 or newer. In `express-ts-crud`, install packages and configure `DATABASE_URL` as `file:./dev.sqlite`. Prisma resolves that path beside its schema, and git ignores the local database file. Then generate the Prisma client, initialize the database, and start the API:

```sh
npm install
DATABASE_URL='file:./dev.sqlite' npm run db:setup
DATABASE_URL='file:./dev.sqlite' npm run dev
```

The service listens on port 3000 by default. Set `PORT` to use another port. For a production compile run `npm run build`, then `npm start`.

## Endpoints

All request and response bodies use JSON.

| Method | Path | Behavior |
| --- | --- | --- |
| `POST` | `/resources` | Create `{ "name": "...", "description": "..." }`; returns `201`. Name is required (1–120 characters); description is optional or `null`. |
| `GET` | `/resources` | List newest first. Optional `?name=term` performs a name substring filter. |
| `GET` | `/resources/:id` | Return one resource or `404`. |
| `PUT` | `/resources/:id` | Update `name`, `description`, or both. Empty updates and invalid values return `400`; missing IDs return `404`. |
| `DELETE` | `/resources/:id` | Delete one resource; returns `204` or `404`. |

SQLite stores resource records locally. Keep local environment configuration and generated database files out of version control. This challenge service does not include user authentication or production deployment hardening.
