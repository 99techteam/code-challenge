# 99Tech Code Challenge #1 #

# Problem 4: Three Ways to Sum to n

**Location**: `src/problem4/`

This problem implements three unique approaches to calculate the summation of integers from 1 to n:

- **Implementation A**: Recursive approach
- **Implementation B**: Iterative/Loop approach
- **Implementation C**: Mathematical formula approach

---

# Problem 5: A Crude Server

**Location**: `src/problem5/`

An Express backend with TypeScript providing RESTful CRUD operations for resource management using SQLite.

**Features**:

- CRUD operations (Create, Read, Update, Delete)
- Full TypeScript type safety
- SQLite database for persistence
- Filtering & search capabilities
- Pagination support (limit and offset)
- Comprehensive error handling
- CORS support

**Project Structure**:

```
src/
├── server.ts                    # Main Express server entry point
├── controllers/                 # Business logic for CRUD operations
├── database/                    # SQLite database configuration
├── middlewares/                 # Error handling middleware
├── repositories/                # SQL command execution layer
├── routes/                      # API route definitions
└── types/                       # TypeScript type definitions
```

**How to run**:

1. Navigate to `src/problem5/`
2. Install dependencies: `npm install`
3. Configure environment variables (see README.md for details)
4. Build TypeScript: `npm run build` (if applicable)
5. Start the server: `npm start`
6. Test API endpoints with your preferred HTTP client (Postman, curl, etc.)

**API Endpoints**:

- `GET /resource` - Get all resources with optional filtering and pagination
- `POST /resource` - Create a new resource
- `GET /resource/:id` - Get a specific resource
- `PUT /resource/:id` - Update a resource
- `DELETE /resource/:id` - Delete a resource

---

# Problem 6: Scoreboard API Service - Architecture

**Location**: `src/problem6/`

A specification about backend service designed to manage user scores and provide real-time leaderboard updates using Redis and PostgreSQL.

**Core Components**:

- `LeaderboardService.ts` - Manages leaderboard operations
- `RedisClient.ts` - Redis connection
- `README.md` - The final specification
