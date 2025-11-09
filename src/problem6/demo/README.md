# Scoreboard API - Demo Implementation

This is a **simplified demo** that demonstrates the key concepts from the specification. It's not the full production implementation - see the main `README.md` for complete specifications.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd demo
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on **http://localhost:3000**

### 3. Open the Client

Open `client.html` in your web browser:

```bash
# macOS
open client.html

# Or just double-click the file
```

## 📝 What's Included

### Features Demonstrated:

✅ **JWT Authentication**
- Login with demo users
- Token-based API access

✅ **Action Token System**
- Two-phase action completion
- Token expiry (5 minutes)
- One-time use verification

✅ **Rate Limiting**
- 10 actions per minute per user
- In-memory tracking

✅ **Leaderboard**
- Top 10 users
- Real-time ranking

✅ **WebSocket Real-Time Updates**
- Live leaderboard updates
- Instant score changes

✅ **Anti-Cheat (Basic)**
- Token replay prevention
- Completion time validation
- Rate limiting

### Demo Users

All users have password: `demo123`

- Alice
- Bob
- Charlie
- David
- Eve
- Frank
- Grace
- Henry
- Iris
- Jack

## 🧪 Testing the API

### Using cURL

#### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","password":"demo123"}'
```

#### 2. Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard
```

#### 3. Request Action Token
```bash
curl -X POST http://localhost:3000/api/actions/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"actionType":"COMPLETE_LEVEL"}'
```

#### 4. Complete Action
```bash
curl -X POST http://localhost:3000/api/actions/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "actionToken":"ACTION_TOKEN",
    "actionId":"ACTION_ID",
    "proof":{"completionTime":5000}
  }'
```

## 🔍 What's Missing (Production Features)

This demo is simplified. For production, you need:

- ❌ PostgreSQL database (uses in-memory storage)
- ❌ Redis for caching
- ❌ Bcrypt password hashing
- ❌ Advanced anti-cheat (ML, behavioral analysis)
- ❌ Comprehensive rate limiting
- ❌ Monitoring and logging
- ❌ Error handling for all edge cases
- ❌ Security hardening
- ❌ Load balancing
- ❌ Auto-scaling

## 📚 Full Implementation

To build the production version, follow:
1. **../README.md** - Complete specification
2. **../IMPLEMENTATION_CHECKLIST.md** - Step-by-step guide
3. **../EXECUTION_FLOW_DIAGRAM.md** - Architecture diagrams

## 🎮 How to Use the Demo Client

1. **Login**: Select a user and click "Login"
2. **Complete Actions**: Click "Complete Action" to earn points
3. **Watch Live Updates**: See the leaderboard update in real-time
4. **Try Rate Limiting**: Click the button rapidly (max 10/minute)
5. **Multiple Clients**: Open in multiple browser tabs to see real-time sync

## 💡 Learning Points

This demo shows:
- How JWT authentication works
- Two-phase action completion (request → complete)
- WebSocket for real-time updates
- Basic anti-cheat mechanisms
- Rate limiting implementation

## ⚠️ Important Notes

**This is a DEMO only!**
- Do NOT use in production
- No persistent storage
- Simplified security
- No error recovery
- Missing many production features

For production implementation, follow the full specification in the parent directory.

