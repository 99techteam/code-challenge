# Score Service API

## 1\. Overview

This service provides a secure API endpoint for updating a user's score and a WebSocket server for broadcasting
real-time scoreboard changes. The service is designed to be **highly available**, **scalable**, and **resilient to
malicious activities**. It acts as the single source of truth for user scores and the top 10 leaderboard.

-----

## 2\. API Endpoints

### `POST /api/v1/score`

This endpoint is used to update a user's score.

#### **Authentication**

Requires a valid `Authorization` header containing a bearer token. The token must be an authenticated JSON Web Token (
JWT) signed by a trusted identity provider. The JWT's payload must contain the user's unique identifier (`sub` or
`user_id`).

#### **Authorization**

The user ID in the JWT payload must match the `user_id` in the request body to prevent unauthorized score updates.

#### **Request Body**

`Content-Type: application/json`

```json
{
  "user_id": "string",
  "score_increase": 100
}
```

* **`user_id`** (`string`): The unique identifier for the user.
* **`score_increase`** (`integer`): An integer representing the amount to add to the user's current score.

#### **Success Response**

**`200 OK`**

```json
{
  "message": "Score updated successfully.",
  "user_id": "string",
  "new_score": 1234
}
```

#### **Error Responses**

* **`400 Bad Request`**: Invalid request body or data types.
* **`401 Unauthorized`**: Missing or invalid Authorization token.
* **`403 Forbidden`**: User ID in the token does not match the request body's user ID.
* **`404 Not Found`**: User not found in the database.
* **`500 Internal Server Error`**: Server-side error.

-----

## 3\. Implementation Details & Comments for Improvement

#### **Caching for Performance**

To improve the responsiveness of the leaderboard, consider using an in-memory data store like Redis. The top 10 scores
can be stored in a sorted set, providing performance faster for updates and lookups, which is
significantly faster than querying a traditional database. The database would still be the source of truth, and the
cache would be updated upon every score change.

#### **Rate Limiting**

Implement rate limiting on the `POST /api/v1/score` endpoint to prevent a single user from spamming the server with
excessive requests.

#### **Message Queue for Scalability**

For high-traffic applications, consider using a message queue (e.g., RabbitMQ, Apache Kafka) to decouple the score
update logic from the real-time broadcasting. The API would simply publish a "score\_updated" event to the queue. A
separate worker would consume this event, update the database, and then trigger the WebSocket broadcast. This allows the
API to respond instantly while offloading heavy processing to another service.
