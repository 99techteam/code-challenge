# 🛒 Product API

A simple RESTful API for managing products, built with Express, Prisma, PostgreSQL, and TypeScript.

## Features

- CRUD operations for products
- Input validation with Zod
- OpenAPI (Swagger) documentation at `/docs`
- Rate limiting, security headers, and CORS enabled

## Getting Started

### 1. Prerequisites

- [Docker](https://www.docker.com/) installed (for DB and app)
- Or: PostgreSQL running locally and Node.js 18+

### 2. Running with Docker Compose

```sh
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- API server on port 3000

### 3. Running Locally (without Docker)

```sh
cd src/problem5
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

> Ensure your `.env` has a valid `DATABASE_URL`.

### 4. Accessing Swagger (OpenAPI) Docs

Once running, open [http://localhost:3000/docs](http://localhost:3000/docs) in your browser.

You can try all endpoints directly from the Swagger UI.

## Example Endpoints

- `GET /products` — List all products
- `POST /products` — Create a product
- `GET /products/{id}` — Get product by ID
- `PUT /products/{id}` — Update product
- `DELETE /products/{id}` — Delete product

## Testing

```sh
npm run test
```

---
