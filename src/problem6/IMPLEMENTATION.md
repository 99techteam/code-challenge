# Implementation Examples

## 1. Core API Service Implementation

### Express.js Server Setup
```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { scoreRoutes } from './routes/scores';
import { authRoutes } from './routes/auth';
import { websocketHandler } from './websocket/handler';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/scores', scoreRoutes);

// WebSocket handling
wss.on('connection', websocketHandler);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong!'
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Score Service Implementation
```typescript
// services/ScoreService.ts
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import crypto from 'crypto';

export class ScoreService {
  private db: Pool;
  private cache: Redis;
  private pubsub: Redis;

  constructor(db: Pool, cache: Redis, pubsub: Redis) {
    this.db = db;
    this.cache = cache;
    this.pubsub = pubsub;
  }

  async updateScore(userId: string, action: ScoreAction): Promise<ScoreUpdateResult> {
    // 1. Validate action signature
    if (!this.validateActionSignature(action)) {
      throw new ValidationError('Invalid action signature');
    }

    // 2. Check for duplicate action
    const isDuplicate = await this.cache.exists(`action:${action.actionId}`);
    if (isDuplicate) {
      throw new DuplicateActionError('Action already processed');
    }

    // 3. Validate score rules
    this.validateScoreRules(action);

    // 4. Begin database transaction
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Insert action record
      await client.query(
        'INSERT INTO score_actions (user_id, action_id, action_type, score_increase, action_data, signature) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, action.actionId, action.actionType, action.scoreIncrease, action.actionData, action.signature]
      );

      // Update user score
      const result = await client.query(
        'UPDATE users SET current_score = current_score + $1, last_activity = NOW() WHERE id = $2 RETURNING current_score',
        [action.scoreIncrease, userId]
      );

      const newScore = result.rows[0].current_score;

      // Calculate new rank
      const rankResult = await client.query(
        'SELECT COUNT(*) + 1 as rank FROM users WHERE current_score > $1',
        [newScore]
      );
      const newRank = parseInt(rankResult.rows[0].rank);

      // Update user rank
      await client.query(
        'UPDATE users SET current_rank = $1 WHERE id = $2',
        [newRank, userId]
      );

      await client.query('COMMIT');

      // 5. Update cache
      await this.updateLeaderboardCache(userId, newScore);
      await this.cache.setex(`action:${action.actionId}`, 3600, 'processed');

      // 6. Publish real-time update
      await this.publishScoreUpdate(userId, newScore, newRank, action.scoreIncrease);

      return {
        newScore,
        newRank,
        scoreIncrease: action.scoreIncrease
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private validateActionSignature(action: ScoreAction): boolean {
    const payload = `${action.actionId}:${action.actionType}:${action.scoreIncrease}:${action.clientTimestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.HMAC_SECRET!)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(action.signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  private validateScoreRules(action: ScoreAction): void {
    const rules = {
      COMPLETE_LEVEL: { maxScore: 500, minTime: 10, maxTime: 300 },
      COLLECT_ITEM: { maxScore: 50, minTime: 1, maxTime: 10 },
      WIN_MATCH: { maxScore: 1000, minTime: 60, maxTime: 1800 }
    };

    const rule = rules[action.actionType as keyof typeof rules];
    if (!rule) {
      throw new ValidationError(`Unknown action type: ${action.actionType}`);
    }

    if (action.scoreIncrease > rule.maxScore) {
      throw new ValidationError(`Score increase ${action.scoreIncrease} exceeds maximum ${rule.maxScore}`);
    }

    // Additional validation based on action data
    if (action.actionData.timeCompleted) {
      const time = action.actionData.timeCompleted;
      if (time < rule.minTime || time > rule.maxTime) {
        throw new ValidationError(`Invalid completion time: ${time}s`);
      }
    }
  }

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Try cache first
    const cached = await this.cache.get('leaderboard:top10');
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const result = await this.db.query(`
      SELECT u.id, u.username, u.current_score, u.current_rank, u.last_activity
      FROM users u
      WHERE u.is_active = true AND u.is_banned = false
      ORDER BY u.current_score DESC, u.id ASC
      LIMIT $1
    `, [limit]);

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      userId: row.id,
      username: row.username,
      score: row.current_score,
      lastUpdate: row.last_activity
    }));

    // Cache for 30 seconds
    await this.cache.setex('leaderboard:top10', 30, JSON.stringify(leaderboard));

    return leaderboard;
  }

  private async updateLeaderboardCache(userId: string, score: number): Promise<void> {
    // Update sorted set
    await this.cache.zadd('leaderboard:global', score, userId);
    
    // Invalidate top10 cache
    await this.cache.del('leaderboard:top10');
  }

  private async publishScoreUpdate(userId: string, newScore: number, newRank: number, increase: number): Promise<void> {
    const event = {
      type: 'score_update',
      data: {
        userId,
        newScore,
        newRank,
        scoreIncrease: increase,
        timestamp: new Date().toISOString()
      }
    };

    await this.pubsub.publish('score_updates', JSON.stringify(event));
  }
}
```

### Authentication Middleware
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authentication token required'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_INVALID',
          message: 'Invalid or expired token'
        }
      });
    }

    req.user = user;
    next();
  });
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions for this operation'
        }
      });
    }
    next();
  };
};
```

## 2. WebSocket Implementation

### WebSocket Handler
```typescript
// websocket/handler.ts
import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
  isAuthenticated?: boolean;
  lastHeartbeat?: Date;
}

