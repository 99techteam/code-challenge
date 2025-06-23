# Live Scoreboard API Service - Technical Specification

## Overview

This document provides comprehensive technical specifications for implementing a real-time scoreboard API service. The system manages user scores with live updates, secure authentication, and high-performance data delivery through WebSocket connections and CDN integration.

## System Architecture

```mermaid
graph TD
    A[Client Web App] -->|User Action| B[Frontend JavaScript]
    B -->|HTTP POST /api/score/update| C[Load Balancer]
    C --> D[API Gateway]
    D -->|Validate JWT| E[Keycloak Auth Server]
    E -->|Token Valid| D
    D --> F[Node.js/Express API Server]
    F -->|Validate Request| G[Rate Limiter Redis]
    G -->|Check Limits| F
    F -->|Update Score| H[PostgreSQL Database]
    F -->|Cache Update| I[Redis Cache]
    F -->|Broadcast Update| J[WebSocket Manager]
    J -->|Real-time Update| K[Connected Clients]
    F -->|CDN Invalidation| L[CDN Cache]
    L -->|GET /api/score/leaderboard| M[Global Users]
    
    subgraph "Monitoring & Logging"
        N[Application Logs]
        O[Metrics Collection]
        P[Error Tracking]
    end
    
    F --> N
    F --> O
    F --> P
```

## Core Requirements

### Functional Requirements
- **FR-001**: Display top 10 users with highest scores
- **FR-002**: Real-time score updates via WebSocket
- **FR-003**: Secure score update with authentication
- **FR-004**: User action completion increases score
- **FR-005**: Prevent unauthorized score manipulation
- **FR-006**: High-performance data delivery via CDN

### Non-Functional Requirements
- **NFR-001**: Response time < 200ms for score updates
- **NFR-002**: Support 10,000+ concurrent WebSocket connections
- **NFR-003**: 99.9% uptime availability
- **NFR-004**: Rate limiting: 10 requests/minute per user
- **NFR-005**: Data consistency across all clients within 1 second

## Technical Stack Recommendations

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with Socket.io
- **Database**: PostgreSQL 14+ (primary), Redis 7+ (cache)
- **Authentication**: Keycloak 20+
- **Message Queue**: Redis Pub/Sub or Apache Kafka

### Infrastructure
- **Containerization**: Docker with Kubernetes
- **Load Balancer**: NGINX or AWS ALB
- **CDN**: CloudFlare or AWS CloudFront
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Database Schema

### PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    current_score BIGINT DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Score history for audit trail
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    score_change INTEGER NOT NULL,
    previous_score BIGINT NOT NULL,
    new_score BIGINT NOT NULL,
    auth_token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard cache table (optional optimization)
