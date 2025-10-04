# Live Leaderboard Module Specification

## Table of Contents

1.  [Introduction](#introduction)
2.  [Software Requirements](#software-requirements)
3.  [High-Level Design](#high-level-design)
    - [API Design](#api-design)
    - [High-Level Architecture](#high-level-architecture)
    - [Data Model](#data-model)
4.  [Design Deep Dive](#design-deep-dive)
    - [Score Update Flow](#score-update-flow)
    - [Live Leaderboard Retrieval Flow](#live-leaderboard-retrieval-flow)
    - [Security Considerations](#security-considerations)
5.  [Future Considerations](#future-considerations)

---

## 1. Introduction

This document specifies the design for a "Live Leaderboard" module, which will manage user scores, update a real-time leaderboard, and provide live score updates to connected client devices.

## 2. Software Requirements

The following requirements must be met by this module:

1.  **Scoreboard Display:** The website must display a scoreboard showing the top 10 users' scores.
2.  **Live Updates:** The scoreboard display on the website must update live as user scores change.
3.  **API-Driven Score Update:** Upon completion of a user action, an API call will be dispatched to the application server to update the score. **Only the trusted Game Service is authorized to call this API.**
4.  **Malicious Score Prevention:** Mechanisms must be in place to prevent unauthorized or malicious attempts to increase user scores.

## 3. High-Level Design

### API Design

The module will expose the following REST API and WebSocket endpoints:

**REST API (for Score Updates & Initial Leaderboard Fetch):**

- **Endpoint 1: Update User Score**
  - **Method:** `POST`
  - **Path:** `/api/v1/scores`
  - **Description:** Increases a user's score based on a completed action. **This API is strictly for internal use by the trusted Game Service.** It requires strong authentication and authorization of the calling service.
  - **Request Body:**
    ```json
    {
      "userId": "string",
      "scoreIncrease": 1
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "success": true,
      "userId": "string",
      "newScore": 1234
    }
    ```
  - **Error Responses (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 500 Internal Server Error)**
- **Endpoint 2: Get Current Leaderboard**

  - **Method:** `GET`
  - **Path:** `/api/v1/scores`
  - **Description:** Retrieves the current top 10 users and their scores. Used for initial load of the scoreboard.
  - **Query Parameters (Optional):**
    - `limit`: `integer` (default: 10, max: 100) - Number of top scores to return.
  - **Response (200 OK):**
    ```json
    {
      "data": [
        {
          "userId": "string",
          "username": "string",
          "score": 1234,
          "rank": 1
        }
      ],
      "meta": {
        "total": "number"
      }
    }
    ```
  - **Error Responses:** (e.g., 500 Internal Server Error)

- **Endpoint 3: Get User Rank**
  - **Method:** `GET`
  - **Path:** `/api/v1/scores/{:user_id}`
  - **Description:** Retrieves player rank.
  - **Response (200 OK):**
    ```json
    {
      "user_info": {
        "userId": "string",
        "username": "string",
        "score": 1234,
        "rank": 1
      }
    }
    ```
  - **Error Responses:** (e.g., 500 Internal Server Error)

### High-Level Architecture

.

**Components:**

1.  **Client Devices:** Web/Mobile applications displaying the scoreboard and initiating score updates.
2.  **Game Service:** **The authoritative backend service responsible for validating user actions and calling the Leaderboard Service's score update API.** This service handles core game logic, user authentication for in-game actions, and ensures the legitimacy of score increases.
3.  **Leaderboard Service:**
    - **REST API:** Exposes `/api/v1/score/update` (internal, Game Service only) and `/api/v1/leaderboard` (public) endpoints.
    - **Logic:** Handles score updates, interacts with Redis for the live leaderboard, persists points to the SQL database, and publishes events.
4.  **WebSocket Server:**
    - Maintains active WebSocket connections with client devices.
    - Push realtime data to active device
5.  **Database:**
    - **Redis (Sorted Set):** Used for the fast, in-memory live leaderboard. Store leaderboard and top 10 user
    - **MySQL/PostgreSQL (User Details Table):** Stores user detail (`username`, `profile_picture_url`, `score`, etc.)

### Data Model

**1. PostgreSQL/MySQL - `users` table (Existing, assuming user management):**

| Column Name     | Data Type      | Constraints        | Description                                       |
| :-------------- | :------------- | :----------------- | :------------------------------------------------ |
| `id`            | `VARCHAR(255)` | `PRIMARY KEY`      | Unique User ID (e.g., UUID)                       |
| `username`      | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Display name of the user                          |
| `info`          | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Display addition info of the user                 |
| `current_score` | `BIGINT`       | `DEFAULT 0`        | **Denormalized current score** (for audit/backup) |
| `created_at`    | `TIMESTAMP`    | `DEFAULT NOW()`    |                                                   |
| `updated_at`    | `TIMESTAMP`    | `DEFAULT NOW()`    |                                                   |

**2. Redis - `leaderboard` (Sorted Set):**

**Redis Commands:**

- `ZINCRYBY leaderboard:main <scoreIncrease> <userId>`: Atomically increments a user's score.
- `ZREVRANGE leaderboard:main 0 9 WITHSCORES`: Retrieves the top 10 users and their scores.
- `ZSCORE leaderboard:main <userId>`: Gets a specific user's score.

## 4. Design Deep Dive

### Score Update Flow

1.  **Device Action Completion:** A user completes an action on their device.
2.  **Game Service API Call:** The Game Service (which has validated the action and user's legitimacy) calls the Leaderboard Service's `POST /api/v1/score/update` endpoint.
    - **Authentication & Authorization:**
      - The Leaderboard Service **must** verify that the calling service is the **authorized Game Service** and is authorized to update scores for the given `userId`. Any calls from other unauthorized services or direct client calls **must be rejected**.
3.  **Leaderboard Service:**
    - **Input Validation:** Validates `userId` and `scoreIncrease`.
    - **Redis Update:**
      - Increase score into `leaderboard` by ZINCRBY. This atomically updates the user's score in the Redis sorted set.
      - Get top 10 by `ZREVRANGE` and update top 10 user into `top10`
    - **SQL Persistence:**
      - Update score into user point table
    - **API Response:** Returns a success response to the Game Service, including the `newScore`.

### Live Leaderboard Retrieval Flow

1.  **Initial Load (Device):** When a user navigates to the scoreboard page:
    - The Device calls the Leaderboard Service's `GET /api/v1/scores` REST API.
    - The Leaderboard Service:
      - Get top 10 user: Get cache from `top10` data in redis
      - Get leaderboard: Executes `ZREVRANGE` to get top of user. For each `userid`, it fetches detail user from the `users` table.
    - The Device displays the initial top 10 leaderboard.
2.  **Live Updates (Device):**
    - The Device establishes a WebSocket connection
    - Upon update flow done, Websocket server emit top 10 latest to device

### Security Considerations

1.  **Authentication & Authorization:**
    - **Game Service -> Leaderboard Service:** Implement strong authentication (e.g., API keys, OAuth client credentials, JWT) for the Game Service to call the `score/update` API. **Crucially, the API Gateway or Leaderboard Service must explicitly verify that the caller is the trusted Game Service and reject any other callers.**
    - **Device -> Leaderboard Service (REST/WebSocket):** User authentication (e.g., JWT in HTTP headers or as part of WebSocket handshake) is crucial if fetching personalized data or if WebSocket connection needs to be tied to a specific user. For public leaderboards, less strict auth might be acceptable for `GET /leaderboard`.
2.  **Rate Limiting:** Implement rate limiting on the `POST /api/v1/score/update` endpoint to prevent abuse and denial-of-service attacks, even from authorized services.
3.  **Transport Security (HTTPS/WSS):** All API communication (REST and WebSockets) must use TLS/SSL (`HTTPS`/`WSS`) to encrypt data in transit.
4.  **Trust Boundary:** The _Game Service_ is the **sole trusted entity** for score updates. The client device **must NOT** directly call the `score/update` API.

## 5. Future Considerations

- **Redis for Leaderboard:** Scale redis by data sharding and primary/replica to optimize storage, availability.
- **Service:** Can be scaled horizontally by adding more instances behind a load balancer.
