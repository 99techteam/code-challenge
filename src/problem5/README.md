# Simple CRUD Backend (Clean Architecture)

A production-ready backend system for a simple CRUD application built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, **Prisma**, and **Redis**, following **Clean Architecture** principles.

---

## Features

- ✅ RESTful API with Express.js
- ✅ Clean Architecture: Domain / Application / Infrastructure / Interfaces / Config
- ✅ PostgreSQL via Prisma ORM
- ✅ Redis Caching
- ✅ Input validation with Zod
- ✅ OpenAPI (Swagger) docs generation
- ✅ Logging via Winston
- ✅ ESLint + Prettier + Commitlint + Husky
- ✅ Docker + Docker Compose support

---

## Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Language      | Node.js, TypeScript              |
| Framework     | Express.js                       |
| ORM           | Prisma                           |
| Database      | PostgreSQL                       |
| Cache         | Redis                            |
| API Docs      | Swagger UI + swagger-jsdoc       |
| Validation    | Zod + zod-to-openapi             |
| Linting       | ESLint + Prettier                |
| CI Hooks      | Husky + lint-staged + commitlint |
| Build Tool    | tsup                             |
| Testing       | Jest (TBD)                       |
| Dockerization | Docker + docker-compose          |

---

## Project Structure

```bash
src/
├── application/       # Use cases, DTOs
├── domain/            # Entities, interfaces
├── infrastructure/    # DB, cache, log, etc.
│   └── database/
│       └── prisma/    # schema.prisma, migrations
├── interfaces/        # Express controllers & routes
├── config/            # env, rate-limit, etc.
├── shared/            # Common utilities
├── types/             # Global TypeScript types
└── index.ts           # Entry point
```

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/your-username/simple_e_commerce.git
cd simple_e_commerce
npm install
```

### 2. Create `.env` (based on `.env.example`)

Copy `.env.example` and adjust as needed:

```bash
cp .env.example .env
```

### 3. Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Start the App

```bash
npm run dev
```

### 5. Build and Run with Docker

> ⚠️ Make sure your `.env` file has `DATABASE_URL` and `REDIS_URL` updated with the correct service names from `docker-compose.yml`, e.g.:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres
REDIS_URL=redis://redis:6379
```

Then run:

```bash
docker-compose up --build
```

---

## Linting & Formatting

```bash
npm run lint        # Lint all .ts files
npm run format      # Format files with Prettier
```

---

## API Documentation

Swagger UI available at:

```
GET /api-docs
```

---

## License

MIT © Vinh Dang Quang

---

## Notes

- This project follows Clean Architecture.
- Prisma client is generated for both `darwin` (local) and `linux-musl-arm64` (Docker).
