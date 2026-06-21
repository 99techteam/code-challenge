# Improvements
## 1. Coding Standards: Domain Modeling
### Standard: Entity Encapsulation
To maintain system integrity and prevent "side-effect bugs," we strictly prohibit direct property manipulation of database entities.

* **❌ Anti-Pattern (Anemic Domain Model):** Direct modification bypasses business rules and exposes the entity to accidental corruption.
``` js 
// AVOID: Bypasses validation and logging logic
// Just Pseudocode
const userScore = await orm.getScore(userId);
userScore.score += 10; 
await userScore.save();
```
* **✅ Best Practice (Rich Domain Model):** Use encapsulated methods (e.g., `data.increase("score")`) to perform state changes.
``` js 
// PREFER: Logic is encapsulated within the model
// Just Pseudocode
const userScore = await orm.getScore(userId);
await userScore.increase("score", 10);
```

**Rationale:** Database transactions ensure **Storage Integrity**, but Encapsulated Methods ensure **Business Logic Integrity**. 

## 2. Standard: Graceful Error Handling
Don't just let the code crash. Define how the API should communicate failures so the frontend doesn't break.

- **Rule:** Never leak internal database errors (e.g., PostgreSQL connection refused or Syntax Error) to the client.

- **Mechanism:** All errors must be caught and mapped to a standard API response format (e.g., { "error": "InsufficientFunds", "code": 402 }).

- **Rationale:** This protects system internals and ensures the frontend receives predictable, actionable error codes rather than raw stack traces.

## 3. Standard: Idempotency (The "Double-Click" Protection)
A user might accidentally tap "Increment" twice. Your system needs to handle that.

- **Rule:** All state-changing requests (like POST /increment) must support idempotency.

- **Mechanism:** The client should provide an Idempotency-Key (a unique UUID) in the request header. The server checks this key against a short-term Redis cache before processing.

- **Rationale:** This prevents duplicate score increments caused by network retries or accidental double-clicks.

### 4. Standard: Observability & Logging
If something goes wrong at 3 AM, how will you know?

- **Rule:** Every atomic transaction must be preceded by a "Request Started" log and followed by a "Request Completed/Failed" log.

- **Mechanism:** Use structured JSON logs containing: request_id, user_id, action_type, and latency.

- **Rationale:** Proper logs allow us to trace a specific user's action through the system, making debugging complex race conditions or transaction failures possible.

### 5. Request Minimization (Optimistic UI)
To make the app feel "instant," the frontend should assume a successful operation while the backend handles the transaction in the background.

- **Optimization**: Implement optimistic updates for score increments. The UI reflects the new score immediately, while the background transaction ensures the database eventually syncs.

### 6. Debouncing & Throttling
We must prevent "hammering" the API with redundant requests, which saves server costs and reduces database load.

- **Optimization:** Frontend requests to /increment must be throttled to a maximum of 1 request per 500ms per user. Backend rate limiting will enforce this to prevent abuse.

## 7. Asynchronous Task Queuing
Non-critical path operations (like sending a notification or updating a global leaderboard) should not block the user.

**Optimization:** Move secondary tasks (analytics, notifications) to an Asynchronous Message Queue (e.g., BullMQ or RabbitMQ).