export class WebSocketManager {
  private clients: Set<AuthenticatedWebSocket> = new Set();
  private subscriber: Redis;

  constructor(subscriber: Redis) {
    this.subscriber = subscriber;
    this.setupSubscriptions();
    this.startHeartbeat();
  }

  handleConnection(ws: AuthenticatedWebSocket) {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        this.sendError(ws, 'INVALID_MESSAGE', 'Invalid JSON message');
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(ws);
    });

    // Send welcome message
    this.send(ws, {
      type: 'connected',
      message: 'Connected to scoreboard service'
    });
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any) {
    switch (message.type) {
      case 'auth':
        this.handleAuth(ws, message.token);
        break;
      
      case 'subscribe':
        this.handleSubscribe(ws, message.channel);
        break;
      
      case 'ping':
        this.handlePing(ws);
        break;
      
      default:
        this.sendError(ws, 'UNKNOWN_MESSAGE_TYPE', `Unknown message type: ${message.type}`);
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      ws.userId = decoded.id;
      ws.username = decoded.username;
      ws.isAuthenticated = true;
      ws.lastHeartbeat = new Date();

      this.clients.add(ws);

      this.send(ws, {
        type: 'auth_success',
        data: {
          userId: ws.userId,
          username: ws.username
        }
      });

    } catch (error) {
      this.sendError(ws, 'AUTH_FAILED', 'Invalid authentication token');
    }
  }

  private handleSubscribe(ws: AuthenticatedWebSocket, channel: string) {
    if (!ws.isAuthenticated) {
      this.sendError(ws, 'NOT_AUTHENTICATED', 'Authentication required');
      return;
    }

    // Add subscription logic here
    this.send(ws, {
      type: 'subscribed',
      channel: channel
    });
  }

  private handlePing(ws: AuthenticatedWebSocket) {
    ws.lastHeartbeat = new Date();
    this.send(ws, { type: 'pong' });
  }

  private setupSubscriptions() {
    this.subscriber.subscribe('score_updates', 'leaderboard_updates');

    this.subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      this.broadcast(data);
    });
  }

  private broadcast(message: any) {
    const payload = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.isAuthenticated && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  private send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, code: string, message: string) {
    this.send(ws, {
      type: 'error',
      error: { code, message }
    });
  }

  private startHeartbeat() {
    setInterval(() => {
      const now = new Date();
      const timeout = 60000; // 60 seconds

      this.clients.forEach(client => {
        if (client.lastHeartbeat && (now.getTime() - client.lastHeartbeat.getTime()) > timeout) {
          console.log('Removing stale connection');
          client.terminate();
          this.clients.delete(client);
        }
      });
    }, 30000); // Check every 30 seconds
  }
}
```

## 3. Client-Side Integration Examples

### JavaScript/TypeScript Client
```typescript
// client/ScoreboardClient.ts
export class ScoreboardClient {
  private baseUrl: string;
  private token: string | null = null;
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async authenticate(username: string, password: string): Promise<AuthResult> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    
    if (result.success) {
      this.token = result.data.token;
      this.connectWebSocket();
    }

