# Real-Time Scoreboard API Module

## Overview

This module provides a backend API service to manage a real-time scoreboard for a website with 50,000 daily active users (DAU). It handles user score updates, maintains a top 10 leaderboard, and broadcasts updates to connected clients. The service uses a message queue to manage large request volumes, especially during peak times (10x daily average).

## Performance Requirements

- **DAU**: 50,000 users
- **Daily Reads**: 200,000
- **Daily Writes**: 500,000
- **Total Daily Requests**: 700,000 (~8.1 requests/second on average)
- **Peak Load**: 81 requests/second (10x average during peak times)

## Features

- **Score Updates**: Accepts score update requests from authenticated users via an API and queues them for processing.
- **Real-Time Updates**: Broadcasts the top 10 leaderboard to all connected clients using WebSockets.
- **Security**: Implements authentication and validation to prevent unauthorized score changes.
- **Scalability**: Uses a message queue (e.g., RabbitMQ) to handle high write volumes and peak loads.

## API Endpoints

### 1. `POST /api/score/update`
Queues a user's score update after completing an action.

#### Request
- **Method**: POST
- **URL**: `/api/score/update`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>` (required)
- **Body** (JSON):
  ```json
  {
    "userId": "string", // Unique user identifier
    "scoreIncrement": "number" // Positive integer to add to user's score
  }
  ```

#### Response
- **Success** (200 Accepted):
  ```json
  {
    "status": "success",
    "message": "Score update queued",
    "newScore": "number"
  }
  ```
- **Error** (400 Bad Request):
  ```json
  {
    "status": "error",
    "message": "Invalid score increment"
  }
  ```
- **Error** (401 Unauthorized):
  ```json
  {
    "status": "error",
    "message": "Authentication failed"
  }
  ```

### 2. WebSocket Endpoint: `/ws/scoreboard`
Provides real-time updates of the top 10 leaderboard.

#### Connection
- **URL**: `wss://<server-domain>/ws/scoreboard`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>` (required)

#### Messages (Server to Client)
- **Event**: `leaderboardUpdate`
- **Payload**:
  ```json
  {
    "event": "leaderboardUpdate",
    "top10": [
      { "userId": "string", "username": "string", "score": "number" },
      // ... up to 10 entries
    ]
  }
  ```

## Architecture

- **Backend Framework**: Node.js with Express
- **WebSocket**: Socket.IO for real-time updates
- **Database**: Redis for fast in-memory storage of scores
- **Message Queue**: RabbitMQ to handle score update requests asynchronously
- **Authentication**: JWT-based authentication

## Flow of Execution

1. Client authenticates and receives JWT token (handled by separate auth service).
2. User completes an action on the website.
3. Client sends `POST /api/score/update` with user ID and score increment.
4. Server validates JWT token and request data.
5. Server pushes the update to RabbitMQ queue.
6. Worker process consumes queue, updates score in Redis, and recalculates top 10.
7. Server broadcasts updated leaderboard via WebSocket to all connected clients.
8. Clients receive and display the updated top 10 list.

## Security Measures

- JWT token validation for all requests and WebSocket connections.
- Rate limiting on score update endpoint (e.g., 100 requests/minute per user).
- Input validation: scoreIncrement must be a positive integer.
- HTTPS enforcement for all communications.

## Dependencies

- Express.js - HTTP server framework
- Socket.IO - WebSocket implementation
- Redis - In-memory data store
- RabbitMQ - Message queue for asynchronous processing
- jsonwebtoken - JWT handling
- express-rate-limit - Rate limiting middleware

## Setup Instructions

1. Install dependencies: `npm install express socket.io redis amqplib jsonwebtoken express-rate-limit`
2. Configure environment variables:
   - `PORT`: Server port (default: 3000)
   - `REDIS_URL`: Redis connection string
   - `RABBITMQ_URL`: RabbitMQ connection string
   - `JWT_SECRET`: Secret key for JWT verification
3. Start RabbitMQ server: `rabbitmq-server`
4. Run the server: `node server.js`
5. Run worker process: `node worker.js`

## Improvements (See Comments Below)

- Add a persistent database (e.g., PostgreSQL) for score history.
- Implement queue priority for peak time requests.
- Add monitoring for queue depth and processing latency.

---

**Additional Comments for Improvement**

1. **Persistence**: Pair Redis with PostgreSQL for long-term score storage and recovery.
2. **Queue Management**: Use RabbitMQ's priority queues or multiple queues for different user tiers during peak loads.
3. **Scalability**: Deploy multiple worker instances to process the queue in parallel; consider Kubernetes for orchestration.
4. **Monitoring**: Use Prometheus and Grafana to monitor queue depth, processing times, and peak load performance.
5. **Rate Limiting**: Adjust rate limits dynamically based on DAU and peak patterns.
```

---

### 2. Updated Diagram - Flow of Execution

```
[Client] --> (User Action Complete)
  |
  v
[HTTP POST /api/score/update] --> [Server]
  |                                 |
  |                                 v
  |                           [Validate JWT]
  |                                 |
  |                                 v
  |                           [Validate Input]
  |                                 |
  |                                 v
  |                           [Push to RabbitMQ]
  |                                 |
  v                                 v
[Response: 200 Accepted]    [Worker Process]
                                |
                                v
                          [Consume Queue]
                                |
                                v
                          [Update Score in Redis]
                                |
                                v
                          [Recalculate Top 10]
                                |
                                v
                          [WebSocket Broadcast]
                                |
                                v
[Client Updates UI] <-- [WS: leaderboardUpdate] --> [All Connected Clients]
```

---

### 3. Additional Comments for Improvement

These are included in the `README.md` but elaborated here:
1. **Persistence**: Redis is fast but volatile; PostgreSQL could log all writes for audit and recovery.
2. **Queue Management**: During peak times (81 req/s), multiple workers can process the queue concurrently, and priority queues could favor high-value users.
3. **Scalability**: With 500,000 daily writes (~5.8 writes/s average, 58 writes/s peak), RabbitMQ ensures writes are handled asynchronously, preventing server overload.
4. **Monitoring**: Track queue backlog and processing latency to detect bottlenecks during peak times.
5. **Security**: Consider signing queue messages to prevent tampering between server and worker.

---

### 4. Specification Context for Backend Team

This updated spec assumes:
- Familiarity with Node.js, Express, Redis, and RabbitMQ
- Ability to implement JWT authentication
- Capacity to handle ~81 requests/second at peak with potential for growth

The message queue (RabbitMQ) is critical for handling the 500,000 daily writes (peak 58 writes/s), ensuring the system doesn’t block under load. The team should test the worker process under peak conditions and scale workers as needed.
