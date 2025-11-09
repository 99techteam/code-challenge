/**
 * DEMO IMPLEMENTATION
 * This is a simplified demonstration of the Real-Time Scoreboard API
 * For production implementation, follow the full specification in README.md
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const JWT_SECRET = 'demo-secret-key-change-in-production';
const PORT = 3000;

// In-memory storage (use database in production)
const users = new Map();
const actionTokens = new Map();
const rateLimits = new Map();

// Initialize demo users
['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'].forEach((name, index) => {
  const userId = `user-${index + 1}`;
  users.set(userId, {
    id: userId,
    username: name,
    password: 'demo123', // In production: hash with bcrypt
    score: Math.floor(Math.random() * 1000),
    totalActions: Math.floor(Math.random() * 50)
  });
});

// Helper Functions
function generateToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getLeaderboard(limit = 10) {
  return Array.from(users.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      score: user.score,
      updatedAt: new Date().toISOString()
    }));
}

function checkRateLimit(userId) {
  const now = Date.now();
  const userLimits = rateLimits.get(userId) || [];
  
  // Remove old entries (older than 1 minute)
  const recentActions = userLimits.filter(time => now - time < 60000);
  
  if (recentActions.length >= 10) {
    return false; // Rate limit exceeded
  }
  
  recentActions.push(now);
  rateLimits.set(userId, recentActions);
  return true;
}

// Middleware: Authentication
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  req.user = decoded;
  next();
}

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Scoreboard API Demo Server',
    version: '1.0.0',
    endpoints: {
      login: 'POST /auth/login',
      leaderboard: 'GET /api/leaderboard',
      requestAction: 'POST /api/actions/request',
      completeAction: 'POST /api/actions/complete',
      myScore: 'GET /api/users/me/score',
      websocket: 'WS /socket.io'
    },
    demoUsers: Array.from(users.values()).map(u => ({
      username: u.username,
      password: 'demo123'
    }))
  });
});

// Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = Array.from(users.values()).find(u => u.username === username);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  const token = generateToken(user);
  
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        score: user.score
      }
    }
  });
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = getLeaderboard(limit);
  
  res.json({
    success: true,
    data: {
      leaderboard,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Request Action Token
app.post('/api/actions/request', authenticate, (req, res) => {
  const { actionType = 'COMPLETE_LEVEL' } = req.body;
  const userId = req.user.userId;
  
  // Generate action token
  const actionId = crypto.randomBytes(16).toString('hex');
  const actionToken = jwt.sign(
    {
      actionId,
      userId,
      actionType,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex')
    },
    JWT_SECRET,
    { expiresIn: '5m' }
  );
  
  // Store token
  actionTokens.set(actionId, {
    token: actionToken,
    userId,
    used: false,
    createdAt: Date.now()
  });
  
  res.json({
    success: true,
    data: {
      actionToken,
      actionId,
      expiresAt: new Date(Date.now() + 300000).toISOString()
    }
  });
});

// Complete Action
app.post('/api/actions/complete', authenticate, (req, res) => {
  const { actionToken, actionId, proof = {} } = req.body;
  const userId = req.user.userId;
  
  // Verify action token
  const decoded = verifyToken(actionToken);
  if (!decoded || decoded.userId !== userId) {
    return res.status(400).json({ success: false, error: 'Invalid action token' });
  }
  
  // Check if token already used
  const storedToken = actionTokens.get(actionId);
  if (!storedToken || storedToken.used) {
    return res.status(400).json({ success: false, error: 'Token already used or expired' });
  }
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: 60
    });
  }
  
  // Validate completion time (basic check)
  const completionTime = proof.completionTime || 10000;
  if (completionTime < 1000 || completionTime > 300000) {
    return res.status(400).json({ success: false, error: 'Suspicious completion time' });
  }
  
  // Mark token as used
  storedToken.used = true;
  
  // Update score
  const user = users.get(userId);
  const scoreIncrement = 100; // Fixed increment for demo
  const oldScore = user.score;
  user.score += scoreIncrement;
  user.totalActions += 1;
  
  // Get new rank
  const leaderboard = getLeaderboard(100);
  const rankIndex = leaderboard.findIndex(entry => entry.userId === userId);
  const newRank = rankIndex + 1;
  
  // Broadcast update to all WebSocket clients
  io.emit('leaderboard:update', {
    leaderboard: getLeaderboard(10),
    updatedAt: new Date().toISOString()
  });
  
  // Send personal score update
  io.emit('score:update', {
    userId,
    oldScore,
    newScore: user.score,
    increment: scoreIncrement,
    newRank
  });
  
  res.json({
    success: true,
    data: {
      scoreIncrement,
      newScore: user.score,
      rank: newRank,
      message: 'Score updated successfully'
    }
  });
});

// Get My Score
app.get('/api/users/me/score', authenticate, (req, res) => {
  const userId = req.user.userId;
  const user = users.get(userId);
  
  const leaderboard = getLeaderboard(100);
  const rankIndex = leaderboard.findIndex(entry => entry.userId === userId);
  
  res.json({
    success: true,
    data: {
      userId: user.id,
      username: user.username,
      score: user.score,
      rank: rankIndex + 1,
      totalActions: user.totalActions
    }
  });
});

// WebSocket Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial leaderboard
  socket.emit('leaderboard:initial', {
    leaderboard: getLeaderboard(10),
    updatedAt: new Date().toISOString()
  });
  
  // Handle ping
  socket.on('ping', (data) => {
    socket.emit('pong', { timestamp: Date.now() });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎮 Scoreboard API Demo Server                           ║
║                                                            ║
║   Server: http://localhost:${PORT}                           ║
║   Status: Running                                          ║
║                                                            ║
║   📚 API Documentation: http://localhost:${PORT}/             ║
║                                                            ║
║   Demo Users (all use password: "demo123"):               ║
${Array.from(users.values()).slice(0, 5).map(u => 
  `║   • ${u.username.padEnd(20)} (Score: ${String(u.score).padStart(4)})              ║`
).join('\n')}
║   ... and 5 more users                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

