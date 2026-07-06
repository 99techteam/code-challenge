# Problem 5: CRUD API

Express + TypeScript REST API with SQLite persistence.

## Setup

```bash
cd src/problem5
npm install
```

## Run

```bash
npm run start:dev   # development (tsx)
npm run dev         # watch mode
npm run build && npm start
```

Server listens on port 3000 by default.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health + route list |
| POST | `/api/resources` | Create resource |
| GET | `/api/resources` | List (filter, paginate) |
| GET | `/api/resources/:id` | Get one |
| PUT | `/api/resources/:id` | Update |
| DELETE | `/api/resources/:id` | Delete |

Query params for list: `category`, `status`, `search`, `limit`, `offset`.

## Examples

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Mechanical Keyboard","category":"electronics","description":"Cherry MX switches"}'

curl "http://localhost:3000/api/resources?category=electronics&limit=10"

curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

curl -X DELETE http://localhost:3000/api/resources/1
```

## Tests

```bash
npm test
npm run test:coverage
```

Tests live in `src/__tests__/api.test.ts` and hit the real SQLite database.

## Layout

```
src/
├── app.ts
├── server.ts
├── models.ts
├── db/
│   ├── connection.ts
│   └── schema.ts
└── items/
    ├── repository.ts
    ├── handlers.ts
    └── routes.ts
```
