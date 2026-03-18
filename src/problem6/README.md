
# Problem 6 - Scoreboard System Specification

### Software Requirements

1. We have a website with a score board, which shows the top 10 user’s scores.
2. We want live update of the score board.
3. User can do an action (which we do not need to care what the action is), completing this action will increase the user’s score.
4. Upon completion the action will dispatch an API call to the application server to update the score.
5. We want to prevent malicious users from increasing scores without authorization.

### Idea

With the current implementation below, the CCU numbers will mostly base on the scale for the websocket service.

We will try to distribute the event through a pub/sub model, so its can reduce the load needed to websocket service.

Roughly this can handle 10,000 concurrent users per service instance (without scaling), assuming typical server specs:

- 2–4 vCPUs
- 4–8 GB RAM
- Optimized Node.js WebSocket server (e.g., ws or socket.io)
- Proper OS/network tuning (file descriptors, keepalive, etc.)

Actual capacity may vary based on message frequency, code efficiency, and network conditions.

### Techstack

**Backend:**
- Node.js (Express or Fastify for API service) for fast iops operation
- Redis (real-time data store, Pub/Sub)
- PostgreSQL (durable storage)
- WebSocket (ws or socket.io for real-time updates)
- AWS SQS/SNS/EventBridge (for event-driven communication)
- Docker (containerization)

**Frontend:**
- React.js (leaderboard UI)
- WebSocket client (native or socket.io-client)
- Axios or Fetch API (for HTTP requests)

**Infrastructure/DevOps:**
- AWS (EC2, Fargate, Elasticache for Redis, RDS for PostgreSQL, SQS/SNS/EventBridge)
- Nginx (reverse proxy, load balancing)
- Terraform or AWS CDK (infrastructure as code)
- GitHub Actions (CI/CD)

## A. Functional Requirements
- Display the top 10 users’ scores
- Support real-time updates for all connected users
- Allow users to increment their score by 1
- Validate user authentication and authorization
- Prevent unauthorized score modifications
- Ensure score data is durable and recoverable

## B. Non-Functional Requirements
- Support high request rates and frequent reads
- Optimize for low-latency, read-heavy workloads
- Scale horizontally across all services
- Ensure eventual consistency between systems
- Provide high availability and fault tolerance
- Enforce rate limiting to prevent abuse and DDoS

## C. System Architecture

### C.1 Write Flow
 - Client sends a score increment request to the API
 - API validates authentication and rate limits the request
 - Score is updated in Redis synchronously
 - An event is published to a queue for asynchronous persistence
 - A background worker consumes events and writes to PostgreSQL

### C.2 Read Flow
 - Clients request leaderboard data from the API
 - API reads directly from Redis
 - The top 10 users are returned with minimal latency

### C.3 Real-Time Updates
 - When a score changes, an event is published
 - WebSocket servers broadcast updated leaderboard data to connected clients
 - Clients update their UI in real time

## D. Step-by-Step Implementation Guide

### D.1 Frontend
 - Displays the top 10 leaderboard
 - Connects to backend using WebSocket (preferred) or polling
 - Sends score increment requests
 - Applies client-side rate limiting (1 request per 10 seconds per user)
 - Updates UI in real time when receiving new data if changed

### D.2 Backend API (Stateless)
 - Receive score update requests
 - Authenticate and authorize users
 - Enforce server-side rate limiting (1 update per user every 10 seconds)
 - Update score in Redis using atomic operations
 - Publish events for asynchronous persistence
 - Broadcast leaderboard updates via a pub/sub mechanism, then broadcast with WebSocket
 - Implemented with microservice: api service, postgres worker service and websocket service

**Key Design Choices:**
 - No locking is required; Redis operations are atomic
 - Stateless design allows horizontal scaling
 - API does not directly depend on database performance

## E. Data Storing

### E.1 Redis (Primary Data Store)
 - Stores leaderboard using sorted sets (ZSET)
 - Acts as the real-time source of truth
 - Strategy: Write-Behind (Asynchronous Persistence)
 - Key format: leaderboard:{category}
 - Operations: Increment score (ZINCRBY), Fetch top 10 (ZREVRANGE)

### E.2 PostgreSQL (Persistence Layer)
 - Stores durable user score data
 - Used for recovery, analytics, and long-term storage
 - Updated asynchronously via background workers

### E.3 Queue / Worker
 - Queue receives score update events
 - Worker processes events and writes to PostgreSQL
 - Supports batching and retry mechanisms

#### Pros
 - Redis is always up-to-date due to write-first design
 - Cache misses only occur during cold start or failure recovery
 - Data is backup into Postgres in case of restart or Redis crashed

#### Cons
 - Redis can only be scale vertical, else we will need a strategy to sync between redis instance if scale
 - PostgreSQL is updated asynchronously, can cause data loss

## F. Security
 - Authenticate all API requests
 - Authorize score updates for valid users only
 - Rate limiting is enforced on both client and server
 - Input validation is applied to all incoming requests (normally support by library)

## G. Infrastructure

### G.1 API Layer
 - Stateless services behind a load balancer (for api and websocket server mainly)
 - Scales horizontally, normally based on CPU and request rate, number of message base for the websocket
 - If scaling is not productive for the realtime category, can use serverless with AWS Fargate

### G.2 Redis
 - Managed service (cluster mode recommended)
 - Scales based on memory usage and throughput

### G.3 PostgreSQL
 - Managed database service
 - Scales vertically and with read replicas (if needed)
 - Tuned based on IOPS and CPU usage

### G.4 CDN (Optional)
 - Used for serving static frontend assets, serve globally users
 - Can cache leaderboard responses with short TTL if slight delay is acceptable

---

## H. Scaling Strategy (AWS preferred)
 - API servers scale horizontally with traffic
 - Redis scales via sharding when memory or throughput limits are reached
 - PostgreSQL scales via increased IOPS throughput and read replicas
 - WebSocket layer scales using pub/sub distribution
 - Use SNS Fan-out to public the topic after redis update
    For update to Postgres, can use lambda as worker
    For websocket broadcast, can use event bridge event to trigger the websocket server

---

## I. Failure Handling

### I.1 Redis Failure
 - Rebuild leaderboard from PostgreSQL snapshot or event logs

### I.2 Queue Failure
 - Use durable messaging with retry support (dead letter queue)

### I.3 Database Failure
 - Retry writes through worker
 - Buffer events temporarily until recovery

---

## J. Future Improvements
 - Multi-region deployment for global users
 - Sharding leaderboard by category
 - Time-based leaderboards (daily, weekly resets)
 - Snapshot and replay mechanisms
 - Load test (k6) and security test (burp suite)