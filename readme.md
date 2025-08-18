# 99Tech Code Challenge

## Problem 4: Sum from 1 to n

Three different ways to calculate sum from 1 to n:

- `sum_to_n_a` - Math formula (fastest) - O(1)
- `sum_to_n_b` - Basic loop - O(n) time, O(1) space
- `sum_to_n_c` - Recursive - O(n) time and space

## Running

```bash
npm install
npm run build
npm run test:problem4
```

See [src/problem4/](./src/problem4/) for the implementation.

## Problem 5: Modern ExpressJS v5 CRUD API

A production-ready RESTful API built with ExpressJS v5, TypeScript, Sequelize ORM, and PostgreSQL.

### Features

- **Modern ExpressJS v5** with TypeScript
- **Sequelize ORM** with PostgreSQL database
- **Complete CRUD operations** for resource management
- **Input validation** with Joi schemas
- **Comprehensive error handling** with custom error classes
- **Structured logging** with Pino
- **Docker** containerization for easy deployment
- **Automatic database initialization** with migrations and seeding
- **Full type safety** with zero `any` types

### Quick Start

**One-command setup:**

```bash
cd src/problem5 && docker-compose up -d
```

The API will be available at `http://localhost:3000/api` with database automatically initialized.

**Test the API:**

```bash
# Health check
curl http://localhost:3000/api/health

# Create a resource
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Resource", "description": "Test", "category": "software", "status": "active"}'

# List resources
curl http://localhost:3000/api/resources
```

### Documentation

- **Full Documentation**: [src/problem5/README.md](./src/problem5/README.md)
- **API Testing**: Use [src/problem5/api-test.http](./src/problem5/api-test.http) with REST clients
- **Project Structure**: Modern TypeScript/Express.js architecture with Sequelize ORM

## Problem 6: Real-Time Scoreboard API Specification

A comprehensive API specification for a real-time scoreboard system that displays top 10 user scores with live updates.

### Features

- **Real-time Updates**: WebSocket-based live scoreboard updates
- **Secure Score Management**: JWT authentication with action verification
- **Top 10 Leaderboard**: Public API endpoint for scoreboard display
- **Anti-Cheat Protection**: Action replay prevention and rate limiting
- **Database Design**: PostgreSQL schema with optimized indexing

### Key Requirements

1. **Scoreboard Display**: API endpoint to serve top 10 user scores
2. **Live Updates**: Real-time scoreboard updates via WebSocket
3. **Score Submission**: Secure API for updating user scores after actions
4. **Authorization**: JWT-based authentication to prevent unauthorized score manipulation
5. **Performance**: Caching and database optimization for high concurrency

### API Endpoints

- `GET /api/scoreboard` - Get top 10 scores (public)
- `POST /api/scores` - Submit score update (authenticated)
- `WS /ws/scoreboard` - WebSocket for real-time updates

### Documentation

- **Complete Specification**: [src/problem6/README.md](./src/problem6/README.md)
- **API Testing**: Use [src/problem6/api-test.http](./src/problem6/api-test.http) with REST clients
- **Architecture Diagram**: Visual flow diagram included in specification
