# Scoreboard API Module

## Overview

This module provides a backend API to manage a **real-time scoreboard**. Users earn points by completing an action (the specific action is not defined and does not need to be tracked), and the frontend displays the Top 10 highest scores. The system ensures fast updates, security, and protection against cheating.

---

## Features

- Retrieve the **Top 10 users with the highest scores**.
- API to **increase a user's score** upon action completion.
- **Real-time updates** via WebSocket or Server-Sent Events (SSE) as an implementation option.
- **Authentication & authorization** using JWT.
- **Anti-cheating measures** to prevent unauthorized score increases.
- Support for **logging** to monitor score updates.

---

## Tech Stack

- **Backend Framework:** Node.js (Express or NestJS)
- **Database:** PostgreSQL or MongoDB
- **Cache:** Redis (Save top 10 for quick access)
- **Realtime:** WebSocket / SSE / PubSub
- **Authentication:** JWT / OAuth2
- **Message Queue (option):** Kafka / RabbitMQ for large scale

---

## Project Structure

/src
/controllers # Handles requests and responses from clients
/services # Contains business logic (calculation, validation, score updates)
/models # Defines data structures (User, Score)
/routes # Defines API endpoints
/ws # Manages WebSocket connections for real-time updates
/utils # Utility functions (authentication, logging, error handling)
app.js # Initializes and configures the server
config.js # Environment configuration (port, database, JWT secret)
/tests # Unit and integration tests

---

## API Endpoints

### 1. Increase User's Score

POST /api/scores/increase
**Headers:**

- `Authorization: Bearer <JWT token>`

**Body:**
{
"userId": "12345",
"points": 10
}
**Response:**
{
"success": true,
"newScore": 150
}

### 2. Get Top 10 Scores

GET /api/scores/top
**Respone:**
{
"scores": [
{ "userId": "123", "username": "Alice", "score": 250 },
{ "userId": "456", "username": "Bob", "score": 230 }
]
}

---

## WebSocket Events

**Option: WebSocket or SSE**
**Endpoint:** ws://server/api/scores/stream
scoreUpdated → Triggered when a user's score is updated.
{ "event": "scoreUpdated", "userId": "123", "newScore": 260 }
leaderboardUpdated → Triggered when the Top 10 changes.
{
"event": "leaderboardUpdated",
"scores": [
{ "userId": "123", "username": "Alice", "score": 260 },
{ "userId": "456", "username": "Bob", "score": 230 }
]
}

---

## Setup Instructions

1. Clone repo:
   git clone https://github.com/your-org/scoreboard-api.git
   cd scoreboard-api
2. Install dependencies:
   npm install
3. Create file .env:
   PORT=8000
   DB_URL=postgres://user:pass@localhost:5432/scoreboard
   JWT_SECRET=your_secret
   REDIS_URL=redis://localhost:6379
4. Run the server:
   npm run start
   npm run dev

## Testing

1. Using Postman

- POST request /api/scores/increase to check for score updates.
- GET /api/scores/top to check for results.

---

## Security

- Authentication: Requires JWT token for all score update requests.
- Authorization: User ID is extracted from the token, not from the client request, to prevent tampering.
- Anti-Cheating: Backend autonomously increments scores (e.g., +10 per action) instead of relying on client-provided values.
- Rate Limiting: Implement using Redis or NGINX to prevent API spam.
- Audit Logging: Record all score updates for fraud detection.

---

## Error Handling

- 400 Bad Request: Invalid request data.
- 401 Unauthorized: Missing or invalid JWT token.
- 403 Forbidden: User lacks permission.
- 404 Not Found: Resource not found.
- 500 Internal Server Error: Server-side error.

---

## Improvements

- Add pagination for the leaderboard (beyond Top 10).
- Integrate monitoring with Prometheus and Grafana.
- Support multiple leaderboards (e.g., by region or game mode).
- Implement automated fraud detection rules.

---

## Flow of Execution (Text Diagram)

User Action → API Call (POST /api/scores/increase) → Validate Token & User → Increment Score → Update Database → Notify Frontend (WebSocket/SSE) → Refresh Leaderboard
