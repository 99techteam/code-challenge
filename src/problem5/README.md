# Problem 5: A Crude Server

This is a small ExpressJS + TypeScript CRUD server for managing books.

The service persists data to a JSON database file at `data/database.json` by default. You can override that path with `DATABASE_FILE`.

## Requirements

- Node.js 20+
- npm

## Install

From the repository root:

```bash
cd backend_test/problem5
npm install
```

## Run In Development

```bash
npm run dev
```

The server starts on `http://localhost:3000`.

To use another port:

```bash
PORT=4000 npm run dev
```

To use another database file:

```bash
DATABASE_FILE=./data/local.json npm run dev
```

## Build And Run

```bash
npm run build
npm start
```

## API

### Health Check

```bash
curl http://localhost:3000/health
```

### Create A Book

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "status": "available",
    "publishedYear": 2008
  }'
```

Fields:

- `title`: required string
- `author`: required string
- `status`: optional, one of `available`, `borrowed`, `archived`
- `publishedYear`: optional integer

### List Books

```bash
curl http://localhost:3000/books
```

Basic filters:

```bash
curl "http://localhost:3000/books?status=available"
curl "http://localhost:3000/books?author=martin"
curl "http://localhost:3000/books?q=clean"
```

### Get Book Details

```bash
curl http://localhost:3000/books/:id
```

### Update A Book

```bash
curl -X PATCH http://localhost:3000/books/:id \
  -H "Content-Type: application/json" \
  -d '{
    "status": "borrowed"
  }'
```

### Delete A Book

```bash
curl -X DELETE http://localhost:3000/books/:id
```

Successful deletes return `204 No Content`.

