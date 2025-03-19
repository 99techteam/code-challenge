# Scoreboard API Service

## Overview

This module provides an API service for managing a scoreboard system that tracks and updates user scores. It ensures live updates, prevents unauthorized modifications, and maintains a real-time top 10 leaderboard.

## Features

- Stores user scores.
- Provides a live scoreboard displaying the top 10 scores.
- Updates user scores when an action is completed.
- Implements security measures to prevent unauthorized score modifications.

## API Endpoints

### 1. Submit Score

**Endpoint:** `POST /api/score/update`

**Description:** Updates the user's score when they complete an action.

**Request:**

```json
{
  "userId": "string",
  "scoreIncrease": "number",
  "authToken": "string"
}
```

**Response:**

```json
{
  "message": "Score updated successfully",
  "newScore": "number"
}
```

**Security Measures:**

- Auth token validation.
- Rate limiting to prevent abuse.
- Server-side verification of score updates.

### 2. Fetch Leaderboard

**Endpoint:** `GET /api/score/leaderboard`

**Description:** Retrieves the top 10 user scores.

**Response:**

```json
[
  {
    "rank": 1,
    "userId": "string",
    "score": "number"
  },
  ...
]
```

### 3. User Authentication

**Endpoint:** `POST /api/auth/login`

**Description:** Generates an authentication token for a valid user.

**Request:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "authToken": "string"
}
```

## Error Handling

To ensure robust error management, the API provides structured error responses for various failure scenarios:

### General Error Response Format
```json
{
  "error": "string",
  "statusCode": "number"
}
```

### Common Errors

| Error Code | Scenario | Response |
|------------|---------------------------|------------------------------------------------|
| 400 | Invalid request data | `{ "error": "Invalid input", "statusCode": 400 }` |
| 401 | Unauthorized access | `{ "error": "Unauthorized", "statusCode": 401 }` |
| 403 | Forbidden action | `{ "error": "Forbidden", "statusCode": 403 }` |
| 404 | Resource not found | `{ "error": "Not Found", "statusCode": 404 }` |
| 429 | Too many requests | `{ "error": "Rate limit exceeded", "statusCode": 429 }` |
| 500 | Server error | `{ "error": "Internal server error", "statusCode": 500 }` |

## Live Scoreboard Update Strategy

To ensure real-time leaderboard updates, I propose the following solutions:

1. **WebSockets:** Ideal for instant updates when new scores arrive.
2. **Polling:** Frontend fetches leaderboard every few seconds.
3. **Cron Job:** Backend updates and caches the leaderboard every X minutes.

## Execution Flow

1. User performs an action.
2. Action triggers `POST /api/score/update` with authentication.
3. Server verifies the request and updates the database.
4. Leaderboard updates either immediately (WebSockets) or periodically (cron job).
5. `GET /api/score/leaderboard` fetches the latest leaderboard.

## Improvements & Considerations

- Implement role-based access control for score updates.
- Use Redis for caching leaderboard results to improve performance.
- Add logging and monitoring for API usage and security events.

