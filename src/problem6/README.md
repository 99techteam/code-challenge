# Live Scoreboard API Service - Technical Specification

## Overview

This module provides a real-time scoreboard system that displays the top 10 users with live score updates. The service handles secure score increments, prevents malicious score manipulation, and broadcasts real-time updates to all connected clients using Server-Sent Events (SSE).

## Architecture Components

### Core Components
- **Score Management Service**: Handles score CRUD operations
- **Consolidated Authentication Service**: Validates user sessions, prevents unauthorized access, includes anti-fraud detection and rate limiting
- **Real-time Broadcasting Service**: Server-Sent Events (SSE) based live updates
- **Message Queue System**: Redis pub/sub for asynchronous processing
- **Caching Layer**: Redis-based caching for performance optimization

## API Endpoints

### Authentication Endpoints

#### `POST /api/auth/login`
Authenticates user and returns JWT token.

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
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "number",
      "username": "string",
      "currentScore": "number"
    }
  }
}
```

#### `POST /api/auth/refresh`
Refreshes authentication token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_string"
  }
}
```

### Score Management Endpoints

#### `GET /api/scoreboard/top10`
Retrieves current top 10 users by score.

**Response:**
```json
{
  "success": true,
  "data": {
    "scoreboard": [
      {
        "rank": 1,
        "userId": "number",
        "username": "string",
        "score": "number",
        "lastUpdated": "ISO_datetime"
      }
    ],
    "lastRefresh": "ISO_datetime"
  }
}
```

#### `POST /api/scores/increment`
Increments user score after completing an action (asynchronous processing).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "actionType": "string",
  "actionId": "string",
  "scoreIncrement": "number",
  "timestamp": "ISO_datetime",
  "clientHash": "string"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Score increment request accepted and queued for processing",
  "data": {
    "requestId": "string",
    "status": "processing",
    "estimatedProcessingTime": "1-3 seconds"
  },
  "links": {
    "sse": "/api/events/scoreboard - Connect for real-time updates"
  }
}
```

#### `GET /api/scores/user/:userId`
Gets specific user's score and rank.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "number",
    "username": "string",
    "score": "number",
    "rank": "number",
    "lastUpdated": "ISO_datetime"
  }
}
```

## Server-Sent Events (SSE) API

### Connection Endpoint

#### `GET /api/events/scoreboard`
Establishes SSE connection for real-time scoreboard updates.

**Headers:**
```
Authorization: Bearer <token>
Accept: text/event-stream
Cache-Control: no-cache
```

**Query Parameters:**
```
token=jwt_token_string (alternative to Authorization header)
```

### SSE Events (Server to Client)

#### `connected`
Sent when client successfully connects and authenticates.
```
event: connected
data: {
  "message": "Connected to live scoreboard updates",
  "userId": "number",
  "timestamp": "ISO_datetime"
}
```

#### `initial_scoreboard`
Sent immediately after connection with current top 10.
```
event: initial_scoreboard
data: {
  "scoreboard": [
    {
      "rank": 1,
      "userId": "number", 
      "username": "string",
      "score": "number"
    }
  ],
  "timestamp": "ISO_datetime"
}
```

#### `scoreboard_update`
Broadcast when top 10 changes.
```
event: scoreboard_update
data: {
  "scoreboard": [...],
  "timestamp": "ISO_datetime",
  "changeType": "score_increment|new_entry|rank_change",
  "affectedUser": "string"
}
```

#### `user_score_update`
Personal score update for authenticated user.
```
event: user_score_update
data: {
  "newScore": "number",
  "increment": "number",
  "newRank": "number",
  "timestamp": "ISO_datetime"
}
```

#### `notification`
General notifications (e.g., duplicate actions, alerts).
```
event: notification
data: {
  "type": "duplicate_action|security_alert|system_message",
  "message": "string",
  "timestamp": "ISO_datetime"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  current_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_score ON users(current_score DESC);
CREATE INDEX idx_users_username ON users(username);
```

### Score History Table
```sql
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  action_id VARCHAR(100) NOT NULL,
  score_increment INTEGER NOT NULL,
  previous_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  client_ip INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score_history_user_id ON score_history(user_id);
CREATE INDEX idx_score_history_created_at ON score_history(created_at);
CREATE UNIQUE INDEX idx_score_history_action ON score_history(user_id, action_id);
```