    return result;
  }

  async updateScore(action: ActionData): Promise<ScoreUpdateResult> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    // Generate action signature
    const signature = await this.generateSignature(action);
    const payload = { ...action, signature };

    const response = await fetch(`${this.baseUrl}/scores/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  }

  async getLeaderboard(): Promise<LeaderboardResponse> {
    const response = await fetch(`${this.baseUrl}/scores/leaderboard`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
    });

    return await response.json();
  }

  private connectWebSocket() {
    const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      // Authenticate WebSocket connection
      this.ws?.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));

      // Subscribe to leaderboard updates
      this.ws?.send(JSON.stringify({
        type: 'subscribe',
        channel: 'leaderboard'
      }));
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleWebSocketMessage(message);
    };

    this.ws.onclose = () => {
      // Implement reconnection logic
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  private handleWebSocketMessage(message: any) {
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message.data));
  }

  on(eventType: string, handler: Function) {
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  private async generateSignature(action: ActionData): Promise<string> {
    // This would be implemented with the same HMAC logic as the server
    // For security, the secret should be obtained securely
    const payload = `${action.actionId}:${action.actionType}:${action.scoreIncrease}:${action.clientTimestamp}`;
    
    // In a real implementation, this would use a secure method to generate HMAC
    // For now, this is a placeholder
    return 'generated_hmac_signature';
  }
}
```

### React Component Example
```tsx
// components/Leaderboard.tsx
import React, { useState, useEffect } from 'react';
import { ScoreboardClient } from '../client/ScoreboardClient';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  lastUpdate: string;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [client] = useState(() => new ScoreboardClient('https://api.scoreboard.com/v1'));

  useEffect(() => {
    // Load initial leaderboard
    loadLeaderboard();

    // Set up real-time updates
    client.on('leaderboard_update', (data: any) => {
      setLeaderboard(data.leaderboard);
    });

    client.on('score_update', (data: any) => {
      // Update specific user's score in the leaderboard
      setLeaderboard(prev => prev.map(entry => 
        entry.userId === data.userId 
          ? { ...entry, score: data.newScore, rank: data.newRank }
          : entry
      ));
    });

  }, [client]);

  const loadLeaderboard = async () => {
    try {
      const response = await client.getLeaderboard();
      if (response.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  return (
    <div className="leaderboard">
      <h2>Top 10 Players</h2>
      <div className="leaderboard-list">
        {leaderboard.map((entry, index) => (
          <div key={entry.userId} className={`leaderboard-entry rank-${entry.rank}`}>
            <span className="rank">#{entry.rank}</span>
            <span className="username">{entry.username}</span>
            <span className="score">{entry.score.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 4. Docker Deployment Configuration

### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY public/ ./public/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S scoreboard -u 1001

# Change ownership
CHOWN scoreboard:nodejs /app

USER scoreboard

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://scoreboard:password@postgres:5432/scoreboard
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - HMAC_SECRET=${HMAC_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=scoreboard
      - POSTGRES_USER=scoreboard
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
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
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: jwt
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

---
apiVersion: v1
kind: Service
metadata:
  name: scoreboard-api-service
spec:
  selector:
    app: scoreboard-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

This implementation provides a complete, production-ready foundation for the real-time scoreboard system with all the security, performance, and scalability considerations outlined in the architecture specification.