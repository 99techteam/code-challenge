# Real-Time Scoreboard API Module

## Overview
A comprehensive API module for managing a real-time scoreboard system that displays top 10 user scores with live updates, secure user actions, and robust security measures to prevent unauthorized score manipulation.

---

## System Architecture

### Real-Time Scoreboard Flow

**Data Flow:**
1. **WebSocket Connection** - Client establishes real-time connection
2. **Connection Storage** - Store active connections in DynamoDB
3. **User Actions** - Users perform score-earning activities
4. **Database Persistence** - Actions recorded in PostgreSQL
5. **Event Dispatch** - Trigger scoreboard update events
6. **Score Calculation** - Retrieve and calculate user scores
7. **Cache Update** - Update DynamoDB scoreboard cache
8. **Real-time Broadcast** - Notify all connected clients

**Technology Stack:**
- **Serverless Architecture**: AWS Lambda for auto-scaling and cost efficiency
- **Cache Layer**: DynamoDB for fast scoreboard retrieval (Redis alternative)
- **Database**: PostgreSQL for persistent data storage
- **Real-time Communication**: WebSocket connections

---

## API Endpoints

### Authentication

#### 1. User Registration
- **Endpoint**: `POST /api/v1/auth/register`
- **Description**: Create a new user account

![Register Sequence](https://uml.planttext.com/plantuml/png/TP8_JyGm3CLtVmgFCA1ZOA43EgbmOWDTWTsqBeq8IMMxL_Zsf7-kkfvWIYA_z_9pdAqQYNLV7ioPPtnL5jppXrCJCXS3xdpi0QYqA9Xxny40fXMlxZ2FmIHwdrmPFZyLBxYXpfgDZ14iS29OoJDy8-ygCaONsixqJ5cm75p9ANK_Hs7W7hl41yTQajsJqJifPvWtN7wYgqS9aXUcwWVvEtaryNkRUZihB55dS3VNjyEvzguqOA_porIH5KEqoNuACcypV2Hji2NLFahrDsf11rwwIUtN4Ox54MJ9AhgoPFsVSZKedSHrvu531Qlt77pZp0QFjZ6acoxcT4o3VH29SWcmJSxq6Nu1)

**Request Body:**
```json
{
  "username": "string",        // Required: User's display name
  "email": "string",          // Required: Valid email address
  "password": "string",       // Required: Min 8 characters
  "confirmPassword": "string" // Required: Must match password
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

#### 2. User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Authenticate user and receive JWT token

![Login Sequence](https://uml.planttext.com/plantuml/png/VP7TIWCn48Nl0tc7ym9B5RpQ2obK54HGw5Qlq-xK1jDCIMPRzUdDJ-jg1U-I-VauPyuqYWaoR9rMOiKH5f427lZLUjmwFa0OToIuV-dGyHjvhRGoA-60cRFa9V_h2yqrPkmbi7E9qUBfSTvXOWRPJ5m6fi6n_MkunRDnjZT2i7utI3mVdLFOsnKbw95qAgJUZH6pD97Q8dJ8-fSVeAsnoTIfYMQajDMazMikRfpKGiyKuLb0xpOAaiMTYV70eSU-ohFiiKxSf0_u5jMSURcwkCJ2PzySx2VrMf6BnyiMT8Jn_GYtiVB_XPRjd8BK5CZtvVG_pfGtIX9_fxMQfeKIirPV)

**Request Body:**
```json
{
  "email": "string",    // Required: User's email
  "password": "string"  // Required: User's password
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "username": "display_name",
    "email": "user@email.com"
  }
}
```

### Core Features

#### 3. Get Scoreboard
- **Endpoint**: `GET /api/v1/scoreboard`
- **Description**: Retrieve top 10 user scores in descending order

![Scoreboard Sequence](https://uml.planttext.com/plantuml/png/TPBBJiCm44NtaV8FymCLiAqKrDBmaWegH8XbvDW3M2HsvPa4yVVOYL5eQtQsvzxZUQs8XUE-Q_CiprXpYx3L0yBBNWb6gAHrs5ZXL8WBoTR1fjLeEDod4omkuHKRil8JkLxlxc496siCIWQs8LIDeJmxL7bRbDLRqJLAUD-TCCgd4D_FIaqoagw7yTCZnypGrb1TVXlHsVBAas81QnyPyAye95uKy6XPlsafmXlSjFOBYYBFggSA5XxwW4JY7UV4db5Y01tOeYhFZkGUC3Sk9gMQaS9EeyUmtSF5EVI4ZbBsVugwHKvMb9GdwqYvZxzFpBD2es9BAGmr-b75RQ2JuOOYflLOmgwdZscjnhRyWi8aLXxij-y7)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "user_id",
      "username": "player_name",
      "score": 1500
    }
  ]
}
```