### Sessions Table
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
```

## Security & Anti-Fraud Measures

### Consolidated Authentication & Authorization
The authentication service combines multiple security layers for optimal performance:

- JWT tokens with short expiration (15 minutes)
- Refresh token mechanism for seamless user experience
- Session invalidation on suspicious activity
- Integrated anti-fraud detection within auth flow
- Combined rate limiting and behavior analysis

### Rate Limiting (Integrated in Auth Service)
- **Per User**: Maximum 10 score increments per minute
- **Per IP**: Maximum 50 requests per minute across all endpoints
- **Global**: Maximum 1000 score increments per minute system-wide
- **Failed Login Attempts**: Maximum 5 attempts per IP per hour

### Anti-Fraud Validation (Consolidated)
1. **Action Deduplication**: Each `actionId` can only be used once per user
2. **Timestamp Validation**: Action timestamp must be within last 5 minutes
3. **Client Hash Verification**: Client-side hash validation for action integrity
4. **Score Increment Limits**: Maximum +100 points per single action
5. **IP Monitoring**: Track and flag suspicious IP behavior
6. **User Behavior Analysis**: Flag users with unusually high score rates
7. **Session Validation**: Cross-check session validity with user behavior
8. **Concurrent Session Monitoring**: Detect unusual session patterns

### Input Validation (Comprehensive)
- Sanitize all input parameters
- Validate JWT token signature and expiration
- Check user permissions for each request
- Validate score increment ranges (1-100 points)
- Client information fingerprinting
- Request pattern analysis

## Performance Optimization

### Caching Strategy
- **Redis Cache**: Store top 10 scoreboard (TTL: 30 seconds)
- **User Score Cache**: Cache individual user scores (TTL: 5 minutes)
- **Session Cache**: Store active sessions in Redis
- **Rate Limiting Cache**: Track request limits and patterns
- **Action Deduplication Cache**: Prevent duplicate processing

### Database Optimization
- Use database indices for score queries
- Implement connection pooling
- Batch score updates when possible
- Archive old score history data
- Asynchronous processing reduces database load

### SSE Optimization
- **Connection Management**: Efficient client connection mapping
- **Automatic Reconnection**: Built-in SSE reconnection handling
- **Redis Pub/Sub Integration**: Multi-server SSE broadcasting
- **Message Queuing**: Asynchronous event processing
- **Connection Health**: Periodic ping/heartbeat for connection validation

### Asynchronous Processing
- **Message Queue**: Redis pub/sub for non-blocking operations
- **Background Workers**: Dedicated processes for database operations
- **Event-Driven Architecture**: Loosely coupled service communication

## Error Handling

### HTTP Status Codes
- `200`: Success (synchronous operations)
- `201`: Created
- `202`: Accepted (asynchronous operations - request queued for processing)
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `409`: Conflict (duplicate action)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Specific field error if applicable"
    }
  },
  "timestamp": "ISO_datetime"
}
```

## Monitoring & Logging

### Key Metrics to Monitor
- API response times
- SSE connection count and health
- Message queue processing rates
- Score increment processing latency
- Cache hit/miss ratios
- Failed authentication attempts
- Rate limit violations
- Background worker performance

### Logging Requirements
- All score increment attempts (success/failure)
- Authentication events with fraud detection results
- Rate limit violations with client information
- System errors and exceptions
- SSE connection events (connect/disconnect/errors)
- Message queue processing metrics
- Asynchronous processing results

## Testing Strategy

### Unit Tests
- Score service logic
- Consolidated authentication service
- Anti-fraud validation (integrated)
- Rate limiting functionality
- Message queue processing

### Integration Tests
- API endpoint testing
- Database operations
- SSE event streaming
- Redis caching and pub/sub
- Asynchronous message processing
- End-to-end score increment flow

### Load Testing
- Concurrent user simulation
- Score increment stress testing
- SSE connection limits and performance
- Message queue throughput
- Rate limiting validation
- Background worker capacity

## Deployment Considerations

### Infrastructure Requirements
- Application server (Node.js/Express)
- PostgreSQL database with read replicas
- Redis cluster for caching and pub/sub
- Load balancer for horizontal scaling

### Scaling Considerations
- Stateless application design
- Database read replicas for query scaling
- Redis cluster for cache scaling
- Horizontal pod autoscaling based on CPU/memory
- Rate limiting across multiple instances

## Additional Improvements & Recommendations

### 3. Performance Enhancements
- **GraphQL API**: Reduce over-fetching for mobile clients
- **CDN Integration**: Cache static scoreboard data globally
- **Database Sharding**: Partition users across multiple databases
- **Event Sourcing**: Store all score events for better auditing

### 4. Operational Improvements
- **Blue-Green Deployment**: Zero-downtime deployments
- **Automated Rollback**: Quick recovery from bad deployments
- **Health Checks**: Comprehensive health monitoring endpoints

### Code Quality Standards
- **Code Coverage**: Minimum 80% test coverage
- **Code Review**: All changes require peer review
- **Static Analysis**: Use ESLint, Prettier, and security scanners
- **Dependency Management**: Regular dependency audits and updates
