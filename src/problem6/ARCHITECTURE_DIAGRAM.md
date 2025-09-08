# System Architecture Diagram

## Text-Based Architecture Overview

```
                                    [Users]
                                       |
                                   [CDN Layer]
                                       |
                               [API Gateway]
                                   |   |   |
                    +--------------+   |   +--------------+
                    |                  |                  |
            [Availability Zone 1]  [Availability Zone 2]  [Availability Zone 3]
                    |                  |                  |
            +-------+-------+  +-------+-------+  +-------+-------+
            |       |       |  |       |       |  |       |       |
       [Score] [User] [Notif] [Score] [User] [Notif] [Score] [User] [Notif]
       Service Service Service Service Service Service Service Service Service
            |       |       |  |       |       |  |       |       |
            +-------+-------+--+-------+-------+--+-------+-------+
                           |           |           |
                      [Event Bus - Kafka Cluster]
                           |           |           |
                      [Redis Cache Cluster]
                           |           |           |
            +-------+-------+--+-------+-------+--+-------+-------+
            |       |       |  |       |       |  |       |       |
        [Primary]  [DB]   [DB] [Read]  [DB]   [DB] [Read]  [DB]   [DB]
        Database  Shard1 Shard2 Replica Shard3 Shard4 Replica Shard5 Shard6
```

## Component Layers

### 1. Client Layer
- **Users**: Web browsers, mobile apps
- **Connections**: HTTPS, WebSocket

### 2. Edge Layer
- **CDN**: Static asset caching, global distribution
- **Caching**: 5-minute TTL for API responses

### 3. Gateway Layer
- **API Gateway**: Single entry point, load balancing
- **Features**: Rate limiting, authentication, routing
- **Security**: JWT validation, DDoS protection

### 4. Service Layer (Microservices)

#### Score Service
```
Responsibilities:
├── Score validation and updates
├── Leaderboard computation
├── Business rule enforcement
└── Event publishing

Endpoints:
├── POST /api/v1/scores
├── GET /api/v1/leaderboard  
├── GET /api/v1/users/{id}/score
└── GET /api/v1/health
```

#### User Service
```
Responsibilities:
├── User authentication
├── Profile management
├── Permission validation
└── Session management

Endpoints:
├── POST /api/v1/auth/login
├── POST /api/v1/auth/refresh
├── GET /api/v1/users/{id}
└── PUT /api/v1/users/{id}
```

#### Notification Service
```
Responsibilities:
├── WebSocket connection management
├── Real-time message broadcasting
├── Event consumption from Kafka
└── Connection pooling

Features:
├── Auto-reconnection
├── Message queuing
├── Graceful degradation
└── Load balancing
```

### 5. Event Layer
- **Apache Kafka**: Event streaming backbone
- **Topics**: score_updates, user_actions, system_events
- **Partitioning**: By user_id for ordered processing
- **Replication**: 3 replicas across AZs

### 6. Cache Layer
- **Redis Cluster**: In-memory data store
- **Use Cases**: Session storage, leaderboard caching, rate limiting
- **Configuration**: 6 nodes (3 primary, 3 replica)
- **Eviction**: LRU policy with 1GB memory per node

### 7. Data Layer

#### Database Sharding Strategy
```
Shard Distribution:
├── Shard 1: Users with hash(user_id) % 4 = 0
├── Shard 2: Users with hash(user_id) % 4 = 1  
├── Shard 3: Users with hash(user_id) % 4 = 2
└── Shard 4: Users with hash(user_id) % 4 = 3

Replication:
├── Primary DB (AZ1): Write operations
├── Read Replica (AZ2): Read operations, failover
└── Read Replica (AZ3): Read operations, analytics
```

#### Database Schema
```sql
-- Users table (sharded by user_id)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scores table (sharded by user_id)  
CREATE TABLE scores (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    current_score INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,
    INDEX idx_score_ranking (current_score DESC)
);

-- Score history (for audit and analytics)
CREATE TABLE score_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    score_change INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(100),
    ip_address INET
);
```

### 8. Monitoring Layer
```
Observability Stack:
├── Metrics: Prometheus + Grafana
├── Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
├── Tracing: Jaeger for distributed tracing
└── Alerting: PagerDuty integration

Key Metrics:
├── Service health and uptime
├── Response times (p50, p95, p99)
├── Error rates and types
├── Active user connections
├── Score update frequency
└── Database performance
```

## Data Flow Diagrams

### Score Update Flow
```
[User Action] 
    ↓ HTTPS POST
[API Gateway] 
    ↓ Load Balance
[Score Service] 
    ↓ Validate
[Database Shard] 
    ↓ Success
[Event Bus] 
    ↓ Publish
[Notification Service] 
    ↓ WebSocket
[Connected Clients]
```

### Real-time Update Flow
```
[Score Change Event] 
    ↓ Kafka Topic
[Notification Service] 
    ↓ Process Event
[WebSocket Connections] 
    ↓ Broadcast
[Frontend Apps] 
    ↓ Update UI
[Leaderboard Display]
```

### Authentication Flow
```
[Login Request] 
    ↓ Credentials
[User Service] 
    ↓ Validate
[JWT Generation] 
    ↓ Return Tokens
[Client Storage] 
    ↓ Include in Headers
[API Gateway] 
    ↓ Verify JWT
[Service Access]
```

## Security Architecture

### Defense in Depth
```
Layer 1: CDN/WAF Protection
├── DDoS mitigation
├── IP filtering
├── Rate limiting
└── SSL/TLS termination

Layer 2: API Gateway Security  
├── JWT token validation
├── Request/response filtering
├── Rate limiting per user
└── Request size limits

Layer 3: Service-Level Security
├── Input validation
├── Business rule enforcement
├── Audit logging
└── Encrypted data storage

Layer 4: Database Security
├── Connection encryption
├── Row-level security
├── Backup encryption
└── Access control lists
```

### Threat Mitigation
```
Score Tampering Prevention:
├── JWT-based authentication
├── Request signing with HMAC
├── Idempotency keys
├── Rate limiting (10 updates/minute)
├── Business rule validation
├── Anomaly detection
└── Comprehensive audit trails

Session Security:
├── Secure HTTP-only cookies
├── CSRF protection
├── Session rotation
├── Concurrent session limits
└── Device fingerprinting
```

This architecture provides a comprehensive, scalable, and secure foundation for the scoreboard system while maintaining clear separation of concerns and enabling future enhancements.
