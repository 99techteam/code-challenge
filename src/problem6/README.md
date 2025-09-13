# Problem 6: Real-Time Scoreboard API Architecture

## Overview

This document provides the technical specification for a real-time scoreboard API service that manages user scores, prevents malicious score manipulation, and provides live updates to connected clients.

## System Requirements

### Functional Requirements
1. **Live Scoreboard Display**: Show top 10 users with highest scores in real-time
2. **Score Updates**: Process legitimate score increases from user actions
3. **Real-time Synchronization**: Instantly update all connected clients when scores change
4. **Security**: Prevent unauthorized score manipulation and gaming attacks

### Non-Functional Requirements
1. **Performance**: Handle 1000+ concurrent users with <100ms response time
2. **Scalability**: Support horizontal scaling for increased load
3. **Availability**: 99.9% uptime with graceful error handling
4. **Security**: Implement robust authentication and anti-cheat mechanisms

## Architecture Overview

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Load Balancer │    │   API Gateway   │
│  (Web/Mobile)   │◄──►│     (Nginx)     │◄──►│   (Rate Limit)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                        ┌─────────────────────────────────┼─────────────────────────────────┐
                        │                                 ▼                                 │
            ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
            │   Auth Service  │              │  Score Service  │              │ WebSocket Hub   │
            │ (JWT/Session)   │◄────────────►│   (Core API)    │◄────────────►│ (Real-time)     │
            └─────────────────┘              └─────────────────┘              └─────────────────┘
                        │                                 │                                 │
                        ▼                                 ▼                                 ▼
            ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
            │   User Store    │              │   Score Cache   │              │  Event Queue    │
            │  (PostgreSQL)   │              │    (Redis)      │              │  (Redis Pub/Sub)│
            └─────────────────┘              └─────────────────┘              └─────────────────┘
                                                         │
                                                         ▼
                                             ┌─────────────────┐
                                             │ Score Database  │
                                             │  (PostgreSQL)   │
                                             └─────────────────┘
```

## API Specification

### Base Configuration
- **Base URL**: `https://api.scoreboard.com/v1`
- **Protocol**: HTTPS only
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: 100 requests/minute per user
- **Content-Type**: `application/json`

### Endpoints

#### 1. Authentication Endpoints

##### POST /auth/login
```json
Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "username": "string",
      "currentScore": 1250
    }
  },
  "expiresIn": 3600
}
```

##### POST /auth/refresh
```json
Request:
{
  "refreshToken": "string"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresIn": 3600
  }
}
```

#### 2. Score Management Endpoints

##### GET /scores/leaderboard
```json
Response:
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "player1",
        "score": 15750,
        "lastUpdate": "2025-09-13T10:30:00Z"
      }
    ],
    "totalPlayers": 1337,
    "lastUpdated": "2025-09-13T10:30:00Z"
  }
}
```

##### POST /scores/update
```json
Request:
{
  "actionId": "unique_action_id",
  "actionType": "COMPLETE_LEVEL",
  "scoreIncrease": 100,
  "actionData": {
    "level": 5,
    "timeCompleted": 45.3,
    "accuracy": 0.95
  },
  "clientTimestamp": "2025-09-13T10:30:00Z",
  "signature": "hmac_signature"
}

Response:
{
  "success": true,
  "data": {
    "newScore": 1350,
    "scoreIncrease": 100,
    "newRank": 42,
    "previousRank": 45
  }
}
```

##### GET /scores/user/:userId
```json
Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "player1",
    "currentScore": 1350,
    "rank": 42,
    "totalActions": 127,
    "lastActivity": "2025-09-13T10:30:00Z"
  }
}
```

#### 3. Real-time WebSocket Events

##### Connection
```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://api.scoreboard.com/v1/ws?token=jwt_token');

// Authentication message
{
  "type": "auth",
  "token": "jwt_token"
}
```

##### Outbound Events (Server → Client)
```javascript
// Leaderboard update
{
  "type": "leaderboard_update",
  "data": {
    "leaderboard": [...], // Same format as REST API
    "timestamp": "2025-09-13T10:30:00Z"
  }
}

// Score update notification
{
  "type": "score_update",
  "data": {
    "userId": "uuid",
    "username": "player1",
    "newScore": 1350,
    "scoreIncrease": 100,
    "newRank": 42
  }
}

// User rank change
{
  "type": "rank_change",
  "data": {
    "userId": "uuid",
    "oldRank": 45,
    "newRank": 42,
    "scoreChange": 100
  }
}
```

##### Inbound Events (Client → Server)
```javascript
// Subscribe to leaderboard updates
{
  "type": "subscribe",
  "channel": "leaderboard"
}

// Heartbeat/Keep-alive
{
  "type": "ping"
}
```

## Security Implementation