CREATE TABLE leaderboard_cache (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    username VARCHAR(50) NOT NULL,
    score BIGINT NOT NULL,
    rank INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_score_desc ON users(current_score DESC);
CREATE INDEX idx_score_history_user_id ON score_history(user_id);
CREATE INDEX idx_score_history_created_at ON score_history(created_at DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard_cache(rank);
```

### Redis Cache Structure

```javascript
// Leaderboard sorted set
ZADD leaderboard:top10 score1 user_id1 score2 user_id2 ...

// User session cache
HSET user:sessions:user_id token auth_token last_action timestamp

// Rate limiting
INCR rate_limit:user_id:minute
EXPIRE rate_limit:user_id:minute 60

// WebSocket connection mapping
HSET websocket:connections connection_id user_id
```

## API Specifications

### 1. Update User Score

**Endpoint**: `POST /api/v1/score/update`

**Authentication**: Bearer Token (Keycloak JWT)

**Rate Limit**: 10 requests/minute per user

**Request Headers**:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-Request-ID: <unique_request_id>
```

**Request Body**:
```json
{
  "user_id": "uuid-string",
  "action": "completed_mission|level_up|achievement_unlocked",
  "action_metadata": {
    "mission_id": "string",
    "level": "number",
    "difficulty": "easy|medium|hard"
  },
  "timestamp": "ISO8601_datetime",
  "client_signature": "hmac_signature"
}
```

**Response (Success - 200)**:
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid-string",
    "previous_score": 1400,
    "score_increase": 100,
    "new_score": 1500,
    "new_rank": 3,
    "previous_rank": 5
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

**Response (Error - 400/401/429)**:
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ACTION|UNAUTHORIZED|RATE_LIMIT_EXCEEDED",
    "message": "Descriptive error message",
    "details": "Additional context"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### 2. Get Leaderboard

**Endpoint**: `GET /api/v1/score/leaderboard`

**Cache**: 30 seconds TTL, served via CDN

**Response**:
```json
{
  "status": "success",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user_id": "uuid-string",
        "username": "player123",
        "score": 15000,
        "avatar_url": "https://cdn.example.com/avatars/player123.jpg"
      }
    ],
    "total_players": 125000,
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "cache_info": {
    "cached_at": "2024-01-15T10:29:30Z",
    "expires_at": "2024-01-15T10:30:30Z"
  }
}
```

## WebSocket Implementation

### Connection Management

**Endpoint**: `WSS /ws/scoreboard`

**Authentication**: JWT token in query parameter or header

**Connection Flow**:
```javascript
// Client connection
const socket = io('wss://api.example.com/ws/scoreboard', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Server events
socket.on('leaderboard_update', (data) => {
  // Real-time leaderboard changes
});

socket.on('user_score_update', (data) => {
  // Individual user score changes
});

socket.on('user_rank_change', (data) => {
  // Rank position changes
});
```

**WebSocket Events**:

```javascript
// Outgoing events (Server -> Client)
{
  "event": "leaderboard_update",
  "data": {
    "type": "full_refresh|incremental_update",
    "leaderboard": [...],
    "timestamp": "ISO8601"
  }
}

{
  "event": "user_score_update", 
  "data": {
    "user_id": "uuid",
    "old_score": 1400,
    "new_score": 1500,
    "score_change": 100,
    "timestamp": "ISO8601"
  }
}
```

## Security Implementation

### Authentication & Authorization

1. **Keycloak Integration**:
   ```javascript
   // JWT Token validation middleware
   const validateJWT = async (req, res, next) => {
     const token = req.headers.authorization?.replace('Bearer ', '');
     
     try {
       const decoded = await keycloak.verifyToken(token);
       req.user = decoded;
       next();
     } catch (error) {
       return res.status(401).json({ error: 'Invalid token' });
     }
   };
   ```

2. **Role-Based Access Control**:
   ```javascript
   const checkPermissions = (requiredRole) => {
     return (req, res, next) => {
       if (!req.user.roles.includes(requiredRole)) {
         return res.status(403).json({ error: 'Insufficient permissions' });
       }
       next();
     };
   };
   ```

3. **Request Validation**:
   ```javascript
   const validateScoreUpdate = [
     body('user_id').isUUID(),
     body('action').isIn(['completed_mission', 'level_up', 'achievement_unlocked']),
     body('action_metadata').isObject(),
     // HMAC signature validation
     (req, res, next) => {
       const expectedSignature = generateHMAC(req.body, process.env.CLIENT_SECRET);
       if (req.body.client_signature !== expectedSignature) {
         return res.status(400).json({ error: 'Invalid request signature' });
       }
       next();
     }
   ];
   ```

### Anti-Fraud Measures

1. **Rate Limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const scoreUpdateLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 10, // 10 requests per minute
     keyGenerator: (req) => req.user.sub, // User ID from JWT
     message: 'Too many score update attempts'
   });
   ```

2. **Anomaly Detection**:
   ```javascript
   const detectAnomalies = async (userId, scoreIncrease) => {
     const recentUpdates = await getRecentScoreUpdates(userId, '1 hour');
     const totalIncrease = recentUpdates.reduce((sum, update) => sum + update.score_change, 0);
     
     // Flag suspicious activity
     if (totalIncrease > HOURLY_SCORE_THRESHOLD || scoreIncrease > SINGLE_ACTION_THRESHOLD) {
       await flagSuspiciousActivity(userId, { totalIncrease, scoreIncrease });
       return false;
     }
     return true;
   };
   ```

## Implementation Guide

### 1. Project Structure

```
src/
├── controllers/          # Route handlers
│   ├── scoreController.ts
│   └── leaderboardController.ts
├── middleware/          # Authentication, validation, etc.
│   ├── auth.ts
│   ├── rateLimit.ts
│   └── validation.ts
├── services/            # Business logic
│   ├── scoreService.ts
│   ├── leaderboardService.ts
│   └── websocketService.ts
├── models/              # Database models
│   ├── User.ts
│   └── ScoreHistory.ts
├── utils/               # Helper functions
│   ├── redis.ts
│   ├── database.ts
│   └── keycloak.ts
├── config/              # Configuration files
│   ├── database.ts
│   ├── redis.ts
│   └── keycloak.ts
└── tests/               # Test files
    ├── integration/
    └── unit/
