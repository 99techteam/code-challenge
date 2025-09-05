# Live Scoreboard System

A real-time scoreboard system with live updates, user authentication, and security features. Built with ExpressJS, TypeScript, WebSocket, and SQLite database.

## 🎯 Features

- **Real-time Scoreboard** - Live updates using WebSocket
- **User Authentication** - JWT-based authentication system
- **Score Security** - Anti-cheat protection and validation
- **Rate Limiting** - Prevents spam and abuse
- **Live Updates** - WebSocket for real-time scoreboard updates
- **Top 10 Leaderboard** - Displays top 10 players
- **Score Validation** - Prevents malicious score manipulation
- **TypeScript** - Full TypeScript support with strict type checking

## 📋 Requirements Met

✅ **Website with scoreboard showing top 10 user scores**  
✅ **Live update of the scoreboard**  
✅ **User actions that increase scores**  
✅ **API call to update scores upon action completion**  
✅ **Prevention of malicious users from increasing scores without authorization**

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to project directory:**

   ```bash
   cd src/problem5
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

4. **Build the project:**

   ```bash
   npm run build
   ```

5. **Start the server:**

   ```bash
   npm run dev
   ```

6. **Access the Live Demo:**
   - **🌐 Live Demo**: Open `http://localhost:3000` in your browser
   - **📚 API Documentation**: `http://localhost:3000/api/health`
   - **🔌 WebSocket**: `ws://localhost:3000`

## 🎮 Live Demo Features

The demo includes a complete web interface with:

### ✅ **Real-time Scoreboard**

- Live top 10 leaderboard updates
- WebSocket-powered real-time updates
- Beautiful, responsive UI

### ✅ **User Authentication**

- User registration and login
- JWT token-based authentication
- Secure password handling

### ✅ **Score Management**

- Update scores with various actions
- Real-time validation and security
- Anti-cheat protection

### ✅ **Demo Scenarios**

- **Scenario 1**: Register new users
- **Scenario 2**: Login and update scores
- **Scenario 3**: Test different score actions
- **Quick Actions**: Connect, disconnect, refresh, get statistics

### ✅ **Advanced Features**

- Multiple user simulation
- Statistics dashboard
- User profile information
- Error handling and notifications

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "username": "player1",
      "email": "player1@example.com"
    }
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "password123"
}
```

### Scoreboard Endpoints

#### Get Scoreboard (Public)

```http
GET /api/scores/scoreboard
```

**Response:**

```json
{
  "success": true,
  "message": "Scoreboard retrieved successfully",
  "data": {
    "scores": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "player1",
        "score": 1500,
        "lastUpdated": "2023-12-07T10:30:00.000Z"
      }
    ],
    "lastUpdated": "2023-12-07T10:30:00.000Z",
    "totalPlayers": 25
  }
}
```

#### Update Score (Authenticated)

```http
POST /api/scores/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "completed_mission",
  "scoreIncrement": 100,
  "timestamp": 1701945000000
}
```

**Note:** The `timestamp` field should be the current timestamp in milliseconds (e.g., `Date.now()` in JavaScript). The server validates that the timestamp is within 5 minutes of the current time to prevent replay attacks.

#### Get My Score

```http
GET /api/scores/my-score
Authorization: Bearer <token>
```

#### Get Statistics

```http
GET /api/scores/statistics
```

## 🔌 WebSocket API

### Connection

```javascript
const socket = io("http://localhost:3000");
```

### Events

#### Client to Server

- `authenticate(token)` - Authenticate with JWT token
- `join-scoreboard` - Join scoreboard room for live updates
- `leave-scoreboard` - Leave scoreboard room
- `update-score(data)` - Update user score

#### Server to Client

- `user:authenticated` - Authentication successful
- `user:unauthorized` - Authentication failed
- `scoreboard:update` - Live scoreboard update
- `scoreboard:new-score` - New score added
- `scoreboard:error` - Error occurred

### Example WebSocket Usage

```javascript
// Connect to WebSocket
const socket = io("http://localhost:3000");

// Authenticate
socket.emit("authenticate", "your-jwt-token");

// Join scoreboard for live updates
socket.emit("join-scoreboard");