### 1. Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 1-hour expiration
- **Refresh Tokens**: 7-day expiration, stored securely
- **Role-based Access**: Different permissions for users/admins
- **Session Management**: Track active sessions and allow revocation

### 2. Anti-Cheat Mechanisms

#### Server-side Validation
```javascript
// Score validation rules
const validateScoreUpdate = (actionData) => {
  const rules = {
    COMPLETE_LEVEL: {
      maxScore: 500,
      minTime: 10, // seconds
      maxTime: 300,
      requiredFields: ['level', 'timeCompleted', 'accuracy']
    }
  };
  
  // Validate against rules
  // Check for impossible scores or times
  // Verify action sequence integrity
};
```

#### Action Signing
- **HMAC Signatures**: Client signs actions with shared secret
- **Nonce/Timestamp**: Prevent replay attacks
- **Action Sequencing**: Verify logical action progression

#### Rate Limiting & Anomaly Detection
```javascript
// Multi-layer rate limiting
const rateLimits = {
  perSecond: 5,    // Max 5 actions per second
  perMinute: 100,  // Max 100 actions per minute
  perHour: 1000    // Max 1000 actions per hour
};

// Anomaly detection
const detectAnomalies = (user, action) => {
  // Statistical analysis of score patterns
  // Detect impossible improvement rates
  // Flag suspicious behavioral patterns
};
```

### 3. Request Security
- **Input Validation**: Strict schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Output encoding and CSP headers
- **CORS Configuration**: Restrict origins to authorized domains

## Data Models

### User Model
```typescript
interface User {
  id: string;           // UUID
  username: string;     // Unique username
  email: string;        // User email
  passwordHash: string; // Bcrypt hashed password
  currentScore: number; // Current total score
  rank: number;         // Current leaderboard rank
  totalActions: number; // Total completed actions
  isActive: boolean;    // Account status
  isBanned: boolean;    // Ban status for cheaters
  createdAt: Date;      // Account creation
  lastActivity: Date;   // Last action timestamp
}
```

### Score Action Model
```typescript
interface ScoreAction {
  id: string;           // UUID
  userId: string;       // User who performed action
  actionId: string;     // Unique action identifier
  actionType: string;   // Type of action (COMPLETE_LEVEL, etc.)
  scoreIncrease: number; // Points awarded
  actionData: object;   // Action-specific data
  clientTimestamp: Date; // When action was completed
  serverTimestamp: Date; // When action was processed
  signature: string;    // HMAC signature for verification
  isValidated: boolean; // Server validation status
  ipAddress: string;    // Client IP for security
}
```

### Leaderboard Cache Model
```typescript
interface LeaderboardEntry {
  rank: number;         // Position on leaderboard
  userId: string;       // User identifier
  username: string;     // Display name
  score: number;        // Current score
  lastUpdate: Date;     // Last score update
}
```

## Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    current_score INTEGER DEFAULT 0,
    current_rank INTEGER,
    total_actions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_username CHECK (LENGTH(username) >= 3),
    CONSTRAINT valid_score CHECK (current_score >= 0)
);

-- Score actions table
CREATE TABLE score_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action_id VARCHAR(255) UNIQUE NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    score_increase INTEGER NOT NULL,
    action_data JSONB NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature VARCHAR(255) NOT NULL,
    is_validated BOOLEAN DEFAULT false,
    ip_address INET,
    
    CONSTRAINT valid_score_increase CHECK (score_increase > 0 AND score_increase <= 1000)
);

-- Indexes for performance
CREATE INDEX idx_users_score_rank ON users(current_score DESC, id);
CREATE INDEX idx_users_last_activity ON users(last_activity DESC);
CREATE INDEX idx_score_actions_user_timestamp ON score_actions(user_id, server_timestamp DESC);
CREATE INDEX idx_score_actions_validation ON score_actions(is_validated, server_timestamp);
```

### Redis Cache Structure

```javascript
// Leaderboard cache (Sorted Set)
ZADD leaderboard:global <score> <userId>

// User session cache
HSET user:session:{userId} {
  "token": "jwt_token",
  "lastActivity": "timestamp",
  "ipAddress": "1.2.3.4"
}

// Rate limiting cache
INCR rate_limit:{userId}:{timeWindow}
EXPIRE rate_limit:{userId}:{timeWindow} {seconds}

// Action deduplication cache
SET action:{actionId} "processed" EX 3600
```

## Implementation Flow

### Score Update Process

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant S as Score Service
    participant R as Redis Cache
    participant D as Database
    participant W as WebSocket Hub
    
    C->>A: POST /scores/update (with signature)
    A->>A: Rate limiting check
    A->>A: JWT validation
    A->>S: Forward request
    S->>S: Validate action signature
    S->>S: Check action deduplication
    S->>S: Validate score rules
    S->>D: Save score action
    S->>D: Update user score
    S->>R: Update leaderboard cache
    S->>W: Publish score update event
    W->>C: Broadcast to all clients
    S->>A: Return success response
    A->>C: Return updated score
```