```

### 2. Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scoreboard
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=http://localhost:8080/auth
KEYCLOAK_REALM=scoreboard
KEYCLOAK_CLIENT_ID=scoreboard-api
KEYCLOAK_CLIENT_SECRET=your-secret

# Security
JWT_SECRET=your-jwt-secret
CLIENT_HMAC_SECRET=your-hmac-secret

# Performance
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
LEADERBOARD_CACHE_TTL=30

# Monitoring
LOG_LEVEL=info
METRICS_PORT=9090
```
## Performance Optimization

### Caching Strategy

1. **Multi-Level Caching**:
   ```javascript
   // L1: Application memory cache (fastest)
   const memoryCache = new Map();
   
   // L2: Redis cache (fast, shared)
   const redisCache = new Redis(process.env.REDIS_URL);
   
   // L3: CDN cache (global distribution)
   const cdnCache = {
     ttl: 30, // seconds
     headers: {
       'Cache-Control': 'public, max-age=30',
       'CDN-Cache-Control': 'max-age=60'
     }
   };
   ```

2. **Cache Invalidation Strategy**:
   ```javascript
   const invalidateLeaderboardCache = async () => {
     // Clear application cache
     memoryCache.delete('leaderboard:top10');
     
     // Clear Redis cache
     await redisCache.del('leaderboard:top10');
     
     // Purge CDN cache
     await cdnProvider.purgeCache('/api/v1/score/leaderboard');
   };
   ```

### Database Optimization

1. **Indexing Strategy**:
   ```sql
   -- Primary indexes for leaderboard queries
   CREATE INDEX CONCURRENTLY idx_users_score_rank ON users(current_score DESC, id);
   
   -- Composite indexes for filtering
   CREATE INDEX CONCURRENTLY idx_score_history_user_time ON score_history(user_id, created_at DESC);
   
   -- Partial indexes for active users
   CREATE INDEX CONCURRENTLY idx_active_users_score ON users(current_score DESC) 
   WHERE current_score > 0 AND updated_at > NOW() - INTERVAL '30 days';
   ```

2. **Query Optimization**:
   ```sql
   -- Optimized leaderboard query with pagination
   WITH ranked_users AS (
     SELECT user_id, username, current_score,
            ROW_NUMBER() OVER (ORDER BY current_score DESC, id) as rank
     FROM users 
     WHERE current_score > 0 
     ORDER BY current_score DESC
     LIMIT 10
   )
   SELECT * FROM ranked_users;
   ```

## Monitoring & Observability

### Metrics Collection

```javascript
// metrics/scoreboardMetrics.js
const prometheus = require('prom-client');

const metrics = {
  scoreUpdatesTotal: new prometheus.Counter({
    name: 'scoreboard_score_updates_total',
    help: 'Total number of score updates',
    labelNames: ['action_type', 'status']
  }),
  
  websocketConnections: new prometheus.Gauge({
    name: 'scoreboard_websocket_connections',
    help: 'Current number of WebSocket connections'
  }),
  
  leaderboardCacheHits: new prometheus.Counter({
    name: 'scoreboard_cache_hits_total',
    help: 'Number of cache hits',
    labelNames: ['cache_type']
  }),
  
  apiResponseTime: new prometheus.Histogram({
    name: 'scoreboard_api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route', 'status_code']
  })
};
```

### Health Checks