#### 4. Complete Action
- **Endpoint**: `POST /api/v1/actions`
- **Description**: Execute user action to increase score
- **Authentication**: Required (JWT Token)

![Action Sequence](https://uml.planttext.com/plantuml/png/VPCnRy8m48Lt_ueRsm69IamC5RG5YQajALsHiG_5gh7JiqD5VttFSI015POayhtldU_PcOGeATOxAqGqqIAi0X8y-rrbCI9CLJJUmTpw7o6aYfvhrg2BGkGt31vPxI9vQnaSTwXiK25jX0__XGvC0EFsqXejfdKiFPbV9WR985kDOJHyW9MJnweMQ0Ds-FzmltkMVYQTZCptYcVIyKdJxdDjD4YdWPVa1LKWxOr2TdyZhp24usZ70cjU6Dl8a4ITCTjjCQeI2BzhGzYwdxI3C_Eqd2UKJUQ4eRQSSmgmFOPUWgVUbmcCXaDuaXgMt1D3p0bsVAQRGo7fmir9fbf3dQv3La5f0lbukA9UE4MOFXiaA4zuRTHLrGGKQfNY5EXqtxDuBzRpnVmrPM929NE2MywZX8sNT6FuTiugdnC7thROrjOUHDFex73xTs-9eVAEztfNP0Zuii-8FDrdSC9F_b7-0000)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "action_id": "action_identifier",
  "data": {
    "level": 5,
    "difficulty": "hard"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scoreEarned": 100,
    "totalScore": 1250,
    "action": "level_completed"
  }
}
```

### Real-Time Updates

#### 5. Scoreboard Refresh Event
- **Type**: WebSocket Event
- **Trigger**: Automatic after any score-affecting action

![Refresh Sequence](https://uml.planttext.com/plantuml/png/LO-n3eCm34JtIFa7Z-t03p1K3AYTIyICGc9A98YH4uhu-mPQKI5llhjdNn6YvZYFWnJHnG6XmeunzA0CCRQasS9ze4MARTHJGNO3XVns1Y47Jz5rAvXU-nS6k2mkzZ07vCRPQ_B_Z2bJbIg71yPTXM0uuQL8MyZ-n1pgJNM-erEuNBqUoRRfOZqbnq7P8OTw8gKM4_c0tyyBz7PlASK7)

**WebSocket Message:**
```json
{
  "type": "scoreboard_update",
  "data": {
    "timestamp": "2025-09-25T10:30:00Z",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_id",
        "username": "player_name",
        "score": 1500
      }
    ]
  }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Actions Table
```sql
CREATE TABLE actions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### User Action History Table
```sql
CREATE TABLE user_action_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action_id INTEGER REFERENCES actions(id),
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, action_id)
);
```

### User Scores Table
```sql
CREATE TABLE user_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  total_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Required for all write operations
- **Token Expiration**: 24-hour validity with refresh mechanism
- **Role-based Access**: User/Admin role separation

### Security Measures
- **Rate Limiting**: 
  - Login attempts: 5 per minute per IP
  - Actions: 10 per minute per user
- **Input Validation**:
  - SQL injection prevention
  - XSS protection
  - Request payload sanitization
- **Password Security**:
  - Bcrypt hashing with salt rounds
  - Minimum 8 characters requirement
- **API Security**:
  - CORS configuration
  - Request size limits
  - SSL/TLS encryption

### Error Handling
- **Standardized Responses**: Consistent error format across all endpoints
- **Logging**: Comprehensive audit trail for security events
- **Monitoring**: Real-time alerts for suspicious activities

---

## Performance Considerations

- **Caching Strategy**: DynamoDB for sub-second scoreboard retrieval
- **Database Optimization**: Indexed queries and connection pooling
- **Scalability**: Serverless architecture with auto-scaling
- **CDN Integration**: Static asset delivery optimization