### Real-time Update Flow

```mermaid
sequenceDiagram
    participant C1 as Client 1
    participant C2 as Client 2
    participant W as WebSocket Hub
    participant R as Redis Pub/Sub
    participant S as Score Service
    
    C1->>W: WebSocket connection
    C2->>W: WebSocket connection
    W->>W: Authenticate connections
    C1->>W: Subscribe to leaderboard
    C2->>W: Subscribe to leaderboard
    
    Note over S: Score update occurs
    S->>R: Publish leaderboard_update
    R->>W: Deliver event
    W->>C1: Send leaderboard update
    W->>C2: Send leaderboard update
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ACTION",
    "message": "Action signature validation failed",
    "details": {
      "field": "signature",
      "expectedFormat": "HMAC-SHA256"
    },
    "requestId": "req_12345",
    "timestamp": "2025-09-13T10:30:00Z"
  }
}
```

### Error Codes
- `AUTH_REQUIRED` (401): Authentication needed
- `AUTH_INVALID` (401): Invalid or expired token
- `FORBIDDEN` (403): Insufficient permissions
- `RATE_LIMITED` (429): Too many requests
- `INVALID_ACTION` (400): Action validation failed
- `DUPLICATE_ACTION` (409): Action already processed
- `INVALID_SIGNATURE` (400): Signature verification failed
- `SCORE_TOO_HIGH` (400): Score increase exceeds limits
- `SERVER_ERROR` (500): Internal server error

## Performance Considerations

### Caching Strategy
1. **Leaderboard Cache**: Redis sorted set, updated in real-time
2. **User Session Cache**: JWT validation results cached
3. **Rate Limiting Cache**: Sliding window counters
4. **Database Query Cache**: Frequently accessed user data

### Scalability Approach
1. **Horizontal Scaling**: Multiple API server instances
2. **Database Sharding**: Partition users by ID ranges
3. **WebSocket Clustering**: Redis adapter for multi-server WebSocket
4. **CDN Integration**: Cache static leaderboard snapshots

### Monitoring & Observability
1. **Metrics**: Response times, error rates, active connections
2. **Logging**: Structured logging with correlation IDs
3. **Alerting**: Anomaly detection and threshold alerts
4. **Tracing**: Distributed tracing for request flows

## Deployment Architecture

### Infrastructure Components
```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scoreboard-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scoreboard-api
  template:
    spec:
      containers:
      - name: api
        image: scoreboard-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/scoreboard
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
HMAC_SECRET=your-hmac-secret
CORS_ORIGINS=https://scoreboard.com,https://app.scoreboard.com
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
WEBSOCKET_HEARTBEAT=30000
```

## Security Checklist

- [ ] HTTPS/TLS encryption for all communications
- [ ] JWT token expiration and refresh mechanism
- [ ] Rate limiting on all endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] CORS configuration
- [ ] Action signature validation
- [ ] Replay attack prevention
- [ ] Anomaly detection system
- [ ] User session management
- [ ] Secure secret management
- [ ] Regular security audits

## Future Improvements

### Phase 1 Enhancements
1. **Machine Learning Anti-Cheat**: Advanced pattern detection
2. **Real-time Analytics**: Live statistics and insights
3. **Mobile App Support**: Native iOS/Android SDKs
4. **Tournament Mode**: Scheduled competitions with special rules

### Phase 2 Enhancements
1. **Multi-Game Support**: Different scoreboards for different games
2. **Social Features**: Friend lists, challenges, achievements
3. **Advanced Reporting**: Detailed analytics and reporting tools
4. **Global Regions**: Regional leaderboards and data locality

### Phase 3 Enhancements
1. **Blockchain Integration**: Tamper-proof score verification
2. **AI-Powered Insights**: Personalized recommendations
3. **Microservices Architecture**: Break down into smaller services
4. **Event Sourcing**: Complete audit trail of all score changes

## Testing Strategy

### Unit Testing
- Individual function validation
- Mock external dependencies
- Edge case coverage
- Security function testing

### Integration Testing
- Database integration
- Redis cache integration
- WebSocket functionality
- Authentication flow

### Load Testing
- Concurrent user simulation
- Database performance under load
- WebSocket connection limits
- Rate limiting effectiveness

### Security Testing
- Penetration testing
- Vulnerability scanning
- Authentication bypass attempts
- Score manipulation attempts

## Conclusion

This architecture provides a robust, scalable, and secure foundation for a real-time scoreboard system. The design emphasizes security through multiple validation layers, performance through strategic caching, and reliability through comprehensive error handling and monitoring.

The implementation should be done incrementally, starting with core functionality and gradually adding advanced features. Regular security audits and performance monitoring are essential for maintaining system integrity as it scales.