```javascript
// health/healthCheck.js
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      keycloak: await checkKeycloak(),
      websocket: await checkWebSocket()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### Error Handling & Logging

```javascript
// middleware/errorHandler.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const errorHandler = (err, req, res, next) => {
  const errorId = uuidv4();
  
  logger.error({
    errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.sub,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    status: 'error',
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      error_id: errorId
    }
  });
};
```

## Testing Strategy

### Unit Tests
```javascript
// tests/unit/scoreService.test.js
describe('ScoreService', () => {
  describe('updateUserScore', () => {
    it('should increase user score correctly', async () => {
      const mockUser = { id: 'user1', current_score: 1000 };
      const result = await scoreService.updateUserScore('user1', 'completed_mission', {});
      
      expect(result.new_score).toBe(1100);
      expect(result.score_increase).toBe(100);
    });
    
    it('should reject suspicious score increases', async () => {
      await expect(
        scoreService.updateUserScore('user1', 'completed_mission', { massive_bonus: true })
      ).rejects.toThrow('Suspicious activity detected');
    });
  });
});
```

### Integration Tests
```javascript
// tests/integration/scoreApi.test.js
describe('Score API Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await createTestUser();
  });
  
  it('should update score and broadcast to WebSocket clients', async () => {
    const token = await getValidJWTToken();
    const wsClient = new WebSocketClient();
    
    // Listen for WebSocket updates
    const updatePromise = new Promise(resolve => {
      wsClient.on('user_score_update', resolve);
    });
    
    // Make API call
    const response = await request(app)
      .post('/api/v1/score/update')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: 'test-user',
        action: 'completed_mission',
        action_metadata: {}
      });
    
    expect(response.status).toBe(200);
    
    // Verify WebSocket broadcast
    const wsUpdate = await updatePromise;
    expect(wsUpdate.new_score).toBe(response.body.data.new_score);
  });
});
```

## Deployment Guide

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000 9090

CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
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
    metadata:
      labels:
        app: scoreboard-api
    spec:
      containers:
      - name: api
        image: scoreboard-api:latest
        ports:
        - containerPort: 3000
        - containerPort: 9090
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: scoreboard-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Security Best Practices

### Input Validation & Sanitization
```javascript
const validateInput = {
  scoreUpdate: [
    body('user_id').isUUID().withMessage('Invalid user ID format'),
    body('action').isIn(['completed_mission', 'level_up', 'achievement_unlocked']),
    body('action_metadata').custom((value) => {
      // Sanitize and validate metadata
      const allowedKeys = ['mission_id', 'level', 'difficulty'];
      const keys = Object.keys(value);
      return keys.every(key => allowedKeys.includes(key));
    })
  ]
};
```

### SQL Injection Prevention
```javascript
// Use parameterized queries
const updateUserScore = async (userId, newScore) => {
  const query = 'UPDATE users SET current_score = $2, updated_at = NOW() WHERE id = $1';
  return await db.query(query, [userId, newScore]);
};
```

### Rate Limiting Implementation
```javascript
const advancedRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: async (req) => {
    // Dynamic limits based on user role
    const userRole = req.user.roles?.[0];
    return userRole === 'premium' ? 20 : 10;
  },
  keyGenerator: (req) => `${req.user.sub}:${req.ip}`,
  skip: (req) => req.user.roles?.includes('admin'),
  onLimitReached: async (req) => {
    // Log rate limit violations
    logger.warn('Rate limit exceeded', {
      userId: req.user.sub,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
});
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless API servers**: Use external session storage (Redis)
- **Database read replicas**: Route read queries to replicas
- **WebSocket clustering**: Use Redis adapter for Socket.io
- **Message queues**: Decouple score processing with Redis/Kafka

### Performance Targets
- **API Response Time**: < 200ms (95th percentile)
- **WebSocket Latency**: < 100ms for score broadcasts
- **Concurrent Users**: Support 50,000+ active connections
- **Throughput**: Handle 1,000 score updates/second

## Future Enhancements

### Phase 2 Features
1. **Advanced Analytics**:
   - User engagement tracking
   - Score progression analytics
   - Fraud pattern detection using ML

2. **Enhanced Security**:
   - Device fingerprinting
   - Behavioral analysis
   - Multi-factor authentication for high-value actions

3. **Performance Optimizations**:
   - GraphQL API for flexible data fetching
   - Event sourcing for audit trails
   - CQRS pattern for read/write separation

4. **Social Features**:
   - Friend leaderboards
   - Achievement system
   - Score history visualization

### Technical Debt Management
- Regular dependency updates
- Code quality monitoring with SonarQube
- Performance regression testing
- Security vulnerability scanning

## Support & Maintenance

### Runbooks
- [Database Migration Procedures](./docs/database-migrations.md)
- [Incident Response Guide](./docs/incident-response.md)
- [Performance Troubleshooting](./docs/performance-troubleshooting.md)

### Contact Information
- **Development Team**: backend-team@company.com
- **On-call Engineer**: +1-xxx-xxx-xxxx
- **Project Manager**: pm-scoreboard@company.com

---

**Document Version**: 1.0  
**Last Updated**: June 15, 2025  
**Next Review**: July 15, 2025