// Listen for scoreboard updates
socket.on("scoreboard:update", (data) => {
  console.log("Scoreboard updated:", data);
});

// Update score
socket.emit("update-score", {
  action: "completed_mission",
  scoreIncrement: 100,
  timestamp: Date.now(),
});
```

## 🛡️ Security Features

### Authentication & Authorization

- **JWT Tokens** - Secure user authentication
- **Password Hashing** - bcrypt with configurable rounds
- **Token Expiration** - Configurable token lifetime
- **Protected Routes** - Authentication required for score updates

### Anti-Cheat Protection

- **Score Validation** - Prevents negative or suspiciously large scores
- **Rate Limiting** - Prevents spam score updates
- **Timestamp Validation** - Prevents replay attacks
- **Cooldown Period** - Minimum time between score updates
- **Input Sanitization** - Validates all input data

### Rate Limiting

- **General API** - 100 requests per 15 minutes per IP
- **Score Updates** - 10 updates per minute per IP
- **Authentication** - Separate limits for auth endpoints

## 🧪 Testing with Postman

### Import Collection

1. Download `Live_Scoreboard_Postman_Collection.json`
2. Open Postman and click "Import"
3. Select the downloaded JSON file
4. The collection will be imported with all endpoints pre-configured

### Collection Features

- **Environment Variables** - `baseUrl`, `token`, `userId`, `username`
- **Auto Token Management** - Automatically saves and uses JWT tokens
- **Complete API Coverage** - All endpoints with examples
- **Error Examples** - Validation and error response examples
- **Sample Data** - Pre-configured test users
- **Auto Tests** - Response validation and timing tests

### Quick Test Flow

1. **Health Check** - Verify server is running
2. **Register User** - Create test account (auto-saves token)
3. **Get Scoreboard** - View current leaderboard
4. **Update Score** - Add points to user account
5. **Get My Score** - Check user's current score and rank

## 📊 System Architecture

### Components

- **Express Server** - REST API endpoints
- **WebSocket Server** - Real-time communication
- **SQLite Database** - Data persistence
- **Authentication Service** - User management
- **Score Service** - Score validation and management
- **WebSocket Service** - Live updates

### Data Flow

1. User performs action → Client sends score update
2. Server validates authentication and score data
3. Score is validated and stored in database
4. Scoreboard is recalculated
5. Live update is broadcast to all connected clients
6. Clients receive real-time scoreboard update

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PATH=./scoreboard.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Scoreboard Configuration
MAX_TOP_SCORES=10
SCORE_UPDATE_COOLDOWN=1000
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  isActive BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scores table
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  action TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  isValidated BOOLEAN DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

## 📁 Project Structure

```
src/problem5/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database configuration
│   │   └── index.ts             # App configuration
│   ├── controllers/
│   │   ├── authController.ts    # Authentication controller
│   │   └── scoreController.ts   # Score controller
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── index.ts             # Application middleware
│   ├── routes/
│   │   ├── authRoutes.ts        # Authentication routes
│   │   ├── scoreRoutes.ts       # Score routes
│   │   └── index.ts             # Main routes
│   ├── services/
│   │   ├── authService.ts       # Authentication service
│   │   ├── scoreService.ts      # Score management service
│   │   └── websocketService.ts  # WebSocket service
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── validation/
│   │   ├── schemas.ts           # Joi validation schemas
│   │   └── index.ts             # Validation middleware
│   └── server.ts                # Main server file
├── package.json
├── tsconfig.json
├── env.example
├── Live_Scoreboard_Postman_Collection.json
└── README.md
```

## 🚀 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🔍 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🎯 Use Cases

### Gaming Applications

- **Leaderboards** - Real-time player rankings
- **Achievements** - Score-based accomplishments
- **Competitions** - Live tournament scoring
- **Progress Tracking** - Player advancement

### Educational Platforms

- **Quiz Scores** - Real-time test results
- **Learning Progress** - Course completion tracking
- **Class Rankings** - Student performance comparison
- **Achievement Systems** - Learning milestones

### Business Applications

- **Sales Leaderboards** - Real-time sales performance
- **Employee Recognition** - Achievement tracking
- **Performance Metrics** - KPI monitoring
- **Team Competitions** - Department challenges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the repository.

---

**Happy Scoring! 🎯**
