# Live Scoreboard API - Implementation

### 1. Install Dependencies

```bash
cd ./src/problem6/backend
yarn install
```

### 2. Start Services with Docker

```bash
# Start PostgreSQL and Redis
docker-compose up -d db redis

# Wait a few seconds for services to start, then start the API
yarn dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login` : Login user
- `POST /api/auth/logout`: Logout user
- `GET /api/auth/profile`: Get user profile

### Score Management

- `POST /api/score/action`: Execute math action (+1 point)
- `GET /api/score/rank`: Get user's current rank
- `GET /api/score/history`: Get user's action history
- `GET /api/score/problem`: Generate random math problem

### Leaderboard

- `GET /api/leaderboard`: Get top 10 users with optional user rank

### System

- `GET /health` - Health check

## 🔌 Socket.io Events

### Client → Server

- `join_leaderboard`: Join leaderboard room for real-time updates
- `leave_leaderboard`: Leave leaderboard room
- `get_leaderboard`: Request current leaderboard

### Server → Client

- `leaderboard_update` - Broadcast leaderboard changes
- `score_update` - Personal score update

## 🔧 Configuration

### Environment Variables (.env)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/scoreboard_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

### Docker Services

- **PostgreSQL**: Port 5432, Database: `scoreboard_db`
- **Redis**: Port 6379
- **API Server**: Port 3000

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- Action cooldowns to prevent spam
- CORS protection
- Helmet security headers

## Production Deployment

### Using Docker Compose

```bash
# Run in background
docker-compose up -d
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update production values (JWT_SECRET, database credentials)
3. Set `NODE_ENV=production`

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Connection Stats

The Socket.io handlers provide connection statistics and the database includes audit trails for all user actions.

## 🔄 Real-time Features

- **Live Leaderboard**: Automatic updates when rankings change
- **Personal Score Updates**: Instant feedback on user actions
- **Connection Management**: Automatic reconnection handling
- **Room-based Broadcasting**: Efficient message delivery

## 🐛 Troubleshooting

### Common Issues

3. **Port Already in Use**
   ```bash
   # Change PORT in .env file or kill process
   lsof -ti:3000 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

---
