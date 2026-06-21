### Problem 6: Architecture
The system utilizes a stateless, horizontally scalable API architecture powered by Redis for real-time leaderboards and PostgreSQL for durable persistence

## 1. Project Objective
This service manages a real-time leaderboard for our website. The core objectives are:
- **Real-time Synchronization:** Update the Top 10 leaderboard live as user scores change.
- **Score Persistence:** Process completed user actions to increment scores reliably.
- **Security:** Ensure all score updates are authorized and protected against malicious tampering.

## 2. System Requirements
1. **Live Updates:** Maintain a live-updating Top 10 leaderboard.
2. **Score Processing:** Expose an API endpoint to increment scores upon action completion.
3. **Security:** Implement strict authorization to prevent unauthorized score manipulation.
---

## 3. Technology Stack
This service is built for high-concurrency and real-time responsiveness.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (TypeScript) | Strong typing and non-blocking I/O |
| **API Framework** | Express | Modular, lightweight routing |
| **Real-time** | Socket.io | Bi-directional event-based broadcasting |
| **Database** | PostgreSQL | ACID compliance for atomic score updates |
| **Caching/Pub-Sub** | Redis | High-speed leaderboard and event broadcasting |
| **Validation** | Zod | Runtime schema enforcement |

## 4. Architecture Overview


``` mermaid 
sequenceDiagram
    participant U as User Client
    participant A as API Service
    participant DB as PostgreSQL
    participant R as Redis (Pub/Sub)
    participant W as WebSocket Server

    U->>A: POST /api/v1/scores/increment (JWT)
    A->>A: Verify JWT & Validate Request
    A->>DB: Atomic UPDATE scores SET score = score + N
    A->>R: Publish 'score_updated' event
    R->>W: Notify broadcast trigger
    W-->>U: Push Updated Top 10 Leaderboard
```

## 5. Tables

**5.1** **Users Table**

``` sql 

CREATE TABLE users (

    user_id SERIAL PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

```



**5.2 Scores Table**

``` sql 
CREATE TABLE scores (

    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),

    total_score BIGINT DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

```



**5.3 Audit Log (For Idempotency & History)**
``` sql
CREATE TABLE action_logs (

    action_id UUID PRIMARY KEY,

    user_id INTEGER REFERENCES users(user_id),

    increment_value INTEGER NOT NULL,

    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

); 
```

### 5.4 Action Types
**Please use this Object for checking score**
``` js
 const ACTION_SCORES = {
  'LEVEL_COMPLETE': 500,
  'DAILY_BONUS': 100,
  'SOCIAL_SHARE': 50,
  'TUTORIAL_FINISH': 200
};
```

## 6. Performance & Caching
To ensure high responsiveness under load, the system utilizes Redis to offload read-heavy operations:

* **Leaderboard Data:** Cached using Redis **Sorted Sets (ZSET)**. This allows for $O(\log N)$ retrieval of top-ranked users, keeping the leaderboard performant regardless of user count.
* **User Scores:** Individual scores are cached with a short TTL (60s) to minimize direct database hits.
* **Data Consistency:** The database remains the final source of truth; Redis acts purely as a performance optimization layer.

## 7.1. Authentication & Session Management Specification
The system uses JSON Web Tokens (JWT) for stateless, scalable authentication. To ensure security, the implementation includes a robust token lifecycle:

-   **Token Issuance:** Upon login, the client receives an access token (short-lived) and an optional refresh token.
-   **Token Versioning:** Each user has a token_version stored in the database. Every request validates the token's version against the database, allowing for immediate "Logout All Sessions" functionality if a user's account is compromised.
-   **Revocation List:** A Redis-backed blacklist is used to immediately invalidate individual jti (JWT ID) claims, ensuring that access can be revoked before the token naturally expires.

## 8. Real-Time Features (Socket.io)
This system utilizes Socket.io to provide bidirectional, event-based communication between the server and the client.

Key Implementations:
- **Persistent Connections:** Maintains a long-lived connection for real-time data streaming (e.g., live score updates).

- **Event-Driven Architecture:** Uses a pub/sub pattern where the server broadcasts score events to relevant subscribers.

- **Automatic Fallbacks:** Socket.io handles connection drops and reconnections gracefully, ensuring the client remains in sync with the server.

## 9.  End points
### 9.1. ``GET`` /api/v1/leaderboards
- **Description:** Retrieve the current Top 10 users' scores..
- **Method:** ``GET``
- **Headers:**
  -**Authorization:** ``Bearer <JWT_TOKEN>`` **(Optional)**
- **Query Parameters:**

  * **`limit`** *(Optional, Integer)*: The number of records to return.
       * **Default:** `10`
       * **Maximum:** `100`
       * **Explanation:** Restricts the result set size to optimize performance and prevent excessive payload sizes.

  * **`offset`** *(Optional, Integer)*: The number of records to skip.
    * **Default:** `0`
    * **Explanation:** Enables pagination by allowing the client to request subsequent pages of data.
- **Success Response** (200 OK)
  ```json
  {
  "status": "success",
  "data": {
    "leaderboard": [
      { "rank": 1,"user_id": 77, "username": "PlayerOne", "score": 1500 },
      { "rank": 2,"user_id":7 ,"username": "PlayerTwo", "score": 1450 }
    ]
  }
}


### 9.2. ``POST`` /api/v1/scores/increment
- **Description:** Atomically increments the user's score in the primary database and triggers a real-time leaderboard update
- **Method:** ``POST``
- **Headers:** - **Authorization:** 
  *  ``Bearer <JWT_TOKEN>`` 
  * ``Content-Type: application/json``
- **Payload:**
  ```json
  {
  "action_id": "string",
  "action_type": "LEVEL_COMPLETE"
}
- **Success Response** (200 OK):
  ```json
  {
  "status": "success",
  "message": "Score updated successfully",
  "new_score": 1510
} 
- **Error Responses:**
  * **``401`` Unauthorized**: Token is missing or invalid.
Used to securely increment a user's score upon action completion.
  * **``400`` Bad Request:** increment_value must be a positive integer.
  * **``429 (Rate Limit):** Rate limit exceeded
  * **``500`` Internal Server Error:** Database or Cache service failure.

### 8.3. ``GET`` /api/v1/user/:user_id
- **Description:** Retrieve user detail..
- **Method:** ``GET``
- **Headers:**
  -**Authorization:** ``Bearer <JWT_TOKEN>``
- **Query Parameters:** None
- **Success Response** (200 OK)
  ```json{
  "status": "success",
  {
    "data": {
      "user_id": 132,
      "user_name": "Data Guy",
      "email": "dataguy@gmail.com",
      "created_at": "2026-06-21T12:56:11Z"
    }
  }
- **Error Response (404 Not Found):**
  ```json 
  {
  "status": "error",
  "message": "User not found"
}



## 📚 Documentation
- [Architecture & Flow](./architecture.md)
- [Future Improvements](./improvement.md)

