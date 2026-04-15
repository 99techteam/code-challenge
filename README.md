# 99Tech Backend Assessment

This repository contains my backend assessment solutions for 99Tech.

## Problem 4

File: `src/problem4.ts`

The task is to provide three unique TypeScript implementations of:

```ts
function sum_to_n(n: number): number
```

For example:

```ts
sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
```

### Assumption

The prompt says `n` can be any integer, but only defines the positive case.
For `n <= 0`, I interpret "sum to n" as walking from `1` down to `n`.

Example:

```ts
sum_to_n(-3) === 1 + 0 + (-1) + (-2) + (-3) === -5
```

The prompt also states that the result will always be less than
`Number.MAX_SAFE_INTEGER`.

### Implementations

- `sum_to_n_a`: arithmetic formula, `O(1)` time and `O(1)` space.
- `sum_to_n_b`: iterative loop, `O(|n|)` time and `O(1)` space.
- `sum_to_n_c`: recursion, `O(|n|)` time and `O(|n|)` space.

### Run

```bash
npm install
npm run build
npm run problem4
```

## Problem 5

File: `src/problem5/server.ts`

The task is to develop an ExpressJS backend server with TypeScript, CRUD APIs,
basic filters, and simple data persistence.

This solution uses a `Book` resource and stores data in `data/books.json`.
The JSON file acts as a simple file-based database, so data remains after the
server restarts.

### Book Resource

```ts
type Book = {
  id: string;
  title: string;
  author: string;
  status: "available" | "borrowed" | "archived";
  description?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Run Server

```bash
npm install
npm run dev
```

The server starts on:

```txt
http://localhost:3000
```

You can change the port with:

```bash
PORT=4000 npm run dev
```

### API Endpoints

Health check:

```bash
curl http://localhost:3000/health
```

Create a book:

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","status":"available","description":"A book about writing readable code."}'
```

List books:

```bash
curl "http://localhost:3000/books"
```

List books with filters:

```bash
curl "http://localhost:3000/books?status=available&author=robert&q=clean&limit=10&offset=0"
```

Get book details:

```bash
curl http://localhost:3000/books/<book-id>
```

Update a book:

```bash
curl -X PATCH http://localhost:3000/books/<book-id> \
  -H "Content-Type: application/json" \
  -d '{"status":"borrowed"}'
```

Delete a book:

```bash
curl -X DELETE http://localhost:3000/books/<book-id>
```

### Build And Run Compiled Code

```bash
npm run build
npm start
```
