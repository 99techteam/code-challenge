# Problem 6: Real-Time Scoreboard API Specification

## Executive Summary

This document specifies a secure, real-time scoreboard API service that displays the top 10 users' scores with live updates while preventing unauthorized score manipulation.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [API Specifications](#api-specifications)
4. [Security Requirements](#security-requirements)
5. [Real-Time Updates](#real-time-updates)
6. [Data Models](#data-models)
7. [Execution Flow](#execution-flow)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Additional Improvements](#additional-improvements)
10. [Testing Requirements](#testing-requirements)

---

## System Overview

### Purpose
Build a backend API service that manages a live scoreboard displaying the top 10 users with anti-cheating mechanisms.

### Key Requirements

1. ✅ **Scoreboard Display**: Show top 10 users ranked by score
2. ✅ **Live Updates**: Real-time score updates without page refresh
3. ✅ **Score Increments**: User actions trigger score increases
4. ✅ **API Integration**: Action completion calls backend API
5. ✅ **Security**: Prevent unauthorized score manipulation

### Technology Stack Recommendations

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL or Redis (for leaderboard)
- **Real-time**: WebSocket (Socket.io) or Server-Sent Events (SSE)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Server-side action verification

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser                                                    │
│  ├─ Scoreboard UI (WebSocket Client)                          │
│  ├─ User Actions (Game/Activity)                              │
│  └─ Authentication Token (JWT)                                │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    │ HTTPS / WSS
                    │
┌───────────────────▼─────────────────────────────────────────────┐
│                     API GATEWAY / LOAD BALANCER                 │
└───────────────────┬─────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐      ┌───────▼────────┐
│  HTTP API      │      │  WebSocket     │
│  Endpoints     │      │  Server        │
└───────┬────────┘      └───────┬────────┘
        │                       │
        │    ┌──────────────────┘
        │    │
┌───────▼────▼───────────────────────────────────────────────────┐
│                   APPLICATION SERVER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Authentication  │  │  Authorization   │                   │
│  │  Middleware      │  │  Middleware      │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              BUSINESS LOGIC LAYER                        │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  ├─ Score Service                                        │ │
│  │  │  ├─ Validate Action Token                            │ │
│  │  │  ├─ Verify Action Completion                         │ │
│  │  │  ├─ Calculate Score Increment                        │ │
│  │  │  ├─ Rate Limiting Check                              │ │
│  │  │  └─ Update Score                                     │ │
│  │  │                                                       │ │
│  │  ├─ Leaderboard Service                                 │ │
│  │  │  ├─ Get Top 10 Users                                 │ │
│  │  │  ├─ Cache Management                                 │ │
│  │  │  └─ Real-time Broadcast                              │ │
│  │  │                                                       │ │
│  │  └─ Anti-Cheat Service                                  │ │
│  │     ├─ Action Verification                              │ │
│  │     ├─ Anomaly Detection                                │ │
│  │     ├─ Rate Limiting                                    │ │
│  │     └─ Fraud Prevention                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼────────┐      ┌───────▼────────┐
│   PostgreSQL   │      │     Redis      │
│   (Primary DB) │      │   (Cache/      │
│                │      │   Leaderboard) │
└────────────────┘      └────────────────┘
```

---

## API Specifications

### Base URL
```
https://api.example.com/v1
```

### Authentication
All API requests require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

---

### Endpoints

#### 1. **User Authentication**

##### POST `/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "string",
      "score": 0
    }
  }
}
```

---

#### 2. **Get Leaderboard**

##### GET `/leaderboard`
Retrieve top 10 users by score.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "string",
        "score": 10000,
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 3. **Request Action Token**

##### POST `/actions/request`
Request a token to perform an action. This token proves action initiation.

**Request:**
```json
{
  "actionType": "COMPLETE_LEVEL",
  "metadata": {
    "levelId": "level-123",
    "difficulty": "hard"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "actionToken": "encrypted_token_string",
    "expiresAt": "2024-01-15T10:35:00Z",
    "actionId": "uuid"
  }
}
```

**Security Notes:**
- Token is cryptographically signed
- Token expires in 5 minutes
- Token is tied to user ID and action type
- Server stores token hash for verification

---

#### 4. **Complete Action & Update Score**

##### POST `/actions/complete`
Submit completed action with proof for score update.

**Request:**
```json
{
  "actionToken": "encrypted_token_string",
  "actionId": "uuid",
  "proof": {
    "completionTime": 45000,
    "checksum": "calculated_checksum",
    "signature": "client_signature"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scoreIncrement": 100,
    "newScore": 1100,
    "rank": 5,
    "rankChange": 2,
    "message": "Score updated successfully"
  }
}
```

**Response (400 Bad Request - Invalid Token):**
```json
{
  "success": false,
  "error": "INVALID_ACTION_TOKEN",
  "message": "Action token is invalid or expired"
}
```

**Response (429 Too Many Requests - Rate Limit):**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many actions. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

---

#### 5. **Get User Score**

##### GET `/users/me/score`
Get current user's score and rank.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "score": 1100,
    "rank": 5,
    "totalActions": 11
  }
}
```

---

### WebSocket API

#### Connection
```
wss://api.example.com/v1/leaderboard/live
```

**Connection Headers:**
```
Authorization: Bearer <jwt_token>
```

#### Events

##### Server → Client: `leaderboard:update`
Broadcast when leaderboard changes.

```json
{
  "event": "leaderboard:update",
  "data": {
    "leaderboard": [...],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

##### Server → Client: `score:update`
Notify user of their score change.

```json
{
  "event": "score:update",
  "data": {
    "userId": "uuid",
    "oldScore": 1000,
    "newScore": 1100,
    "increment": 100,
    "newRank": 5
  }
}
```

##### Client → Server: `ping`
Keep connection alive.

```json
{
  "event": "ping",
  "timestamp": 1234567890
}
```

##### Server → Client: `pong`
Connection alive response.

```json
{
  "event": "pong",
  "timestamp": 1234567890
}
```

---

## Security Requirements

### 1. **Authentication & Authorization**

#### JWT Token Structure
```json
{
  "userId": "uuid",
  "username": "string",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

- Token expiry: 1 hour
- Refresh token: 7 days
- Algorithm: HS256 or RS256

#### Authorization Levels
- **User**: Can update own score, view leaderboard
- **Admin**: Can view all data, moderate scores
- **System**: Internal service communication

---

### 2. **Action Verification System**

To prevent unauthorized score increases:

#### Step 1: Action Token Generation
```javascript
actionToken = encrypt({
  userId: user.id,
  actionType: "COMPLETE_LEVEL",
  timestamp: Date.now(),
  nonce: crypto.randomBytes(16),
  expectedScore: calculateExpectedScore(actionType)
})
```

#### Step 2: Server-Side Validation
```javascript
function validateActionCompletion(actionToken, proof) {
  // 1. Decrypt and verify token signature
  const action = decrypt(actionToken);
  
  // 2. Check token expiry (5 minutes)
  if (Date.now() - action.timestamp > 300000) {
    throw new Error('Token expired');
  }
  
  // 3. Verify token hasn't been used (check database)
  if (isTokenUsed(actionToken)) {
    throw new Error('Token already used');
  }
  
  // 4. Verify proof checksum
  const expectedChecksum = calculateChecksum(action, proof);
  if (proof.checksum !== expectedChecksum) {
    throw new Error('Invalid proof');
  }
  
  // 5. Verify completion time is reasonable
  if (proof.completionTime < MIN_TIME || proof.completionTime > MAX_TIME) {
    throw new Error('Suspicious completion time');
  }
  
  // 6. Mark token as used
  markTokenAsUsed(actionToken);
  
  return true;
}
```

---

### 3. **Rate Limiting**

Implement multiple levels of rate limiting:

| Level | Limit | Time Window | Scope |
|-------|-------|-------------|-------|
| **Aggressive** | 1 action | 1 second | Per user |
| **Action** | 10 actions | 1 minute | Per user |
| **Hourly** | 100 actions | 1 hour | Per user |
| **Daily** | 500 actions | 24 hours | Per user |
| **IP** | 1000 requests | 1 hour | Per IP |

**Implementation:**
```javascript
// Redis-based rate limiting
const rateLimiter = new RateLimiter({
  store: redisClient,
  points: 10, // Number of actions
  duration: 60, // Per 60 seconds
  blockDuration: 60 // Block for 60 seconds if exceeded
});
```

---

### 4. **Anti-Cheat Mechanisms**

#### Anomaly Detection
- Monitor abnormal completion times
- Detect patterns of rapid score increases
- Flag accounts with suspicious activity

#### Server-Side Validation
- Never trust client data
- Validate all action completions server-side
- Use cryptographic proofs

#### Action Verification Checklist
- [ ] Valid JWT token
- [ ] Action token not expired
- [ ] Action token not reused
- [ ] Proof checksum valid
- [ ] Completion time reasonable
- [ ] Rate limits not exceeded
- [ ] No suspicious patterns detected

---

### 5. **HTTPS & Secure Communication**

- **All API calls**: HTTPS only (TLS 1.2+)
- **WebSocket**: WSS (WebSocket Secure)
- **Headers**: CORS properly configured
- **Secrets**: Store in environment variables

---

## Real-Time Updates

### Technology Options

#### Option 1: WebSocket (Socket.io) ✅ Recommended
**Pros:**
- Bidirectional communication
- Automatic reconnection
- Room/namespace support
- Fallback mechanisms

**Implementation:**
```javascript
// Server
io.on('connection', (socket) => {
  // Join leaderboard room
  socket.join('leaderboard');
  
  // Send initial leaderboard
  socket.emit('leaderboard:initial', getLeaderboard());
  
  // Handle disconnection
  socket.on('disconnect', () => {
    // Cleanup
  });
});

// Broadcast update
io.to('leaderboard').emit('leaderboard:update', newLeaderboard);
```

**Client:**
```javascript
const socket = io('wss://api.example.com', {
  auth: {
    token: jwtToken
  }
});

socket.on('leaderboard:update', (data) => {
  updateUI(data.leaderboard);
});
```

---

#### Option 2: Server-Sent Events (SSE)
**Pros:**
- Simple implementation
- Native browser support
- Automatic reconnection

**Implementation:**
```javascript
// Server
app.get('/leaderboard/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  leaderboardEmitter.on('update', sendUpdate);
  
  req.on('close', () => {
    leaderboardEmitter.off('update', sendUpdate);
  });
});
```

---

### Update Strategy

#### When to Broadcast Updates:
1. When any user's score changes
2. When top 10 rankings change
3. Maximum once per second (throttled)

#### Optimization:
```javascript
// Throttle updates to prevent spam
const throttledBroadcast = _.throttle(() => {
  const leaderboard = getLeaderboard();
  io.to('leaderboard').emit('leaderboard:update', leaderboard);
}, 1000); // Maximum 1 update per second
```

---

## Data Models

### User
```typescript
interface User {
  id: string;                    // UUID
  username: string;              // Unique username
  email: string;                 // Email address
  passwordHash: string;          // Bcrypt hash
  score: number;                 // Current score
  totalActions: number;          // Total completed actions
  createdAt: Date;              // Account creation
  updatedAt: Date;              // Last update
  lastActionAt: Date;           // Last action timestamp
  status: 'active' | 'banned';  // Account status
}
```

### Score History
```typescript
interface ScoreHistory {
  id: string;                   // UUID
  userId: string;               // Foreign key to User
  actionType: string;           // Type of action completed
  scoreIncrement: number;       // Points gained
  previousScore: number;        // Score before action
  newScore: number;             // Score after action
  actionToken: string;          // Action token used
  metadata: object;             // Additional data
  timestamp: Date;              // When action completed
}
```

### Action Token
```typescript
interface ActionToken {
  id: string;                   // UUID
  userId: string;               // Foreign key to User
  actionType: string;           // Type of action
  token: string;                // Encrypted token
  tokenHash: string;            // SHA-256 hash for verification
  isUsed: boolean;              // Has token been consumed
  createdAt: Date;              // When token created
  expiresAt: Date;              // When token expires
  usedAt: Date | null;          // When token was used
}
```

### Leaderboard Cache (Redis)
```typescript
// Redis Sorted Set
// Key: "leaderboard"
// Score: user's score
// Member: userId

// Commands:
ZADD leaderboard 1000 "user-123"
ZREVRANGE leaderboard 0 9 WITHSCORES  // Get top 10
ZRANK leaderboard "user-123"          // Get user rank
```

---

## Execution Flow

### Flow 1: User Authentication
```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │  API    │                │Database │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ POST /auth/login         │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Validate credentials     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │ User data                │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Generate JWT token       │
     │                          │                          │
     │ 200 OK + JWT token       │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ Store token in          │                          │
     │ localStorage            │                          │
     │                          │                          │
```

---

### Flow 2: Initial Leaderboard Load
```
┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐
│ Client  │       │  API    │       │  Redis  │       │Database │
└────┬────┘       └────┬────┘       └────┬────┘       └────┬────┘
     │                 │                  │                  │
     │ GET /leaderboard│                  │                  │
     ├────────────────>│                  │                  │
     │ + JWT token     │                  │                  │
     │                 │                  │                  │
     │                 │ Verify JWT       │                  │
     │                 │                  │                  │
     │                 │ Check Redis cache│                  │
     │                 ├─────────────────>│                  │
     │                 │                  │                  │
     │                 │ Cache HIT        │                  │
     │                 │<─────────────────┤                  │
     │                 │                  │                  │
     │ 200 OK          │                  │                  │
     │ Top 10 users    │                  │                  │
     │<────────────────┤                  │                  │
     │                 │                  │                  │
```

---

### Flow 3: WebSocket Connection
```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │WebSocket│                │ Redis   │
│         │                │ Server  │                │ PubSub  │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ Connect to WSS           │                          │
     │ wss://api.../leaderboard │                          │
     ├─────────────────────────>│                          │
     │ + JWT token              │                          │
     │                          │                          │
     │                          │ Verify JWT               │
     │                          │                          │
     │ Connection established   │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │                          │ Join "leaderboard" room  │
     │                          │                          │
     │                          │ Subscribe to updates     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │ leaderboard:initial      │                          │
     │ (current top 10)         │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

---

### Flow 4: Complete Action & Update Score (CRITICAL FLOW)
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Client  │  │  API    │  │  Auth   │  │Anti-Cheat│ │Database │  │WebSocket│
└────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
     │            │            │            │            │            │
     │ 1. User starts action   │            │            │            │
     │            │            │            │            │            │
     │ POST /actions/request   │            │            │            │
     ├───────────>│            │            │            │            │
     │ + JWT      │            │            │            │            │
     │            │            │            │            │            │
     │            │ Verify JWT │            │            │            │
     │            ├───────────>│            │            │            │
     │            │            │            │            │            │
     │            │ JWT Valid  │            │            │            │
     │            │<───────────┤            │            │            │
     │            │            │            │            │            │
     │            │ Generate action token   │            │            │
     │            │ (encrypted, signed)     │            │            │
     │            │            │            │            │            │
     │            │ Store token hash        │            │            │
     │            ├───────────────────────────────────────>│            │
     │            │            │            │            │            │
     │ actionToken│            │            │            │            │
     │ expiresAt  │            │            │            │            │
     │<───────────┤            │            │            │            │
     │            │            │            │            │            │
     │ 2. User completes action│            │            │            │
     │    (client-side)        │            │            │            │
     │            │            │            │            │            │
     │ POST /actions/complete  │            │            │            │
     ├───────────>│            │            │            │            │
     │ + actionToken           │            │            │            │
     │ + proof    │            │            │            │            │
     │            │            │            │            │            │
     │            │ Verify JWT │            │            │            │
     │            ├───────────>│            │            │            │
     │            │<───────────┤            │            │            │
     │            │            │            │            │            │
     │            │ Validate action token   │            │            │
     │            ├───────────────────────────────────────>│            │
     │            │            │            │            │            │
     │            │ Token valid│            │            │            │
     │            │<───────────────────────────────────────┤            │
     │            │            │            │            │            │
     │            │ Anti-cheat checks       │            │            │
     │            ├───────────────────────>│            │            │
     │            │            │            │            │            │
     │            │  • Rate limiting        │            │            │
     │            │  • Completion time OK   │            │            │
     │            │  • Checksum valid       │            │            │
     │            │  • No anomalies         │            │            │
     │            │            │            │            │            │
     │            │ Checks passed           │            │            │
     │            │<───────────────────────┤            │            │
     │            │            │            │            │            │
     │            │ Update score & mark token used       │            │
     │            ├───────────────────────────────────────>│            │
     │            │            │            │            │            │
     │            │ Updated score & rank    │            │            │
     │            │<───────────────────────────────────────┤            │
     │            │            │            │            │            │
     │ 200 OK     │            │            │            │            │
     │ newScore   │            │            │            │            │
     │ rank       │            │            │            │            │
     │<───────────┤            │            │            │            │
     │            │            │            │            │            │
     │            │ Broadcast leaderboard update          │            │
     │            ├──────────────────────────────────────────────────>│
     │            │            │            │            │            │
     │            │            │            │            │ Emit to all│
     │            │            │            │            │ connected  │
     │<───────────────────────────────────────────────────────────────┤
     │ leaderboard:update      │            │            │            │
     │            │            │            │            │            │
```

**Key Security Steps:**
1. ✅ JWT authentication
2. ✅ Action token generation (server-side)
3. ✅ Token expiry (5 minutes)
4. ✅ One-time use verification
5. ✅ Rate limiting check
6. ✅ Completion time validation
7. ✅ Checksum verification
8. ✅ Anomaly detection
9. ✅ Score update in transaction
10. ✅ Real-time broadcast

---

## Implementation Guidelines

### Tech Stack

```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5+",
  "framework": "Express.js 4.x",
  "database": "PostgreSQL 14+",
  "cache": "Redis 7+",
  "websocket": "Socket.io 4.x",
  "authentication": "jsonwebtoken",
  "encryption": "crypto (Node.js native)",
  "validation": "joi or zod",
  "testing": "Jest + Supertest"
}
```

### Project Structure

```
src/
├── config/
│   ├── database.ts
│   ├── redis.ts
│   └── websocket.ts
├── middleware/
│   ├── auth.ts
│   ├── rateLimiter.ts
│   └── errorHandler.ts
├── services/
│   ├── authService.ts
│   ├── scoreService.ts
│   ├── leaderboardService.ts
│   ├── actionTokenService.ts
│   └── antiCheatService.ts
├── controllers/
│   ├── authController.ts
│   ├── scoreController.ts
│   └── leaderboardController.ts
├── models/
│   ├── User.ts
│   ├── ScoreHistory.ts
│   └── ActionToken.ts
├── routes/
│   ├── auth.routes.ts
│   ├── score.routes.ts
│   └── leaderboard.routes.ts
├── websocket/
│   ├── socketHandler.ts
│   └── leaderboardSocket.ts
├── utils/
│   ├── encryption.ts
│   ├── validation.ts
│   └── checksum.ts
└── index.ts
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  score BIGINT DEFAULT 0,
  total_actions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_action_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  
  INDEX idx_score (score DESC),
  INDEX idx_username (username),
  INDEX idx_status (status)
);

-- Score history table
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  score_increment INT NOT NULL,
  previous_score BIGINT NOT NULL,
  new_score BIGINT NOT NULL,
  action_token_id UUID NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp)
);

-- Action tokens table
CREATE TABLE action_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_count INT DEFAULT 1,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  
  INDEX idx_user_window (user_id, window_end)
);
```

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scoreboard
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Encryption
ACTION_TOKEN_SECRET=your-action-token-secret
ENCRYPTION_ALGORITHM=aes-256-gcm

# Rate Limiting
RATE_LIMIT_ACTIONS_PER_MINUTE=10
RATE_LIMIT_ACTIONS_PER_HOUR=100
RATE_LIMIT_ACTIONS_PER_DAY=500

# Anti-Cheat
MIN_ACTION_COMPLETION_TIME_MS=1000
MAX_ACTION_COMPLETION_TIME_MS=300000
ANOMALY_DETECTION_THRESHOLD=5

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_RECONNECT_ATTEMPTS=3

# CORS
CORS_ORIGIN=https://yourdomain.com
```

---

## Additional Improvements

### 🔒 Security Enhancements

#### 1. **Multi-Factor Verification**
- Implement multiple verification points for score updates
- Use device fingerprinting
- Monitor IP addresses for suspicious patterns

#### 2. **Machine Learning Anomaly Detection**
```javascript
// Future enhancement
const anomalyScore = await mlModel.predict({
  userId,
  completionTime,
  recentActions,
  scoreVelocity,
  timeOfDay
});

if (anomalyScore > THRESHOLD) {
  flagForReview(userId);
}
```

#### 3. **Blockchain-Based Score Ledger**
- Immutable score history
- Cryptographic proof of all score changes
- Prevents retroactive tampering

---

### ⚡ Performance Optimizations

#### 1. **Caching Strategy**
```javascript
// Multi-level caching
┌─────────────────┐
│ Client Cache    │  (1 second TTL)
├─────────────────┤
│ Redis Cache     │  (5 seconds TTL)
├─────────────────┤
│ Database        │  (Source of truth)
└─────────────────┘
```

#### 2. **Database Optimization**
- Use materialized views for leaderboard
- Implement database sharding for large user bases
- Use read replicas for leaderboard queries

#### 3. **CDN for Static Assets**
- Cache leaderboard UI components
- Reduce API server load

---

### 📊 Analytics & Monitoring

#### 1. **Metrics to Track**
```javascript
{
  "api_requests_total": "Counter",
  "score_updates_total": "Counter",
  "websocket_connections": "Gauge",
  "action_completion_time": "Histogram",
  "rate_limit_violations": "Counter",
  "anti_cheat_flags": "Counter",
  "leaderboard_query_time": "Histogram"
}
```

#### 2. **Logging Strategy**
```javascript
// Structured logging
logger.info('Score updated', {
  userId,
  oldScore,
  newScore,
  actionType,
  timestamp,
  ip: req.ip
});
```

#### 3. **Alerting**
- Alert on high rate limit violations
- Alert on anomaly detection triggers
- Alert on system performance degradation

---

### 🎮 User Experience Improvements

#### 1. **Optimistic UI Updates**
```javascript
// Update UI immediately, rollback if fails
updateScoreOptimistically(userId, increment);

try {
  await api.completeAction(token);
} catch (error) {
  rollbackScore(userId, increment);
  showError('Score update failed');
}
```

#### 2. **Reconnection Handling**
```javascript
socket.on('disconnect', () => {
  showReconnectingMessage();
  attemptReconnect();
});

socket.on('connect', () => {
  hideReconnectingMessage();
  refreshLeaderboard();
});
```

#### 3. **Leaderboard Animations**
- Smooth rank changes
- Highlight position changes
- Celebratory effects for top 10 entries

---

### 🔄 Scalability Considerations

#### 1. **Horizontal Scaling**
```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐ ┌──▼──┐
│API 1│ │API 2│ ... (N instances)
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       │
┌──────▼────────┐
│ Redis Cluster │
└───────────────┘
```

#### 2. **WebSocket Scaling**
- Use Redis pub/sub for cross-server communication
- Sticky sessions for WebSocket connections
- Consider dedicated WebSocket servers

#### 3. **Database Scaling**
- Master-slave replication
- Read replicas for leaderboard queries
- Connection pooling

---

### 🧪 Testing Strategy

#### 1. **Unit Tests**
- Test each service independently
- Mock external dependencies
- Test anti-cheat logic thoroughly

#### 2. **Integration Tests**
- Test complete action flow
- Test WebSocket connections
- Test rate limiting

#### 3. **Load Testing**
```javascript
// Example using k6
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.post('https://api.example.com/v1/actions/complete', {
    actionToken: '...',
    proof: {...}
  });
  
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

#### 4. **Security Testing**
- Penetration testing
- Token replay attack testing
- Rate limit bypass attempts
- SQL injection tests

---

### 🌍 Internationalization

#### 1. **Multi-Region Support**
- Deploy API servers in multiple regions
- Use GeoDNS for routing
- Regional leaderboards option

#### 2. **Localization**
- Error messages in multiple languages
- Timestamp formatting
- Number formatting

---

### 📱 Mobile Considerations

#### 1. **Battery Optimization**
- Implement WebSocket reconnection backoff
- Reduce update frequency on low battery
- Pause updates when app backgrounded

#### 2. **Network Resilience**
- Queue failed requests
- Retry with exponential backoff
- Graceful degradation on poor connections

---

## Testing Requirements

### Unit Tests
```bash
npm run test:unit
```

**Required Coverage:**
- Services: >90%
- Controllers: >80%
- Utilities: >95%

### Integration Tests
```bash
npm run test:integration
```

**Test Scenarios:**
- [ ] User authentication flow
- [ ] Action token generation and validation
- [ ] Score update with anti-cheat checks
- [ ] Rate limiting enforcement
- [ ] WebSocket connection and updates
- [ ] Leaderboard retrieval and caching

### Load Tests
```bash
npm run test:load
```

**Performance Targets:**
- API response time: <100ms (p95)
- WebSocket latency: <50ms
- Concurrent users: 10,000+
- Actions per second: 1,000+

### Security Tests
```bash
npm run test:security
```

**Security Checks:**
- [ ] Token replay attack prevention
- [ ] Rate limit bypass attempts
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF prevention
- [ ] Action token tampering

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis cluster configured
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring and alerts set up
- [ ] Load balancer configured
- [ ] WebSocket sticky sessions enabled
- [ ] Database backups scheduled
- [ ] Disaster recovery plan documented

---

## API Rate Limits Summary

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/login | 5 | 15 minutes |
| POST /actions/request | 10 | 1 minute |
| POST /actions/complete | 10 | 1 minute |
| GET /leaderboard | 60 | 1 minute |
| GET /users/me/score | 30 | 1 minute |
| WebSocket connections | 3 | 5 minutes |

---

## Support & Documentation

### API Documentation
- Interactive API docs: `/api/docs` (Swagger/OpenAPI)
- Postman collection: Available in repository

### Monitoring Dashboards
- Application metrics: Grafana dashboard
- Error tracking: Sentry integration
- Log aggregation: ELK stack

### Contact
- Technical Lead: backend-lead@example.com
- Security Team: security@example.com
- DevOps: devops@example.com

---

## Conclusion

This specification provides a complete blueprint for implementing a secure, scalable, real-time scoreboard API. The architecture emphasizes:

1. ✅ **Security First**: Multi-layered anti-cheat mechanisms
2. ✅ **Real-Time Updates**: WebSocket-based live updates
3. ✅ **Scalability**: Designed for horizontal scaling
4. ✅ **Performance**: Caching and optimization strategies
5. ✅ **Maintainability**: Clear structure and documentation

The backend engineering team should follow this specification closely while adapting implementation details to specific project requirements and constraints.

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Status:** Ready for Implementation

