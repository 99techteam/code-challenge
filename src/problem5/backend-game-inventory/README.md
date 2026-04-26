# Game Inventory API

A simple **Game Inventory Management API** built with **Node.js, Express, TypeScript, MongoDB, and Docker**.

---

# Tech Stack

- Node.js + Express
- TypeScript
- MongoDB
- Docker & Docker Compose

---

# Project Structure
```bash
├── app.ts
├── server.ts
│
├── config
│ ├── env.ts
│ └── index.ts
│
├── controllers
│ ├── game.controller.ts
│ └── tests
│
├── services
│ ├── game.service.ts
│ └── tests
│
├── routes
│ └── game.routes.ts
│
├── models
│ └── game.model.ts
│
├── db
│ └── mongo.ts
│
├── dto
│ └── game.dto.ts
│
├── validation
│ └── game.validation.ts
│
├── middleware
│ ├── errorHandler.ts
│ └── validate.ts
│
├── utils
│ ├── AppError.ts
│ ├── asyncWrapper.ts
│ ├── errors.ts
│ ├── handler.ts
│ └── response.ts
│
├── types
│ ├── express.d.ts
│ └── validated-request.ts
│
└── docs
└── openapi.yaml
```

# Environment Setup

## 1. Create `.env` file

Copy from `.env.example`:

```bash
cp .env.example .env
```
Example
```
PORT=3000
MONGO_URI=mongodb://db:27017/game_inventory
NODE_ENV=development
```

## 2. Development setup

Start dev environment
```bash
docker compose -f docker-compose.dev.yml up -d
```

View logs
```bash
docker compose -f docker-compose.dev.yml logs -f app
```
Access app
```
http://localhost:3000
```

Stop dev
```bash
docker compose -f docker-compose.dev.yml down
```

## 3. Production setup

Start production
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

View logs
```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Access app
```
http://localhost:3000
```

Stop production
```bash
docker compose -f docker-compose.prod.yml down
```

## 4. API Documentation

The API is documented using OpenAPI (Swagger).

After running the application, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

## 5. Running Tests

The project uses Jest for unit testing.

Run all tests
```
npm run test
```

Run tests in watch mode
```
npm run test:watch
```